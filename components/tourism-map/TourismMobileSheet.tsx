"use client";

import { ArrowUpRight, MapPin, Navigation, X } from "lucide-react";
import Link from "next/link";

import { getTourismCategoryLabel } from "@/data/tourism-map/categories";
import type { TourismPlace } from "@/data/tourism-map/types";
import { getPlaceDirectionsUrl, hasVerifiedCoordinates } from "@/lib/tourism-map";

import { TourismPlaceVisual } from "./TourismPlaceVisual";

interface TourismMobileSheetProps {
  place: TourismPlace | null;
  places: TourismPlace[];
  onClose: () => void;
}

export function TourismMobileSheet({
  place,
  places,
  onClose,
}: TourismMobileSheetProps) {
  if (!place || !places.length) return null;

  const placeIndex = Math.max(
    0,
    places.findIndex((candidate) => candidate.slug === place.slug),
  );
  const directionsUrl = getPlaceDirectionsUrl(place);
  return (
    <section
      className="tourism-mobile-sheet absolute inset-x-3 bottom-3 z-20 rounded-[1.5rem] border border-white/70 bg-white/96 p-2 shadow-[0_18px_50px_rgba(16,37,26,0.28)] backdrop-blur lg:hidden"
      aria-label="Chi tiết địa điểm đang chọn"
      aria-live="polite"
      data-testid="tourism-mobile-sheet"
    >
      <div className="relative flex min-h-11 items-center">
        <span
          className="absolute left-1/2 top-1 h-1 w-10 -translate-x-1/2 rounded-full bg-[#10251A]/18"
          aria-hidden="true"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng thông tin địa điểm"
          className="ml-auto inline-flex size-11 items-center justify-center rounded-full border border-[#10251A]/10 bg-[#EEF1E9] text-[#10251A] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 px-1 pb-1.5 min-[360px]:grid-cols-[80px_minmax(0,1fr)] min-[360px]:gap-3">
        <div className="relative hidden h-20 overflow-hidden rounded-2xl bg-[#DDE5D5] min-[360px]:block">
          <TourismPlaceVisual place={place} sizes="80px" />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.12em] text-[#49672D] min-[360px]:text-[10px]">
            {getTourismCategoryLabel(place.category)}
          </p>
          <h3 className="mt-1 font-serif text-[15px] font-semibold leading-[1.2] text-[#10251A]">
            {place.name}
          </h3>
          <p className="mt-0.5 hidden truncate text-xs leading-4 text-[#10251A]/62 min-[360px]:block">
            {place.shortDescription}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-semibold text-[#29452C]/75 min-[360px]:text-xs">
            <span>{placeIndex + 1} / {places.length} địa điểm</span>
            {!hasVerifiedCoordinates(place) ? (
              <span className="hidden min-w-0 items-center gap-1 truncate text-[#8A633D] min-[430px]:inline-flex">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                Vị trí tham khảo
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[#10251A]/8 px-1 pt-2">
        <Link
          href={`/dia-diem/${place.slug}`}
          className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[#29452C]/18 bg-[#EEF1E9] px-2 text-[11px] font-semibold text-[#29452C] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] min-[360px]:gap-1.5 min-[360px]:text-xs"
        >
          Xem chi tiết
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
        {directionsUrl ? (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#29452C] px-2 text-[11px] font-semibold text-white transition hover:bg-[#49672D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] min-[360px]:gap-1.5 min-[360px]:text-xs"
            aria-label={`Chỉ đường đến ${place.name}`}
          >
            <Navigation className="size-3.5" aria-hidden="true" />
            Chỉ đường
          </a>
        ) : (
          <button
            type="button"
            disabled
            aria-label={`Chỉ đường đến ${place.name} — đang cập nhật vị trí`}
            className="inline-flex min-h-11 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#10251A]/8 px-2 text-[11px] font-semibold text-[#10251A]/45 min-[360px]:gap-1.5 min-[360px]:text-xs"
          >
            <Navigation className="size-3.5" aria-hidden="true" />
            Chỉ đường
          </button>
        )}
      </div>
    </section>
  );
}
