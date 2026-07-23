import Link from "next/link";
import ScrollReveal from "@/components/animation/ScrollReveal";

import type { HomePageContent } from "@/lib/content/types";

import { HeroVideoBackground } from "./HeroVideoBackground";
import { ArrowGlyph } from "./_shared";

type HeroSectionProps = {
  hero: HomePageContent["hero"];
};

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section
      id="dau-trang"
      aria-labelledby="hero-title"
      className="hero-section relative isolate flex min-h-[680px] overflow-hidden bg-[#07100C] text-[#EEF1E9] sm:min-h-[760px] lg:min-h-[100svh]"
    >
      <HeroVideoBackground
        src="/videos/tra-linh-hero.mp4"
        poster={hero.backgroundMedia}
        mobilePosterSrc="/images/tra-linh/hero-ban-lang-ngoc-linh-mobile.webp"
        className="hero-media absolute inset-0 -z-30"
        mediaClassName="scale-[1.03] motion-safe:transition-transform motion-safe:duration-[1800ms]"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(7,16,12,0.92)_0%,rgba(7,16,12,0.66)_50%,rgba(7,16,12,0.24)_76%,rgba(7,16,12,0.38)_100%)]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(0deg,#07100C_0%,transparent_42%,rgba(7,16,12,0.45)_100%)]" />
      <div
        aria-hidden="true"
        className="hero-mist absolute inset-x-[-10%] top-[30%] -z-10 h-64 bg-[radial-gradient(ellipse_at_center,rgba(238,241,233,0.2),transparent_68%)] blur-2xl"
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col justify-end px-5 pb-24 pt-32 sm:px-8 sm:pb-28 lg:px-16 lg:pb-32 xl:px-20">
        <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_190px]">
          <div className="max-w-4xl">
            <ScrollReveal direction="up" delay={0.2}>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#D5A84E] sm:text-xs">
                {hero.eyebrow}
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.4}>
              <h1
                id="hero-title"
                className="mt-5 max-w-[15ch] font-serif text-[clamp(2.75rem,7vw,7.2rem)] leading-[0.88] tracking-[-0.045em] text-balance"
              >
                {hero.title}
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.6}>
              <p className="mt-4 font-serif text-[clamp(1.4rem,3vw,2.5rem)] italic text-[#9BBE62]">
                {hero.placeName}
              </p>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.8}>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#EEF1E9]/78 sm:text-lg">
                {hero.description}
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={1.0}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={hero.primaryCta.href}
                  className="group animate-pulse-ring inline-flex min-h-12 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-[#D5A84E] px-6 py-3 text-sm font-semibold text-[#10251A] transition-all duration-300 hover:scale-[1.03] hover:bg-[#EEE3CB] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EEF1E9]"
                >
                  {hero.primaryCta.label}
                  <ArrowGlyph />
                </Link>
              </div>

              <p className="mt-8 text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#EEF1E9]/56">
                {hero.tags.join(" · ")}
              </p>
            </ScrollReveal>
          </div>

          <ol className="hidden border-l border-[#EEF1E9]/24 pl-6 text-xs uppercase tracking-[0.2em] text-[#EEF1E9]/60 lg:grid lg:gap-6">
            <li><span className="mr-3 text-[#D5A84E]">01</span>Đại ngàn</li>
            <li><span className="mr-3 text-[#D5A84E]">02</span>Vùng sâm</li>
            <li><span className="mr-3 text-[#D5A84E]">03</span>Con người</li>
          </ol>
        </div>

        <a
          href="#cau-chuyen"
          className="absolute bottom-6 right-5 inline-flex min-h-11 items-center gap-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#EEF1E9]/60 transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EEF1E9] sm:right-8 lg:right-16"
        >
          <span className="h-px w-8 bg-current" aria-hidden="true" />
          Cuộn để khám phá
        </a>
      </div>
    </section>
  );
}

export default HeroSection;
