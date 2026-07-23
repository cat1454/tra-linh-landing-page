"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminAccess } from "@/lib/supabase/access";
import { buildAdminUpdatePayload } from "@/lib/cms/admin-fields";
import { resolveEditorialIntent } from "@/lib/cms/admin-preview";
import { getMediaBucketName, getPublicSupabaseConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentStatus, ContentTableName } from "@/lib/supabase/types";
import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  validateMediaUpload,
} from "@/lib/supabase/uploads";

const tableSchema = z.enum([
  "site_settings",
  "hero_slides",
  "stories",
  "journeys",
  "ginseng_story_steps",
  "culture_stories",
  "local_products",
  "ginseng_products",
  "travel_guides",
  "media_assets",
  "page_sections",
]);

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(120);
const titleSchema = z.string().trim().min(2).max(180);
const descriptionSchema = z.string().trim().min(10).max(8_000);
const httpUrlSchema = z
  .string()
  .trim()
  .url()
  .max(2_000)
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  });
const optionalUrlSchema = z.union([
  z.literal(""),
  httpUrlSchema,
  z.string().trim().regex(/^\/[a-zA-Z0-9/_\-.]+$/).max(2_000),
]);
const externalUrlSchema = httpUrlSchema;
const statusSchema = z.enum(["draft", "review", "published"]);
const usagePermissionSchema = z.enum([
  "client_confirmed",
  "official_publication",
  "pending",
]);
const journeyCategorySchema = z.enum([
  "nature",
  "community",
  "heritage",
  "ginseng",
]);
const accessStatusSchema = z.enum([
  "open",
  "contact_required",
  "organized_only",
]);
const localProductCategorySchema = z.enum([
  "am-thuc",
  "duoc-lieu",
  "nong-san",
]);
const ginsengProductTypeSchema = z.enum([
  "fresh-ginseng",
  "dried-ginseng",
  "herbal-tea",
]);

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function checked(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}

function adminRedirect(
  table: ContentTableName,
  key: "notice" | "error",
  value: string,
  id?: string,
): never {
  const selected = id ? `&id=${encodeURIComponent(id)}` : "";
  redirect(`/admin?table=${table}${selected}&${key}=${encodeURIComponent(value)}`);
}

async function requireAuthenticatedAdmin(table: ContentTableName) {
  const access = await getAdminAccess();
  if (access.state === "unconfigured") redirect("/admin/login?error=unconfigured");
  if (access.state === "anonymous") redirect("/admin/login");
  if (access.state !== "authorized") redirect("/admin/login?error=forbidden");

  const supabase = await createServerSupabaseClient();
  if (!supabase) adminRedirect(table, "error", "cms-unavailable");
  return supabase;
}

function parseCommon(formData: FormData) {
  const table = tableSchema.parse(formData.get("table"));
  const title = titleSchema.parse(formData.get("title"));
  const description = descriptionSchema.parse(formData.get("description"));
  const imageUrl = optionalUrlSchema.parse(text(formData, "image_url"));
  const mediaAssetIdText = text(formData, "media_asset_id");
  const mediaAssetId = mediaAssetIdText
    ? z.string().uuid().parse(mediaAssetIdText)
    : null;
  const altText = text(formData, "alt_text");
  const sourceUrlText = text(formData, "source_url");
  const sourceUrl = sourceUrlText
    ? externalUrlSchema.parse(sourceUrlText)
    : null;
  const sourceCredit = text(formData, "source_credit") || null;
  const usagePermissionText = text(formData, "usage_permission");
  const usagePermission = usagePermissionText
    ? usagePermissionSchema.parse(usagePermissionText)
    : null;
  const status = statusSchema.parse(formData.get("status"));
  const displayOrder = z.coerce.number().int().min(0).max(10_000).parse(
    formData.get("display_order") ?? 0,
  );
  const isPlaceholder = checked(formData, "is_placeholder");

  if (imageUrl && !altText) {
    throw new Error("missing-alt");
  }

  if (
    status === "published" &&
    !isPlaceholder &&
    usagePermission === "official_publication" &&
    (!sourceUrl || !sourceCredit)
  ) {
    throw new Error("missing-verification-source");
  }

  return {
    altText,
    description,
    displayOrder,
    imageUrl,
    mediaAssetId,
    isPlaceholder,
    sourceCredit,
    sourceUrl,
    status,
    table,
    title,
    usagePermission,
  };
}

