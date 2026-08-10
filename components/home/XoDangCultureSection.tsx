import ScrollReveal from "@/components/animation/ScrollReveal";
import { SemanticHeadingText } from "@/components/home/SemanticHeadingText";
import type { HomePageContent } from "@/lib/content/types";

import { MediaFrame, SectionIntro } from "./_shared";
import { ResponsiveMediaRail } from "./ResponsiveMediaRail";

type XoDangCultureSectionProps = {
  stories: HomePageContent["cultureStories"];
  section?: HomePageContent["sectionSettings"][string];
  peopleMedia?: HomePageContent["media"];
};

export function XoDangCultureSection({ stories, section, peopleMedia = [] }: XoDangCultureSectionProps) {
  if (!stories.length) return null;

  return (
    <section id="van-hoa" aria-labelledby="culture-heading" className="bg-[#EEE3CB] px-5 py-12 text-[#10251A] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto max-w-[1380px]">
        <ScrollReveal direction="up" delay={0.1}>
          <div id="culture-heading">
            <SectionIntro
              eyebrow={section?.eyebrow ?? "Văn hóa & con người"}
              title={section?.title ?? "Nhịp sống Xơ Đăng giữa đại ngàn"}
              description={section?.description}
            />
          </div>
        </ScrollReveal>
        <ScrollReveal direction="left" delay={0.3}>
          <blockquote className="ml-auto mt-8 max-w-3xl border-l border-[#D5A84E] pl-6 font-serif text-xl leading-8 text-[#29452C] sm:text-2xl sm:leading-10 lg:mt-10">
            {section?.secondaryText ?? "Rừng không chỉ là cảnh quan. Đó là không gian sống, lao động và văn hóa của cộng đồng Xơ Đăng tại Trà Linh."}
          </blockquote>
        </ScrollReveal>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10">
          {stories.map((story, index) => (
            <article
              key={story.id}
              className="culture-card group relative isolate h-[320px] sm:h-[380px] overflow-hidden rounded-[1.5rem] bg-[#29452C] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <ScrollReveal direction="up" delay={0.2 * index} className="h-full w-full block">
                <MediaFrame hoverReveal={true} media={story.media} className="absolute inset-0 -z-20" sizes="(min-width: 1024px) 45vw, (min-width: 640px) 50vw, 100vw" imageClassName="transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07100C]/90 via-[#07100C]/18 to-transparent" />
              <div className="flex h-full flex-col justify-end p-6 sm:p-8">
                <h3 className="font-serif text-2xl text-[#EEF1E9] sm:text-3xl">
                  <SemanticHeadingText text={story.title} compact />
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-[#EEF1E9]/68">{story.description}</p>
                {story.media.sourceCredit ? (
                  <p className="mt-3 text-[0.65rem] uppercase tracking-[0.12em] text-[#EEF1E9]/80">
                    Nguồn: {story.media.sourceCredit}
                  </p>
                ) : null}
              </div>
              </ScrollReveal>
            </article>
          ))}
        </div>

        {peopleMedia.length > 0 && (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-16 border-t border-[#10251A]/10 pt-12">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-serif text-2xl text-[#29452C] sm:text-3xl">
                  <SemanticHeadingText text="Khoảnh khắc con người & đời sống" compact />
                </h3>
                <p className="text-xs text-[#536258] uppercase tracking-[0.12em]">
                  {new Set(peopleMedia.map((item) => item.id)).size} khoảnh khắc tiêu biểu
                </p>
              </div>

              <ResponsiveMediaRail media={peopleMedia} tone="cream" itemSize="large" />
            </div>
          </ScrollReveal>
        )}

        <p className="mt-12 max-w-3xl text-sm leading-7 text-[#3D5133] border-t border-[#10251A]/10 pt-6">
          Khi ghé thăm, hãy xin phép trước khi chụp ảnh, tôn trọng không gian nghi lễ và lắng nghe hướng dẫn của cộng đồng địa phương.
        </p>
      </div>
    </section>
  );
}

export default XoDangCultureSection;
