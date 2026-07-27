"use client";

import mapboxgl, {
  type CircleLayerSpecification,
  type GeoJSONSource,
  type LngLatBoundsLike,
  type SymbolLayerSpecification,
} from "mapbox-gl";
import { Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";

import { tourismExplorerCategories } from "@/data/tourism-map/categories";
import type {
  TourismExplorerCategory,
  TourismMapMode,
  TourismMapScope,
  TourismPlace,
} from "@/data/tourism-map/types";
import {
  filterTourismExplorerEntities,
  hasMappableCoordinates,
  toTourismGeoJson,
} from "@/lib/tourism-map";
import {
  TOURISM_ACTIVE_LABEL_LAYER_ID,
  TOURISM_LABEL_LAYER_ID,
  TOURISM_MAP_CENTER,
  TOURISM_MAP_ZOOM,
  createTourismActiveLabelLayer,
  createTourismLabelLayer,
  getTourismMapConfiguration,
} from "@/lib/tourism-map-basemap";
import { TourismFilterBar } from "./TourismFilterBar";
import { TourismMapErrorFallback } from "./TourismMapErrorFallback";
import { TourismMapFullscreen } from "./TourismMapFullscreen";
import { TourismMapLegend } from "./TourismMapLegend";
import { TourismMapPointMarker } from "./TourismMapPointMarker";
import { TourismMobileSheet } from "./TourismMobileSheet";
import { TourismPlaceList } from "./TourismPlaceList";
import { TourismPlacePopup } from "./TourismPlacePopup";

const SOURCE_ID = "tourism-places";
const CLUSTER_LAYER_ID = "tourism-place-clusters";
const CLUSTER_COUNT_LAYER_ID = "tourism-place-cluster-count";
// Show category icons early enough to make places discoverable at the normal
// mobile overview, while retaining clusters when the map is viewed from afar.
const OVERVIEW_MARKER_MIN_ZOOM = 10;
const SELECTED_PLACE_ZOOM = 15;

const clusterLayer: CircleLayerSpecification = {
  id: CLUSTER_LAYER_ID,
  type: "circle",
  source: SOURCE_ID,
  maxzoom: OVERVIEW_MARKER_MIN_ZOOM,
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#49672D",
      5,
      "#29452C",
      10,
      "#10251A",
    ],
    "circle-radius": ["step", ["get", "point_count"], 21, 5, 26, 10, 31],
    "circle-stroke-color": "#F7F2E6",
    "circle-stroke-width": 4,
  },
};

const clusterCountLayer: SymbolLayerSpecification = {
  id: CLUSTER_COUNT_LAYER_ID,
  type: "symbol",
  source: SOURCE_ID,
  maxzoom: OVERVIEW_MARKER_MIN_ZOOM,
  filter: ["has", "point_count"],
  layout: {
    "text-field": ["get", "point_count_abbreviated"],
    "text-size": 13,
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
  },
  paint: { "text-color": "#FFFFFF" },
};

interface PopupReference {
  popup: mapboxgl.Popup;
  root: Root;
}

interface MarkerReference {
  element: HTMLDivElement;
  marker: mapboxgl.Marker;
  onSelect: () => void;
  place: TourismPlace;
  root: Root;
}

interface TourismMapClientProps {
  entities: TourismPlace[];
  mode?: TourismMapMode;
  onClientReady?: () => void;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isDesktopViewport(): boolean {
  return window.matchMedia("(min-width: 1024px)").matches;
}

function getBounds(entities: TourismPlace[]): LngLatBoundsLike | null {
  const mappable = entities.filter(hasMappableCoordinates);
  if (!mappable.length) return null;
  const bounds = new mapboxgl.LngLatBounds();
  mappable.forEach((place) => bounds.extend([place.longitude, place.latitude]));
  return bounds;
}

function disposePopup(reference: PopupReference | null) {
  if (!reference) return;
  reference.popup.remove();
  queueMicrotask(() => reference.root.unmount());
}

function renderMarker(reference: MarkerReference, active: boolean) {
  reference.root.render(
    <TourismMapPointMarker
      place={reference.place}
      active={active}
      onSelect={reference.onSelect}
    />,
  );
}

function disposeMarkers(references: Map<string, MarkerReference>) {
  const markers = [...references.values()];
  references.clear();
  markers.forEach((reference) => reference.marker.remove());
  queueMicrotask(() => markers.forEach((reference) => reference.root.unmount()));
}

export default function TourismMapClient({
  entities,
  mode = "preview",
  onClientReady,
}: TourismMapClientProps) {
  const [query, setQuery] = useState("");
  const [activeScope, setActiveScope] =
    useState<TourismMapScope>("inside_tra_linh");
  const [activeCategory, setActiveCategory] =
    useState<TourismExplorerCategory>("all");
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapRendered, setMapRendered] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const mapCanvasRef = useRef<HTMLDivElement>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(new Map<string, MarkerReference>());
  const popupRef = useRef<PopupReference | null>(null);
  const entitiesRef = useRef(entities);
  const visibleSlugsRef = useRef(new Set(entities.map((entity) => entity.slug)));

