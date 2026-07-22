import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HeroVideoBackground } from "@/components/home/HeroVideoBackground";

import type { MediaAsset } from "@/lib/content/types";

const poster: MediaAsset = {
  id: "hero-poster",
  src: "/images/tra-linh/hero-ban-lang-ngoc-linh.jpg",
  altText: "Bản làng giữa đại ngàn Ngọc Linh",
  sourceUrl: "https://example.com/tra-linh",
  sourceCredit: "Nguồn thử nghiệm",
  usagePermission: "client_confirmed",
  verifiedAt: "2026-07-22",
};

function stubMediaPreferences({
  reducedMotion = false,
  desktop = true,
  saveData = false,
}: {
  reducedMotion?: boolean;
  desktop?: boolean;
  saveData?: boolean;
} = {}) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion")
        ? reducedMotion
        : desktop,
      media: query,
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia,
  );

  Object.defineProperty(window.navigator, "connection", {
    configurable: true,
    value: { saveData },
  });

  return { addEventListener, removeEventListener };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HeroVideoBackground", () => {
  it("plays the optimized public video over a meaningful poster", async () => {
    stubMediaPreferences();
    const play = vi
      .spyOn(window.HTMLMediaElement.prototype, "play")
      .mockResolvedValue();

    const { container, unmount } = render(
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={poster}
      />,
    );

    expect(screen.getByRole("img", { name: poster.altText })).toBeVisible();
    await waitFor(() => {
      expect(container.querySelector("source")).toHaveAttribute(
        "src",
        "/videos/tra-linh-hero.mp4",
      );
    });
    expect(container.querySelector("video")).toHaveAttribute("poster", poster.src);
    await waitFor(() => expect(play).toHaveBeenCalledOnce());

    unmount();
  });

  it("pauses motion and cleans up its media-query listener", async () => {
    const { addEventListener, removeEventListener } =
      stubMediaPreferences({ reducedMotion: true });
    const play = vi.spyOn(window.HTMLMediaElement.prototype, "play");

    const { unmount } = render(
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={poster}
      />,
    );

    await waitFor(() => expect(screen.getByRole("img", { name: poster.altText })).toBeVisible());
    expect(play).not.toHaveBeenCalled();
    expect(document.querySelector("video")).not.toBeInTheDocument();
    expect(addEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );

    unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it.each([
    [{ desktop: false }, "small screens"],
    [{ saveData: true }, "data saver"],
  ])("does not download video for %s", async (preferences) => {
    stubMediaPreferences(preferences);

    const { container } = render(
      <HeroVideoBackground src="/videos/tra-linh-hero.mp4" poster={poster} />,
    );

    await waitFor(() => expect(screen.getByRole("img", { name: poster.altText })).toBeVisible());
    expect(container.querySelector("source")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});
