import { expect, test, type Page } from "@playwright/test";

const CHAPTER_SELECTOR =
  ".landing-page > section:is([id], [aria-labelledby]), .landing-page > #lien-he";

async function startDesktopChapterSnap(page: Page) {
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          window.dispatchEvent(
            new PointerEvent("pointerdown", {
              bubbles: true,
              pointerType: "mouse",
            }),
          );
          return document.documentElement.hasAttribute(
            "data-lenis-chapter-snap",
          );
        }),
      { timeout: 15_000 },
    )
    .toBe(true);
}

async function waitForScrollIdle(page: Page) {
  await expect
    .poll(
      async () => {
        const before = await page.evaluate(() => window.scrollY);
        await page.waitForTimeout(120);
        const after = await page.evaluate(() => window.scrollY);
        return Math.abs(after - before);
      },
      { timeout: 6_000 },
    )
    .toBeLessThan(1);
}

test.describe("landing page chapter scrolling", () => {
  test.describe.configure({ mode: "serial" });

  test("uses proximity snap points with a fixed-header offset on desktop", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop interaction coverage");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const scrollBehavior = await page.evaluate((chapterSelector) => {
      const root = getComputedStyle(document.documentElement);
      const header = document.querySelector<HTMLElement>(".site-header");
      const chapters = Array.from(
        document.querySelectorAll<HTMLElement>(chapterSelector),
      );

      return {
        snapType: root.scrollSnapType,
        scrollPaddingTop: Number.parseFloat(root.scrollPaddingTop),
        chapterCount: chapters.length,
        chapterAlignments: chapters.map(
          (chapter) => getComputedStyle(chapter).scrollSnapAlign,
        ),
        headerHeight: header?.getBoundingClientRect().height ?? 0,
      };
    }, CHAPTER_SELECTOR);

    expect(scrollBehavior.snapType).toContain("y");
    expect(scrollBehavior.snapType).not.toContain("mandatory");
    expect(scrollBehavior.chapterCount).toBeGreaterThan(8);
    expect(scrollBehavior.chapterAlignments.every((align) => align === "start")).toBe(true);
    expect(scrollBehavior.scrollPaddingTop).toBeGreaterThanOrEqual(
      scrollBehavior.headerHeight,
    );

    await startDesktopChapterSnap(page);
    await expect(page.locator("html.lenis")).toBeAttached({ timeout: 10_000 });
  });

  test("keeps long chapters naturally scrollable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.goto("/");

    const dimensions = await page.locator("#vung-sam").evaluate((chapter) => {
      const style = getComputedStyle(chapter);
      return {
        height: chapter.getBoundingClientRect().height,
        declaredHeight: style.height,
        minHeight: style.minHeight,
      };
    });

    expect(dimensions.height).toBeGreaterThan(700);
    expect(dimensions.declaredHeight).not.toBe("700px");
    expect(dimensions.minHeight).not.toBe("700px");
  });

  test("gives compact chapters a viewport-sized canvas without forcing long stories", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop frame layout coverage");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const layout = await page.evaluate(() => {
      const compactSelectors = [
        "#cau-chuyen",
        "#san-vat",
        "#san-pham-sam",
        "#cam-nang",
        "#bao-chi",
        '[aria-labelledby="final-cta-heading"]',
        "#lien-he",
      ];
      const headerOffset = Number.parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop,
      );

      return {
        expectedFrameHeight: window.innerHeight - headerOffset,
        compact: compactSelectors.map((selector) => {
          const element = document.querySelector<HTMLElement>(
            `.landing-page > ${selector}`,
          );
          const style = element ? getComputedStyle(element) : null;
          return {
            selector,
            exists: Boolean(element),
            height: element?.getBoundingClientRect().height ?? 0,
            display: style?.display,
            alignItems: style?.alignItems,
          };
        }),
        longStoryDisplay: getComputedStyle(
          document.querySelector<HTMLElement>("#vung-sam")!,
        ).display,
      };
    });

    const existingFrames = layout.compact.filter(({ exists }) => exists);
    expect(existingFrames.length).toBeGreaterThanOrEqual(4);
    expect(
      existingFrames.every(
        ({ height }) => height >= layout.expectedFrameHeight - 1,
      ),
    ).toBe(true);
    expect(
      existingFrames.every(
        ({ display, alignItems }) =>
          display === "grid" && alignItems === "center",
      ),
    ).toBe(true);
    expect(layout.longStoryDisplay).not.toBe("grid");
  });

  test("settles near a chapter boundary without trapping long content", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop wheel coverage");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await startDesktopChapterSnap(page);

    const target = page.locator("#vung-sam");
    await page.getByRole("link", { name: "Vùng sâm", exact: true }).click();
    const targetScrollY = await target.evaluate((section) => {
      const headerOffset = Number.parseFloat(
        getComputedStyle(document.documentElement).scrollPaddingTop,
      );
      return section.getBoundingClientRect().top + window.scrollY - headerOffset;
    });
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 6_000 })
      .toBeCloseTo(targetScrollY, -1);

    await page.mouse.wheel(0, 320);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 6_000 })
      .toBeGreaterThan(targetScrollY + 250);

    await page.mouse.wheel(0, -80);
    await expect
      .poll(() => page.evaluate(() => window.scrollY), { timeout: 6_000 })
      .toBeCloseTo(targetScrollY, -1);
  });

  test("preserves the pinned horizontal journey animation", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop horizontal journey coverage");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await startDesktopChapterSnap(page);
    await page.locator('a[href="/#hanh-trinh"]').first().click();

    await expect
      .poll(
        () =>
          page.locator("#hanh-trinh").evaluate((section) => {
            const offset = Number.parseFloat(
              getComputedStyle(document.documentElement).scrollPaddingTop,
            );
            return Math.abs(section.getBoundingClientRect().top - offset);
          }),
        { timeout: 6_000 },
      )
      .toBeLessThan(2);

    const track = page.locator(".horizontal-journey__track");
    const initialLeft = await track.evaluate(
      (element) => element.getBoundingClientRect().left,
    );

    for (let index = 0; index < 6; index += 1) {
      await page.mouse.wheel(0, 300);
      await page.waitForTimeout(120);
    }

    await expect
      .poll(
        () => track.evaluate((element) => element.getBoundingClientRect().left),
        { timeout: 6_000 },
      )
      .toBeLessThan(initialLeft - 20);
    await expect(page.locator("html[data-lenis-chapter-snap]")).toBeAttached();
  });

  test("keeps keyboard scrolling native and anchor navigation header-safe", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop keyboard coverage");
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    await page.keyboard.press("PageDown");
    await expect(page.locator("html.lenis")).not.toBeAttached();
    await waitForScrollIdle(page);

    await startDesktopChapterSnap(page);
    await waitForScrollIdle(page);
    await page.getByRole("link", { name: "Vùng sâm", exact: true }).click();

    await expect
      .poll(
        () =>
          page.locator("#vung-sam").evaluate((section) => {
            const sectionTop = section.getBoundingClientRect().top;
            const headerHeight =
              document
                .querySelector<HTMLElement>(".site-header")
                ?.getBoundingClientRect().height ?? 0;
            return sectionTop - headerHeight;
        }),
        { timeout: 6_000 },
      )
      .toBeLessThanOrEqual(40);

    const anchorOffset = await page.locator("#vung-sam").evaluate((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      const headerHeight =
        document
          .querySelector<HTMLElement>(".site-header")
          ?.getBoundingClientRect().height ?? 0;
      return sectionTop - headerHeight;
    });
    expect(anchorOffset).toBeGreaterThanOrEqual(0);
  });

  test("keeps touch scrolling native on desktop-width touch devices", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "mobile-chrome", "Desktop touch fallback coverage");
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");

    for (let index = 0; index < 12; index += 1) {
      await page.evaluate(() => {
        window.dispatchEvent(
          new PointerEvent("pointerdown", {
            bubbles: true,
            pointerType: "touch",
          }),
        );
      });
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1_000);

    await expect(page.locator("html.lenis")).not.toBeAttached();
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).scrollSnapType,
        ),
      )
      .toContain("y");
  });

  test("disables chapter snapping on mobile and with reduced motion", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).scrollSnapType,
        ),
      )
      .toBe("none");

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.reload();
    await expect
      .poll(() =>
        page.evaluate(
          () => getComputedStyle(document.documentElement).scrollSnapType,
        ),
      )
      .toBe("none");
  });
});
