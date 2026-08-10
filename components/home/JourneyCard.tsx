import { MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

import { SemanticHeadingText } from "@/components/home/SemanticHeadingText";
import type { HomePageContent } from "@/lib/content/types";

import { MediaFrame, PlaceholderPill } from "./_shared";

export function JourneyCard({
  journey,
  index,
}: {
  journey: HomePageContent["journeys"][number];
  index: number;
}) {
  const mapUrl = journey.locationLabel === "Vùng sâm Ngọc Linh"
    ? "https://maps.app.goo.gl/RU7q8XwC8HGnHxrC6"
    : "https://maps.app.goo.gl/X4rMVecthoadSjcb6";

  return (
    <article className="group relative isolate min-h-[500px] overflow-hidden rounded-[1.5rem] bg-[#29452C] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <MediaFrame media={journey.featuredMedia} className="absolute inset-0 -z-20" sizes="(min-width: 1024px) 32vw, 88vw" imageClassName="transition duration-700 group-hover:scale-105" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07100C] via-[#07100C]/30 to-[#07100C]/5" />
      <div className="flex min-h-[500px] flex-col justify-between p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <span className="font-serif text-4xl text-[#EEF1E9]/45">{String(index + 1).padStart(2, "0")}</span>
          {journey.isPlaceholder ? <PlaceholderPill label={journey.placeholderLabel} /> : null}
        </div>
        <div>
          {journey.locationLabel ? (
            <p className="flex items-center">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#D5A84E] hover:text-[#EEF1E9] hover:underline transition-colors focus-visible:outline-2 focus-visible:outline-[#D5A84E] group/location"
              >
                <MapPin aria-hidden="true" className="size-4 shrink-0 transition-transform group-hover/location:scale-110" />
                <span>{journey.locationLabel}</span>
                <ExternalLink aria-hidden="true" className="size-3 opacity-60 transition-opacity group-hover/location:opacity-100" />
                <span className="sr-only">(mở Google Maps)</span>
              </a>
            </p>
          ) : null}
          <h3 className="mt-3 font-serif text-3xl leading-tight text-[#EEF1E9] sm:text-4xl">
            <SemanticHeadingText text={journey.title} compact />
          </h3>
          <p className="mt-4 line-clamp-3 text-sm leading-7 text-[#EEF1E9]/70">{journey.shortDescription}</p>
          <Link
            href={`/hanh-trinh/${journey.slug}`}
            className="mt-6 inline-flex min-h-11 items-center border-b border-[#D5A84E] text-sm font-semibold text-[#EEF1E9] transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
          >
            Xem hành trình <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
