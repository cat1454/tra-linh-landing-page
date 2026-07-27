import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_TOURISM_MAP_STYLE_URL,
  TOURISM_ACTIVE_LABEL_LAYER_ID,
  TOURISM_LABEL_LAYER_ID,
  TOURISM_MAP_CENTER,
  TOURISM_MAP_ZOOM,
  createTourismActiveLabelLayer,
  createTourismLabelLayer,
  getTourismMapConfiguration,
} from "@/lib/tourism-map-basemap";

describe("tourism Mapbox configuration", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the configured public Mapbox token and Standard style", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test-public-token");
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_STYLE_URL", "mapbox://styles/mapbox/standard");

    expect(getTourismMapConfiguration()).toEqual({
      accessToken: "pk.test-public-token",
      styleUrl: "mapbox://styles/mapbox/standard",
    });
    expect(TOURISM_MAP_CENTER).toEqual([108.025, 15.03]);
    expect(TOURISM_MAP_ZOOM).toBe(12);
  });

  it("defaults to Mapbox Standard and rejects a missing public token", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test-public-token");
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_STYLE_URL", "");
    expect(getTourismMapConfiguration()?.styleUrl).toBe(DEFAULT_TOURISM_MAP_STYLE_URL);

    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "");
    expect(getTourismMapConfiguration()).toBeNull();
  });

  it("rejects non-Mapbox style URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN", "pk.test-public-token");
    vi.stubEnv("NEXT_PUBLIC_MAPBOX_STYLE_URL", "https://tile.openstreetmap.org/style.json");

    expect(getTourismMapConfiguration()).toBeNull();
  });

  it("builds readable place labels that automatically avoid one another", () => {
    const layer = createTourismLabelLayer("tourism-places");

    expect(layer).toMatchObject({
      id: TOURISM_LABEL_LAYER_ID,
      type: "symbol",
      source: "tourism-places",
      slot: "top",
      layout: {
        "text-field": ["get", "name"],
        "text-variable-anchor": ["top", "bottom", "left", "right"],
        "text-allow-overlap": false,
        "text-ignore-placement": false,
      },
      paint: {
        "text-color": "#10251A",
        "text-halo-color": "#F8FAF5",
      },
    });
    expect(layer.layout?.["text-max-width"]).toBeGreaterThanOrEqual(10);
    expect(layer.layout?.["text-radial-offset"]).toBeGreaterThanOrEqual(2.2);
    expect(layer.layout?.["text-padding"]).toBeGreaterThanOrEqual(8);
    expect(layer.paint?.["text-halo-width"]).toBeGreaterThanOrEqual(2);
  });

  it("keeps the selected place label visible and visually prominent", () => {
    const layer = createTourismActiveLabelLayer("tourism-places");

    expect(layer).toMatchObject({
      id: TOURISM_ACTIVE_LABEL_LAYER_ID,
      type: "symbol",
      source: "tourism-places",
      slot: "top",
      filter: ["==", ["get", "slug"], ""],
      layout: {
        "text-field": ["get", "name"],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
      },
    });
    expect(layer.paint?.["text-halo-width"]).toBeGreaterThanOrEqual(3);
  });
});
