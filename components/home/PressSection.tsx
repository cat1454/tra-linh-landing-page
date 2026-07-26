import { ExternalLink } from "lucide-react";

import ScrollReveal from "@/components/animation/ScrollReveal";
import type { PageSectionSettings, PressArticle } from "@/lib/content/types";

import { MediaFrame, SectionIntro } from "./_shared";

type PressSectionProps = {
  articles: PressArticle[];
  section?: PageSectionSettings;
};

export function PressSection({ articles, section }: PressSectionProps) {
  const verifiedArticles = articles.filter((article) => article.isVerified);
  if (!verifiedArticles.length) return null;

  return (
    <section id="bao-chi" aria-labelledby="press-heading" className="border-t border-[#10251A]/10 bg-[#EEF1E9] px-5 py-12 text-[#10251A] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto max-w-[1380px]">
        <ScrollReveal direction="up">
          <div id="press-heading">
            <SectionIntro
              eyebrow={section?.eyebrow ?? "Báo chí & Truyền thông"}
              title={section?.title ?? "Báo chí nói về Trà Linh"}
              description={section?.description ?? "Những bài viết đã được xác minh về Trà Linh, rừng Ngọc Linh và cộng đồng địa phương."}
            />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {verifiedArticles.map((article, index) => (
            <ScrollReveal key={article.id} direction="up" delay={0.1 * index}>
              <article className="h-full">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${article.title} — ${article.publisher} (mở trong tab mới)`}
                  className="group flex h-full min-h-11 flex-col overflow-hidden rounded-[1.5rem] border border-[#10251A]/10 bg-white/70 p-3 shadow-sm transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#10251A]/5">
                    <MediaFrame
                      media={article.media}
                      className="absolute inset-0"
                      sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                      imageClassName="transition duration-700 group-hover:scale-[1.04]"
                      hoverReveal={false}
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#536258]">
                      <span>{article.publisher}</span>
                      <time dateTime={article.publishedDate}>{article.publishedDate}</time>
                    </div>
                    <h3 className="mt-3 text-balance font-serif text-xl leading-snug text-[#10251A]">{article.title}</h3>
                    <span className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#29452C]">
                      Đọc bài viết <ExternalLink aria-hidden="true" className="size-4" />
                    </span>
                  </div>
                </a>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PressSection;
