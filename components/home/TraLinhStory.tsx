import ScrollReveal from "@/components/animation/ScrollReveal";
import type { HomePageContent } from "@/lib/content/types";

import { MediaFrame, SectionIntro } from "./_shared";

type TraLinhStoryProps = {
  chapters: HomePageContent["storyChapters"];
  section?: HomePageContent["sectionSettings"][string];
};

export function TraLinhStory({ chapters, section }: TraLinhStoryProps) {
  const [primary, secondary, ...rest] = chapters;

  if (!primary) return null;

  return (
    <section id="cau-chuyen" aria-labelledby="story-heading" className="bg-[#EEF1E9] px-5 py-12 text-[#10251A] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto grid max-w-[1380px] items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <ScrollReveal direction="left" duration={0.8}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 sm:items-start">
            <MediaFrame
              media={primary.media}
              className="aspect-[4/5] rounded-[1.75rem] shadow-[0_30px_80px_rgba(16,37,26,0.16)] sm:aspect-[5/6]"
              sizes="(min-width: 1024px) 27vw, 50vw"
              imageClassName="transition-transform duration-700 hover:scale-[1.02]"
              showCaption
              hoverReveal={true}
            />
            {secondary ? (
              <MediaFrame
                media={secondary.media}
                className="aspect-[4/5] rounded-[1.75rem] shadow-[0_30px_80px_rgba(16,37,26,0.16)] sm:aspect-[5/6] sm:mt-12"
                sizes="(min-width: 1024px) 27vw, 50vw"
                imageClassName="transition-transform duration-700 hover:scale-[1.03]"
                showCaption
                hoverReveal={true}
              />
            ) : null}
          </div>
        </ScrollReveal>

        <ScrollReveal direction="right" duration={0.8} delay={0.15}>
          <div>
            <div id="story-heading">
              <SectionIntro
                eyebrow={section?.eyebrow ?? primary.eyebrow}
                title={section?.title ?? primary.title}
                description={section?.description ?? primary.description}
              />
            </div>

            <div className="mt-10 border-l border-[#D5A84E]/65 pl-6 sm:pl-8">
              <p className="font-serif text-xl leading-8 text-[#29452C] sm:text-2xl sm:leading-9">
                {section?.secondaryText ?? "Trà Linh là vùng đất sống cùng rừng — nơi sinh kế, tri thức bản địa và việc gìn giữ dược liệu cùng nương tựa vào hệ sinh thái đại ngàn."}
              </p>
            </div>

            {rest.length ? (
              <div className="mt-10 grid gap-6 sm:grid-cols-2">
                {rest.map((chapter, index) => (
                  <ScrollReveal key={chapter.id} direction="up" delay={0.1 * index}>
                    <article className="border-t border-[#10251A]/15 pt-5">
                      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#49672D]">
                        {chapter.eyebrow}
                      </p>
                      <h3 className="mt-2 font-serif text-2xl">{chapter.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-[#10251A]/68">{chapter.description}</p>
                    </article>
                  </ScrollReveal>
                ))}
              </div>
            ) : (
              <ul className="mt-10 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#29452C]">
                {(section?.badges.length ? section.badges : ["Rừng tự nhiên", "Khí hậu mát ẩm", "Dược liệu dưới tán", "Sinh kế cộng đồng"]).map((label) => (
                  <li key={label} className="rounded-full border border-[#29452C]/20 px-4 py-2.5">{label}</li>
                ))}
              </ul>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default TraLinhStory;
