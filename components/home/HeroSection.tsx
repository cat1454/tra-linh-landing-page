import Link from "next/link";
import ScrollReveal from "@/components/animation/ScrollReveal";

import type { HomePageContent } from "@/lib/content/types";

import { HeroVideoBackground } from "./HeroVideoBackground";
import { HeroRightRail } from "./HeroRightRail";
import { HeroTitle } from "./HeroTitle";
import { ArrowGlyph } from "./_shared";

type HeroSectionProps = {
  hero: HomePageContent["hero"];
};

export const HERO_INTRO_VIDEO_SRC =
  "/assets/ThienNhien/1784805090350_7825852089651351479_g3040039768026489372.mp4";

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="dau-trang"
      aria-labelledby="hero-title"
      className="hero-section relative isolate flex min-h-screen overflow-hidden bg-[#031713] text-[#F1F1E8]"
    >
      <HeroVideoBackground
        src={HERO_INTRO_VIDEO_SRC}
        poster={hero.backgroundMedia}
        mobilePosterSrc={hero.mobilePoster?.src ?? "/images/tra-linh/hero-ban-lang-ngoc-linh-mobile.webp"}
        className="hero-media absolute inset-0 -z-30"
        mediaClassName="scale-[1.03] motion-safe:transition-transform motion-safe:duration-[1800ms]"
        soundControlTargetId="hero-sound-control"
      />
      <div className="absolute inset-0 -z-20 bg-black/20" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-r from-[#031713]/95 via-[#08251f]/65 to-[#081610]/20 max-lg:from-[#031713]/95 max-lg:via-[#031713]/78 max-lg:to-[#081610]/48" />
      <div className="absolute inset-0 -z-20 bg-gradient-to-t from-black/45 via-transparent to-black/15" />
      <div
        aria-hidden="true"
        className="hero-mist absolute inset-x-[-10%] top-[30%] -z-10 h-64 bg-[radial-gradient(ellipse_at_center,rgba(238,241,233,0.2),transparent_68%)] blur-2xl"
      />

      <div
        data-hero-grid
        className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col justify-end px-6 pb-14 pt-32 sm:px-8 sm:pb-16 lg:px-14 lg:pb-12 lg:pt-28 xl:px-20"
      >
        <div className="grid items-end gap-10 min-[1180px]:grid-cols-[minmax(0,850px)_320px] min-[1180px]:justify-between min-[1180px]:gap-10 xl:grid-cols-[minmax(0,850px)_360px] xl:gap-16">
          <div className="max-w-[850px]">
            <ScrollReveal direction="up" delay={0.2}>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#DDB149] sm:text-sm">
                {hero.eyebrow}
              </p>
            </ScrollReveal>
            <HeroTitle title={hero.title} />
            <ScrollReveal direction="up" delay={0.6}>
              <p className="mt-3 font-serif text-4xl italic text-[#9AC45C] lg:text-5xl">
                {hero.placeName}
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.8}>
              <p className="mt-7 max-w-[650px] text-base font-normal leading-8 text-white/72 sm:text-lg">
                {hero.description}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={1.0}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={hero.primaryCta.href}
                  className="group inline-flex min-h-14 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-[#E3B44B] px-8 py-4 text-base font-semibold text-[#10261F] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#EDC35D] active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F1F1E8]"
                >
                  {hero.primaryCta.label}
                  <ArrowGlyph />
                </Link>
              </div>

              <p className="mt-8 text-xs font-medium uppercase tracking-[0.25em] text-white/50">
                {hero.tags.join(" · ")}
              </p>
            </ScrollReveal>
          </div>

          <HeroRightRail />
        </div>

        <a
          href="#cau-chuyen"
          className="absolute bottom-3 right-6 hidden min-h-11 items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#EEF1E9]/52 transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EEF1E9] sm:right-8 lg:inline-flex lg:right-14 xl:right-20"
        >
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          Cuộn để khám phá
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
