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
    ...(formData.has("image_url") ? {
      image_url: url.parse(value(formData, "image_url")) || null,
    } : {}),
    ...(formData.has("media_asset_id") ? {
      media_asset_id: uuidOrEmpty.parse(value(formData, "media_asset_id")) || null,
    } : {}),
    ...(formData.has("alt_text") ? {
      alt_text: value(formData, "alt_text") || null,
    } : {}),
    ...(formData.has("source_url") ? {
      source_url: url.parse(value(formData, "source_url")) || null,
    } : {}),
    ...(formData.has("source_credit") ? {
      source_credit: value(formData, "source_credit") || null,
    } : {}),
    ...(formData.has("usage_permission") ? {
      usage_permission: z.enum([
        "client_confirmed",
        "official_publication",
        "pending",
      ]).catch("client_confirmed").parse(value(formData, "usage_permission")),
    } : {}),
  };
}

export function buildAdminUpdatePayload(
  formData: FormData,
  table: ContentTableName,
): Record<string, unknown> {
  if (table === "page_sections") {
    return {
      ...(formData.has("eyebrow") ? { eyebrow: value(formData, "eyebrow") || null } : {}),
      ...(formData.has("title") ? { title: title.parse(formData.get("title")) } : {}),
      ...(formData.has("description") ? { description: value(formData, "description") || null } : {}),
      ...(formData.has("secondary_text") ? { secondary_text: value(formData, "secondary_text") || null } : {}),
      ...(formData.has("cta_label") ? { cta_label: value(formData, "cta_label") || null } : {}),
      ...(formData.has("cta_href") ? { cta_href: url.parse(value(formData, "cta_href")) || null } : {}),
      ...(formData.has("badges") ? { badges: lines(value(formData, "badges")) } : {}),
      ...(formData.has("stats") ? { stats: lines(value(formData, "stats")).flatMap((line) => {
        const [statValue, label, icon] = line.split("|").map((item) => item.trim());
        return statValue && label
          ? [{ value: statValue, label, ...(icon ? { icon } : {}) }]
          : [];
      }) } : {}),
      ...(formData.has("media_asset_id") ? { media_asset_id: uuidOrEmpty.parse(value(formData, "media_asset_id")) || null } : {}),
    };
  }

  if (table === "site_settings") {
    return {
      ...(formData.has("site_name") ? { site_name: title.parse(formData.get("site_name")) } : {}),
      ...(formData.has("tagline") ? { tagline: value(formData, "tagline") || null } : {}),
      ...(formData.has("description") ? { description: value(formData, "description") || null } : {}),
      ...(formData.has("primary_cta_label") ? { primary_cta_label: value(formData, "primary_cta_label") || null } : {}),
      ...(formData.has("primary_cta_href") ? { primary_cta_href: url.parse(value(formData, "primary_cta_href")) || null } : {}),
      ...(formData.has("legal_address") ? { legal_address: value(formData, "legal_address") || null } : {}),
      ...(formData.has("contact_email") ? { contact_email:
        z.union([z.literal(""), z.string().email().max(254)])
          .parse(value(formData, "contact_email")) || null } : {}),
      ...(formData.has("contact_phone") ? { contact_phone: z.string().max(30).parse(value(formData, "contact_phone")) || null } : {}),
      ...(formData.has("zalo_url") ? { zalo_url: url.parse(value(formData, "zalo_url")) || null } : {}),
      ...(formData.has("maps_url") ? { maps_url: url.parse(value(formData, "maps_url")) || null } : {}),
      ...(formData.has("privacy_url") ? { privacy_url: url.parse(value(formData, "privacy_url")) || null } : {}),
      ...(formData.has("header_title") ? { header_title: value(formData, "header_title") || null } : {}),
      ...(formData.has("header_subtitle") ? { header_subtitle: value(formData, "header_subtitle") || null } : {}),
      ...(formData.has("footer_title") ? { footer_title: value(formData, "footer_title") || null } : {}),
      ...(formData.has("footer_description") ? { footer_description: value(formData, "footer_description") || null } : {}),
      ...(formData.has("seo_title") ? { seo_title: value(formData, "seo_title") || null } : {}),
      ...(formData.has("seo_description") ? { seo_description: value(formData, "seo_description") || null } : {}),
      ...(formData.has("hero_video_url") ? { hero_video_url: url.parse(value(formData, "hero_video_url")) || null } : {}),
      ...(formData.has("hero_video_asset_id") ? { hero_video_asset_id: uuidOrEmpty.parse(value(formData, "hero_video_asset_id")) || null } : {}),
      ...(formData.has("hero_mobile_poster_url") ? { hero_mobile_poster_url: url.parse(value(formData, "hero_mobile_poster_url")) || null } : {}),
      ...(formData.has("hero_mobile_poster_asset_id") ? { hero_mobile_poster_asset_id: uuidOrEmpty.parse(value(formData, "hero_mobile_poster_asset_id")) || null } : {}),
    };
  }

  if (table === "media_assets") {
    return {
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("alt_text") ? { alt_text: z.string().trim().min(5).max(300).parse(value(formData, "alt_text")) } : {}),
      ...(formData.has("section") ? { section: value(formData, "section") || null } : {}),
      ...(formData.has("source_url") ? { source_url: url.parse(value(formData, "source_url")) || null } : {}),
      ...(formData.has("source_credit") ? { source_credit: value(formData, "source_credit") || null } : {}),
      ...(formData.has("usage_permission") ? { usage_permission: z.enum([
        "client_confirmed",
        "official_publication",
        "pending",
      ]).parse(formData.get("usage_permission")) } : {}),
      ...(formData.has("poster_asset_id") ? { poster_asset_id:
        uuidOrEmpty.parse(value(formData, "poster_asset_id")) || null } : {}),
    };
  }

  const shared = common(formData);

  if (table === "hero_slides") {
    return {
      ...shared,
      ...(formData.has("eyebrow") ? { eyebrow: value(formData, "eyebrow") || null } : {}),
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("description") ? { description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("cta_label") ? { cta_label: value(formData, "cta_label") || null } : {}),
      ...(formData.has("cta_href") ? { cta_href: url.parse(value(formData, "cta_href")) || null } : {}),
    };
  }
  if (table === "stories") {
    return {
      ...shared,
      ...(formData.has("eyebrow") ? { eyebrow: value(formData, "eyebrow") || null } : {}),
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("description") ? { description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("body") ? { body: lines(value(formData, "body")) } : {}),
      ...(formData.has("quote") ? { quote: value(formData, "quote") || null } : {}),
    };
  }
  if (table === "journeys") {
    const accessStatus = formData.has("access_status")
      ? z.enum(["open", "contact_required", "organized_only"])
        .parse(formData.get("access_status"))
      : undefined;
    return {
      ...shared,
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("slug") ? { slug: slug.parse(value(formData, "slug")) } : {}),
      ...(formData.has("category") ? { category: z.enum(["nature", "community", "heritage", "ginseng"])
        .parse(formData.get("category")) } : {}),
      ...(formData.has("description") ? { short_description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("body") ? { body: lines(value(formData, "body")) } : {}),
      ...(formData.has("location_label") ? { location_label: value(formData, "location_label") || null } : {}),
      ...(formData.has("duration_label") ? { duration_label: value(formData, "duration_label") || null } : {}),
      ...(formData.has("access_note") ? { access_note: value(formData, "access_note") || null } : {}),
      ...(formData.has("safety_note") ? { safety_note: value(formData, "safety_note") || null } : {}),
      ...(formData.has("highlights") ? { highlights: lines(value(formData, "highlights")) } : {}),
      ...(accessStatus ? {
        access_status: accessStatus,
        contact_required: accessStatus !== "open",
      } : {}),
    };
  }
  if (table === "ginseng_story_steps") {
    return {
      ...shared,
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("description") ? { description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("step_number") ? { step_number: z.coerce.number().int().min(1).parse(formData.get("step_number")) } : {}),
      ...(formData.has("quote") ? { quote: value(formData, "quote") || null } : {}),
    };
  }
  if (table === "culture_stories") {
    return {
      ...shared,
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("description") ? { description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("caption") ? { caption: value(formData, "caption") || null } : {}),
    };
  }
  if (table === "local_products") {
    return {
      ...shared,
      ...(formData.has("title") ? { name: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("slug") ? { slug: slug.parse(value(formData, "slug")) } : {}),
      ...(formData.has("category") ? { category: z.enum(["am-thuc", "duoc-lieu", "nong-san"])
        .parse(formData.get("category")) } : {}),
      ...(formData.has("description") ? { description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("origin_note") ? { origin_note: value(formData, "origin_note") || null } : {}),
    };
  }
  if (table === "ginseng_products") {
    return {
      ...shared,
      ...(formData.has("title") ? { name: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("slug") ? { slug: slug.parse(value(formData, "slug")) } : {}),
      ...(formData.has("product_type") ? { product_type: z.enum(["fresh-ginseng", "dried-ginseng", "herbal-tea"])
        .parse(formData.get("product_type")) } : {}),
      ...(formData.has("description") ? { short_description: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("contact_url") ? { contact_url: url.parse(value(formData, "contact_url")) || null } : {}),
      ...(formData.has("origin_note") ? { origin_note: value(formData, "origin_note") || null } : {}),
      ...(formData.has("legal_disclaimer") ? { legal_disclaimer:
        value(formData, "legal_disclaimer") ||
        "Nội dung giới thiệu, không thay thế tư vấn chuyên môn.",
      } : {}),
    };
  }
  if (table === "travel_guides") {
    return {
      ...shared,
      ...(formData.has("title") ? { title: title.parse(value(formData, "title")) } : {}),
      ...(formData.has("slug") ? { slug: slug.parse(value(formData, "slug")) } : {}),
      ...(formData.has("category") ? { category: value(formData, "category") || "Cẩm nang" } : {}),
      ...(formData.has("description") ? { excerpt: description.parse(value(formData, "description")) } : {}),
      ...(formData.has("body") ? { body: lines(value(formData, "body")) } : {}),
      ...(formData.has("read_time_label") ? { read_time_label: value(formData, "read_time_label") || null } : {}),
      ...(formData.has("season_label") ? { season_label: value(formData, "season_label") || null } : {}),
      ...(formData.has("sections") ? { sections: lines(value(formData, "sections")).map((body, index) => ({
        title: `Phần ${index + 1}`,
        body,
      })) } : {}),
    };
  }
  return {};
}
