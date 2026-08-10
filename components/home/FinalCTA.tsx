import Link from "next/link";
import ScrollReveal from "@/components/animation/ScrollReveal";

import type { MediaAsset, PageSectionSettings } from "@/lib/content/types";

import { SemanticHeadingText } from "./SemanticHeadingText";
import { ArrowGlyph, MediaFrame } from "./_shared";

type FinalCTAProps = {
  media?: MediaAsset | null;
  section?: PageSectionSettings;
};

export function FinalCTA({ media, section }: FinalCTAProps) {
  const title = section?.title ?? "Trà Linh không chỉ để ngắm nhìn";

  return (
    <section aria-labelledby="final-cta-heading" className="relative isolate overflow-hidden bg-[#10251A] px-5 py-16 text-center text-[#EEF1E9] sm:px-8 sm:py-20 lg:px-16 lg:py-24">
      <MediaFrame media={media} className="final-cta-bg absolute inset-0 -z-30" sizes="100vw" imageClassName="brightness-[0.65]" />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(7,16,12,0.78),rgba(16,37,26,0.52),rgba(7,16,12,0.78))]" />
      <div aria-hidden="true" className="absolute inset-x-0 top-1/3 -z-10 h-48 bg-[radial-gradient(ellipse_at_center,rgba(238,241,233,0.17),transparent_67%)] blur-xl" />

      <div className="mx-auto max-w-4xl">
        <ScrollReveal direction="up" delay={0.2}>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-[#D5A84E]">{section?.eyebrow ?? "Bắt đầu hành trình"}</p>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.4}>
          <h2 id="final-cta-heading" className="mt-5 font-serif text-[clamp(2.5rem,6vw,5.6rem)] leading-[0.98] tracking-[-0.04em]">
            <SemanticHeadingText text={title} />
          </h2>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.6}>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#EEF1E9]/72 sm:text-lg">
            {section?.description ?? "Đó là hành trình chạm vào rừng, con người và câu chuyện của vùng sâm Ngọc Linh — bằng sự chuẩn bị, tôn trọng và tò mò chân thành."}
          </p>
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.8}>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={section?.cta?.href ?? "#hanh-trinh"}
            className="group animate-pulse-ring inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#D5A84E] px-6 py-3 text-sm font-semibold text-[#10251A] transition-all duration-300 hover:scale-[1.03] hover:bg-[#EEE3CB] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EEF1E9]"
          >
            {section?.cta?.label ?? "Khám phá hành trình"} <ArrowGlyph />
          </Link>
          <Link
            href="#lien-he"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#EEF1E9]/35 bg-[#07100C]/15 px-6 py-3 text-sm font-semibold text-[#EEF1E9] backdrop-blur-sm transition-all duration-300 hover:scale-[1.03] hover:border-[#D5A84E] hover:text-[#D5A84E] active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EEF1E9]"
          >
            Liên hệ địa phương <ArrowGlyph />
          </Link>
        </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default FinalCTA;
