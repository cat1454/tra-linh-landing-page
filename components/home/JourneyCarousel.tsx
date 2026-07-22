"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type { HomePageContent } from "@/lib/content/types";

import { JourneyCard } from "./JourneyCard";

type JourneyCarouselProps = {
  journeys: HomePageContent["journeys"];
};

export function JourneyCarousel({ journeys }: JourneyCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps" });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(journeys.length > 1);

  const syncControls = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", syncControls);
    emblaApi.on("reInit", syncControls);
    return () => {
      emblaApi.off("select", syncControls);
      emblaApi.off("reInit", syncControls);
    };
  }, [emblaApi, syncControls]);

  return (
    <div className="lg:hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="-ml-4 flex touch-pan-y">
          {journeys.map((journey, index) => (
            <div key={journey.id} className="min-w-0 flex-[0_0_88%] pl-4 sm:basis-[58%]">
              <JourneyCard journey={journey} index={index} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-7 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-[#3D5133]">Vuốt để tiếp tục</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label="Hành trình trước"
            className="inline-grid size-12 place-items-center rounded-full border border-[#10251A]/25 text-[#10251A] transition disabled:cursor-not-allowed disabled:opacity-30 hover:border-[#5E7F3B] hover:text-[#5E7F3B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]"
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label="Hành trình tiếp theo"
            className="inline-grid size-12 place-items-center rounded-full border border-[#10251A]/25 text-[#10251A] transition disabled:cursor-not-allowed disabled:opacity-30 hover:border-[#5E7F3B] hover:text-[#5E7F3B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]"
          >
            <ArrowRight aria-hidden="true" className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
