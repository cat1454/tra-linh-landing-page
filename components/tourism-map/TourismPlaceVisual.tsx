import Image from "next/image";

import { hasDocumentaryTourismCover } from "@/data/tourism-map/media";
import type { TourismPlace } from "@/data/tourism-map/types";

import { TourismCategoryArtwork } from "./TourismCategoryArtwork";

interface TourismPlaceVisualProps {
  place: TourismPlace;
  sizes: string;
  priority?: boolean;
  variant?: "thumbnail" | "hero";
}

export function TourismPlaceVisual({
  place,
  sizes,
  priority = false,
  variant = "thumbnail",
}: TourismPlaceVisualProps) {
  if (!hasDocumentaryTourismCover(place)) {
    return <TourismCategoryArtwork place={place} variant={variant} />;
  }

  return (
    <Image
      src={place.coverImage!}
      alt={place.imageAlt}
      fill
      priority={priority}
      sizes={sizes}
      className="object-cover"
    />
  );
}
