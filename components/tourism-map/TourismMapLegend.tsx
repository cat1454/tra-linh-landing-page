"use client";

import { Layers3, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { tourismCategories } from "@/data/tourism-map/categories";
import type { TourismCategory, TourismPlaceCategory } from "@/data/tourism-map/types";
import { TourismMapMarker } from "./TourismMapMarker";

const legendCategories = tourismCategories.filter(
  (
    category,
  ): category is TourismCategory & { key: TourismPlaceCategory } =>
    category.key !== "all" && category.key !== "nearby",
);

interface TourismMapLegendProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LegendItems() {
  return (
    <ul className="grid gap-2 text-xs text-[#10251A]/75 sm:grid-cols-2">
      {legendCategories.map((category) => (
        <li key={category.key}>
          <TourismMapMarker category={category.key} label={category.label} />
        </li>
      ))}
    </ul>
  );
}

export function TourismMapLegend({ open, onOpenChange }: TourismMapLegendProps) {
  const mobileLegendRef = useRef<HTMLDivElement>(null);
  const [desktopOpen, setDesktopOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!mobileLegendRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onOpenChange, open]);

  return (
    <>
      <div ref={mobileLegendRef} className="absolute right-3 top-16 z-10 lg:hidden">
        <button
          type="button"
          aria-label={open ? "Ẩn chú giải bản đồ" : "Mở chú giải bản đồ"}
          aria-expanded={open}
          aria-controls="tourism-mobile-map-legend"
          onClick={() => onOpenChange(!open)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-[#EEF1E9]/96 text-[#10251A] shadow-[0_8px_24px_rgba(16,37,26,0.16)] backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
        >
          <Layers3 className="size-5" aria-hidden="true" />
        </button>

        {open ? (
          <div
            id="tourism-mobile-map-legend"
            role="dialog"
            aria-label="Chú giải bản đồ"
            className="absolute right-0 top-14 w-56 rounded-2xl border border-white/70 bg-[#EEF1E9]/98 p-3 shadow-[0_16px_40px_rgba(16,37,26,0.22)] backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-[#10251A]">Chú giải bản đồ</p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                aria-label="Đóng chú giải bản đồ"
                className="inline-flex size-9 items-center justify-center rounded-full text-[#10251A] hover:bg-white focus-visible:outline-2 focus-visible:outline-[#D5A84E]"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <LegendItems />
          </div>
        ) : null}
      </div>

      <div className="absolute bottom-4 left-4 z-10 hidden lg:block">
        {desktopOpen ? (
          <div
            id="tourism-desktop-map-legend"
            role="dialog"
            aria-label="Chú giải bản đồ trên máy tính"
            className="w-[25rem] max-w-[calc(100vw-2rem)] rounded-3xl border border-white/60 bg-[#EEF1E9]/95 p-4 shadow-[0_12px_32px_rgba(16,37,26,0.18)] backdrop-blur"
          >
            <div className="mb-3 flex items-center justify-between gap-4">
              <h3 className="text-base font-semibold text-[#10251A]">
                Chú giải bản đồ
              </h3>
              <button
                type="button"
                aria-label="Đóng chú giải bản đồ trên máy tính"
                onClick={() => setDesktopOpen(false)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-[#10251A] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#D5A84E]"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
            <LegendItems />
          </div>
        ) : (
            <button
              type="button"
              aria-label="Mở chú giải bản đồ trên máy tính"
              aria-expanded="false"
              aria-controls="tourism-desktop-map-legend"
              onClick={() => setDesktopOpen(true)}
              className="min-h-11 rounded-2xl border border-white/60 bg-[#EEF1E9]/95 px-5 py-3 text-sm font-semibold text-[#10251A] shadow-[0_12px_32px_rgba(16,37,26,0.18)] backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-[#D5A84E]"
            >
              Chú giải bản đồ
            </button>
        )}
      </div>
    </>
  );
}
