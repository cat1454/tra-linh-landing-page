import type { Feature, FeatureCollection, Point } from "geojson";

import type {
  TourismExplorerFilters,
  TourismFilterKey,
  TourismPlace,
} from "@/data/tourism-map/types";
import {
  areTourismEntitiesRelated,
  normalizeTourismIdentity,
} from "@/lib/tourism-map-quality";

export interface TourismFeatureProperties {
  slug: string;
  name: string;
  category: TourismPlace["category"];
  coverImage: string | null;
  shortDescription: string;
}

export type TourismFeature = Feature<Point, TourismFeatureProperties>;

export function getAllTourismEntities(
  places: TourismPlace[],
  events: TourismPlace[],
): TourismPlace[] {
  const displayedByName = new Map<string, TourismPlace[]>();

  return [...places, ...events]
    .filter((entity) => entity.published)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .filter((entity) => {
      const normalizedName = normalizeTourismIdentity(entity.name);
      const displayedMatches = displayedByName.get(normalizedName) ?? [];
      if (displayedMatches.some((displayed) => areTourismEntitiesRelated(displayed, entity))) {
        return false;
      }

      displayedByName.set(normalizedName, [...displayedMatches, entity]);
      return true;
    });
}

export function filterTourismEntities(
  entities: TourismPlace[],
  filter: TourismFilterKey,
): TourismPlace[] {
  if (filter === "all") return [...entities];
  if (filter === "nearby") {
    return entities.filter((entity) => entity.scope === "nearby");
  }
  return entities.filter(
    (entity) => entity.category === filter && entity.scope === "inside_tra_linh",
  );
}

function normalizeSearchValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .trim();
}

export function filterTourismExplorerEntities(
  entities: TourismPlace[],
  filters: TourismExplorerFilters,
): TourismPlace[] {
  const query = normalizeSearchValue(filters.query);

  return entities.filter((entity) => {
    if (entity.scope !== filters.scope) return false;

    const categoryMatches =
      filters.category === "all" ||
      (filters.category === "culture_community"
        ? entity.category === "culture" || entity.category === "community"
        : entity.category === filters.category);
    if (!categoryMatches) return false;
    if (!query) return true;

    return normalizeSearchValue(
      [entity.name, entity.currentAddress, entity.shortDescription].join(" "),
    ).includes(query);
  });
}

export function getTourismViewportEntities(
  entities: TourismPlace[],
  filter: TourismFilterKey,
): TourismPlace[] {
  if (filter === "nearby") {
    return entities.filter((entity) => entity.scope === "nearby");
  }
  if (filter === "all") {
    return entities.filter((entity) => entity.scope === "inside_tra_linh");
  }
  return filterTourismEntities(entities, filter);
}

const previewCategoryOrder: TourismPlace["category"][] = [
  "ginseng",
  "culture",
  "community",
  "nature",
  "shopping",
  "administrative",
];

export function getTourismPreviewEntities(
  entities: TourismPlace[],
  limit = 6,
): TourismPlace[] {
  if (limit <= 0) return [];
  const insideTraLinh = getTourismViewportEntities(entities, "all");
  const selected: TourismPlace[] = [];

  for (const category of previewCategoryOrder) {
    const candidates = insideTraLinh.filter((entity) => entity.category === category);
    const candidate = candidates.find((entity) => entity.featured) ?? candidates[0];
    if (candidate) selected.push(candidate);
    if (selected.length === limit) return selected;
  }

  for (const entity of insideTraLinh) {
    if (!selected.some(({ id }) => id === entity.id)) selected.push(entity);
    if (selected.length === limit) break;
  }

  return selected;
}

export function hasMappableCoordinates(
  place: TourismPlace,
): place is TourismPlace & { latitude: number; longitude: number } {
  return (
    typeof place.latitude === "number" &&
    Number.isFinite(place.latitude) &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.longitude) &&
    place.coordinateStatus !== "missing" &&
    place.coordinateStatus !== "conflicting" &&
    place.geometryType === "point" &&
    place.entityType !== "recurring_event"
  );
}

export function toTourismGeoJson(
  entities: TourismPlace[],
): FeatureCollection<Point, TourismFeatureProperties> {
  const features: TourismFeature[] = entities
    .filter(hasMappableCoordinates)
    .map((place) => ({
      type: "Feature",
      id: place.id,
      geometry: {
        type: "Point",
        coordinates: [place.longitude, place.latitude],
      },
      properties: {
        slug: place.slug,
        name: place.name,
        category: place.category,
        coverImage: place.coverImage,
        shortDescription: place.shortDescription,
      },
    }));

  return { type: "FeatureCollection", features };
}

export function buildGoogleMapsDirectionsUrl(
  destination: string,
): string {
  const params = new URLSearchParams({
    api: "1",
    destination,
    travelmode: "driving",
    dir_action: "navigate",
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function hasVerifiedCoordinates(
  place: TourismPlace,
): place is TourismPlace & { latitude: number; longitude: number } {
  return (
    place.coordinateStatus === "verified" &&
    typeof place.latitude === "number" &&
    Number.isFinite(place.latitude) &&
    typeof place.longitude === "number" &&
    Number.isFinite(place.longitude)
  );
}

export function getPlaceDirectionsUrl(place: TourismPlace): string | null {
  const candidate = place.googleMapsUrl?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    const isShortPlaceLink =
      url.protocol === "https:" &&
      url.hostname === "maps.app.goo.gl" &&
      url.pathname.length > 1;
    const isFullPlaceLink =
      url.protocol === "https:" &&
      (url.hostname === "google.com" || url.hostname === "www.google.com") &&
      url.pathname.startsWith("/maps/place/");

    return isShortPlaceLink || isFullPlaceLink ? candidate : null;
  } catch {
    return null;
  }
}
