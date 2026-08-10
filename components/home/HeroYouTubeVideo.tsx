"use client";

import { ExternalLink, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export const HERO_YOUTUBE_URL = "https://youtu.be/NrI3fP5kq3A";
const HERO_YOUTUBE_EMBED_URL =
  "https://www.youtube-nocookie.com/embed/NrI3fP5kq3A?autoplay=1&rel=0";

export function HeroYouTubeVideo() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section
      aria-label="Video giới thiệu Trà Linh"
      className="mx-auto w-full max-w-[280px] rounded-2xl border border-white/25 bg-[#07100C]/55 p-2 shadow-xl backdrop-blur-sm sm:mx-0 sm:max-w-[320px]"
    >
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        {isPlaying ? (
          <iframe
            src={HERO_YOUTUBE_EMBED_URL}
            title="Video giới thiệu Trà Linh"
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsPlaying(true)}
            aria-label="Xem video giới thiệu"
            className="group relative h-full w-full overflow-hidden text-left focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#DDB149]"
          >
            <Image
              src="/images/tra-linh/hero-ban-lang-ngoc-linh-mobile.webp"
              alt="Xem trước video giới thiệu Trà Linh"
              width={640}
              height={360}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute inset-x-3 bottom-3 flex items-center gap-2.5 text-sm font-semibold text-white">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#DDB149] text-[#10251A] shadow-lg">
                <Play aria-hidden="true" className="ml-0.5 size-4" fill="currentColor" />
              </span>
              Xem video giới thiệu
            </span>
          </button>
        )}
      </div>
      {isPlaying ? (
        <a
          href={HERO_YOUTUBE_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 inline-flex min-h-8 w-full items-center justify-end gap-1.5 px-1 text-[11px] font-medium text-white/60 transition-colors hover:text-[#DDB149] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#DDB149]"
        >
          Xem trên YouTube
          <ExternalLink aria-hidden="true" className="size-3" />
        </a>
      ) : null}
    </section>
  );
}

export default HeroYouTubeVideo;
