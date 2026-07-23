import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminVisualEditor } from "@/components/admin/AdminVisualEditor";
import AdminLayout from "@/app/admin/layout";
import {
  ADMIN_NAV_GROUPS,
  buildAdminPreviewMediaMap,
  resolveEditorialIntent,
} from "@/lib/cms/admin-preview";
import { fallbackContent } from "@/lib/content/fallback-content";

describe("admin visual editor", () => {
  it("uses friendly navigation labels instead of database names", () => {
    const labels = ADMIN_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.label),
    );

    expect(labels).toContain("Các vùng trên trang chủ");
    expect(labels).toContain("Thông tin chung & liên hệ");
    expect(labels).toContain("Kho ảnh & video");
    expect(labels).not.toContain("page_sections");
  });

  it("updates the section preview while a nontechnical editor types", () => {
    render(
      <AdminVisualEditor
        table="page_sections"
        row={{
          id: "section-1",
          section_key: "hero",
          title: "Tiêu đề ban đầu",
          description: "Mô tả ban đầu",
          status: "published",
          display_order: 0,
          is_placeholder: false,
        }}
        mediaOptions={[]}
      >
        <form>
          <label htmlFor="title">Tiêu đề</label>
          <input id="title" name="title" defaultValue="Tiêu đề ban đầu" />
        </form>
      </AdminVisualEditor>,
    );

    expect(screen.getByText("Tiêu đề ban đầu", { selector: "[data-preview-title]" })).toBeVisible();

    fireEvent.input(screen.getByLabelText("Tiêu đề"), {
      target: { value: "Tiêu đề đang sửa" },
    });

    expect(screen.getByText("Tiêu đề đang sửa", { selector: "[data-preview-title]" })).toBeVisible();
    expect(screen.getByText("Thay đổi chưa lưu")).toBeVisible();
  });

  it("resolves the two explicit editorial actions", () => {
    expect(resolveEditorialIntent("save-draft")).toBe("draft");
    expect(resolveEditorialIntent("publish")).toBe("published");
    expect(() => resolveEditorialIntent("anything-else")).toThrow();
  });

  it("previews a newly selected library image immediately", () => {
    render(
      <AdminVisualEditor
        table="page_sections"
        row={{
          id: "section-2",
          section_key: "story",
          title: "Câu chuyện",
          status: "draft",
          display_order: 1,
          is_placeholder: false,
        }}
        mediaOptions={[
          {
            id: "media-1",
            title: "Rừng Trà Linh",
            mediaType: "image",
            previewUrl: "https://example.com/forest.webp",
          },
        ]}
      >
        <form>
          <label htmlFor="media">Ảnh từ thư viện</label>
          <select id="media" name="media_asset_id" defaultValue="">
            <option value="">Không chọn</option>
            <option value="media-1">Rừng Trà Linh</option>
          </select>
        </form>
      </AdminVisualEditor>,
    );

    fireEvent.change(screen.getByLabelText("Ảnh từ thư viện"), {
      target: { value: "media-1" },
    });

    expect(screen.getByRole("img", { name: "Câu chuyện" })).toHaveStyle({
      backgroundImage: 'url("https://example.com/forest.webp")',
    });
  });

  it("marks admin routes so public website chrome can be hidden", () => {
    const { container } = render(
      <AdminLayout>
        <main>Trang quản trị</main>
      </AdminLayout>,
    );

    expect(container.querySelector("[data-admin-root]")).toBeInTheDocument();
  });

  it("resets preview content when the selected record changes", () => {
    const { rerender } = render(
      <AdminVisualEditor
        table="page_sections"
        row={{
          id: "hero-row",
          section_key: "hero",
          title: "Tiêu đề Hero",
          status: "published",
          display_order: 0,
          is_placeholder: false,
        }}
        mediaOptions={[]}
      >
        <form><input name="title" defaultValue="Tiêu đề Hero" /></form>
      </AdminVisualEditor>,
    );

    rerender(
      <AdminVisualEditor
        table="page_sections"
        row={{
          id: "story-row",
          section_key: "story",
          title: "Tiêu đề Câu chuyện",
          status: "published",
          display_order: 1,
          is_placeholder: false,
        }}
        mediaOptions={[]}
      >
        <form><input name="title" defaultValue="Tiêu đề Câu chuyện" /></form>
      </AdminVisualEditor>,
    );

    expect(screen.getByText("Tiêu đề Câu chuyện", { selector: "[data-preview-title]" })).toBeVisible();
    expect(screen.queryByText("Tiêu đề Hero", { selector: "[data-preview-title]" })).not.toBeInTheDocument();
  });

  it("shows the image currently used by the website when no media is linked", () => {
    render(
      <AdminVisualEditor
        table="page_sections"
        row={{
          id: "story-fallback",
          section_key: "story",
          title: "Câu chuyện",
          status: "published",
          display_order: 1,
          is_placeholder: false,
        }}
        mediaOptions={[]}
        fallbackMedia={{
          url: "/images/tra-linh/story.webp",
          mediaType: "image",
          altText: "Rừng Trà Linh",
          source: "website",
        }}
      >
        <form><input name="title" defaultValue="Câu chuyện" /></form>
      </AdminVisualEditor>,
    );

    expect(screen.getByRole("img", { name: "Rừng Trà Linh" })).toBeVisible();
    expect(screen.getByText("Ảnh hiện tại của website")).toBeVisible();
  });

  it("maps every homepage area to representative published media", () => {
    const map = buildAdminPreviewMediaMap(fallbackContent);

    expect(map.hero.url).toBe(fallbackContent.hero.backgroundMedia.src);
    expect(map.story.url).toBe(fallbackContent.storyChapters[0].media.src);
    expect(map.journeys.url).toBe(fallbackContent.journeys[0].featuredMedia.src);
    expect(map.ginseng.url).toBe(fallbackContent.ginsengStorySteps[0].media.src);
    expect(map.culture.url).toBe(fallbackContent.cultureStories[0].media.src);
    expect(map.local_products.url).toBe(fallbackContent.localSpecialties[0].media.src);
    expect(map.products.url).toBe(
      fallbackContent.products[0]?.featuredMedia.src ??
        fallbackContent.hero.backgroundMedia.src,
    );
    expect(map.guides.url).toBe(fallbackContent.guides[0].featuredMedia.src);
  });

  it("shows a clear recovery message when an image preview cannot load", () => {
    render(
      <AdminVisualEditor
        table="media_assets"
        row={{
          id: "broken-media",
          title: "Ảnh bị lỗi",
          external_url: "https://example.com/missing.webp",
          media_type: "image",
          status: "draft",
          display_order: 0,
          is_placeholder: false,
        }}
        mediaOptions={[]}
      >
        <form><input name="title" defaultValue="Ảnh bị lỗi" /></form>
      </AdminVisualEditor>,
    );

    fireEvent.error(screen.getByRole("img", { name: "Ảnh bị lỗi" }));

    expect(screen.getByText(/không tải được ảnh xem trước/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /mở ảnh trong tab mới/i })).toHaveAttribute(
      "href",
      "https://example.com/missing.webp",
    );
  });
});