function parseTableSpecific(
  formData: FormData,
  table: ContentTableName,
): { category: string; accessStatus: z.infer<typeof accessStatusSchema> | null } {
  const category = text(formData, "category");

  if (table === "journeys") {
    return {
      category: journeyCategorySchema.parse(category),
      accessStatus: accessStatusSchema.parse(formData.get("access_status")),
    };
  }
  if (table === "local_products") {
    return {
      category: localProductCategorySchema.parse(category),
      accessStatus: null,
    };
  }
  if (table === "ginseng_products") {
    return {
      category: ginsengProductTypeSchema.parse(
        formData.get("product_type"),
      ),
      accessStatus: null,
    };
  }

  return { category: category || "Khám phá", accessStatus: null };
}

export async function createContentItemAction(formData: FormData): Promise<never> {
  let common: ReturnType<typeof parseCommon>;
  let tableSpecific: ReturnType<typeof parseTableSpecific>;

  try {
    common = parseCommon(formData);
    tableSpecific = parseTableSpecific(formData, common.table);
  } catch {
    const table = tableSchema.safeParse(formData.get("table"));
    adminRedirect(table.success ? table.data : "stories", "error", "invalid-content");
  }

  const supabase = await requireAuthenticatedAdmin(common.table);
  const metadata = {
    display_order: common.displayOrder,
    is_placeholder: common.isPlaceholder,
    placeholder_label: common.isPlaceholder ? "Nội dung đề xuất" : null,
    source_credit: common.sourceCredit,
    source_url: common.sourceUrl,
    status: common.status,
    usage_permission: common.usagePermission,
    verified_at:
      common.status === "published" && !common.isPlaceholder
        ? new Date().toISOString()
        : null,
  };

  const slug = slugSchema.safeParse(text(formData, "slug"));
  const requiresSlug = [
    "journeys",
    "local_products",
    "ginseng_products",
    "travel_guides",
  ].includes(common.table);

  if (requiresSlug && !slug.success) {
    adminRedirect(common.table, "error", "invalid-slug");
  }

  let error: { message: string } | null = null;

  if (common.table === "site_settings") {
    ({ error } = await supabase.from("site_settings").insert({
      ...metadata,
      site_name: common.title,
      tagline: common.description,
      description: common.description,
      primary_cta_label: "Khám phá hành trình",
      primary_cta_href: "#hanh-trinh",
      legal_address: "Xã Trà Linh, thành phố Đà Nẵng",
    }));
  } else if (common.table === "hero_slides") {
    if ((!common.imageUrl && !common.mediaAssetId) || !common.altText) {
      adminRedirect(common.table, "error", "missing-image");
    }
    ({ error } = await supabase.from("hero_slides").insert({
      ...metadata,
      title: common.title,
      description: common.description,
      image_url: common.imageUrl,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText,
      cta_label: "Khám phá hành trình",
      cta_href: "#hanh-trinh",
    }));
  } else if (common.table === "stories") {
    ({ error } = await supabase.from("stories").insert({
      ...metadata,
      title: common.title,
      description: common.description,
      body: [common.description],
      image_url: common.imageUrl || null,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText || null,
    }));
  } else if (common.table === "journeys") {
    if ((!common.imageUrl && !common.mediaAssetId) || !common.altText || !slug.success) {
      adminRedirect(common.table, "error", "missing-required-fields");
    }
    const accessStatus = tableSpecific.accessStatus;
    if (!accessStatus) {
      adminRedirect(common.table, "error", "invalid-content");
    }
    ({ error } = await supabase.from("journeys").insert({
      ...metadata,
      title: common.title,
      slug: slug.data,
      category: tableSpecific.category,
      short_description: common.description,
      body: [common.description],
      image_url: common.imageUrl,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText,
      access_status: accessStatus,
      contact_required: accessStatus !== "open",
      duration_label: text(formData, "duration_label") || null,
      highlights: [],
    }));
  } else if (common.table === "ginseng_story_steps") {
    ({ error } = await supabase.from("ginseng_story_steps").insert({
      ...metadata,
      step_number: common.displayOrder + 1,
      title: common.title,
      description: common.description,
      image_url: common.imageUrl || null,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText || null,
    }));
  } else if (common.table === "culture_stories") {
    if ((!common.imageUrl && !common.mediaAssetId) || !common.altText) {
      adminRedirect(common.table, "error", "missing-image");
    }
    ({ error } = await supabase.from("culture_stories").insert({
      ...metadata,
      title: common.title,
      description: common.description,
      image_url: common.imageUrl,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText,
      caption: common.sourceCredit,
    }));
  } else if (common.table === "local_products") {
    if ((!common.imageUrl && !common.mediaAssetId) || !common.altText || !slug.success) {
      adminRedirect(common.table, "error", "missing-required-fields");
    }
    ({ error } = await supabase.from("local_products").insert({
      ...metadata,
      name: common.title,
      slug: slug.data,
      category: tableSpecific.category,
      description: common.description,
      image_url: common.imageUrl,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText,
      origin_note: text(formData, "origin_note") || null,
    }));
  } else if (common.table === "ginseng_products") {
    if ((!common.imageUrl && !common.mediaAssetId) || !common.altText || !slug.success) {
      adminRedirect(common.table, "error", "missing-required-fields");
    }
    ({ error } = await supabase.from("ginseng_products").insert({
      ...metadata,
      name: common.title,
      slug: slug.data,
      product_type: tableSpecific.category,
      short_description: common.description,
      image_url: common.imageUrl,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText,
      contact_url: null,
      origin_note: text(formData, "origin_note") || null,
      legal_disclaimer:
        text(formData, "legal_disclaimer") ||
        "Nội dung đang được xác minh; không phải tư vấn y tế và chưa mở bán trực tuyến.",
    }));
  } else if (common.table === "travel_guides") {
    if (!slug.success) {
      adminRedirect(common.table, "error", "invalid-slug");
    }
    ({ error } = await supabase.from("travel_guides").insert({
      ...metadata,
      title: common.title,
      slug: slug.data,
      category: tableSpecific.category,
      excerpt: common.description,
      body: [common.description],
      image_url: common.imageUrl || null,
      media_asset_id: common.mediaAssetId,
      alt_text: common.altText || null,
      read_time_label: text(formData, "read_time_label") || null,
      season_label: text(formData, "season_label") || null,
      sections: [{ title: common.title, body: common.description }],
    }));
  } else {
    adminRedirect(common.table, "error", "use-media-upload");
  }

  if (error) adminRedirect(common.table, "error", "save-failed");
  revalidatePath("/", "layout");
  adminRedirect(common.table, "notice", "created");
}

