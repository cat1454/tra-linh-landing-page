"use client";

import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";

interface TourismMapFullscreenProps {
  targetRef: RefObject<HTMLDivElement | null>;
}

export function TourismMapFullscreen({ targetRef }: TourismMapFullscreenProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === targetRef.current);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [targetRef]);

  async function toggleFullscreen() {
    if (isFullscreen && document.exitFullscreen) {
      await document.exitFullscreen();
      return;
    }
    if (targetRef.current?.requestFullscreen) {
      await targetRef.current.requestFullscreen();
    }
  }

  const Icon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <button
      type="button"
      onClick={toggleFullscreen}
      aria-label={isFullscreen ? "Thoát toàn màn hình" : "Mở bản đồ toàn màn hình"}
      className="absolute right-3 top-3 z-10 inline-flex size-11 items-center justify-center rounded-full border border-white/70 bg-[#EEF1E9]/96 text-sm font-semibold text-[#10251A] shadow-[0_8px_24px_rgba(16,37,26,0.16)] backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] lg:right-4 lg:top-4 lg:w-auto lg:gap-2 lg:px-4"
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="hidden lg:inline">
        {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
      </span>
    </button>
  );
}
