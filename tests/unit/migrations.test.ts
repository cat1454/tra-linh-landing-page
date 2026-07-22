import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function migration(name: string) {
  return readFileSync(
    resolve(process.cwd(), "supabase", "migrations", name),
    "utf8",
  );
}

describe("verified public content migration", () => {
  it("adds optional public contact settings and lead interest", () => {
    const sql = migration(
      "202607220003_verified_public_content_and_contact.sql",
    );

    expect(sql).toContain("add column if not exists contact_email text");
    expect(sql).toContain("add column if not exists contact_phone text");
    expect(sql).toContain("add column if not exists zalo_url text");
    expect(sql).toContain("add column if not exists maps_url text");
    expect(sql).toContain("add column if not exists privacy_url text");
    expect(sql).toContain("add column if not exists interest text");
    expect(sql).toContain("journey");
    expect(sql).toContain("partnership");
  });

  it("replaces public read policies with verified-only guards", () => {
    const sql = migration(
      "202607220003_verified_public_content_and_contact.sql",
    );

    expect(sql).toContain('drop policy if exists "Public reads published content"');
    expect(sql).toContain("status = 'published'::public.content_status");
    expect(sql).toContain("is_placeholder = false");
    expect(sql).toContain("verified_at is not null");
    expect(sql).toContain("usage_permission <> 'pending'");
  });

  it("keeps placeholder cleanup in a separate forward-only data migration", () => {
    const sql = migration("202607220004_hide_placeholder_content.sql");

    expect(sql).toContain("Forward-only data migration");
    expect(sql).toContain("status = 'review'::public.content_status");
    expect(sql).toContain("is_placeholder = true");
  });

  it("uses the normalized-email index when upserting the production admin", () => {
    const sql = migration("202607220005_production_contact_settings.sql");

    expect(sql).toContain("on conflict ((lower(email))) do update");
  });

  it("publishes every verified journey and guide linked from the fallback homepage", () => {
    const sql = migration("202607220006_verified_detail_content.sql");

    for (const slug of [
      "trekking-duoi-tan-rung",
      "ban-lang-trong-suong",
      "cham-vao-mien-duoc-lieu",
      "duong-den-tra-linh",
      "thoi-diem-goi-y",
      "luu-y-khi-vao-rung",
    ]) {
      expect(sql).toContain(slug);
    }
    expect(sql).toContain("status = excluded.status");
    expect(sql).toContain("is_placeholder = excluded.is_placeholder");
    expect(sql).toContain("verified_at = excluded.verified_at");
  });
});
