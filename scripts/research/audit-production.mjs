import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const targetUrl = process.env.AUDIT_URL ?? "https://tra-linh-landing-page.vercel.app/";
const label = process.env.AUDIT_LABEL ?? "production";
const outputDirectory = resolve(
  process.cwd(),
  "docs/research/1000-user-simulation",
);

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: "vi-VN",
  colorScheme: "light",
});
const page = await context.newPage();
const failedRequests = [];
const badResponses = [];
const consoleErrors = [];

await page.addInitScript(() => {
  window.__auditMetrics = { cls: 0, lcp: 0, layoutShiftSources: [] };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      window.__auditMetrics.lcp = Math.round(entry.startTime);
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.hadRecentInput) continue;
      window.__auditMetrics.cls += entry.value;
      window.__auditMetrics.layoutShiftSources.push(
        ...(entry.sources ?? []).map((source) => ({
          node: source.node?.outerHTML?.slice(0, 240) ?? null,
          previousRect: source.previousRect,
          currentRect: source.currentRect,
        })),
      );
    }
  }).observe({ type: "layout-shift", buffered: true });
});

page.on("requestfailed", (request) => {
  failedRequests.push({
    method: request.method(),
    resourceType: request.resourceType(),
    url: request.url(),
    error: request.failure()?.errorText ?? "unknown",
  });
});
page.on("response", (response) => {
  if (response.status() >= 400) {
    badResponses.push({ status: response.status(), url: response.url() });
  }
});
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.emulateMedia({ reducedMotion: "reduce" });
const mainResponse = await page.goto(targetUrl, {
  waitUntil: "networkidle",
  timeout: 60_000,
});
await page.waitForTimeout(500);
const initialPerformance = await page.evaluate(() => ({
  lcpMs: window.__auditMetrics?.lcp ?? null,
  cls: Number((window.__auditMetrics?.cls ?? 0).toFixed(4)),
  layoutShiftSources: window.__auditMetrics?.layoutShiftSources ?? [],
}));
// Trigger deferred sections, images, and the map before collecting evidence.
await page.evaluate(async () => {
  const step = Math.max(600, Math.floor(innerHeight * 0.8));
  for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 90));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(2_500);

const pageFacts = await page.evaluate(() => {
  const anchors = [...document.querySelectorAll("a[href]")].map((anchor) => ({
    text: (anchor.textContent ?? "").replace(/\s+/g, " ").trim(),
    href: anchor.getAttribute("href") ?? "",
    ariaLabel: anchor.getAttribute("aria-label"),
  }));
  const headings = [...document.querySelectorAll("h1, h2, h3")].map((heading) => ({
    level: heading.tagName.toLowerCase(),
    text: (heading.textContent ?? "").replace(/\s+/g, " ").trim(),
  }));
  const images = [...document.images].map((image) => ({
    alt: image.alt,
    src: image.currentSrc || image.src,
    loaded: image.complete && image.naturalWidth > 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
  }));
  const navigation = performance.getEntriesByType("navigation")[0];
  const resources = performance.getEntriesByType("resource");
  const nav = navigation
    ? {
        domContentLoaded: Math.round(navigation.domContentLoadedEventEnd),
        loadEvent: Math.round(navigation.loadEventEnd),
        responseEnd: Math.round(navigation.responseEnd),
        transferSize: navigation.transferSize,
        decodedBodySize: navigation.decodedBodySize,
      }
    : null;

  return {
    title: document.title,
    language: document.documentElement.lang,
    h1: document.querySelector("h1")?.textContent?.replace(/\s+/g, " ").trim() ?? null,
    bodyTextLength: document.body.innerText.length,
    scrollHeight: document.documentElement.scrollHeight,
    sectionCount: document.querySelectorAll("main section").length,
    headings,
    anchors,
    images,
    forms: document.forms.length,
    formFields: [...document.querySelectorAll("input, select, textarea")].map((field) => ({
      name: field.getAttribute("name"),
      type: field.getAttribute("type") ?? field.tagName.toLowerCase(),
      required: field.hasAttribute("required"),
    })),
    mapCanvas: Boolean(document.querySelector('[data-testid="tourism-map-canvas"]')),
    mapMarkers: document.querySelectorAll('[data-testid^="tourism-map-marker-"]').length,
    specialtyInitialCount: document.querySelectorAll('#san-vat article').length,
    specialtyRevealAvailable: [...document.querySelectorAll('#san-vat button')]
      .some((button) => /xem thêm/i.test(button.textContent ?? '')),
    mapPreviewCardCount: document.querySelectorAll('[data-testid="tourism-place-card"]').length,
    mediaRailOriginalCounts: [...document.querySelectorAll('[data-testid="media-rail-originals"]')]
      .map((rail) => rail.querySelectorAll('img').length),
    mediaRailDuplicateCount: document.querySelectorAll('[data-testid="media-rail-duplicates"] img').length,
    shortcutBarAbsent: !document.querySelector('.home-task-navigation')
      && !document.querySelector('button[aria-label^="Tiết kiệm dữ liệu"]'),
    heroVideoCount: document.querySelectorAll('#dau-trang video').length,
    backToTop: anchors.some(({ href, text }) => href === '#dau-trang' && /quay lại đầu trang/i.test(text)),
    weatherLinks: anchors.filter((anchor) => /thời tiết/i.test(anchor.text)),
    navigationPerformance: nav,
    resourceSummary: {
      count: resources.length,
      transferSize: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
      decodedBodySize: resources.reduce((sum, entry) => sum + (entry.decodedBodySize || 0), 0),
      videoCount: resources.filter((entry) => /\.(mp4|webm)(\?|$)/i.test(entry.name)).length,
      imageCount: resources.filter((entry) => entry.initiatorType === "img").length,
      largestTransfers: resources
        .map((entry) => ({ name: entry.name, transferSize: entry.transferSize || 0, initiatorType: entry.initiatorType }))
        .sort((left, right) => right.transferSize - left.transferSize)
        .slice(0, 20),
    },
  };
});

