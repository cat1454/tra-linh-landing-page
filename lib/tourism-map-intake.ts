import type { TourismPlace } from "@/data/tourism-map/types";

export const TOURISM_INTAKE_STORAGE_KEY = "tra-linh-tourism-intake-v1";

export interface TourismIntakeDraft {
  slug: string;
  name: string;
  currentAddress: string;
  legacyAddress: string;
  latitude: string;
  longitude: string;
  googleMapsUrl: string;
  coordinateConfirmed: boolean;
  shortDescription: string;
  accessNotes: string;
  imageFiles: string;
  imageRights: string;
  sourceUrls: string;
  notes: string;
  updatedAt: string | null;
}

export type TourismIntakeDrafts = Record<string, TourismIntakeDraft>;

export function createTourismIntakeDraft(place: TourismPlace): TourismIntakeDraft {
  return {
    slug: place.slug,
    name: place.name,
    currentAddress: place.currentAddress,
    legacyAddress: place.legacyAddress ?? "",
    latitude: place.latitude === null ? "" : String(place.latitude),
    longitude: place.longitude === null ? "" : String(place.longitude),
    googleMapsUrl: place.googleMapsUrl ?? "",
    coordinateConfirmed: place.coordinateStatus === "verified",
    shortDescription: place.shortDescription,
    accessNotes: "",
    imageFiles: [place.coverImage, ...place.gallery].filter(Boolean).join("\n"),
    imageRights: place.imageStatus === "ready" ? "Ảnh hiện có đã được xác nhận" : "",
    sourceUrls: (place.sourceUrls ?? []).join("\n"),
    notes: "",
    updatedAt: null,
  };
}

function parseCoordinate(value: string, minimum: number, maximum: number): number | null {
  if (!value.trim()) return null;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && coordinate >= minimum && coordinate <= maximum
    ? coordinate
    : null;
}

function lines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildTourismIntakeExport(drafts: TourismIntakeDrafts) {
  return {
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    records: Object.values(drafts).map((draft) => {
      const latitude = parseCoordinate(draft.latitude, -90, 90);
      const longitude = parseCoordinate(draft.longitude, -180, 180);
      const hasCoordinate = latitude !== null && longitude !== null;

      return {
        slug: draft.slug,
        name: draft.name,
        currentAddress: draft.currentAddress.trim(),
        legacyAddress: draft.legacyAddress.trim() || null,
        latitude: hasCoordinate ? latitude : null,
        longitude: hasCoordinate ? longitude : null,
        coordinateStatus: hasCoordinate
          ? draft.coordinateConfirmed
            ? "verified"
            : "pending_review"
          : "missing",
        googleMapsUrl: draft.googleMapsUrl.trim() || null,
        shortDescription: draft.shortDescription.trim(),
        accessNotes: draft.accessNotes.trim() || null,
        imageFiles: lines(draft.imageFiles),
        imageRights: draft.imageRights.trim() || null,
        sourceUrls: lines(draft.sourceUrls),
        notes: draft.notes.trim() || null,
        updatedAt: draft.updatedAt,
      };
    }),
  };
}

export function isTourismIntakeReady(draft: TourismIntakeDraft): boolean {
  const latitude = parseCoordinate(draft.latitude, -90, 90);
  const longitude = parseCoordinate(draft.longitude, -180, 180);
  return Boolean(
    draft.currentAddress.trim() &&
      latitude !== null &&
      longitude !== null &&
      draft.coordinateConfirmed &&
      draft.googleMapsUrl.trim() &&
      draft.imageFiles.trim() &&
      draft.imageRights.trim(),
  );
}
