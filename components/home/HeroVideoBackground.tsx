"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { MediaAsset } from "@/lib/content/types";

type HeroVideoBackgroundProps = {
  src: string;
  poster: MediaAsset;
  className?: string;
  mediaClassName?: string;
};

export function HeroVideoBackground({
  src,
  poster,
  className = "",
  mediaClassName = "",
}: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause();
        video.currentTime = 0;
        return;
      }

      void video.play().catch(() => {
        // The poster remains visible when a browser blocks autoplay.
      });
    };

    syncPlayback();
    motionPreference.addEventListener("change", syncPlayback);

    return () => {
      motionPreference.removeEventListener("change", syncPlayback);
    };
  }, []);

  return (
    <figure className={`overflow-hidden ${className}`.trim()}>
      <Image
        src={poster.src}
        alt={poster.altText}
        fill
        preload
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className={`object-cover ${mediaClassName}`.trim()}
      />
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="metadata"
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
    </figure>
  );
}

