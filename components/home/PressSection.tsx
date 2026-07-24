import Link from "next/link";
import ScrollReveal from "@/components/animation/ScrollReveal";
import type { PageSectionSettings, PressArticle } from "@/lib/content/types";
import { MediaFrame, SectionIntro } from "./_shared";
import { ExternalLink } from "lucide-react";

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
              className="press-card group flex flex-col justify-between overflow-hidden rounded-[1.5rem] border border-[#10251A]/10 bg-white/60 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
            >
              <ScrollReveal direction="up" delay={0.15 * index} className="flex flex-col h-full justify-between">
                <div>
                  <MediaFrame
                    media={article.media}
                    className="aspect-[16/10] w-full rounded-xl"
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 33vw, 100vw"
                    imageClassName="transition duration-500 group-hover:scale-[1.03]"
                    hoverReveal={false}
                  />

                  <div className="mt-5 flex items-center justify-between">
                    <span className="inline-block rounded-full bg-[#5E7F3B]/10 px-3 py-1 text-xs font-semibold text-[#49672D]">
                      {article.publisher}
                    </span>
                    <span className="text-xs text-[#536258]">{article.publishedDate}</span>
                  </div>

                  <h3 className="mt-3 font-serif text-xl font-semibold leading-tight text-[#10251A] transition-colors group-hover:text-[#49672D] sm:text-2xl">
                    {article.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-[#10251A]/72">
                    {article.summary}
                  </p>
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
