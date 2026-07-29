import { describe, expect, it } from "vitest";

import { buildAdminUpdatePayload } from "@/lib/cms/admin-fields";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("full CMS edit payloads", () => {
  it.each([
    ["site_settings", "site_name", "Trà Linh", { site_name: "Trà Linh" }],
    ["site_settings", "tagline", "Đại ngàn Ngọc Linh", { tagline: "Đại ngàn Ngọc Linh" }],
    ["site_settings", "description", "Điểm đến giữa đại ngàn Ngọc Linh.", { description: "Điểm đến giữa đại ngàn Ngọc Linh." }],
    ["site_settings", "primary_cta_label", "Khám phá", { primary_cta_label: "Khám phá" }],
    ["site_settings", "primary_cta_href", "#hanh-trinh", { primary_cta_href: "#hanh-trinh" }],
    ["site_settings", "legal_address", "Xã Trà Linh", { legal_address: "Xã Trà Linh" }],
    ["site_settings", "contact_email", "contact@example.com", { contact_email: "contact@example.com" }],
    ["site_settings", "contact_phone", "0900000000", { contact_phone: "0900000000" }],
    ["site_settings", "zalo_url", "https://zalo.me/0900000000", { zalo_url: "https://zalo.me/0900000000" }],
    ["site_settings", "maps_url", "https://maps.example.com/tra-linh", { maps_url: "https://maps.example.com/tra-linh" }],
    ["site_settings", "privacy_url", "/chinh-sach-quyen-rieng", { privacy_url: "/chinh-sach-quyen-rieng" }],
    ["site_settings", "header_title", "TRÀ LINH", { header_title: "TRÀ LINH" }],
    ["site_settings", "header_subtitle", "Đại ngàn Ngọc Linh", { header_subtitle: "Đại ngàn Ngọc Linh" }],
    ["site_settings", "footer_title", "Liên hệ Trà Linh", { footer_title: "Liên hệ Trà Linh" }],
    ["site_settings", "footer_description", "Thông tin liên hệ địa phương", { footer_description: "Thông tin liên hệ địa phương" }],
    ["site_settings", "seo_title", "Trà Linh · Ngọc Linh", { seo_title: "Trà Linh · Ngọc Linh" }],
    ["site_settings", "seo_description", "Khám phá Trà Linh", { seo_description: "Khám phá Trà Linh" }],
    ["site_settings", "hero_video_url", "/videos/tra-linh.mp4", { hero_video_url: "/videos/tra-linh.mp4" }],
    ["site_settings", "hero_video_asset_id", "11111111-1111-4111-8111-111111111111", { hero_video_asset_id: "11111111-1111-4111-8111-111111111111" }],
    ["site_settings", "hero_mobile_poster_url", "/images/poster.webp", { hero_mobile_poster_url: "/images/poster.webp" }],
    ["site_settings", "hero_mobile_poster_asset_id", "22222222-2222-4222-8222-222222222222", { hero_mobile_poster_asset_id: "22222222-2222-4222-8222-222222222222" }],
    ["page_sections", "eyebrow", "Trà Linh", { eyebrow: "Trà Linh" }],
    ["page_sections", "title", "Hành trình", { title: "Hành trình" }],
    ["page_sections", "description", "Những hành trình giữa đại ngàn.", { description: "Những hành trình giữa đại ngàn." }],
    ["page_sections", "secondary_text", "Thông tin bổ sung", { secondary_text: "Thông tin bổ sung" }],
    ["page_sections", "cta_label", "Xem thêm", { cta_label: "Xem thêm" }],
    ["page_sections", "cta_href", "#lien-he", { cta_href: "#lien-he" }],
    ["page_sections", "badges", "Rừng\nVăn hóa", { badges: ["Rừng", "Văn hóa"] }],
    ["page_sections", "stats", "4|Giá trị|leaf", { stats: [{ value: "4", label: "Giá trị", icon: "leaf" }] }],
    ["page_sections", "media_asset_id", "33333333-3333-4333-8333-333333333333", { media_asset_id: "33333333-3333-4333-8333-333333333333" }],
    ["hero_slides", "image_url", "/images/hero.webp", { image_url: "/images/hero.webp" }],
    ["hero_slides", "media_asset_id", "44444444-4444-4444-8444-444444444444", { media_asset_id: "44444444-4444-4444-8444-444444444444" }],
    ["hero_slides", "alt_text", "Ảnh Trà Linh", { alt_text: "Ảnh Trà Linh" }],
    ["hero_slides", "source_url", "https://example.com/source", { source_url: "https://example.com/source" }],
    ["hero_slides", "source_credit", "UBND xã Trà Linh", { source_credit: "UBND xã Trà Linh" }],
    ["hero_slides", "usage_permission", "pending", { usage_permission: "pending" }],
    ["hero_slides", "eyebrow", "Khám phá", { eyebrow: "Khám phá" }],
    ["hero_slides", "title", "Khám phá Trà Linh", { title: "Khám phá Trà Linh" }],
    ["hero_slides", "description", "Hành trình khám phá vùng cao Trà Linh.", { description: "Hành trình khám phá vùng cao Trà Linh." }],
    ["hero_slides", "cta_label", "Bắt đầu", { cta_label: "Bắt đầu" }],
    ["hero_slides", "cta_href", "#hanh-trinh", { cta_href: "#hanh-trinh" }],
    ["stories", "quote", "Lời kể bản địa", { quote: "Lời kể bản địa" }],
    ["stories", "body", "Đoạn một\nĐoạn hai", { body: ["Đoạn một", "Đoạn hai"] }],
    ["journeys", "safety_note", "Đi cùng hướng dẫn viên", { safety_note: "Đi cùng hướng dẫn viên" }],
    ["journeys", "slug", "duoi-tan-rung", { slug: "duoi-tan-rung" }],
    ["journeys", "category", "ginseng", { category: "ginseng" }],
    ["journeys", "description", "Hành trình được chuẩn bị cùng người địa phương.", { short_description: "Hành trình được chuẩn bị cùng người địa phương." }],
    ["journeys", "location_label", "Trà Linh", { location_label: "Trà Linh" }],
    ["journeys", "duration_label", "2 ngày", { duration_label: "2 ngày" }],
    ["journeys", "access_note", "Liên hệ trước", { access_note: "Liên hệ trước" }],
    ["journeys", "highlights", "Rừng già\nDược liệu", { highlights: ["Rừng già", "Dược liệu"] }],
    ["journeys", "access_status", "organized_only", { access_status: "organized_only", contact_required: true }],
    ["ginseng_story_steps", "quote", "Giữ rừng để giữ sâm", { quote: "Giữ rừng để giữ sâm" }],
    ["ginseng_story_steps", "step_number", "3", { step_number: 3 }],
    ["culture_stories", "caption", "Lễ hội tại Trà Linh", { caption: "Lễ hội tại Trà Linh" }],
    ["local_products", "origin_note", "Sản xuất tại địa phương", { origin_note: "Sản xuất tại địa phương" }],
    ["local_products", "title", "Nông sản Trà Linh", { name: "Nông sản Trà Linh" }],
    ["local_products", "category", "nong-san", { category: "nong-san" }],
    ["ginseng_products", "contact_url", "https://example.com/lien-he", { contact_url: "https://example.com/lien-he" }],
    ["ginseng_products", "product_type", "herbal-tea", { product_type: "herbal-tea" }],
    ["ginseng_products", "legal_disclaimer", "Thông tin giới thiệu sản phẩm.", { legal_disclaimer: "Thông tin giới thiệu sản phẩm." }],
    ["travel_guides", "season_label", "Tháng 3 đến tháng 8", { season_label: "Tháng 3 đến tháng 8" }],
    ["travel_guides", "category", "Chuẩn bị", { category: "Chuẩn bị" }],
    ["travel_guides", "read_time_label", "5 phút", { read_time_label: "5 phút" }],
    ["travel_guides", "sections", "Chuẩn bị nước\nLiên hệ địa phương", { sections: [{ title: "Phần 1", body: "Chuẩn bị nước" }, { title: "Phần 2", body: "Liên hệ địa phương" }] }],
    ["media_assets", "title", "Ảnh đại ngàn", { title: "Ảnh đại ngàn" }],
    ["media_assets", "alt_text", "Rừng Trà Linh", { alt_text: "Rừng Trà Linh" }],
    ["media_assets", "section", "hero", { section: "hero" }],
    ["media_assets", "source_url", "https://example.com/media", { source_url: "https://example.com/media" }],
    ["media_assets", "source_credit", "Nhiếp ảnh gia", { source_credit: "Nhiếp ảnh gia" }],
    ["media_assets", "usage_permission", "official_publication", { usage_permission: "official_publication" }],
    ["media_assets", "poster_asset_id", "55555555-5555-4555-8555-555555555555", { poster_asset_id: "55555555-5555-4555-8555-555555555555" }],
  ] as const)(
    "updates only the submitted %s.%s field",
    (table, field, fieldValue, expected) => {
      expect(buildAdminUpdatePayload(form({ [field]: fieldValue }), table))
        .toEqual(expected);
    },
  );

  it("normalizes global contact, branding, SEO, and hero media settings", () => {
    const payload = buildAdminUpdatePayload(form({
      site_name: "Trà Linh",
      contact_email: "admin@example.com",
      contact_phone: "0900000000",
      primary_cta_href: "#hanh-trinh",
      header_title: "TRÀ LINH",
      footer_description: "Nội dung giới thiệu vùng cao.",
      seo_title: "Trà Linh · Ngọc Linh",
      hero_video_asset_id: "11111111-1111-4111-8111-111111111111",
    }), "site_settings");

    expect(payload).toMatchObject({
      site_name: "Trà Linh",
      contact_email: "admin@example.com",
      contact_phone: "0900000000",
      header_title: "TRÀ LINH",
      seo_title: "Trà Linh · Ngọc Linh",
      hero_video_asset_id: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("turns section badge and statistic lines into structured JSON", () => {
    const payload = buildAdminUpdatePayload(form({
      title: "Các giá trị Trà Linh",
      badges: "Rừng\nVăn hóa",
      stats: "4|Giá trị|leaf\n12|Hành trình",
      cta_href: "#lien-he",
    }), "page_sections");

    expect(payload).toMatchObject({
      badges: ["Rừng", "Văn hóa"],
      stats: [
        { value: "4", label: "Giá trị", icon: "leaf" },
        { value: "12", label: "Hành trình" },
      ],
      cta_href: "#lien-he",
    });
  });

  it("does not clear hidden page-section fields that were not submitted", () => {
    const payload = buildAdminUpdatePayload(form({
      section_key: "journeys",
      title: "Các hành trình",
      description: "Những trải nghiệm giữa đại ngàn Trà Linh.",
    }), "page_sections");

    expect(payload).toEqual({
      title: "Các hành trình",
      description: "Những trải nghiệm giữa đại ngàn Trà Linh.",
    });
    expect(payload).not.toHaveProperty("badges");
    expect(payload).not.toHaveProperty("media_asset_id");
  });

  it("does not clear hidden global settings that were not submitted", () => {
    const payload = buildAdminUpdatePayload(form({
      site_name: "Trà Linh",
      contact_email: "admin@example.com",
      legal_address: "Xã Trà Linh, thành phố Đà Nẵng",
    }), "site_settings");

    expect(payload).toEqual({
      site_name: "Trà Linh",
      contact_email: "admin@example.com",
      legal_address: "Xã Trà Linh, thành phố Đà Nẵng",
    });
    expect(payload).not.toHaveProperty("primary_cta_label");
    expect(payload).not.toHaveProperty("hero_video_asset_id");
  });

  it("persists every editable journey field and linked media", () => {
    const payload = buildAdminUpdatePayload(form({
      title: "Đi dưới tán rừng",
      slug: "di-duoi-tan-rung",
      description: "Một hành trình được chuẩn bị kỹ cùng người địa phương.",
      category: "nature",
      access_status: "contact_required",
      body: "Đoạn một\nĐoạn hai",
      highlights: "Rừng già\nDược liệu",
      media_asset_id: "22222222-2222-4222-8222-222222222222",
      usage_permission: "client_confirmed",
    }), "journeys");

    expect(payload).toMatchObject({
      title: "Đi dưới tán rừng",
      slug: "di-duoi-tan-rung",
      category: "nature",
      access_status: "contact_required",
      contact_required: true,
      body: ["Đoạn một", "Đoạn hai"],
      highlights: ["Rừng già", "Dược liệu"],
      media_asset_id: "22222222-2222-4222-8222-222222222222",
    });
  });
});
