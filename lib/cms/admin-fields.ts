import { z } from "zod";

import type { ContentTableName } from "@/lib/supabase/types";

const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120);
const title = z.string().trim().min(2).max(180);
const description = z.string().trim().min(10).max(8_000);
const url = z.union([
  z.literal(""),
  z.string().trim().url().max(2_000).refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }),
  z.string().trim().regex(/^\/[a-zA-Z0-9/_\-.]+$/).max(2_000),
  z.string().trim().regex(/^#[a-zA-Z0-9_-]+$/).max(120),
]);
const uuidOrEmpty = z.union([z.literal(""), z.string().uuid()]);

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function lines(raw: string) {
  return raw.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

function common(formData: FormData) {
  return {
    image_url: url.parse(value(formData, "image_url")) || null,
    media_asset_id: uuidOrEmpty.parse(value(formData, "media_asset_id")) || null,
    alt_text: value(formData, "alt_text") || null,
    source_url: url.parse(value(formData, "source_url")) || null,
    source_credit: value(formData, "source_credit") || null,
    usage_permission: z.enum([
      "client_confirmed",
      "official_publication",
      "pending",
    ]).catch("client_confirmed").parse(value(formData, "usage_permission")),
  };
}

export function buildAdminUpdatePayload(
  formData: FormData,
  table: ContentTableName,
): Record<string, unknown> {
  if (table === "page_sections") {
    return {
      eyebrow: value(formData, "eyebrow") || null,
      title: title.parse(formData.get("title")),
      description: value(formData, "description") || null,
      secondary_text: value(formData, "secondary_text") || null,
      cta_label: value(formData, "cta_label") || null,
      cta_href: url.parse(value(formData, "cta_href")) || null,
      badges: lines(value(formData, "badges")),
      stats: lines(value(formData, "stats")).flatMap((line) => {
        const [statValue, label, icon] = line.split("|").map((item) => item.trim());
        return statValue && label
          ? [{ value: statValue, label, ...(icon ? { icon } : {}) }]
          : [];
      }),
      media_asset_id: uuidOrEmpty.parse(value(formData, "media_asset_id")) || null,
    };
  }

  if (table === "site_settings") {
    return {
      site_name: title.parse(formData.get("site_name")),
      tagline: value(formData, "tagline") || null,
      description: value(formData, "description") || null,
      primary_cta_label: value(formData, "primary_cta_label") || null,
      primary_cta_href: url.parse(value(formData, "primary_cta_href")) || null,
      legal_address: value(formData, "legal_address") || null,
      contact_email:
        z.union([z.literal(""), z.string().email().max(254)])
          .parse(value(formData, "contact_email")) || null,
      contact_phone: z.string().max(30).parse(value(formData, "contact_phone")) || null,
      zalo_url: url.parse(value(formData, "zalo_url")) || null,
      maps_url: url.parse(value(formData, "maps_url")) || null,
      privacy_url: url.parse(value(formData, "privacy_url")) || null,
      header_title: value(formData, "header_title") || null,
      header_subtitle: value(formData, "header_subtitle") || null,
      footer_title: value(formData, "footer_title") || null,
      footer_description: value(formData, "footer_description") || null,
      seo_title: value(formData, "seo_title") || null,
      seo_description: value(formData, "seo_description") || null,
      hero_video_url: url.parse(value(formData, "hero_video_url")) || null,
      hero_video_asset_id:
        uuidOrEmpty.parse(value(formData, "hero_video_asset_id")) || null,
      hero_mobile_poster_url:
        url.parse(value(formData, "hero_mobile_poster_url")) || null,
      hero_mobile_poster_asset_id:
        uuidOrEmpty.parse(value(formData, "hero_mobile_poster_asset_id")) || null,
    };
  }

  if (table === "media_assets") {
    return {
      title: title.parse(formData.get("title")),
      alt_text: z.string().trim().min(5).max(300).parse(formData.get("alt_text")),
      section: value(formData, "section") || null,
      source_url: url.parse(value(formData, "source_url")) || null,
      source_credit: value(formData, "source_credit") || null,
      usage_permission: z.enum([
        "client_confirmed",
        "official_publication",
        "pending",
      ]).parse(formData.get("usage_permission")),
      poster_asset_id:
        uuidOrEmpty.parse(value(formData, "poster_asset_id")) || null,
    };
  }

  const recordTitle = title.parse(formData.get("title"));
  const recordDescription = description.parse(formData.get("description"));
  const shared = common(formData);

  if (table === "hero_slides") {
    return {
      ...shared,
      eyebrow: value(formData, "eyebrow") || null,
      title: recordTitle,
      description: recordDescription,
      cta_label: value(formData, "cta_label") || null,
      cta_href: url.parse(value(formData, "cta_href")) || null,
    };
  }
  if (table === "stories") {
    return {
      ...shared,
      eyebrow: value(formData, "eyebrow") || null,
      title: recordTitle,
      description: recordDescription,
      body: lines(value(formData, "body") || recordDescription),
      quote: value(formData, "quote") || null,
    };
  }
  if (table === "journeys") {
    const accessStatus = z.enum([
      "open",
      "contact_required",
      "organized_only",
    ]).parse(formData.get("access_status"));
    return {
      ...shared,
      title: recordTitle,
      slug: slug.parse(value(formData, "slug")),
      category: z.enum(["nature", "community", "heritage", "ginseng"])
        .parse(formData.get("category")),
      short_description: recordDescription,
      body: lines(value(formData, "body") || recordDescription),
      location_label: value(formData, "location_label") || null,
      duration_label: value(formData, "duration_label") || null,
      access_note: value(formData, "access_note") || null,
      safety_note: value(formData, "safety_note") || null,
      highlights: lines(value(formData, "highlights")),
      access_status: accessStatus,
      contact_required: accessStatus !== "open",
    };
  }
  if (table === "ginseng_story_steps") {
    return {
      ...shared,
      title: recordTitle,
      description: recordDescription,
      step_number: z.coerce.number().int().min(1).parse(formData.get("step_number")),
      quote: value(formData, "quote") || null,
    };
  }
  if (table === "culture_stories") {
    return {
      ...shared,
      title: recordTitle,
      description: recordDescription,
      caption: value(formData, "caption") || null,
    };
  }
  if (table === "local_products") {
    return {
      ...shared,
      name: recordTitle,
      slug: slug.parse(value(formData, "slug")),
      category: z.enum(["am-thuc", "duoc-lieu", "nong-san"])
        .parse(formData.get("category")),
      description: recordDescription,
      origin_note: value(formData, "origin_note") || null,
    };
  }
  if (table === "ginseng_products") {
    return {
      ...shared,
      name: recordTitle,
      slug: slug.parse(value(formData, "slug")),
      product_type: z.enum(["fresh-ginseng", "dried-ginseng", "herbal-tea"])
        .parse(formData.get("product_type")),
      short_description: recordDescription,
      contact_url: url.parse(value(formData, "contact_url")) || null,
      origin_note: value(formData, "origin_note") || null,
      legal_disclaimer:
        value(formData, "legal_disclaimer") ||
        "Nội dung giới thiệu, không thay thế tư vấn chuyên môn.",
    };
  }
  if (table === "travel_guides") {
    return {
      ...shared,
      title: recordTitle,
      slug: slug.parse(value(formData, "slug")),
      category: value(formData, "category") || "Cẩm nang",
      excerpt: recordDescription,
      body: lines(value(formData, "body") || recordDescription),
      read_time_label: value(formData, "read_time_label") || null,
      season_label: value(formData, "season_label") || null,
      sections: lines(value(formData, "sections")).map((body, index) => ({
        title: `Phần ${index + 1}`,
        body,
      })),
    };
  }
  return {};
}
