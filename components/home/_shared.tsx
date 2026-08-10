import Image from "next/image";

import type { MediaAsset } from "@/lib/content/types";

import { SemanticHeadingText } from "./SemanticHeadingText";

export function SectionIntro({
  eyebrow,
  title,
  description,
  tone = "light",
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
}) {
  const isDark = tone === "dark";

  return (
    <header
      className={`section-intro w-full max-w-7xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      <p
        className={`text-[0.7rem] font-semibold uppercase tracking-[0.3em] sm:text-xs ${
          isDark ? "text-[#D5A84E]" : "text-[#49672D]"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 font-serif text-[clamp(2.25rem,5vw,4.8rem)] leading-[0.98] tracking-[-0.035em] ${
          isDark ? "text-[#EEF1E9]" : "text-[#10251A]"
        }`}
      >
        <SemanticHeadingText text={title} />
      </h2>
      {description ? (
        <p
          className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${
            align === "center" ? "mx-auto" : ""
          } ${isDark ? "text-[#EEF1E9]/70" : "text-[#10251A]/70"}`}
        >
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function PlaceholderPill({ label }: { label?: string }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-[#D5A84E]/45 bg-[#EEE3CB]/95 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[#6A4B31] shadow-sm">
      {label ?? "Nội dung đề xuất"}
    </span>
  );
}

export function MediaFrame({
  media,
  className = "",
  imageClassName = "",
  sizes = "(min-width: 1024px) 50vw, 100vw",
  priority = false,
  showCaption = false,
  hoverReveal = false,
}: {
  media?: MediaAsset | null;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  showCaption?: boolean;
  hoverReveal?: boolean;
}) {
  const positionClass = /(?:^|\s)(?:absolute|fixed|sticky)(?:\s|$)/.test(className)
    ? ""
    : "relative";
  const wrapperRevealClass = hoverReveal ? "hover-reveal-wrapper" : "";
  const imgRevealClass = hoverReveal ? "hover-reveal-img" : "";

  if (!media?.src) {
    return (
      <div
        aria-hidden="true"
        className={`${positionClass} overflow-hidden bg-[linear-gradient(145deg,#29452C,#10251A_58%,#07100C)] ${className}`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(155,190,98,0.24),transparent_35%)]" />
      </div>
    );
  }

  const isVideo =
    media.mediaType === "video" ||
    media.src.includes(".mp4") ||
    media.src.includes(".webm") ||
    media.src.includes("/videos/");

  if (isVideo) {
    return (
      <figure className={`${positionClass} overflow-hidden ${className} ${wrapperRevealClass}`.trim()}>
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={media.poster?.src}
          className={`h-full w-full object-cover ${imageClassName} ${imgRevealClass}`.trim()}
        >
          <source src={media.src} type={media.mimeType ?? (media.src.includes(".webm") ? "video/webm" : "video/mp4")} />
        </video>
        {showCaption && (media.caption || media.sourceCredit) ? (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07100C]/90 to-transparent px-4 pb-3 pt-10 text-xs leading-5 text-[#EEF1E9]/75">
            {media.caption ? <span>{media.caption}</span> : null}
            {media.caption && media.sourceCredit ? <span aria-hidden="true"> · </span> : null}
            {media.sourceCredit ? <span>Nguồn: {media.sourceCredit}</span> : null}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <figure className={`${positionClass} overflow-hidden ${className} ${wrapperRevealClass}`.trim()}>
      <Image
        src={media.src}
        alt={media.altText}
        fill
        preload={priority}
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : "auto"}
        sizes={sizes}
        className={`object-cover ${imageClassName} ${imgRevealClass}`.trim()}
      />
      {showCaption && (media.caption || media.sourceCredit) ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07100C]/90 to-transparent px-4 pb-3 pt-10 text-xs leading-5 text-[#EEF1E9]/75 z-10 pointer-events-none">
          {media.caption ? <span>{media.caption}</span> : null}
          {media.caption && media.sourceCredit ? <span aria-hidden="true"> · </span> : null}
          {media.sourceCredit ? <span>Nguồn: {media.sourceCredit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function ArrowGlyph() {
  return (
    <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
      →
    </span>
  );
}
