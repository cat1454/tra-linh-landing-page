import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  HERO_YOUTUBE_URL,
  HeroYouTubeVideo,
} from "@/components/home/HeroYouTubeVideo";

describe("HeroYouTubeVideo", () => {
  it("shows a small 16:9 preview and loads YouTube inline only when requested", async () => {
    const user = userEvent.setup();
    const { container } = render(<HeroYouTubeVideo />);

    expect(HERO_YOUTUBE_URL).toBe("https://youtu.be/NrI3fP5kq3A");
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
    const card = screen.getByRole("region", {
      name: /video giới thiệu trà linh/i,
    });
    expect(card).toHaveClass(
      "mx-auto",
      "max-w-[280px]",
      "sm:max-w-[320px]",
      "sm:mx-0",
    );
    expect(card.firstElementChild).toHaveClass("aspect-video");
    expect(screen.queryByRole("link", { name: /xem trên youtube/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: /xem trước video/i }).getAttribute("src"),
    ).toContain("hero-ban-lang-ngoc-linh-mobile.webp");

    await user.click(
      screen.getByRole("button", { name: /xem video giới thiệu/i }),
    );

    const player = screen.getByTitle("Video giới thiệu Trà Linh");
    expect(player).toHaveAttribute(
      "src",
      expect.stringContaining(
        "https://www.youtube-nocookie.com/embed/NrI3fP5kq3A",
      ),
    );
    expect(screen.getByRole("link", { name: /xem trên youtube/i })).toHaveAttribute(
      "href",
      HERO_YOUTUBE_URL,
    );
  });

  it("keeps playback inside the preview instead of opening a modal", async () => {
    const user = userEvent.setup();
    render(<HeroYouTubeVideo />);
    const trigger = screen.getByRole("button", {
      name: /xem video giới thiệu/i,
    });

    await user.click(trigger);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTitle("Video giới thiệu Trà Linh")).toBeVisible();
  });
});
