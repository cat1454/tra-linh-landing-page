"use client";

import { getImageProps } from "next/image";
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
  const commonImageProps = {
    alt: poster.altText,
    sizes: "100vw",
    quality: 75,
    loading: "eager",
  } as const;
  const {
    props: { srcSet: desktopSrcSet, ...desktopImageProps },
  } = getImageProps({
    ...commonImageProps,
    src: poster.src,
    width: 1920,
    height: 1080,
  });
  const mobileSrcSet = mobilePosterSrc
    ? getImageProps({
        ...commonImageProps,
        src: mobilePosterSrc,
        width: 900,
        height: 1200,
      }).props.srcSet
    : undefined;

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
      const canLoad =
        !motionPreference.matches &&
        desktopPreference.matches &&
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
        {mobileSrcSet ? (
          <source media="(max-width: 767px)" srcSet={mobileSrcSet} />
        ) : null}
        <img
          {...desktopImageProps}
          alt={poster.altText}
          srcSet={desktopSrcSet}
          loading="eager"
          fetchPriority="high"
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
          <source src={src} type="video/mp4" />
        </video>
      ) : null}
    </figure>
  );
}
