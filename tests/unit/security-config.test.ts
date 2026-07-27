import { describe, expect, it } from "vitest";

import nextConfig from "@/next.config";

describe("security configuration for the tourism map", () => {
  it("allows Mapbox Standard without reopening the former raster providers", async () => {
    const headerGroups = await nextConfig.headers?.();
    const headers = headerGroups?.[0]?.headers ?? [];
    const csp = headers.find((header) => header.key === "Content-Security-Policy")?.value;
    const permissions = headers.find((header) => header.key === "Permissions-Policy")?.value;

    expect(csp).toContain("https://api.mapbox.com");
    expect(csp).toContain("https://events.mapbox.com");
    expect(csp).toContain("'wasm-unsafe-eval'");
    expect(csp).not.toContain("https://tile.openstreetmap.org");
    expect(csp).not.toContain("https://server.arcgisonline.com");
    expect(permissions).toContain("geolocation=()");
  });
});
