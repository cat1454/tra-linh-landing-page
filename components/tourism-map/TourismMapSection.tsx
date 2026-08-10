import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";
import {
  getAllTourismEntities,
  getTourismPreviewEntities,
} from "@/lib/tourism-map";
import type { TourismMapMode } from "@/data/tourism-map/types";
import { SemanticHeadingText } from "@/components/home/SemanticHeadingText";
import { TourismMapLoader } from "./TourismMapLoader";

interface TourismMapSectionProps {
  eager?: boolean;
  mode?: TourismMapMode;
}

export function TourismMapSection({
  eager = false,
  mode = "preview",
}: TourismMapSectionProps) {
  const allEntities = getAllTourismEntities(tourismPlaces, tourismEvents);
  const entities =
    mode === "preview"
      ? getTourismPreviewEntities(allEntities, 6)
      : allEntities;
  const Heading = mode === "explorer" ? "h1" : "h2";

  return (
    <section
      id="ban-do-du-lich"
      aria-labelledby="tourism-map-heading"
      className="bg-[#EEF1E9] px-5 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20"
    >
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#49672D]">
            Hành trình theo địa danh
          </p>
          <Heading
            id="tourism-map-heading"
            className="mt-3 font-serif text-[clamp(2rem,5vw,4.25rem)] font-semibold leading-[1.06] tracking-[-0.035em] text-[#10251A]"
          >
            <SemanticHeadingText text="Khám phá Trà Linh trên bản đồ" />
          </Heading>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#10251A]/68 sm:text-lg sm:leading-8">
            Khám phá các điểm đến thiên nhiên, văn hóa, sâm Ngọc Linh và đời sống cộng đồng tại vùng Trà Linh.
          </p>
        </header>

        <div className="sr-only" aria-hidden="true">
          <ul>
            {entities.map((entity) => (
              <li key={entity.id}>
                <h3>{entity.name}</h3>
                <p>{entity.shortDescription}</p>
                <p>{entity.currentAddress}</p>
              </li>
            ))}
          </ul>
        </div>

        <TourismMapLoader entities={entities} eager={eager} mode={mode} />
      </div>
    </section>
  );
}