const axeResults = await new AxeBuilder({ page }).analyze();

const marker = page.locator('button.mapboxgl-marker[aria-pressed]').first();
const mapKeyboard = {
  markerCount: await page.locator('button.mapboxgl-marker[aria-pressed]').count(),
  role: null,
  selectedAfterEnter: false,
};
if (mapKeyboard.markerCount > 0) {
  await marker.focus();
  mapKeyboard.role = await marker.getAttribute("role");
  await marker.press("Enter");
  mapKeyboard.selectedAfterEnter = (await marker.getAttribute("aria-pressed")) === "true";
}

const internalLinks = [...new Set(pageFacts.anchors.map(({ href }) => href))]
  .filter((href) => href && !href.startsWith("#") && !/^(mailto:|tel:|javascript:)/i.test(href))
  .map((href) => new URL(href, targetUrl))
  .filter((url) => url.origin === new URL(targetUrl).origin)
  .slice(0, 80);

const internalLinkStatus = [];
for (const url of internalLinks) {
  try {
    const response = await context.request.get(url.href, {
      failOnStatusCode: false,
      timeout: 20_000,
    });
    internalLinkStatus.push({ url: url.href, status: response.status() });
  } catch (error) {
    internalLinkStatus.push({ url: url.href, status: null, error: String(error) });
  }
}

const hashTargets = await page.evaluate(() =>
  [...new Set([...document.querySelectorAll('a[href^="#"]')].map((anchor) => anchor.getAttribute("href") ?? ""))]
    .map((href) => ({
      href,
      exists: href === "#" ? false : Boolean(document.getElementById(decodeURIComponent(href.slice(1)))),
    })),
);

const journeyLink = page.locator('a[href^="/hanh-trinh/"]').first();
const journey = (await journeyLink.count())
  ? await journeyLink.evaluate((element) => ({
      text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
      href: element.getAttribute("href"),
    }))
  : null;

const featureChecks = {
  weatherRoute: false,
  searchRoute: false,
  faqRoute: false,
  englishRoute: false,
  englishLang: null,
  journeyTripInfo: false,
  journeyItinerary: false,
  journeyPrint: false,
  journeyVerification: false,
  journeySaveShare: false,
  savedRoute: false,
  guideOffline: false,
  guideSaveShare: false,
  placeVerification: false,
  placeSources: false,
  placeSaveShare: false,
  faqAuthenticityGuidance: false,
  reducedMotionUnloadsVideo: pageFacts.heroVideoCount === 0,
  boundedSpecialties: pageFacts.specialtyInitialCount <= 6 && pageFacts.specialtyRevealAvailable,
  boundedMapPreview: pageFacts.mapPreviewCardCount <= 6,
  boundedMediaRails: pageFacts.mediaRailOriginalCounts.every((count) => count <= 6)
    && pageFacts.mediaRailDuplicateCount === 0,
  shortcutBarAbsent: pageFacts.shortcutBarAbsent,
  backToTop: pageFacts.backToTop,
  contactPhone: pageFacts.anchors.some(({ href }) => href.startsWith("tel:")),
  contactEmail: pageFacts.anchors.some(({ href }) => href.startsWith("mailto:")),
  contactFacebook: pageFacts.anchors.some(({ href }) => /facebook\.com/i.test(href)),
};