async function legacyUpdateContentItemAction(formData: FormData): Promise<never> {
  const tableResult = tableSchema.safeParse(formData.get("table"));
  const idResult = z.string().uuid().safeParse(formData.get("id"));
  const statusResult = statusSchema.safeParse(formData.get("status"));

  if (!tableResult.success || !idResult.success || !statusResult.success) {
    adminRedirect(tableResult.success ? tableResult.data : "stories", "error", "invalid-update");
  }

  const table = tableResult.data;
  const supabase = await requireAuthenticatedAdmin(table);
  const isPlaceholder = checked(formData, "is_placeholder");
  const payload = {
    status: statusResult.data as ContentStatus,
    is_placeholder: isPlaceholder,
    placeholder_label: isPlaceholder
      ? "Nội dung đề xuất"
      : null,
    display_order: z.coerce.number().int().min(0).max(10_000).catch(0).parse(
      formData.get("display_order"),
    ),
    verified_at:
      statusResult.data === "published" && !isPlaceholder
        ? new Date().toISOString()
        : null,
    ...(table === "media_assets"
      ? { verification_status: isPlaceholder ? "placeholder" : "verified" }
      : {}),
  };

  const { error } = await supabase
    .from(table)
    .update(payload as never)
    .eq("id", idResult.data);

  if (error) adminRedirect(table, "error", "update-failed");
  revalidatePath("/", "layout");
  adminRedirect(table, "notice", "updated");
}

