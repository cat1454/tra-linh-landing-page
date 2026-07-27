import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HERO_INTRO_VIDEO_SRC } from "@/components/home/HeroSection";
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
  it("wires the supplied Tra Linh introduction video into the hero", () => {
    expect(HERO_INTRO_VIDEO_SRC).toBe(
      "/assets/ThienNhien/1784805090350_7825852089651351479_g3040039768026489372.mp4",
    );
  });

  it("tries to autoplay the introduction with sound over a meaningful poster", async () => {
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
      expect(container.querySelector("video source")).toHaveAttribute(
        "src",
        "/videos/tra-linh-hero.mp4",
      );
    });
    expect(container.querySelector("video")).toHaveAttribute("poster", poster.src);
    expect(container.querySelector("video")).toHaveAttribute("autoplay");
    expect(container.querySelector("video")).toHaveProperty("muted", false);
    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Tắt tiếng video giới thiệu" })).toBeVisible();

    unmount();
  });

  it("continues autoplay muted and lets the visitor enable sound when sound autoplay is blocked", async () => {
    const user = userEvent.setup();
    stubMediaPreferences();
    const play = vi
      .spyOn(window.HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Autoplay blocked", "NotAllowedError"))
      .mockResolvedValue();

    const { container } = render(
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={poster}
      />,
    );

    const soundButton = await screen.findByRole("button", {
      name: "Bật tiếng video giới thiệu",
    });
    expect(container.querySelector("video")).toHaveProperty("muted", true);
    expect(play).toHaveBeenCalledTimes(2);

    await user.click(soundButton);
    expect(container.querySelector("video")).toHaveProperty("muted", false);
    expect(screen.getByRole("button", { name: "Tắt tiếng video giới thiệu" })).toBeVisible();
  });

  it("enables sound on the visitor's first page interaction after mobile autoplay is muted", async () => {
    stubMediaPreferences({ desktop: false });
    vi.spyOn(window.HTMLMediaElement.prototype, "play")
      .mockRejectedValueOnce(new DOMException("Autoplay blocked", "NotAllowedError"))
      .mockResolvedValue();

    const { container } = render(
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={poster}
      />,
    );

    const soundButton = await screen.findByRole("button", {
      name: "Bật tiếng video giới thiệu",
    });
    expect(soundButton).toHaveTextContent("Chạm để bật tiếng");
    expect(soundButton).toHaveClass("bottom-24", "left-1/2");

    fireEvent.pointerDown(document.body);

    await waitFor(() => {
      expect(container.querySelector("video")).toHaveProperty("muted", false);
    });
    expect(screen.getByRole("button", { name: "Tắt tiếng video giới thiệu" })).toBeVisible();
  });

  it("art-directs a single mobile poster without a duplicate preload", () => {
    stubMediaPreferences({ desktop: false });

    const { container } = render(
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={poster}
        mobilePosterSrc="/images/tra-linh/hero-mobile.webp"
      />,
    );

    expect(container.querySelector("picture source")).toHaveAttribute(
      "media",
      "(max-width: 767px)",
    );
    expect(container.querySelector("picture source")).toHaveAttribute(
      "srcset",
      "/images/tra-linh/hero-mobile.webp",
    );
    expect(container.querySelectorAll("picture img")).toHaveLength(1);
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

  it("autoplays the responsive cover video on small screens", async () => {
    stubMediaPreferences({ desktop: false });
    vi.spyOn(window.HTMLMediaElement.prototype, "play").mockResolvedValue();

    const { container } = render(
      <HeroVideoBackground src="/videos/tra-linh-hero.mp4" poster={poster} />,
    );

    await waitFor(() => expect(container.querySelector("video source")).toBeInTheDocument());
    expect(container.querySelector("video")).toHaveClass("h-full", "w-full", "object-cover");
  });

  it("does not download video in data saver mode", async () => {
    stubMediaPreferences({ saveData: true });

    const { container } = render(
      <HeroVideoBackground src="/videos/tra-linh-hero.mp4" poster={poster} />,
    );

    await waitFor(() => expect(screen.getByRole("img", { name: poster.altText })).toBeVisible());
    expect(container.querySelector("video source")).not.toBeInTheDocument();
    expect(container.querySelector("video")).not.toBeInTheDocument();
  });
});
