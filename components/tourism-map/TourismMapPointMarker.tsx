import type { MouseEvent } from "react";

import type { TourismPlace } from "@/data/tourism-map/types";
import { TourismMapMarker } from "./TourismMapMarker";

interface TourismMapPointMarkerProps {
  place: TourismPlace;
  active: boolean;
  onSelect: (slug: string) => void;
}

export function TourismMapPointMarker({
  place,
  active,
  onSelect,
}: TourismMapPointMarkerProps) {
  function selectMarker(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onSelect(place.slug);
  }

  return (
    <button
      type="button"
      aria-label={`Chọn ${place.name} trên bản đồ`}
      aria-pressed={active}
      data-category={place.category}
      data-testid={`tourism-map-marker-${place.slug}`}
      className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
      onClick={selectMarker}
    >
      <TourismMapMarker category={place.category} active={active} />
    </button>
  );
}