for (const [key, path] of [
  ["weatherRoute", "/thoi-tiet"],
  ["searchRoute", "/tim-kiem"],
  ["faqRoute", "/cau-hoi-thuong-gap"],
  ["savedRoute", "/da-luu"],
]) {
  const response = await context.request.get(new URL(path, targetUrl).href, { failOnStatusCode: false });
  featureChecks[key] = response.status() === 200;
}

const englishPage = await context.newPage();
const englishResponse = await englishPage.goto(new URL("/en", targetUrl).href, {
  waitUntil: "domcontentloaded",
  timeout: 30_000,
});
featureChecks.englishRoute = englishResponse?.status() === 200;
featureChecks.englishLang = await englishPage.locator("html").getAttribute("lang");
await englishPage.close();

if (journey?.href) {
  const journeyPage = await context.newPage();
  const response = await journeyPage.goto(new URL(journey.href, targetUrl).href, {
    waitUntil: "domcontentloaded",
    timeout: 30_000,
  });
  if (response?.status() === 200) {
    const text = (await journeyPage.locator("body").innerText()).toLowerCase();
    featureChecks.journeyTripInfo = text.includes("thông tin chuyến đi") && text.includes("độ khó") && text.includes("mùa phù hợp");
    featureChecks.journeyItinerary = text.includes("lịch trình") || text.includes("từng chặng");
    featureChecks.journeyPrint = /in|pdf/i.test(await journeyPage.getByRole("button").allInnerTexts().then((items) => items.join(" ")));
    featureChecks.journeyVerification = text.includes("xác minh") && text.includes("cập nhật");
    const actionText = await journeyPage.getByRole("button").allInnerTexts().then((items) => items.join(" "));
    featureChecks.journeySaveShare = /lưu hành trình/i.test(actionText)
      && (/chia sẻ/i.test(actionText) || /sao chép liên kết/i.test(actionText));
  }
  await journeyPage.close();
}

const guidePage = await context.newPage();
const guideResponse = await guidePage.goto(new URL('/cam-nang/duong-den-tra-linh', targetUrl).href, {
  waitUntil: 'domcontentloaded',
  timeout: 30_000,
});
if (guideResponse?.status() === 200) {
  const buttons = await guidePage.getByRole('button').allInnerTexts().then((items) => items.join(' '));
  featureChecks.guideOffline = /in hoặc lưu pdf/i.test(buttons);
  featureChecks.guideSaveShare = /lưu cẩm nang/i.test(buttons)
    && (/chia sẻ/i.test(buttons) || /sao chép liên kết/i.test(buttons));
}
await guidePage.close();

const placePage = await context.newPage();
const placeResponse = await placePage.goto(new URL('/dia-diem/tram-duoc-lieu-tra-linh', targetUrl).href, {
  waitUntil: 'domcontentloaded',
  timeout: 30_000,
});
if (placeResponse?.status() === 200) {
  const text = (await placePage.locator('body').innerText()).toLowerCase();
  const buttons = await placePage.getByRole('button').allInnerTexts().then((items) => items.join(' '));
  featureChecks.placeVerification = text.includes('đã xác minh') && text.includes('rà soát');
  featureChecks.placeSources = await placePage.getByRole('link', { name: /nguồn tham khảo/i }).count() > 0;
  featureChecks.placeSaveShare = /lưu địa điểm/i.test(buttons)
    && (/chia sẻ/i.test(buttons) || /sao chép liên kết/i.test(buttons));
}
await placePage.close();

const faqPage = await context.newPage();
const faqResponse = await faqPage.goto(new URL('/cau-hoi-thuong-gap', targetUrl).href, {
  waitUntil: 'domcontentloaded',
  timeout: 30_000,
});
if (faqResponse?.status() === 200) {
  const text = ((await faqPage.locator('body').textContent()) ?? '').toLowerCase();
  featureChecks.faqAuthenticityGuidance = text.includes('làm sao kiểm tra nguồn gốc sâm ngọc linh')
    && text.includes('website không cấp tem hoặc chứng nhận');
}
await faqPage.close();


