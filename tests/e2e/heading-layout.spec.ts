import { expect, test, type Page } from "@playwright/test";

const MAIN_HEADINGS =
  "#hero-title, .section-intro h2, #tourism-map-heading, #final-cta-heading, #lien-he h2";

type HeadingMetrics = {
  key: string;
  text: string;
  overflow: boolean;
  wordsPerLine: number[];
  phrases: Array<{ text: string; lineCount: number }>;
};

function measureHeading(element: HTMLElement): HeadingMetrics {
  const textRects = (root: Node) => {
    const rects: DOMRect[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!node.data.trim()) continue;

      const range = document.createRange();
      range.selectNodeContents(node);
      rects.push(
        ...Array.from(range.getClientRects()).filter(
          (rect) => rect.width > 0 && rect.height > 0,
        ),
      );
    }

    return rects;
  };

  const lines = new Map<number, Set<number>>();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let wordIndex = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;

    for (const match of node.data.matchAll(/\S+/gu)) {
      const start = match.index ?? 0;
      const range = document.createRange();
      range.setStart(node, start);
      range.setEnd(node, start + match[0].length);

      for (const rect of range.getClientRects()) {
        if (rect.width <= 0 || rect.height <= 0) continue;
        const line = Math.round(rect.top);
        const words = lines.get(line) ?? new Set<number>();
        words.add(wordIndex);
        lines.set(line, words);
      }

      wordIndex += 1;
    }
  }

  const bounds = element.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;
  const headingTextRects = textRects(element);
  const leftBoundary = Math.max(0, bounds.left);
  const rightBoundary = Math.min(viewportWidth, bounds.right);

  return {
    key: element.id || element.closest("section")?.id || element.tagName,
    text: element.textContent?.trim() ?? "",
    overflow:
      element.scrollWidth > element.clientWidth + 1 ||
      bounds.left < -1 ||
      bounds.right > viewportWidth + 1 ||
      headingTextRects.some(
        (rect) =>
          rect.left < leftBoundary - 1 || rect.right > rightBoundary + 1,
      ),
    wordsPerLine: Array.from(lines.entries())
      .sort(([topA], [topB]) => topA - topB)
      .map(([, words]) => words.size),
    phrases: Array.from(
      element.querySelectorAll<HTMLElement>("[data-heading-phrase]"),
      (phrase) => ({
        text: phrase.textContent?.trim() ?? "",
        lineCount: new Set(
          textRects(phrase).map((rect) => Math.round(rect.top)),
        ).size,
      }),
    ),
  };
}

async function prepare(page: Page, width: number, height = 900) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width, height });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

async function collectHeadings(page: Page) {
  const locator = page.locator(MAIN_HEADINGS);
  const count = await locator.count();

  return Promise.all(
    Array.from({ length: count }, (_, index) =>
      locator.nth(index).evaluate(measureHeading),
    ),
  );
}

test("main headings wrap intentionally on desktop", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name === "mobile-chrome",
    "Desktop geometry is covered by desktop projects.",
  );
  test.setTimeout(60_000);

  for (const width of [1024, 1139, 1280, 1398, 1440]) {
    await prepare(page, width);
    const headings = await collectHeadings(page);

    expect(headings.length).toBeGreaterThan(8);
    expect.soft(
      headings.flatMap(({ key, text, phrases }) =>
        phrases
          .filter(({ lineCount }) => lineCount > 1)
          .map((phrase) => ({ key, heading: text, ...phrase })),
      ),
      `Phrase wrapped internally at ${width}px`,
    ).toEqual([]);
    expect.soft(
      headings
        .filter(
          ({ wordsPerLine }) =>
            wordsPerLine.length > 1 && wordsPerLine.at(-1) === 1,
        )
        .map(({ key, text, wordsPerLine }) => ({ key, text, wordsPerLine })),
      `One-word final line at ${width}px`,
    ).toEqual([]);
    expect.soft(
      headings
        .filter(({ wordsPerLine }) =>
          wordsPerLine.length > (width >= 1280 ? 2 : 3),
        )
        .map(({ key, text, wordsPerLine }) => ({ key, text, wordsPerLine })),
      `Too many heading lines at ${width}px`,
    ).toEqual([]);
    expect.soft(
      headings
        .filter(({ overflow }) => overflow)
        .map(({ key, text }) => ({ key, text })),
      `Heading overflow at ${width}px`,
    ).toEqual([]);
  }
});

test("main headings remain contained with native mobile wrapping", async ({
  page,
}) => {
  for (const width of [320, 390]) {
    await prepare(page, width, 844);
    const headings = await collectHeadings(page);

    expect.soft(
      headings
        .filter(({ overflow }) => overflow)
        .map(({ key, text }) => ({ key, text })),
      `Heading overflow at ${width}px`,
    ).toEqual([]);

    const pageOverflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );

    expect.soft(pageOverflow, `Page overflow at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("tourism card titles keep place names and final lines together", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Responsive title geometry is covered once in Chromium.",
  );

  for (const width of [390, 1024, 1139, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/ban-do-du-lich", { waitUntil: "domcontentloaded" });
    await page
      .locator('[data-testid="tourism-place-card"]')
      .first()
      .waitFor({ state: "attached" });
    await page.evaluate(() => document.fonts.ready.then(() => undefined));

    const offenders = await page
      .locator('[data-testid="tourism-place-card"] span.text-balance.font-serif')
      .evaluateAll((titles) =>
        titles.flatMap((title) => {
          const lines = new Map<number, number>();
          const walker = document.createTreeWalker(
            title,
            NodeFilter.SHOW_TEXT,
          );

          while (walker.nextNode()) {
            const node = walker.currentNode as Text;
            for (const match of node.data.matchAll(/\S+/gu)) {
              const start = match.index ?? 0;
              const range = document.createRange();
              range.setStart(node, start);
              range.setEnd(node, start + match[0].length);

              for (const rect of range.getClientRects()) {
                if (rect.width <= 0 || rect.height <= 0) continue;
                const top = Math.round(rect.top);
                lines.set(top, (lines.get(top) ?? 0) + 1);
              }
            }
          }

          const wordsPerLine = Array.from(lines.entries())
            .sort(([topA], [topB]) => topA - topB)
            .map(([, words]) => words);
          const splitNames = Array.from(
            title.querySelectorAll<HTMLElement>("[data-heading-name]"),
          )
            .filter((name) => {
              const range = document.createRange();
              range.selectNodeContents(name);
              return (
                new Set(
                  Array.from(range.getClientRects(), (rect) =>
                    Math.round(rect.top),
                  ),
                ).size > 1
              );
            })
            .map((name) => name.textContent?.trim());

          return title.scrollWidth > title.clientWidth + 1 ||
            (wordsPerLine.length > 1 && wordsPerLine.at(-1) === 1) ||
            splitNames.length
            ? [
                {
                  text: title.textContent?.trim(),
                  wordsPerLine,
                  splitNames,
                },
              ]
            : [];
        }),
      );

    expect.soft(offenders, `Card heading issues at ${width}px`).toEqual([]);
  }
});
