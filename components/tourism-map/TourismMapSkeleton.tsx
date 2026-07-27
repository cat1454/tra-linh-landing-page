import type { TourismPlace } from "@/data/tourism-map/types";

interface TourismMapSkeletonProps {
  places?: TourismPlace[];
}

export function TourismMapSkeleton({ places = [] }: TourismMapSkeletonProps) {
  const skeletonItems: Array<TourismPlace | null> = places.length
    ? places.slice(0, 3)
    : [null, null, null];

  return (
    <div className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]" aria-busy="true">
      <div className="hidden space-y-3 lg:block">
        {skeletonItems.map((place, index) => (
          <div
            key={place?.id ?? index}
            className="min-h-32 animate-pulse rounded-[1.4rem] border border-[#10251A]/8 bg-white/70 p-5"
          >
            {place ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#49672D]">
                  Địa điểm
                </p>
                <p className="mt-2 font-serif text-lg font-semibold">{place.name}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#10251A]/70">
                  {place.shortDescription}
                </p>
              </>
            ) : null}
          </div>
        ))}
      </div>
      <div className="grid min-h-[430px] animate-pulse place-items-center rounded-[1.75rem] bg-[linear-gradient(145deg,#DCE5D6,#E9DFC9)] lg:min-h-[560px]">
        <p className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[#49672D]">
          Đang chuẩn bị bản đồ…
        </p>
      </div>
    </div>
  );
}
