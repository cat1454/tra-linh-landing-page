import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LocalProduceSection } from "@/components/home/LocalProduceSection";
import { PressSection } from "@/components/home/PressSection";
import { ResponsiveMediaRail } from "@/components/home/ResponsiveMediaRail";
import type { LocalSpecialty, MediaAsset, PressArticle } from "@/lib/content/types";

function media(id: string): MediaAsset {
  return {
    id,
    src: `/images/${id}.jpg`,
    altText: `Khoảnh khắc ${id}`,
    sourceUrl: "https://example.com/source",
    sourceCredit: "Nguồn kiểm thử",
    usagePermission: "client_confirmed",
    verifiedAt: "2026-07-24",
    mediaType: "image",
  };
}

function specialty(
  id: string,
  category: LocalSpecialty["category"],
): LocalSpecialty {
  return {
    id,
    slug: id,
    name: `Sản vật ${id}`,
    category,
    description: `Câu chuyện chi tiết của sản vật ${id} tại Trà Linh.`,
    media: media(`media-${id}`),
    isPlaceholder: false,
    sourceUrl: "https://example.com/source",
    sourceCredit: "Nguồn kiểm thử",
    displayOrder: 1,
  };
}

function pressArticle(id: string, isVerified: boolean): PressArticle {
  return {
    id,
    title: `Bài viết ${id}`,
    publisher: "Báo kiểm thử",
    publishedDate: "24 tháng 7, 2026",
    summary: `Tóm tắt ${id}`,
    url: `https://example.com/articles/${id}`,
    media: media(`press-${id}`),
    displayOrder: 1,
    isVerified,
  };
}

describe("modern responsive homepage interactions", () => {
  it("renders only verified press articles as descriptive external links", () => {
    render(
      <PressSection
        articles={[
          pressArticle("draft", false),
          pressArticle("verified", true),
        ]}
      />,
    );

    expect(screen.queryByText("Bài viết draft")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /bài viết verified/i })).toHaveAttribute(
      "href",
      "https://example.com/articles/verified",
    );
    expect(screen.getByRole("link", { name: /bài viết verified/i })).toHaveAttribute(
      "target",
      "_blank",
    );
    expect(screen.getByText("24 tháng 7, 2026")).toBeInTheDocument();
  });

  it("opens a specialty dialog from a native button and restores focus", async () => {
    const user = userEvent.setup();
    render(<LocalProduceSection items={[specialty("ca-nien", "am-thuc")]} />);

    const trigger = screen.getByRole("button", { name: /xem câu chuyện sản vật ca-nien/i });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeVisible();

    await user.click(screen.getByRole("button", { name: /đóng câu chuyện/i }));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("exposes the active produce filter and updates the visible cards", async () => {
    render(
      <LocalProduceSection
        items={[
          specialty("ca-nien", "am-thuc"),
          specialty("sam", "duoc-lieu"),
        ]}
      />,
    );

    const medicinalFilter = screen.getByRole("button", { name: "Dược liệu" });
    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(medicinalFilter);
    expect(medicinalFilter).toHaveAttribute("aria-pressed", "true");
    await waitFor(() => expect(screen.queryByText("Sản vật ca-nien")).not.toBeInTheDocument());
    expect(screen.getByText("Sản vật sam")).toBeInTheDocument();
  });

  it("limits each media rail to twelve originals and hides desktop duplicates from assistive technology", () => {
    render(
      <ResponsiveMediaRail
        media={Array.from({ length: 20 }, (_, index) => media(`rail-${index + 1}`))}
        tone="cream"
        itemSize="large"
      />,
    );

    const originals = within(screen.getByTestId("media-rail-originals")).getAllByRole("img");
    expect(originals).toHaveLength(12);
    expect(screen.getByTestId("media-rail-duplicates")).toHaveAttribute("aria-hidden", "true");
    expect(within(screen.getByTestId("media-rail-duplicates")).queryAllByRole("img")).toHaveLength(0);
  });
});
