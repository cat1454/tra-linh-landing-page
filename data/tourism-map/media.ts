import type { TourismPlace } from "./types";
import type { TourismMediaManifestEntry } from "@/lib/tourism-image-pipeline";
import tourismMediaManifest from "./media-manifest.json";

export const TOURISM_PLACEHOLDER_IMAGE =
  "/images/placeholders/tourism-place-placeholder.webp";

export const TOURISM_BRAND_LOGO = "/images/brand/logo_tra_linh.jpg";
export const approvedTourismMediaManifest =
  tourismMediaManifest.entries as TourismMediaManifestEntry[];

export function hasDocumentaryTourismCover(
  place: TourismPlace,
): place is TourismPlace & { coverImage: string } {
  return Boolean(
    place.coverImage &&
      place.mediaAttribution?.some(
        (asset) => asset.role === "cover" && asset.representation === "documentary",
      ),
  );
}

export function applyApprovedTourismMedia(
  place: TourismPlace,
  manifest: TourismMediaManifestEntry[],
): TourismPlace {
  const assets = manifest.filter((entry) => entry.slug === place.slug);
  if (!assets.length) return place;

  const cover = assets.find((entry) => entry.role === "cover");
  const gallery = assets
    .filter((entry) => entry.role === "gallery")
    .map((entry) => entry.publicPath);

  return {
    ...place,
    coverImage: cover?.publicPath ?? place.coverImage,
    gallery,
    imageStatus: cover || gallery.length ? "ready" : place.imageStatus,
    mediaAttribution: assets.map((entry) => ({
      assetId: entry.assetId,
      role: entry.role,
      credit: entry.credit,
      sourcePageUrl: entry.sourcePageUrl,
      license: entry.license as Exclude<
        TourismMediaManifestEntry["license"],
        "permission_required"
      >,
      representation: entry.representation,
    })),
  };
}

export function isTrustedTourismImageUrl(value: string | null): value is string {
  if (!value) return false;
  if (value.startsWith("/images/")) return true;

  const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!configuredSupabaseUrl) return false;

  try {
    const candidate = new URL(value);
    const supabase = new URL(configuredSupabaseUrl);
    return (
      candidate.protocol === "https:" &&
      candidate.hostname === supabase.hostname &&
      candidate.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

export function sanitizeTourismPlaceMedia(place: TourismPlace): TourismPlace {
  const coverImage = isTrustedTourismImageUrl(place.coverImage)
    ? place.coverImage
    : null;
  const gallery = Array.from(
    new Set(place.gallery.filter(isTrustedTourismImageUrl)),
  );
  const hasTrustedMedia = Boolean(coverImage || gallery.length);

  return {
    ...place,
    coverImage,
    gallery,
    imageStatus: hasTrustedMedia ? "ready" : "missing",
  };
}