void legacyUpdateContentItemAction;

export async function updateContentItemAction(formData: FormData): Promise<never> {
  const tableResult = tableSchema.safeParse(formData.get("table"));
  const idResult = z.string().uuid().safeParse(formData.get("id"));
  const intent = text(formData, "intent");
  const statusResult = intent
    ? (() => {
        try {
          return { success: true as const, data: resolveEditorialIntent(intent) };
        } catch {
          return { success: false as const };
        }
      })()
    : statusSchema.safeParse(formData.get("status"));

  if (!tableResult.success || !idResult.success || !statusResult.success) {
    adminRedirect(
      tableResult.success ? tableResult.data : "stories",
      "error",
      "invalid-update",
    );
  }

  const table = tableResult.data;
  const supabase = await requireAuthenticatedAdmin(table);
  const isPageSection = table === "page_sections";
  const isPlaceholder = isPageSection ? false : checked(formData, "is_placeholder");
  let payload: Record<string, unknown> = {
    status: statusResult.data,
    display_order: z.coerce.number().int().min(0).max(10_000).catch(0)
      .parse(formData.get("display_order")),
  };

  if (!isPageSection) {
    payload = {
      ...payload,
      is_placeholder: isPlaceholder,
      placeholder_label: isPlaceholder ? "Nội dung đề xuất" : null,
      verified_at:
        statusResult.data === "published" && !isPlaceholder
          ? new Date().toISOString()
          : null,
      ...(table === "media_assets"
        ? { verification_status: isPlaceholder ? "placeholder" : "verified" }
        : {}),
    };
  }

  if (formData.has("title") || formData.has("site_name")) {
    try {
      payload = { ...payload, ...buildAdminUpdatePayload(formData, table) };
    } catch {
      adminRedirect(table, "error", "invalid-update", idResult.data);
    }
  }

  const { error } = await supabase
    .from(table)
    .update(payload as never)
    .eq("id", idResult.data);

  if (error) adminRedirect(table, "error", "update-failed", idResult.data);
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  adminRedirect(
    table,
    "notice",
    statusResult.data === "published" ? "published" : "draft-saved",
    idResult.data,
  );
}

export async function deleteContentItemAction(formData: FormData): Promise<never> {
  const tableResult = tableSchema.safeParse(formData.get("table"));
  const idResult = z.string().uuid().safeParse(formData.get("id"));

  if (!tableResult.success || !idResult.success) {
    adminRedirect(tableResult.success ? tableResult.data : "stories", "error", "invalid-delete");
  }

  const table = tableResult.data;
  const supabase = await requireAuthenticatedAdmin(table);
  let mediaStoragePath: string | null = null;
  if (table === "media_assets") {
    const { data: media } = await supabase
      .from("media_assets")
      .select("storage_path")
      .eq("id", idResult.data)
      .maybeSingle();
    mediaStoragePath = media?.storage_path ?? null;
  }
  const { error } = await supabase.from(table).delete().eq("id", idResult.data);

  if (error) adminRedirect(table, "error", "delete-failed");
  if (mediaStoragePath && !mediaStoragePath.includes("..")) {
    const bucket = getMediaBucketName();
    await supabase.storage.from(bucket).remove([mediaStoragePath]);
  }
  revalidatePath("/", "layout");
  adminRedirect(table, "notice", "deleted");
}

