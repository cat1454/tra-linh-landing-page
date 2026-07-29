"use client";

import { ArrowUpRight, MapPin, Navigation } from "lucide-react";
import Link from "next/link";

import { getTourismCategoryLabel } from "@/data/tourism-map/categories";
import type { TourismPlace } from "@/data/tourism-map/types";
import { getPlaceDirectionsUrl, hasVerifiedCoordinates } from "@/lib/tourism-map";

import { TourismPlaceVisual } from "./TourismPlaceVisual";

interface TourismPlaceCardProps {
  place: TourismPlace;
  active: boolean;
  onSelect: (place: TourismPlace) => void;
  compact?: boolean;
}

export function TourismPlaceCard({
  place,
  active,
  onSelect,
  compact = false,
}: TourismPlaceCardProps) {
  const directionsUrl = getPlaceDirectionsUrl(place);
  return (
    <article
      id={`tourism-place-${place.slug}`}
      data-testid="tourism-place-card"
      className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-[0_10px_30px_rgba(16,37,26,0.08)] transition ${active
          ? "border-[#49672D] ring-2 ring-[#9BBE62]/45"
          : "border-[#10251A]/10 hover:border-[#49672D]/35"
        }`}
    >
      <button
        type="button"
        aria-label={`Chọn ${place.name} trên bản đồ`}
        aria-pressed={active}
        onClick={() => onSelect(place)}
        className={`grid w-full items-stretch text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#D5A84E] ${compact
            ? "grid-cols-[88px_1fr] min-[360px]:grid-cols-[112px_1fr]"
            : "grid-cols-[104px_1fr]"
          }`}
      >
        <span className="relative min-h-32 overflow-hidden bg-[#DDE5D5]">
          <TourismPlaceVisual
            place={place}
            sizes="(max-width: 359px) 88px, (max-width: 1023px) 112px, 104px"
          />
        </span>
        <span className={compact ? "px-3 py-2 min-[360px]:px-4 min-[360px]:py-3" : "p-4"}>
          <span className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#49672D]">
            {getTourismCategoryLabel(place.category)}
            {place.scope === "nearby" ? (
              <span className="rounded-full bg-[#7B6CA8]/12 px-2 py-1 text-[#67588D]">
                Lân cận
              </span>
            ) : null}
          </span>
          <span
            className={`block font-serif font-semibold leading-snug text-[#10251A] ${compact
                ? "mt-1 text-base min-[360px]:mt-2 min-[360px]:text-lg"
                : "mt-2 text-lg"
              }`}
          >
            {place.name}
          </span>
          <span
            className={`text-[#10251A]/65 ${compact
                ? "mt-1 line-clamp-1 text-xs leading-5 min-[360px]:mt-2 min-[360px]:line-clamp-2 min-[360px]:text-sm min-[360px]:leading-6"
                : "mt-2 line-clamp-2 text-sm leading-6"
              }`}
          >
            {place.shortDescription}
          </span>
          {!hasVerifiedCoordinates(place) ? (
            <span className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#8A633D]">
              <MapPin className="size-3.5" aria-hidden="true" />
              Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps
            </span>
          ) : null}
        </span>
      </button>

      <div
        className={`flex items-center border-t border-[#10251A]/8 ${compact
            ? "gap-1 px-2 py-2 min-[360px]:gap-2 min-[360px]:px-4 min-[360px]:py-3"
            : "gap-2 px-4 py-3"
          }`}
      >
        <Link
          href={`/dia-diem/${place.slug}`}
          className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#EEF1E9] px-2 text-[11px] font-semibold text-[#29452C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] min-[360px]:gap-1.5 min-[360px]:px-3 min-[360px]:text-xs"
        >
          Xem chi tiết
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
        {directionsUrl ? (
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#29452C] px-2 text-[11px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] min-[360px]:gap-1.5 min-[360px]:px-3 min-[360px]:text-xs"
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
            className="inline-flex min-h-10 min-w-0 flex-1 cursor-not-allowed items-center justify-center gap-1 whitespace-nowrap rounded-full bg-[#10251A]/8 px-2 text-[11px] font-semibold text-[#10251A]/45 min-[360px]:gap-1.5 min-[360px]:px-3 min-[360px]:text-xs"
          >
            <Navigation className="size-3.5" aria-hidden="true" />
            Chỉ đường
          </button>
        )}
      </div>
    </article>
  );
}
