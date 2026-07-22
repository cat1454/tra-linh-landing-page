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

function stubMotionPreference(matches: boolean) {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener,
      removeEventListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia,
  );

  return { addEventListener, removeEventListener };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("HeroVideoBackground", () => {
  it("plays the optimized public video over a meaningful poster", async () => {
    stubMotionPreference(false);
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
    expect(container.querySelector("source")).toHaveAttribute(
      "src",
      "/videos/tra-linh-hero.mp4",
    );
    expect(container.querySelector("video")).toHaveAttribute(
      "poster",
      poster.src,
    );
    await waitFor(() => expect(play).toHaveBeenCalledOnce());

    unmount();
  });

  it("pauses motion and cleans up its media-query listener", async () => {
    const { addEventListener, removeEventListener } =
      stubMotionPreference(true);
    const pause = vi
      .spyOn(window.HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);

    const { unmount } = render(
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={poster}
      />,
    );

    await waitFor(() => expect(pause).toHaveBeenCalledOnce());
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
});
