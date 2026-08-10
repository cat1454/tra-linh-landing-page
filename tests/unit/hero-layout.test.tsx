import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HeroSection } from "@/components/home/HeroSection";
import { fallbackContent } from "@/lib/content/fallback-content";

vi.mock("@/components/animation/ScrollReveal", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/home/WeatherTimeCard", () => ({
  WeatherTimeCard: () => <div aria-label="Thời gian và thời tiết tại Trà Linh" />,
}));

describe("premium homepage hero layout", () => {
  it("uses pre-compressed art-directed posters instead of the multi-megabyte source photo", () => {
    expect(fallbackContent.hero.backgroundMedia.src).toBe(
      "/images/tra-linh/hero-ban-lang-ngoc-linh-desktop.webp",
    );
    expect(fallbackContent.hero.mobilePoster?.src).toBe(
      "/images/tra-linh/hero-ban-lang-ngoc-linh-mobile.webp",
    );
  });

  it("uses the responsive poster as the hero background without embedding a video", () => {
    const { container } = render(<HeroSection hero={fallbackContent.hero} />);

    expect(container.querySelector("#dau-trang video")).not.toBeInTheDocument();
    expect(container.querySelector('#dau-trang picture source')).toHaveAttribute(
      "srcset",
      fallbackContent.hero.mobilePoster?.src,
    );
    expect(
      screen.getByRole("button", { name: /xem video giới thiệu/i }),
    ).toBeVisible();
    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("uses the shared 1680px grid and a near full-screen composition", () => {
    const { container } = render(<HeroSection hero={fallbackContent.hero} />);
    const hero = container.querySelector("#dau-trang");
    const grid = container.querySelector("[data-hero-grid]");

    expect(hero).toHaveClass("min-h-screen");
    expect(grid).toHaveClass(
      "max-w-[1680px]",
      "px-6",
      "sm:px-8",
      "lg:px-14",
      "xl:px-20",
    );
  });

  it("keeps the editorial story on the left and one unified rail on the right", () => {
    render(<HeroSection hero={fallbackContent.hero} />);

    expect(
      screen.getByRole("heading", {
        name: "Giữa đại ngàn, một báu vật lớn lên",
      }),
    ).toBeVisible();
    expect(screen.getByText("Trà Linh")).toBeVisible();

    const rail = screen.getByLabelText("Thông tin nhanh");
    expect(rail).toHaveClass("min-[1180px]:w-[320px]", "xl:w-[360px]");
    expect(rail.querySelector("#hero-sound-control")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /đại ngàn|vùng sâm|con người/i })).toHaveLength(3);
  });

  it("keeps the primary journey CTA visually dominant", () => {
    render(<HeroSection hero={fallbackContent.hero} />);

    const primaryCta = screen.getByRole("link", { name: /khám phá hành trình/i });
    expect(primaryCta).toHaveClass(
      "bg-[#E3B44B]",
      "px-8",
      "py-4",
      "hover:-translate-y-0.5",
    );
  });
});
