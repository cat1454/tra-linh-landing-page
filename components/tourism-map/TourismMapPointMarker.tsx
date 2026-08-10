import type { TourismPlace } from "@/data/tourism-map/types";
import { TourismMapMarker } from "./TourismMapMarker";

interface TourismMapPointMarkerProps {
  place: TourismPlace;
  active: boolean;
}

export function TourismMapPointMarker({
  place,
  active,
}: TourismMapPointMarkerProps) {
  return (
    <span
      aria-hidden="true"
      data-category={place.category}
      data-testid={`tourism-map-marker-${place.slug}`}
    >
      <TourismMapMarker category={place.category} active={active} />
    </span>
  );
}