export async function uploadMediaAction(formData: FormData): Promise<never> {
  const table: ContentTableName = "media_assets";
  const supabase = await requireAuthenticatedAdmin(table);
  const file = formData.get("file");

  if (!(file instanceof File)) adminRedirect(table, "error", "missing-file");

  let validated: Awaited<ReturnType<typeof validateMediaUpload>>;
  try {
    validated = await validateMediaUpload(file);
  } catch {
    adminRedirect(table, "error", "invalid-file");
  }

  const metadata = z
    .object({
      title: titleSchema,
      altText: z.string().trim().min(5).max(300),
      sourceUrl: z.union([z.literal(""), externalUrlSchema]),
      sourceCredit: z.string().trim().max(300),
      usagePermission: z.enum([
        "client_confirmed",
        "official_publication",
        "pending",
      ]),
      section: z.string().trim().max(80),
    })
    .safeParse({
      title: formData.get("title"),
      altText: formData.get("alt_text"),
      sourceUrl: formData.get("source_url"),
      sourceCredit: formData.get("source_credit"),
      usagePermission: formData.get("usage_permission"),
      section: formData.get("section") ?? "",
    });

  if (!metadata.success) adminRedirect(table, "error", "invalid-metadata");

  const bucket = getMediaBucketName();
  const storagePath = `${new Date().getUTCFullYear()}/${randomUUID()}${validated.extension}`;
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, {
      cacheControl: "31536000",
      contentType: validated.mimeType,
      upsert: false,
    });

  if (uploadError) adminRedirect(table, "error", "upload-failed");

  const { error: insertError } = await supabase.from("media_assets").insert({
    title: metadata.data.title,
    file_url: `storage://${bucket}/${storagePath}`,
    storage_path: storagePath,
    media_type: validated.mediaType,
    mime_type: validated.mimeType,
    file_size_bytes: file.size,
    alt_text: metadata.data.altText,
    source_url: metadata.data.sourceUrl,
    source_credit: metadata.data.sourceCredit,
    usage_permission: metadata.data.usagePermission,
    section: metadata.data.section || null,
    status: "draft",
    verification_status: "verified",
    is_placeholder: false,
    placeholder_label: null,
  });

  if (insertError) {
    await supabase.storage.from(bucket).remove([storagePath]);
    adminRedirect(table, "error", "save-failed");
  }

  revalidatePath("/admin");
  adminRedirect(table, "notice", "uploaded");
}

