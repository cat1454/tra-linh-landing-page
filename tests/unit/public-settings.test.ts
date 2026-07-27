import { describe, expect, it } from "vitest";

import { normalizePublicSiteSettings } from "@/lib/content/public-settings";

describe("public site settings", () => {
  it("normalizes configured contact values and safe public URLs", () => {
    expect(
      normalizePublicSiteSettings({
        contact_email: "  admin@example.com ",
        contact_phone: " 0900000000 ",
        zalo_url: "https://zalo.me/0900000000",
        maps_url: "https://maps.google.com/?q=Tra+Linh",
        privacy_url: "/chinh-sach-quyen-rieng",
        legal_address: " Xã Trà Linh, thành phố Đà Nẵng ",
      }),
    ).toEqual({
      contactEmail: "admin@example.com",
      contactPhone: "0900000000",
      zaloUrl: "https://zalo.me/0900000000",
      mapsUrl: "https://maps.google.com/?q=Tra+Linh",
      privacyUrl: "/chinh-sach-quyen-rieng",
      legalAddress: "Xã Trà Linh, thành phố Đà Nẵng",
    });
  });

  it("drops malformed contact values and unsafe URL schemes", () => {
    expect(
      normalizePublicSiteSettings({
        contact_email: "not-an-email",
        contact_phone: "call-me",
        zalo_url: "javascript:alert(1)",
        maps_url: "data:text/html,unsafe",
        privacy_url: "//example.com/redirect",
        legal_address: " ",
      }),
    ).toEqual({
      contactEmail: undefined,
      contactPhone: undefined,
      zaloUrl: undefined,
      mapsUrl: undefined,
      privacyUrl: undefined,
      legalAddress: undefined,
    });
  });

  it("normalizes editable branding, SEO, and navigation", () => {
    expect(normalizePublicSiteSettings({
      header_title: " Trà Linh ",
      header_subtitle: " Đại ngàn Ngọc Linh ",
      footer_title: "Du lịch Trà Linh",
      footer_description: "Đi chậm và tôn trọng cộng đồng.",
      seo_title: "Khám phá Trà Linh",
      seo_description: "Cẩm nang hành trình vùng Ngọc Linh.",
      navigation: [
        { label: "Hành trình", href: "/#hanh-trinh" },
        { label: "Unsafe", href: "javascript:alert(1)" },
      ],
    })).toMatchObject({
      headerTitle: "Trà Linh",
      headerSubtitle: "Đại ngàn Ngọc Linh",
      footerTitle: "Du lịch Trà Linh",
      seoTitle: "Khám phá Trà Linh",
      navigation: [{ label: "Hành trình", href: "/#hanh-trinh" }],
    });
  });
});
