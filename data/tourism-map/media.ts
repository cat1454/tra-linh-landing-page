import type { TourismPlace } from "./types";

export const TOURISM_PLACEHOLDER_IMAGE =
  "/images/placeholders/tourism-place-placeholder.webp";

export const TOURISM_BRAND_LOGO = "/images/brand/logo_tra_linh.jpg";

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
