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
      contact_phone: "0334059776",
      primary_cta_href: "#hanh-trinh",
      header_title: "TRÀ LINH",
      footer_description: "Nội dung giới thiệu vùng cao.",
      seo_title: "Trà Linh · Ngọc Linh",
      hero_video_asset_id: "11111111-1111-4111-8111-111111111111",
    }), "site_settings");

    expect(payload).toMatchObject({
      site_name: "Trà Linh",
      contact_email: "admin@example.com",
      contact_phone: "0334059776",
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

