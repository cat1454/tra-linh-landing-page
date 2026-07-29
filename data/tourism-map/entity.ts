import type {
  TourismDataSource,
  TourismEntityKind,
  TourismGeometryType,
  TourismPlace,
  TourismPlaceInput,
  TourismVerificationStatus,
} from "./types";

function inferEntityKind(place: TourismPlaceInput): TourismEntityKind {
  if (place.entityType === "recurring_event") return "event";
  if (place.entityType === "event_venue" || place.entityType === "cultural_venue") {
    return "venue";
  }
  if (place.entityType === "route") return "route";
  if (place.entityType === "area") return "area";
  return "place";
}

function inferGeometryType(kind: TourismEntityKind): TourismGeometryType {
  if (kind === "route") return "route";
  if (kind === "area") return "area";
  return "point";
}

function inferDataSource(place: TourismPlaceInput): TourismDataSource {
  return place.sourceUrls?.length ? "public_sources" : "unverified";
}

function inferVerificationStatus(place: TourismPlaceInput): TourismVerificationStatus {
  return place.sourceUrls?.length ? "needs_review" : "unverified";
}

export function completeTourismEntity(place: TourismPlaceInput): TourismPlace {
  const entityKind = place.entityKind ?? inferEntityKind(place);

  return {
    ...place,
    entityKind,
    geometryType: place.geometryType ?? inferGeometryType(entityKind),
    physicalPlaceId: place.physicalPlaceId ?? `physical-${place.id}`,
    parentPlaceId: place.parentPlaceId ?? null,
    precisionMeters: place.precisionMeters ?? null,
    verificationStatus: place.verificationStatus ?? inferVerificationStatus(place),
    verifiedAt: place.verifiedAt ?? null,
    verifiedBy: place.verifiedBy ?? null,
    lastReviewedAt: place.lastReviewedAt ?? null,
    dataSource: place.dataSource ?? inferDataSource(place),
  };
}
