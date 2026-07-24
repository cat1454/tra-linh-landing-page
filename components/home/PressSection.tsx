import ScrollReveal from "@/components/animation/ScrollReveal";
import type { PageSectionSettings, PressArticle } from "@/lib/content/types";
import { MediaFrame, SectionIntro } from "./_shared";

type PressSectionProps = {
  articles: PressArticle[];
  section?: PageSectionSettings;
};

export function PressSection({ articles, section }: PressSectionProps) {
  if (!articles.length) return null;

  return (
    <section id="bao-chi" aria-labelledby="press-heading" className="bg-[#EEF1E9] px-5 py-12 text-[#10251A] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20 border-t border-[#10251A]/10">
      <div className="mx-auto max-w-[1380px]">
        <ScrollReveal direction="up">
          <div id="press-heading">
            <SectionIntro
              eyebrow={section?.eyebrow ?? "Báo chí & Truyền thông"}
              title={section?.title ?? "Báo chí nói về Trà Linh"}
              description={section?.description ?? "Hành trình giữ rừng và nâng tầm sâm Ngọc Linh được các cơ quan thông tấn báo chí uy tín ghi lại."}
            />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-6 md:grid-cols-3 lg:mt-10">
          {articles.map((article, index) => (
            <article
              key={article.id}
              className="press-card group relative overflow-hidden rounded-[1.5rem] border border-[#10251A]/10 bg-white/60 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
            >
              <ScrollReveal direction="up" delay={0.15 * index}>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#10251A]/5">
                  <MediaFrame
                    media={article.media}
                    className="absolute inset-0"
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 100vw"
                    imageClassName="transition duration-700 group-hover:scale-[1.04]"
                    hoverReveal={false}
                  />
                  {/* Subtle metadata overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07100C]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
                    <div className="text-left">
                      <p className="text-[10px] text-[#D5A84E] font-bold uppercase tracking-widest mb-1">
                        {article.publisher}
                      </p>
                      <p className="text-xs text-[#EEF1E9] font-medium line-clamp-2 leading-snug">
                        {article.title}
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PressSection;
