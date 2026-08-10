"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { MediaAsset } from "@/lib/content/types";
import { DATA_SAVER_EVENT, isDataSaverEnabled } from "@/lib/data-saver";

type ResponsiveMediaRailProps = {
  media: MediaAsset[];
  tone: "mist" | "cream";
  itemSize: "small" | "large";
};

export function ResponsiveMediaRail({
  media,
  tone,
  itemSize,
}: ResponsiveMediaRailProps) {
  const [allowMarquee, setAllowMarquee] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; addEventListener?: (type: "change", listener: () => void) => void; removeEventListener?: (type: "change", listener: () => void) => void } }).connection;
    const sync = () => setAllowMarquee(!motion.matches && !isDataSaverEnabled());
    sync();
    motion.addEventListener("change", sync);
    connection?.addEventListener?.("change", sync);
    window.addEventListener(DATA_SAVER_EVENT, sync);
    return () => {
      motion.removeEventListener("change", sync);
      connection?.removeEventListener?.("change", sync);
      window.removeEventListener(DATA_SAVER_EVENT, sync);
    };
  }, []);

  const featured = Array.from(
    new Map(media.map((item) => [item.id, item])).values(),
  );
  if (!featured.length) return null;

  const edgeColor = tone === "cream" ? "#EEE3CB" : "#EEF1E9";
  const sizeClass = itemSize === "large"
    ? "h-[220px] w-[290px]"
    : "h-[180px] w-[260px]";

  const cards = (duplicate = false) => featured.map((item) => (
    <figure
      key={`${item.id}${duplicate ? "-duplicate" : ""}`}
      className={`group relative shrink-0 snap-start overflow-hidden rounded-2xl bg-[#10251A]/5 shadow-sm ${sizeClass}`}
    >
      <Image
        src={item.src}
        alt={duplicate ? "" : item.altText}
        fill
        sizes={itemSize === "large" ? "290px" : "260px"}
        className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
      />
    </figure>
  ));

  return (
    <div data-testid="media-rail" className="responsive-media-rail relative mt-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-12 lg:block"
        style={{ background: `linear-gradient(to right, ${edgeColor}, transparent)` }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-12 lg:block"
        style={{ background: `linear-gradient(to left, ${edgeColor}, transparent)` }}
      />
      <div
        tabIndex={0}
        role="region"
        aria-label={tone === "cream" ? "Thư viện ảnh con người và đời sống" : "Thư viện ảnh hoạt động trải nghiệm"}
        className="responsive-media-rail__scroller overflow-x-auto overscroll-x-contain rounded-2xl pb-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B] lg:overflow-hidden lg:pb-0"
      >
        <div className="responsive-media-rail__track flex w-max snap-x snap-mandatory gap-4 lg:snap-none">
          <div data-testid="media-rail-originals" className="flex gap-4">
            {cards()}
          </div>
          <div data-testid="media-rail-duplicates" aria-hidden="true" className="hidden gap-4 lg:flex">
            {allowMarquee ? cards(true) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
