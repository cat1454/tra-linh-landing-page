"use client";

import { useEffect, useRef, useState } from "react";

import type { MediaAsset } from "@/lib/content/types";

type HeroVideoBackgroundProps = {
  src: string;
  poster: MediaAsset;
  mobilePosterSrc?: string;
  className?: string;
  mediaClassName?: string;
};

export function HeroVideoBackground({
  src,
  poster,
  mobilePosterSrc,
  className = "",
  mediaClassName = "",
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const desktopPreference = window.matchMedia("(min-width: 768px)");
    const connection = (
      navigator as Navigator & {
        connection?: {
          saveData?: boolean;
          addEventListener?: (type: "change", listener: () => void) => void;
          removeEventListener?: (type: "change", listener: () => void) => void;
        };
      }
    ).connection;
    const syncEligibility = () => {
      const isDesktop = desktopPreference.matches;
      const canLoad =
        !motionPreference.matches &&
        isDesktop &&
        !connection?.saveData;
      setShouldLoadVideo(canLoad);
      if (!canLoad) setIsPlaying(false);
    };

    syncEligibility();
    motionPreference.addEventListener("change", syncEligibility);
    desktopPreference.addEventListener("change", syncEligibility);
    connection?.addEventListener?.("change", syncEligibility);

    return () => {
      motionPreference.removeEventListener("change", syncEligibility);
      desktopPreference.removeEventListener("change", syncEligibility);
      connection?.removeEventListener?.("change", syncEligibility);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldLoadVideo || !video) return;

    void video.play().catch(() => {
        // The poster remains visible when a browser blocks autoplay.
    });
  }, [shouldLoadVideo]);

  return (
    <figure className={`overflow-hidden ${className}`.trim()}>
      <picture>
        {mobilePosterSrc ? (
          <source media="(max-width: 767px)" srcSet={mobilePosterSrc} />
        ) : null}
        {/* The two pre-compressed art-directed sources intentionally bypass Next Image. */}
        <img
          src={poster.src}
          alt={poster.altText}
          width={1920}
          height={1080}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover ${mediaClassName}`.trim()}
        />
      </picture>
      {shouldLoadVideo ? (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          poster={poster.src}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setIsPlaying(true)}
          className={`hero-video absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            isPlaying ? "opacity-100" : "opacity-0"
          } ${mediaClassName}`.trim()}
        >
          <source src={src} type={src.includes(".webm") ? "video/webm" : "video/mp4"} />
        </video>
      ) : null}
    </figure>
  );
}
