import { createHash } from "node:crypto";

import sharp from "sharp";

export const MAX_TOURISM_IMAGE_BYTES = 400_000;
export const MAX_TOURISM_MEDIA_BUDGET_BYTES = 60_000_000;

export type TourismMediaLicense =
  | "client_confirmed"
  | "official_publication"
  | "cc0"
  | "cc_by"
  | "cc_by_sa"
  | "permission_required";
export type TourismMediaRole = "cover" | "gallery";
export type TourismMediaRepresentation = "documentary" | "contextual" | "illustrative";

export interface OptimizedTourismImage {
  bytes: Buffer;
  mimeType: "image/webp";
  width: number;
  height: number;
  sha256: string;
}

export interface TourismMediaManifestEntry {
  assetId: string;
  slug: string;
  role: TourismMediaRole;
  publicPath: string;
  sourcePageUrl: string;
  sourceImageUrl: string;
  credit: string;
  license: TourismMediaLicense;
  representation: TourismMediaRepresentation;
  mimeType: "image/webp";
  width: number;
  height: number;
  bytes: number;
  sha256: string;
  importedAt: string;
}

export interface TourismMediaAuditIssue {
  code:
    | "duplicate_asset_id"
    | "duplicate_content"
    | "external_public_path"
    | "image_too_large"
    | "invalid_dimensions"
    | "invalid_hash"
    | "invalid_source_url"
    | "missing_credit"
    | "unapproved_license"
    | "media_budget_exceeded"
    | "file_missing"
    | "file_hash_mismatch"
    | "file_size_mismatch"
    | "file_dimensions_mismatch"
    | "unreadable_image";
  severity: "error" | "warning";
  assetIds: string[];
  message: string;
}

const approvedLicenses = new Set<TourismMediaLicense>([
  "client_confirmed",
  "official_publication",
  "cc0",
  "cc_by",
  "cc_by_sa",
]);

const optimizationAttempts = [
  { width: 1600, height: 1200, quality: 80 },
  { width: 1400, height: 1050, quality: 76 },
  { width: 1200, height: 900, quality: 72 },
  { width: 1000, height: 750, quality: 66 },
  { width: 900, height: 675, quality: 60 },
] as const;

export async function optimizeTourismImage(source: Uint8Array): Promise<OptimizedTourismImage> {
  let lastResult: { data: Buffer; info: { width: number; height: number } } | null = null;

  for (const attempt of optimizationAttempts) {
    lastResult = await sharp(source, { animated: false })
      .rotate()
      .resize({
        width: attempt.width,
        height: attempt.height,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: attempt.quality, effort: 6, smartSubsample: true })
      .toBuffer({ resolveWithObject: true });
    if (lastResult.data.byteLength <= MAX_TOURISM_IMAGE_BYTES) break;
  }

  if (!lastResult || !lastResult.info.width || !lastResult.info.height) {
    throw new Error("Không thể đọc kích thước ảnh sau khi tối ưu.");
  }
  if (lastResult.data.byteLength > MAX_TOURISM_IMAGE_BYTES) {
    throw new Error(`Ảnh sau tối ưu vẫn vượt ${MAX_TOURISM_IMAGE_BYTES} byte.`);
  }

  return {
    bytes: lastResult.data,
    mimeType: "image/webp",
    width: lastResult.info.width,
    height: lastResult.info.height,
    sha256: createHash("sha256").update(lastResult.data).digest("hex"),
  };
}

export function buildTourismMediaManifestEntry(
  input: Omit<
    TourismMediaManifestEntry,
    "mimeType" | "width" | "height" | "bytes" | "sha256"
  > & { optimized: OptimizedTourismImage },
): TourismMediaManifestEntry {
  const { optimized, ...metadata } = input;
  return {
    ...metadata,
    mimeType: optimized.mimeType,
    width: optimized.width,
    height: optimized.height,
    bytes: optimized.bytes.byteLength,
    sha256: optimized.sha256,
  };
}

function hasValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isSharedAssetAllowed(
  firstAssetId: string,
  secondAssetId: string,
  sharedAssetGroups: string[][],
): boolean {
  return sharedAssetGroups.some(
    (group) => group.includes(firstAssetId) && group.includes(secondAssetId),
  );
}

