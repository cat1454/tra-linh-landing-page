"use client";

import { lazy, Suspense, useEffect, useRef, useState } from "react";

import type { HomePageContent } from "@/lib/content/types";

import { JourneyCard } from "./JourneyCard";

const LazyJourneyCarousel = lazy(() =>
  import("./JourneyCarousel").then((module) => ({ default: module.JourneyCarousel })),
);

type Props = {
  journeys: HomePageContent["journeys"];
};

function ScrollSnapFallback({ journeys }: Props) {
  return (
    <div className="lg:hidden">
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
        {journeys.map((journey, index) => (
          <div key={journey.id} className="min-w-0 flex-[0_0_88%] snap-start sm:basis-[58%]">
            <JourneyCard journey={journey} index={index} />
          </div>
        ))}
      </div>
      <p className="mt-7 text-xs uppercase tracking-[0.16em] text-[#3D5133]">Vuốt để tiếp tục</p>
    </div>
  );
}

export function DeferredJourneyCarousel({ journeys }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldEnhance, setShouldEnhance] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      setShouldEnhance(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldEnhance(true);
        observer.disconnect();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={rootRef}>
      {shouldEnhance ? (
        <Suspense fallback={<ScrollSnapFallback journeys={journeys} />}>
          <LazyJourneyCarousel journeys={journeys} />
        </Suspense>
      ) : (
        <ScrollSnapFallback journeys={journeys} />
      )}
    </div>
  );
}
