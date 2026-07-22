import { describe, expect, it } from "vitest";

import { normalizePublicSiteSettings } from "@/lib/content/public-settings";

describe("public site settings", () => {
  it("normalizes configured contact values and safe public URLs", () => {
    expect(
      normalizePublicSiteSettings({
        contact_email: "  phuh15521@gmail.com ",
        contact_phone: " 0334059776 ",
        zalo_url: "https://zalo.me/0334059776",
        maps_url: "https://maps.google.com/?q=Tra+Linh",
        privacy_url: "/chinh-sach-quyen-rieng",
      }),
    ).toEqual({
      contactEmail: "phuh15521@gmail.com",
      contactPhone: "0334059776",
      zaloUrl: "https://zalo.me/0334059776",
      mapsUrl: "https://maps.google.com/?q=Tra+Linh",
      privacyUrl: "/chinh-sach-quyen-rieng",
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
      }),
    ).toEqual({
      contactEmail: undefined,
      contactPhone: undefined,
      zaloUrl: undefined,
      mapsUrl: undefined,
      privacyUrl: undefined,
    });
  });
});
