export type TourismPlaceCategory =
  | "ginseng"
  | "culture"
  | "community"
  | "nature"
  | "shopping"
  | "administrative";

export type TourismEntityType =
  | "tourist_attraction"
  | "natural_feature"
  | "cultural_venue"
  | "community_settlement"
  | "research_and_production_facility"
  | "public_service"
  | "event_venue"
  | "recurring_event"
  | "route"
  | "area";

export type TourismEntityKind = "place" | "venue" | "event" | "route" | "area";
export type TourismGeometryType = "point" | "route" | "area";
export type TourismVerificationStatus = "verified" | "needs_review" | "unverified";
export type TourismDataSource =
  | "official_public_source"
  | "public_sources"
  | "editorial"
  | "unverified";

export interface TourismMediaAttribution {
  assetId: string;
  role: "cover" | "gallery";
  credit: string;
  sourcePageUrl: string;
  license: "client_confirmed" | "official_publication" | "cc0" | "cc_by" | "cc_by_sa";
  representation: "documentary" | "contextual" | "illustrative";
}

export type TourismFilterKey = "all" | TourismPlaceCategory | "nearby";
export type TourismMapScope = "inside_tra_linh" | "nearby";
export type TourismMapMode = "preview" | "explorer";
export type TourismExplorerCategory =
  | "all"
  | "ginseng"
  | "culture_community"
  | "nature"
  | "shopping"
  | "administrative";

export interface TourismExplorerFilters {
  query: string;
  scope: TourismMapScope;
  category: TourismExplorerCategory;
}

export interface TourismPlace {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description?: string;
  category: TourismPlaceCategory;
  entityType: TourismEntityType;
  entityKind: TourismEntityKind;
  geometryType: TourismGeometryType;
  physicalPlaceId: string | null;
  parentPlaceId: string | null;
  scope: TourismMapScope;
  latitude: number | null;
  longitude: number | null;
  coordinateStatus: "verified" | "approximate" | "missing" | "conflicting";
  precisionMeters: number | null;
  currentAddress: string;
  legacyAddress?: string | null;
  coverImage: string | null;
  gallery: string[];
  imageAlt: string;
  imageStatus: "ready" | "missing" | "permission_required";
  mediaAttribution?: TourismMediaAttribution[];
  visitorAccess:
    | "public"
    | "contact_required"
    | "permission_required"
    | "event_only"
    | "restricted"
    | "unknown";
  featured: boolean;
  published: boolean;
  sortOrder: number;
  googleMapsUrl?: string | null;
  sourceUrls?: string[];
  relatedPlaceSlug?: string | null;
  aliases?: string[];
  verificationStatus: TourismVerificationStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  lastReviewedAt: string | null;
  dataSource: TourismDataSource;
  openingHours?: string;
  ticketPrice?: string;
}

type TourismMetadataKey =
  | "entityKind"
  | "geometryType"
  | "physicalPlaceId"
  | "parentPlaceId"
  | "precisionMeters"
  | "verificationStatus"
  | "verifiedAt"
  | "verifiedBy"
  | "lastReviewedAt"
  | "dataSource";

export type TourismPlaceInput = Omit<TourismPlace, TourismMetadataKey> &
  Partial<Pick<TourismPlace, TourismMetadataKey>>;

export interface TourismCategory {
  key: TourismFilterKey;
  label: string;
  shortLabel: string;
  color: string;
}

export interface TourismExplorerCategoryOption {
  key: TourismExplorerCategory;
  label: string;
  shortLabel: string;
  color: string;
}
