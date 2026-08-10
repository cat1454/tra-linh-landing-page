import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { createContentRepository } from "@/lib/content/repository";

const retiredBackendName = ["supa", "base"].join("");

describe("static-only architecture", () => {
  it("serves the curated local content as the canonical source", async () => {
    const content = await createContentRepository().getHomePageContent();

    expect(content.source).toBe("static");
  });

  it("does not ship the retired backend SDK or admin application", () => {
    const packageJson = readFileSync(resolve(process.cwd(), "package.json"), "utf8");
    const nextConfig = readFileSync(resolve(process.cwd(), "next.config.ts"), "utf8");

    expect(packageJson.toLowerCase()).not.toContain(retiredBackendName);
    expect(nextConfig.toLowerCase()).not.toContain(retiredBackendName);
    expect(existsSync(resolve(process.cwd(), "app", "admin", "page.tsx"))).toBe(false);
    expect(
      existsSync(resolve(process.cwd(), "lib", retiredBackendName, "index.ts")),
    ).toBe(false);
  });
});