const resumableMimeSchema = z.enum([
  "image/avif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

const uploadExtensions: Record<z.infer<typeof resumableMimeSchema>, string[]> = {
  "image/avif": [".avif"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
};

export async function prepareMediaUploadAction(input: {
  fileName: string;
  mimeType: string;
  fileSize: number;
}) {
  await requireAuthenticatedAdmin("media_assets");
  const parsed = z.object({
    fileName: z.string().trim().min(1).max(240),
    mimeType: resumableMimeSchema,
    fileSize: z.number().int().positive(),
  }).safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid-file" };

  const { fileName, mimeType, fileSize } = parsed.data;
  const isVideo = mimeType.startsWith("video/");
  if (fileSize > (isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE)) {
    return { ok: false as const, error: "file-too-large" };
  }
  const lowerName = fileName.toLowerCase();
  if (!uploadExtensions[mimeType].some((extension) => lowerName.endsWith(extension))) {
    return { ok: false as const, error: "invalid-extension" };
  }

  const config = getPublicSupabaseConfig();
  if (!config) return { ok: false as const, error: "cms-unavailable" };
  const projectId = new URL(config.url).hostname.split(".")[0];
  const extension = uploadExtensions[mimeType][0] === ".jpeg"
    ? ".jpg"
    : uploadExtensions[mimeType][0];
  const storagePath = `${new Date().getUTCFullYear()}/${randomUUID()}${extension}`;

  return {
    ok: true as const,
    bucket: getMediaBucketName(),
    storagePath,
    endpoint: `https://${projectId}.storage.supabase.co/storage/v1/upload/resumable`,
  };
}

export async function finalizeMediaUploadAction(formData: FormData) {
  const supabase = await requireAuthenticatedAdmin("media_assets");
  const parsed = z.object({
    title: titleSchema,
    altText: z.string().trim().min(5).max(300),
    storagePath: z.string().regex(/^[0-9]{4}\/[a-f0-9-]+\.(avif|jpe?g|png|webp|mp4|webm)$/),
    mimeType: resumableMimeSchema,
    fileSize: z.coerce.number().int().positive().max(MAX_VIDEO_SIZE),
    sourceUrl: z.union([z.literal(""), externalUrlSchema]),
    sourceCredit: z.string().trim().max(300),
    section: z.string().trim().max(80),
  }).safeParse({
    title: formData.get("title"),
    altText: formData.get("alt_text"),
    storagePath: formData.get("storage_path"),
    mimeType: formData.get("mime_type"),
    fileSize: formData.get("file_size"),
    sourceUrl: formData.get("source_url") ?? "",
    sourceCredit: formData.get("source_credit") ?? "",
    section: formData.get("section") ?? "",
  });
  if (!parsed.success) return { ok: false as const, error: "invalid-metadata" };

  const bucket = getMediaBucketName();
  const { error } = await supabase.from("media_assets").insert({
    title: parsed.data.title,
    file_url: `storage://${bucket}/${parsed.data.storagePath}`,
    storage_path: parsed.data.storagePath,
    alt_text: parsed.data.altText,
    media_type: parsed.data.mimeType.startsWith("video/") ? "video" : "image",
    mime_type: parsed.data.mimeType,
    file_size_bytes: parsed.data.fileSize,
    source_url: parsed.data.sourceUrl || null,
    source_credit: parsed.data.sourceCredit || null,
    usage_permission: "client_confirmed",
    section: parsed.data.section || null,
    status: "draft",
    verification_status: "verified",
    is_placeholder: false,
    placeholder_label: null,
  });
  if (error) return { ok: false as const, error: "save-failed" };

  revalidatePath("/admin");
  return { ok: true as const };
}

export async function createExternalMediaAction(formData: FormData): Promise<never> {
  const table: ContentTableName = "media_assets";
  const supabase = await requireAuthenticatedAdmin(table);
  const parsed = z.object({
    title: titleSchema,
    altText: z.string().trim().min(5).max(300),
    externalUrl: externalUrlSchema,
    mediaType: z.enum(["image", "video"]),
    sourceCredit: z.string().trim().max(300),
    section: z.string().trim().max(80),
  }).safeParse({
    title: formData.get("title"),
    altText: formData.get("alt_text"),
    externalUrl: formData.get("external_url"),
    mediaType: formData.get("media_type"),
    sourceCredit: formData.get("source_credit") ?? "",
    section: formData.get("section") ?? "",
  });
  if (!parsed.success) adminRedirect(table, "error", "invalid-metadata");

  const { error } = await supabase.from("media_assets").insert({
    title: parsed.data.title,
    file_url: parsed.data.externalUrl,
    external_url: parsed.data.externalUrl,
    storage_path: null,
    alt_text: parsed.data.altText,
    media_type: parsed.data.mediaType,
    source_url: parsed.data.externalUrl,
    source_credit: parsed.data.sourceCredit || null,
    usage_permission: "client_confirmed",
    section: parsed.data.section || null,
    status: "draft",
    verification_status: "verified",
    is_placeholder: false,
    placeholder_label: null,
  });
  if (error) adminRedirect(table, "error", "save-failed");
  revalidatePath("/admin");
  adminRedirect(table, "notice", "created");
}