await page.locator("#dau-trang").screenshot({
  path: resolve(outputDirectory, `${label}-hero-desktop.png`),
  animations: "disabled",
});
await page.screenshot({
  path: resolve(outputDirectory, `${label}-desktop-full.png`),
  fullPage: true,
  animations: "disabled",
});

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2.75,
  hasTouch: true,
  isMobile: true,
  locale: "vi-VN",
  colorScheme: "light",
});
const mobile = await mobileContext.newPage();
await mobile.addInitScript(() => {
  window.__auditMetrics = { cls: 0, lcp: 0, inp: 0 };
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) window.__auditMetrics.lcp = Math.round(entry.startTime);
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) window.__auditMetrics.cls += entry.value;
    }
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (["click", "keydown", "pointerup"].includes(entry.name)) {
        window.__auditMetrics.inp = Math.max(window.__auditMetrics.inp, entry.duration);
      }
    }
  }).observe({ type: "event", buffered: true, durationThreshold: 16 });
});
await mobile.emulateMedia({ reducedMotion: "reduce" });
await mobile.goto(targetUrl, { waitUntil: "networkidle", timeout: 60_000 });
await mobile.waitForTimeout(1_000);
const mobileFacts = await mobile.evaluate(() => ({
  horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  stickyActions: [...document.querySelectorAll('[aria-label="Thao tác nhanh"] a')].map((anchor) => ({
    text: anchor.textContent?.replace(/\s+/g, " ").trim() ?? "",
    href: anchor.getAttribute("href"),
  })),
  viewport: { width: innerWidth, height: innerHeight },
}));
const menuButton = mobile.getByRole("button", { name: /mở menu/i });
if (await menuButton.count()) {
  await menuButton.click();
  await mobile.getByRole("dialog").waitFor({ state: "visible", timeout: 5_000 }).catch(() => undefined);
  await mobile.waitForTimeout(100);
}
const mobileMenu = await mobile.evaluate(() => ({
  visible: Boolean(document.querySelector('[role="dialog"]')),
  items: [...document.querySelectorAll('[role="dialog"] a')].map((anchor) =>
    anchor.textContent?.replace(/\s+/g, " ").trim() ?? "",
  ),
}));
const mobilePerformance = await mobile.evaluate(() => {
  const resources = performance.getEntriesByType("resource");
  return {
    lcpMs: window.__auditMetrics?.lcp ?? null,
    cls: Number((window.__auditMetrics?.cls ?? 0).toFixed(4)),
    inpMs: window.__auditMetrics?.inp ?? null,
    transferSize: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
  };
});
await mobile.screenshot({
  path: resolve(outputDirectory, `${label}-mobile-menu.png`),
  fullPage: false,
  animations: "disabled",
});
if (await mobile.getByRole("button", { name: /đóng menu/i }).count()) {
  await mobile.getByRole("button", { name: /đóng menu/i }).click();
}
await mobile.screenshot({
  path: resolve(outputDirectory, `${label}-mobile-full.png`),
  fullPage: true,
  animations: "disabled",
});
await mobileContext.close();

const evidence = {
  generatedAt: new Date().toISOString(),
  targetUrl,
  label,
  mainStatus: mainResponse?.status() ?? null,
  finalUrl: page.url(),
  pageFacts,
  journey,
  hashTargets,
  internalLinkStatus,
  accessibility: {
    violationCount: axeResults.violations.length,
    violations: axeResults.violations.map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      description: violation.description,
      help: violation.help,
      nodes: violation.nodes.map((node) => ({
        target: node.target,
        html: node.html,
        failureSummary: node.failureSummary,
      })),
    })),
  },
  mapKeyboard,
  featureChecks,
  performance: initialPerformance,
  consoleErrors: [...new Set(consoleErrors)],
  failedRequests,
  unexpectedFailedRequests: failedRequests.filter(({ error }) => error !== 'net::ERR_ABORTED'),
  badResponses,
  mobile: { ...mobileFacts, menu: mobileMenu, performance: mobilePerformance },
};

await writeFile(
  resolve(outputDirectory, `evidence-${label}.json`),
  `${JSON.stringify(evidence, null, 2)}\n`,
  "utf8",
);

await browser.close();
console.log(JSON.stringify({
  label,
  targetUrl,
  status: evidence.mainStatus,
  title: pageFacts.title,
  headings: pageFacts.headings.length,
  internalLinks: internalLinkStatus.length,
  brokenInternalLinks: internalLinkStatus.filter(({ status }) => status === null || status >= 400).length,
  missingHashTargets: hashTargets.filter(({ exists }) => !exists).length,
  accessibilityViolations: evidence.accessibility.violationCount,
  failedRequests: failedRequests.length,
  badResponses: badResponses.length,
  mobileOverflow: mobileFacts.horizontalOverflow,
}, null, 2));
