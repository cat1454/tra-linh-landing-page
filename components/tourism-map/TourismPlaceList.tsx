"use client";

import type { TourismPlace } from "@/data/tourism-map/types";
import { TourismPlaceCard } from "./TourismPlaceCard";

interface TourismPlaceListProps {
  places: TourismPlace[];
  activeSlug: string | null;
  onSelect: (place: TourismPlace) => void;
  className?: string;
}

export function TourismPlaceList({
  places,
  activeSlug,
  onSelect,
  className = "",
}: TourismPlaceListProps) {
  if (!places.length) {
    return (
      <p className="rounded-2xl border border-dashed border-[#10251A]/20 p-5 text-sm leading-6 text-[#10251A]/65">
        Chưa có địa điểm phù hợp với bộ lọc này.
      </p>
    );
  }

  return (
    <div
      className={`tourism-scrollbar space-y-3 overflow-y-auto overscroll-y-contain pr-1 ${className}`}
      data-lenis-prevent-wheel
      role="list"
    >
      {places.map((place) => (
        <div key={place.id} role="listitem">
          <TourismPlaceCard
            place={place}
            active={place.slug === activeSlug}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  );
}
