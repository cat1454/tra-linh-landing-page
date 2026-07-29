import { ExternalLink, Navigation } from "lucide-react";
import Link from "next/link";

import { getTourismCategoryLabel } from "@/data/tourism-map/categories";
import type { TourismPlace } from "@/data/tourism-map/types";
import { getPlaceDirectionsUrl, hasVerifiedCoordinates } from "@/lib/tourism-map";

import { TourismPlaceVisual } from "./TourismPlaceVisual";

const accessLabels: Record<TourismPlace["visitorAccess"], string> = {
  public: "Có thể tiếp cận công khai",
  contact_required: "Cần liên hệ trước",
  permission_required: "Cần được cho phép",
  event_only: "Mở theo lịch sự kiện",
  restricted: "Hạn chế tiếp cận",
  unknown: "Đang cập nhật điều kiện tham quan",
};

export function TourismPlacePopup({ place }: { place: TourismPlace }) {
  const directionsUrl = getPlaceDirectionsUrl(place);
  return (
    <article className="w-[min(280px,calc(100vw-64px))] overflow-hidden rounded-2xl bg-white text-[#10251A]">
      <div className="relative h-28 bg-[#DDE5D5]">
        <TourismPlaceVisual place={place} sizes="280px" />
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#49672D]">
          {getTourismCategoryLabel(place.category)}
        </p>
        <h3 className="mt-1 font-serif text-lg font-semibold leading-snug">{place.name}</h3>
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#10251A]/65">
          {place.shortDescription}
        </p>
        <dl className="mt-3 space-y-1 text-xs">
          <div>
            <dt className="inline font-semibold">Địa chỉ: </dt>
            <dd className="inline text-[#10251A]/65">{place.currentAddress}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Tham quan: </dt>
            <dd className="inline text-[#10251A]/65">{accessLabels[place.visitorAccess]}</dd>
          </div>
        </dl>
        {!hasVerifiedCoordinates(place) ? (
          <p className="mt-3 text-xs font-semibold leading-5 text-[#8A633D]">
            Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps
          </p>
        ) : null}
        <div className="mt-4 flex gap-2">
          <Link
            href={`/dia-diem/${place.slug}`}
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-[#EEF1E9] px-3 text-xs font-semibold text-[#29452C]"
          >
            Xem chi tiết <ExternalLink className="size-3" aria-hidden="true" />
          </Link>
          {directionsUrl ? (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Chỉ đường đến ${place.name}`}
              className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-full bg-[#29452C] px-3 text-xs font-semibold text-white"
            >
              <Navigation className="size-3" aria-hidden="true" /> Chỉ đường
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
