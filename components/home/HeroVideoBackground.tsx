"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const [isMuted, setIsMuted] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  const enableSound = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    setIsMuted(false);

    if (video.paused) {
      try {
        await video.play();
      } catch {
        video.muted = true;
        setIsMuted(true);
      }
    }
  }, []);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
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
      const canLoad = !motionPreference.matches && !connection?.saveData;
      setShouldLoadVideo(canLoad);
      if (!canLoad) {
        setIsPlaying(false);
        setIsMuted(false);
      }
    };

    syncEligibility();
    motionPreference.addEventListener("change", syncEligibility);
    connection?.addEventListener?.("change", syncEligibility);

    return () => {
      motionPreference.removeEventListener("change", syncEligibility);
      connection?.removeEventListener?.("change", syncEligibility);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldLoadVideo || !video) return;

    let isActive = true;

    const startPlayback = async () => {
      video.muted = false;
      setIsMuted(false);

      try {
        await video.play();
      } catch {
        if (!isActive) return;

        // Audible autoplay is commonly rejected. Preserve automatic playback
        // in muted mode and expose a one-tap control for sound.
        video.muted = true;
        setIsMuted(true);
        try {
          await video.play();
        } catch {
          // The poster remains visible when the browser blocks all autoplay.
        }
      }
    };

    void startPlayback();

    return () => {
      isActive = false;
    };
  }, [shouldLoadVideo]);

  useEffect(() => {
    if (!shouldLoadVideo || !isMuted) return;

    const enableSoundOnFirstInteraction = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        target.closest("[data-hero-sound-control]")
      ) {
        return;
      }

      void enableSound();
    };

    document.addEventListener("pointerdown", enableSoundOnFirstInteraction, {
      capture: true,
    });

    return () => {
      document.removeEventListener("pointerdown", enableSoundOnFirstInteraction, {
        capture: true,
      });
    };
  }, [enableSound, isMuted, shouldLoadVideo]);

  const toggleSound = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      await enableSound();
      return;
    }

    video.muted = true;
    setIsMuted(true);
  };

  return (
    <>
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
            autoPlay
            muted={isMuted}
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
            <source src={src} type={src.includes(".webm") ? "video/webm" : "video/mp4"} />
          </video>
        ) : null}
      </figure>

      {shouldLoadVideo ? (
        <button
          type="button"
          data-hero-sound-control
          onClick={() => void toggleSound()}
          aria-label={`${isMuted ? "Bật" : "Tắt"} tiếng video giới thiệu`}
          className={`absolute z-20 inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold shadow-lg backdrop-blur-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EEF1E9] ${
            isMuted
              ? "bottom-24 left-1/2 -translate-x-1/2 border-[#D5A84E] bg-[#D5A84E] text-[#10251A] hover:bg-[#EEE3CB] sm:bottom-auto sm:left-auto sm:right-8 sm:top-24 sm:translate-x-0 lg:right-16"
              : "right-5 top-24 border-[#EEF1E9]/35 bg-[#07100C]/72 text-[#EEF1E9] hover:border-[#D5A84E] hover:text-[#D5A84E] sm:right-8 lg:right-16"
          }`}
        >
          {isMuted ? <VolumeX aria-hidden="true" size={17} /> : <Volume2 aria-hidden="true" size={17} />}
          <span>{isMuted ? "Chạm để bật tiếng" : "Tắt tiếng"}</span>
        </button>
      ) : null}
    </>
  );
}
