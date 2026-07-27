import {
  Building2,
  House,
  Landmark,
  Leaf,
  MapPin,
  Mountain,
  ShoppingBasket,
} from "lucide-react";

import { TOURISM_CATEGORY_COLORS } from "@/data/tourism-map/categories";
import type { TourismPlaceCategory } from "@/data/tourism-map/types";

const markerIcons = {
  ginseng: Leaf,
  culture: Landmark,
  community: House,
  nature: Mountain,
  shopping: ShoppingBasket,
  administrative: Building2,
};

interface TourismMapMarkerProps {
  category: TourismPlaceCategory;
  active?: boolean;
  label?: string;
}

export function TourismMapMarker({
  category,
  active = false,
  label,
}: TourismMapMarkerProps) {
  const Icon = markerIcons[category] ?? MapPin;
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        data-testid="tourism-map-marker-visual"
        className={`inline-grid shrink-0 place-items-center rounded-full border-2 border-white text-white shadow-[0_4px_12px_rgba(16,37,26,0.22)] transition-transform ${
          active ? "size-11 scale-110" : "size-9"
        }`}
        style={{
          backgroundColor: active
            ? "#D5A84E"
            : TOURISM_CATEGORY_COLORS[category] ?? "#49672D",
        }}
      >
        <Icon className="size-4" strokeWidth={2.25} />
      </span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}