  const filteredEntities = useMemo(
    () =>
      mode === "explorer"
        ? filterTourismExplorerEntities(entities, {
            query,
            scope: activeScope,
            category: activeCategory,
          })
        : entities,
    [activeCategory, activeScope, entities, mode, query],
  );
  const filteredGeoJson = useMemo(
    () => toTourismGeoJson(filteredEntities),
    [filteredEntities],
  );
  const activePlace = activeSlug
    ? filteredEntities.find((place) => place.slug === activeSlug) ?? null
    : null;
  const mobilePlace = activePlace;

  useEffect(() => {
    onClientReady?.();
  }, [onClientReady]);

  useEffect(() => {
    entitiesRef.current = entities;
  }, [entities]);

  useEffect(() => {
    if (!mapCanvasRef.current || mapRef.current) return;

    const markerReferences = markersRef.current;
    mapCanvasRef.current.replaceChildren();
    const mapConfiguration = getTourismMapConfiguration();
    if (!mapConfiguration) {
      queueMicrotask(() => setMapFailed(true));
      return;
    }

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        accessToken: mapConfiguration.accessToken,
        container: mapCanvasRef.current,
        style: mapConfiguration.styleUrl,
        center: TOURISM_MAP_CENTER,
        zoom: TOURISM_MAP_ZOOM,
        cooperativeGestures: true,
        attributionControl: false,
      });
      mapRef.current = map;
    } catch {
      queueMicrotask(() => setMapFailed(true));
      return;
    }

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-left");
    map.addControl(
      new mapboxgl.AttributionControl({ compact: !isDesktopViewport() }),
      "bottom-right",
    );

    const updateMarkerVisibility = () => {
      const showMarkers = map.getZoom() >= OVERVIEW_MARKER_MIN_ZOOM;
      markerReferences.forEach((reference, slug) => {
        reference.element.hidden = !showMarkers || !visibleSlugsRef.current.has(slug);
      });
    };

    const loadTimeout = window.setTimeout(() => {
      if (!map.isStyleLoaded()) setMapFailed(true);
    }, 15_000);

    map.on("style.load", () => {
      window.clearTimeout(loadTimeout);
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: toTourismGeoJson(entitiesRef.current),
        cluster: true,
        clusterMaxZoom: OVERVIEW_MARKER_MIN_ZOOM - 1,
        clusterRadius: 60,
      });
      map.addLayer(clusterLayer);
      map.addLayer(clusterCountLayer);
      map.addLayer(createTourismLabelLayer(SOURCE_ID));
      map.addLayer(createTourismActiveLabelLayer(SOURCE_ID));

      map.on("mouseenter", CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTER_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("click", CLUSTER_LAYER_ID, (event) => {
        const feature = map.queryRenderedFeatures(event.point, {
          layers: [CLUSTER_LAYER_ID],
        })[0];
        const clusterId = feature?.properties?.cluster_id;
        if (typeof clusterId !== "number") return;
        const source = map.getSource(SOURCE_ID) as GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error || typeof zoom !== "number" || feature.geometry.type !== "Point") return;
          map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
        });
      });

      [TOURISM_LABEL_LAYER_ID, TOURISM_ACTIVE_LABEL_LAYER_ID].forEach((layerId) => {
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", layerId, (event) => {
          const slug = event.features?.[0]?.properties?.slug;
          if (typeof slug !== "string") return;
          setLegendOpen(false);
          setActiveSlug(slug);
          if (isDesktopViewport()) {
            document.getElementById(`tourism-place-${slug}`)?.scrollIntoView({
              block: "nearest",
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          }
        });
      });

      entitiesRef.current.filter(hasMappableCoordinates).forEach((place) => {
        const element = document.createElement("div");
        const root = createRoot(element);
        const onSelect = () => {
          setLegendOpen(false);
          setActiveSlug(place.slug);
          if (isDesktopViewport()) {
            document.getElementById(`tourism-place-${place.slug}`)?.scrollIntoView({
              block: "nearest",
              behavior: prefersReducedMotion() ? "auto" : "smooth",
            });
          }
        };
        const marker = new mapboxgl.Marker({ element, anchor: "center" })
          .setLngLat([place.longitude, place.latitude])
          .addTo(map);
        const reference = { element, marker, onSelect, place, root };
        markerReferences.set(place.slug, reference);
        renderMarker(reference, false);
      });

      updateMarkerVisibility();
      map.on("zoom", updateMarkerVisibility);
      map.on("click", (event) => {
        const interactiveFeatures = map.queryRenderedFeatures(event.point, {
          layers: [
            CLUSTER_LAYER_ID,
            TOURISM_LABEL_LAYER_ID,
            TOURISM_ACTIVE_LABEL_LAYER_ID,
          ],
        });
        if (interactiveFeatures.length === 0) {
          setActiveSlug(null);
          setLegendOpen(false);
        }
      });
      setMapReady(true);
      setMapRendered(true);
    });

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setActiveSlug(null);
      setLegendOpen(false);
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.clearTimeout(loadTimeout);
      window.removeEventListener("keydown", handleEscape);
      disposePopup(popupRef.current);
      popupRef.current = null;
      disposeMarkers(markerReferences);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    source?.setData(filteredGeoJson);
    const visibleSlugs = new Set(filteredEntities.map((place) => place.slug));
    visibleSlugsRef.current = visibleSlugs;
    const showMarkers = map.getZoom() >= OVERVIEW_MARKER_MIN_ZOOM;
    markersRef.current.forEach((reference, slug) => {
      reference.element.hidden = !showMarkers || !visibleSlugs.has(slug);
    });

    const bounds = getBounds(filteredEntities);
    if (bounds) {
      map.fitBounds(bounds, {
        padding: mode === "explorer" ? 72 : 54,
        maxZoom: filteredGeoJson.features.length === 1 ? SELECTED_PLACE_ZOOM : 13,
        duration: prefersReducedMotion() ? 0 : 650,
      });
    } else {
      map.easeTo({
        center: TOURISM_MAP_CENTER,
        zoom: TOURISM_MAP_ZOOM,
        duration: prefersReducedMotion() ? 0 : 650,
      });
    }
  }, [filteredEntities, filteredGeoJson, mapReady, mode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    markersRef.current.forEach((reference, slug) => {
      renderMarker(reference, slug === activePlace?.slug);
    });
    map.setFilter(TOURISM_LABEL_LAYER_ID, [
      "all",
      ["!", ["has", "point_count"]],
      ["!=", ["get", "slug"], activePlace?.slug ?? ""],
    ]);
    map.setFilter(TOURISM_ACTIVE_LABEL_LAYER_ID, [
      "all",
      ["!", ["has", "point_count"]],
      ["==", ["get", "slug"], activePlace?.slug ?? ""],
    ]);

    disposePopup(popupRef.current);
    popupRef.current = null;
    if (!activePlace || !hasMappableCoordinates(activePlace)) {
      return;
    }

    map.flyTo({
      center: [activePlace.longitude, activePlace.latitude],
      zoom: SELECTED_PLACE_ZOOM,
      duration: prefersReducedMotion() ? 0 : 750,
      essential: false,
    });

    if (!isDesktopViewport()) return;

    const container = document.createElement("div");
    const root = createRoot(container);
    root.render(<TourismPlacePopup place={activePlace} />);
    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: "320px",
      offset: 28,
    })
      .setLngLat([activePlace.longitude, activePlace.latitude])
      .setDOMContent(container)
      .addTo(map);
    popup.on("close", () => setActiveSlug(null));
    popupRef.current = { popup, root };
  }, [activePlace, mapReady]);

  function selectPlace(place: TourismPlace) {
    setLegendOpen(false);
    setActiveSlug(place.slug);
  }

  function resetSelection() {
    setActiveSlug(null);
  }

  function closeSelectionIfFilteredOut(
    nextQuery: string,
    nextScope: TourismMapScope,
    nextCategory: TourismExplorerCategory,
  ) {
    if (!activeSlug || mode !== "explorer") return;
    const remainsVisible = filterTourismExplorerEntities(entities, {
      query: nextQuery,
      scope: nextScope,
      category: nextCategory,
    }).some((place) => place.slug === activeSlug);
    if (!remainsVisible) resetSelection();
  }

  function changeScope(scope: TourismMapScope) {
    setActiveScope(scope);
    closeSelectionIfFilteredOut(query, scope, activeCategory);
  }

  function changeCategory(category: TourismExplorerCategory) {
    setActiveCategory(category);
    closeSelectionIfFilteredOut(query, activeScope, category);
  }

  function changeLegend(open: boolean) {
    setLegendOpen(open);
    if (open) resetSelection();
  }

  const filterBar = mode === "explorer" ? (
    <TourismFilterBar
      categories={tourismExplorerCategories}
      activeCategory={activeCategory}
      activeScope={activeScope}
      query={query}
      onCategoryChange={changeCategory}
      onQueryChange={(value) => {
        setQuery(value);
        closeSelectionIfFilteredOut(value, activeScope, activeCategory);
      }}
      onScopeChange={changeScope}
    />
  ) : null;

  return (
    <div className={mode === "explorer" ? "tourism-map-explorer" : "tourism-map-preview"}>
      {mode === "explorer" ? <div className="mb-4 lg:hidden">{filterBar}</div> : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(320px,35%)_minmax(0,65%)]">
        <aside className="hidden min-h-0 lg:flex lg:h-[600px] lg:flex-col">
          {filterBar}
          <div className={`${filterBar ? "mt-4" : ""} mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-[#49672D]`}>
            <span>Danh sách địa điểm</span>
            <span>{filteredEntities.length} kết quả</span>
          </div>
          <TourismPlaceList
            places={filteredEntities}
            activeSlug={activeSlug}
            onSelect={selectPlace}
            className="min-h-0 flex-1"
          />
        </aside>

        <div className="min-w-0">
          <div
            ref={fullscreenRef}
            className="tourism-map-frame relative overflow-hidden rounded-[1.75rem] border border-[#10251A]/10 bg-[#DCE5D6] shadow-[0_24px_70px_rgba(16,37,26,0.12)]"
            data-mobile-sheet-open={Boolean(mobilePlace)}
          >
            {mapFailed ? (
              <TourismMapErrorFallback
                places={filteredEntities}
                onRetry={() => window.location.reload()}
              />
            ) : (
              <>
                <div
                  ref={mapCanvasRef}
                  className="h-[540px] w-full lg:h-[600px]"
                  data-testid="tourism-map-canvas"
                  aria-label="Bản đồ tương tác các điểm du lịch Trà Linh"
                  aria-busy={!mapRendered}
                  role="application"
                />
                <TourismMapFullscreen targetRef={fullscreenRef} />
                {mapReady ? (
                  <TourismMapLegend open={legendOpen} onOpenChange={changeLegend} />
                ) : null}
                {mapReady && filteredGeoJson.features.length === 0 ? (
                  <div className="pointer-events-none absolute inset-x-4 top-20 z-10 mx-auto max-w-sm rounded-2xl border border-white/60 bg-[#EEF1E9]/92 p-4 text-center shadow-lg backdrop-blur">
                    <p className="text-sm font-semibold text-[#10251A]">
                      Không tìm thấy địa điểm phù hợp.
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#10251A]/65">
                      Hãy thử từ khóa, phạm vi hoặc nhóm trải nghiệm khác.
                    </p>
                  </div>
                ) : null}
                <TourismMobileSheet
                  place={mobilePlace}
                  places={filteredEntities}
                  onClose={resetSelection}
                />
              </>
            )}
          </div>

          {mode === "preview" ? (
            <div className="mt-4 flex justify-end">
              <Link
                href="/ban-do-du-lich"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/20 bg-white/75 px-5 text-sm font-semibold text-[#29452C] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
              >
                <MapIcon className="size-4" aria-hidden="true" />
                Mở bản đồ du lịch
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
