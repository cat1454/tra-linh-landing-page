import { MapPinned } from "lucide-react";
import Link from "next/link";

import type { TourismPlace } from "@/data/tourism-map/types";

interface TourismMapErrorFallbackProps {
  places?: TourismPlace[];
  onRetry?: () => void;
}

export function TourismMapErrorFallback({
  places = [],
  onRetry,
}: TourismMapErrorFallbackProps) {
  return (
    <div
      className="grid min-h-[430px] place-items-center rounded-[1.75rem] border border-[#10251A]/10 bg-[linear-gradient(145deg,#E6EBDD,#EEE3CB)] p-6 text-center lg:min-h-[560px]"
      role="status"
    >
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-white/80 text-[#49672D] shadow-sm">
          <MapPinned className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-5 font-serif text-2xl font-semibold text-[#10251A]">
          Không thể tải bản đồ tương tác.
        </p>
        <p className="mt-3 leading-7 text-[#10251A]/68">
          Bạn vẫn có thể xem danh sách địa điểm và mở thông tin chi tiết.
        </p>
        {places.length ? (
          <ul className="mt-5 space-y-2 text-left">
            {places.slice(0, 3).map((place) => (
              <li key={place.id}>
                <Link
                  href={`/dia-diem/${place.slug}`}
                  className="block rounded-full bg-white/80 px-4 py-3 text-sm font-semibold text-[#29452C] transition hover:bg-white"
                >
                  {place.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 min-h-11 rounded-full bg-[#29452C] px-5 text-sm font-semibold text-white"
          >
            Thử tải lại
          </button>
        ) : null}
      </div>
    </div>
  );
}
