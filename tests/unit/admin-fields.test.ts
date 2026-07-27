import { describe, expect, it } from "vitest";

import { buildAdminUpdatePayload } from "@/lib/cms/admin-fields";

function form(values: Record<string, string>) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

describe("full CMS edit payloads", () => {
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
