import type { SymbolLayerSpecification } from "mapbox-gl";

export const DEFAULT_TOURISM_MAP_STYLE_URL = "mapbox://styles/mapbox/standard";
export const TOURISM_MAP_CENTER: [number, number] = [108.025, 15.03];
export const TOURISM_MAP_ZOOM = 12;
export const TOURISM_LABEL_LAYER_ID = "tourism-place-labels";
export const TOURISM_ACTIVE_LABEL_LAYER_ID = "tourism-active-place-label";

export interface TourismMapConfiguration {
  accessToken: string;
  styleUrl: string;
}

function isAllowedMapboxStyleUrl(styleUrl: string): boolean {
  return (
    styleUrl.startsWith("mapbox://styles/") ||
    styleUrl.startsWith("https://api.mapbox.com/styles/")
  );
}

export function getTourismMapConfiguration(): TourismMapConfiguration | null {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim() ?? "";
  const configuredStyle = process.env.NEXT_PUBLIC_MAPBOX_STYLE_URL?.trim() ?? "";
  const styleUrl = configuredStyle || DEFAULT_TOURISM_MAP_STYLE_URL;

  if (!accessToken.startsWith("pk.") || !isAllowedMapboxStyleUrl(styleUrl)) {
    return null;
  }

  return { accessToken, styleUrl };
}

const tourismLabelLayout: SymbolLayerSpecification["layout"] = {
  "text-field": ["get", "name"],
  "text-size": ["interpolate", ["linear"], ["zoom"], 10, 12.5, 14, 14.5],
  "text-max-width": 11.5,
  "text-variable-anchor": ["top", "bottom", "left", "right"],
  "text-radial-offset": 2.6,
  "text-justify": "auto",
  "text-padding": 9,
  "text-allow-overlap": false,
  "text-ignore-placement": false,
};

export function createTourismLabelLayer(sourceId: string): SymbolLayerSpecification {
  return {
    id: TOURISM_LABEL_LAYER_ID,
    type: "symbol",
    source: sourceId,
    slot: "top",
    minzoom: 9,
    filter: ["!", ["has", "point_count"]],
    layout: tourismLabelLayout,
    paint: {
      "text-color": "#10251A",
      "text-halo-color": "#F8FAF5",
      "text-halo-width": 2,
      "text-halo-blur": 0.5,
    },
  };
}

export function createTourismActiveLabelLayer(
  sourceId: string,
): SymbolLayerSpecification {
  return {
    id: TOURISM_ACTIVE_LABEL_LAYER_ID,
    type: "symbol",
    source: sourceId,
    slot: "top",
    minzoom: 9,
    filter: ["==", ["get", "slug"], ""],
    layout: {
      ...tourismLabelLayout,
      "text-size": ["interpolate", ["linear"], ["zoom"], 10, 14, 14, 16],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": "#29452C",
      "text-halo-color": "#FFFFFF",
      "text-halo-width": 3,
      "text-halo-blur": 0.5,
    },
  };
}
