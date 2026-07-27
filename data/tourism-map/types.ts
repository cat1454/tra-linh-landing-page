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
  | "recurring_event";

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
  scope: TourismMapScope;
  latitude: number | null;
  longitude: number | null;
  coordinateStatus: "verified" | "approximate" | "missing" | "conflicting";
  currentAddress: string;
  legacyAddress?: string | null;
  coverImage: string | null;
  gallery: string[];
  imageAlt: string;
  imageStatus: "ready" | "missing" | "permission_required";
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
  openingHours?: string;
  ticketPrice?: string;
}

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
