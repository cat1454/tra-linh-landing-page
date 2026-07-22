"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAdminAccess } from "@/lib/supabase/access";
import { getMediaBucketName } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentStatus, ContentTableName } from "@/lib/supabase/types";
import { validateImageUpload } from "@/lib/supabase/uploads";

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

function adminRedirect(table: ContentTableName, key: "notice" | "error", value: string): never {
  redirect(`/admin?table=${table}&${key}=${encodeURIComponent(value)}`);
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
    (!sourceUrl ||
      !sourceCredit ||
      !usagePermission ||
      usagePermission === "pending")
  ) {
    throw new Error("missing-verification-source");
  }

  return {
    altText,
    description,
    displayOrder,
    imageUrl,
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
    if (!common.imageUrl || !common.altText) {
      adminRedirect(common.table, "error", "missing-image");
    }
    ({ error } = await supabase.from("hero_slides").insert({
      ...metadata,
      title: common.title,
      description: common.description,
      image_url: common.imageUrl,
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
      alt_text: common.altText || null,
    }));
  } else if (common.table === "journeys") {
    if (!common.imageUrl || !common.altText || !slug.success) {
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
      alt_text: common.altText || null,
    }));
  } else if (common.table === "culture_stories") {
    if (!common.imageUrl || !common.altText) {
      adminRedirect(common.table, "error", "missing-image");
    }
    ({ error } = await supabase.from("culture_stories").insert({
      ...metadata,
      title: common.title,
      description: common.description,
      image_url: common.imageUrl,
      alt_text: common.altText,
      caption: common.sourceCredit,
    }));
  } else if (common.table === "local_products") {
    if (!common.imageUrl || !common.altText || !slug.success) {
      adminRedirect(common.table, "error", "missing-required-fields");
    }
    ({ error } = await supabase.from("local_products").insert({
      ...metadata,
      name: common.title,
      slug: slug.data,
      category: tableSpecific.category,
      description: common.description,
      image_url: common.imageUrl,
      alt_text: common.altText,
      origin_note: text(formData, "origin_note") || null,
    }));
  } else if (common.table === "ginseng_products") {
    if (!common.imageUrl || !common.altText || !slug.success) {
      adminRedirect(common.table, "error", "missing-required-fields");
    }
    ({ error } = await supabase.from("ginseng_products").insert({
      ...metadata,
      name: common.title,
      slug: slug.data,
      product_type: tableSpecific.category,
      short_description: common.description,
      image_url: common.imageUrl,
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

export async function updateContentItemAction(formData: FormData): Promise<never> {
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

  let validated: Awaited<ReturnType<typeof validateImageUpload>>;
  try {
    validated = await validateImageUpload(file);
  } catch {
    adminRedirect(table, "error", "invalid-file");
  }

  const metadata = z
    .object({
      title: titleSchema,
      altText: z.string().trim().min(5).max(300),
      sourceUrl: externalUrlSchema,
      sourceCredit: z.string().trim().min(2).max(300),
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
    alt_text: metadata.data.altText,
    source_url: metadata.data.sourceUrl,
    source_credit: metadata.data.sourceCredit,
    usage_permission: metadata.data.usagePermission,
    section: metadata.data.section || null,
    status: "review",
    verification_status: "placeholder",
    is_placeholder: true,
    placeholder_label: "Nội dung đề xuất",
  });

  if (insertError) {
    await supabase.storage.from(bucket).remove([storagePath]);
    adminRedirect(table, "error", "save-failed");
  }

  revalidatePath("/admin");
  adminRedirect(table, "notice", "uploaded");
}
