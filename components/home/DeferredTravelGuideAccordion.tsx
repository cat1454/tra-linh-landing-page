"use client";

import Link from "next/link";
import { lazy, Suspense, useEffect, useRef, useState } from "react";

import type { HomePageContent } from "@/lib/content/types";

const LazyTravelGuideAccordion = lazy(() =>
  import("./TravelGuideAccordion").then((module) => ({
    default: module.TravelGuideAccordion,
  })),
);

type Props = {
  guides: HomePageContent["guides"];
};

function StaticGuideList({ guides }: Props) {
  return (
    <div className="divide-y divide-[#10251A]/15 border-y border-[#10251A]/15">
      {guides.map((guide, index) => (
        <details key={guide.id} open={index === 0} className="group">
          <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-5 py-5 font-serif text-2xl marker:content-none sm:text-3xl">
            {guide.title}
            <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-full border border-[#10251A]/20 text-base">+</span>
          </summary>
          <div className="max-w-3xl pb-7 pr-12">
            <p className="text-base leading-8 text-[#10251A]/70">{guide.shortDescription}</p>
            <Link
              href={`/cam-nang/${guide.slug}`}
              className="mt-5 inline-flex min-h-11 items-center border-b border-[#5E7F3B] text-sm font-semibold text-[#29452C]"
            >
              Đọc cẩm nang <span aria-hidden="true" className="ml-2">↗</span>
            </Link>
          </div>
        </details>
      ))}
    </div>
  );
}

export function DeferredTravelGuideAccordion({ guides }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldEnhance, setShouldEnhance] = useState(false);

  useEffect(() => {
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
        <Suspense fallback={<StaticGuideList guides={guides} />}>
          <LazyTravelGuideAccordion guides={guides} />
        </Suspense>
      ) : (
        <StaticGuideList guides={guides} />
      )}
    </div>
  );
}