export function auditTourismMediaManifest(
  entries: TourismMediaManifestEntry[],
  options: { sharedAssetGroups?: string[][] } = {},
): TourismMediaAuditIssue[] {
  const issues: TourismMediaAuditIssue[] = [];
  const seenIds = new Set<string>();
  const entriesByHash = new Map<string, TourismMediaManifestEntry[]>();
  const sharedAssetGroups = options.sharedAssetGroups ?? [];

  for (const entry of entries) {
    if (seenIds.has(entry.assetId)) {
      issues.push({
        code: "duplicate_asset_id",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Mã ảnh được khai báo nhiều lần.",
      });
    }
    seenIds.add(entry.assetId);

    if (!entry.publicPath.startsWith("/images/tourism-map/") || !entry.publicPath.endsWith(".webp")) {
      issues.push({
        code: "external_public_path",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Ảnh bản đồ cố định phải là WebP nội bộ trong /images/tourism-map/.",
      });
    }
    if (!approvedLicenses.has(entry.license)) {
      issues.push({
        code: "unapproved_license",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Ảnh chưa có trạng thái sử dụng được chấp nhận.",
      });
    }
    if (!entry.credit.trim()) {
      issues.push({
        code: "missing_credit",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Ảnh thiếu thông tin ghi nguồn.",
      });
    }
    if (!hasValidHttpUrl(entry.sourcePageUrl) || !hasValidHttpUrl(entry.sourceImageUrl)) {
      issues.push({
        code: "invalid_source_url",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Ảnh thiếu URL nguồn hợp lệ.",
      });
    }
    if (entry.bytes > MAX_TOURISM_IMAGE_BYTES) {
      issues.push({
        code: "image_too_large",
        severity: "error",
        assetIds: [entry.assetId],
        message: `Ảnh vượt ngân sách ${MAX_TOURISM_IMAGE_BYTES} byte.`,
      });
    }
    if (entry.width < 600 || entry.height < 400 || entry.width > 1600 || entry.height > 1200) {
      issues.push({
        code: "invalid_dimensions",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Kích thước ảnh nằm ngoài giới hạn 600×400 đến 1600×1200.",
      });
    }
    if (!/^[a-f0-9]{64}$/.test(entry.sha256)) {
      issues.push({
        code: "invalid_hash",
        severity: "error",
        assetIds: [entry.assetId],
        message: "SHA-256 của ảnh không hợp lệ.",
      });
    }

    const matchingEntries = entriesByHash.get(entry.sha256) ?? [];
    for (const matching of matchingEntries) {
      if (!isSharedAssetAllowed(matching.assetId, entry.assetId, sharedAssetGroups)) {
        issues.push({
          code: "duplicate_content",
          severity: "error",
          assetIds: [matching.assetId, entry.assetId],
          message: "Hai tài sản ảnh có cùng nội dung nhưng chưa khai báo dùng chung.",
        });
      }
    }
    entriesByHash.set(entry.sha256, [...matchingEntries, entry]);
  }

  const totalBytes = entries.reduce((sum, entry) => sum + entry.bytes, 0);
  if (totalBytes > MAX_TOURISM_MEDIA_BUDGET_BYTES) {
    issues.push({
      code: "media_budget_exceeded",
      severity: "error",
      assetIds: entries.map(({ assetId }) => assetId),
      message: `Kho ảnh vượt ngân sách ${MAX_TOURISM_MEDIA_BUDGET_BYTES} byte.`,
    });
  }

  return issues;
}

export async function auditTourismMediaFiles(
  entries: TourismMediaManifestEntry[],
  loadFile: (publicPath: string) => Promise<Uint8Array>,
): Promise<TourismMediaAuditIssue[]> {
  const issues: TourismMediaAuditIssue[] = [];
  const loadedFiles = new Map<string, Uint8Array>();

  for (const entry of entries) {
    let bytes = loadedFiles.get(entry.publicPath);
    if (!bytes) {
      try {
        bytes = await loadFile(entry.publicPath);
        loadedFiles.set(entry.publicPath, bytes);
      } catch {
        issues.push({
          code: "file_missing",
          severity: "error",
          assetIds: [entry.assetId],
          message: `Không đọc được tệp ${entry.publicPath}.`,
        });
        continue;
      }
    }

    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (sha256 !== entry.sha256) {
      issues.push({
        code: "file_hash_mismatch",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Nội dung tệp không khớp SHA-256 trong manifest.",
      });
    }
    if (bytes.byteLength !== entry.bytes) {
      issues.push({
        code: "file_size_mismatch",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Dung lượng tệp không khớp manifest.",
      });
    }

    try {
      const metadata = await sharp(bytes, { animated: false }).metadata();
      if (metadata.width !== entry.width || metadata.height !== entry.height) {
        issues.push({
          code: "file_dimensions_mismatch",
          severity: "error",
          assetIds: [entry.assetId],
          message: "Kích thước tệp không khớp manifest.",
        });
      }
    } catch {
      issues.push({
        code: "unreadable_image",
        severity: "error",
        assetIds: [entry.assetId],
        message: "Tệp không phải ảnh hợp lệ mà Sharp có thể đọc.",
      });
    }
  }

  return issues;
}
