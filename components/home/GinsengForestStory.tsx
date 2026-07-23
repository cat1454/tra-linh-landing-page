import { ContactRound, Trees } from "lucide-react";

import ScrollReveal from "@/components/animation/ScrollReveal";
import type { HomePageContent } from "@/lib/content/types";

import { MediaFrame, SectionIntro } from "./_shared";

type GinsengForestStoryProps = {
  steps: HomePageContent["ginsengStorySteps"];
  section?: HomePageContent["sectionSettings"][string];
};

export function GinsengForestStory({ steps, section }: GinsengForestStoryProps) {
  if (!steps.length) return null;

  return (
    <section id="vung-sam" aria-labelledby="ginseng-heading" className="bg-[#10251A] px-5 py-12 text-[#EEF1E9] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto max-w-[1380px]">
        <ScrollReveal direction="fade">
          <div id="ginseng-heading">
            <SectionIntro
              eyebrow={section?.eyebrow ?? "Vùng sâm dưới tán rừng"}
              title={section?.title ?? "Một hành trình lớn lên chậm rãi"}
              description={section?.description ?? "Sâm Ngọc Linh gắn với độ ẩm, lớp mùn và bóng râm của rừng. Câu chuyện của cây cũng là câu chuyện gìn giữ môi trường sống và sinh kế cộng đồng."}
              tone="dark"
            />
          </div>
        </ScrollReveal>

        <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <ScrollReveal direction="left">
              <MediaFrame
                media={steps[0]?.media}
                className="aspect-[4/5] rounded-[1.75rem]"
                sizes="(min-width: 1024px) 52vw, 100vw"
                imageClassName="brightness-[0.82]"
                showCaption
              />
              <div className="relative mt-6 mx-4 rounded-2xl border border-[#EEF1E9]/12 bg-[#07100C]/88 p-5 backdrop-blur-md sm:mx-8 sm:p-7">
                <Trees aria-hidden="true" className="size-6 text-[#D5A84E]" />
                <p className="mt-4 font-serif text-xl leading-8 text-[#EEF1E9] sm:text-2xl">
                  {section?.secondaryText ?? "“Sống cùng rừng” là nền tảng để kể câu chuyện vùng sâm một cách có trách nhiệm."}
                </p>
              </div>
            </ScrollReveal>
          </div>

          <ol className="relative border-l border-[#9BBE62]/25 pl-7 sm:pl-10">
            {steps.map((step) => (
              <li key={step.id} className="relative pb-10 last:pb-0 lg:min-h-[250px] lg:pb-12">
                <ScrollReveal direction="up">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[2.17rem] top-0 grid size-10 place-items-center rounded-full border border-[#D5A84E]/60 bg-[#10251A] font-serif text-sm text-[#D5A84E] sm:-left-[3.05rem]"
                  >
                    {String(step.stepNumber).padStart(2, "0")}
                  </span>
                  <h3 className="font-serif text-3xl leading-tight sm:text-4xl">{step.title}</h3>
                  <p className="mt-5 max-w-xl text-base leading-8 text-[#EEF1E9]/68">{step.description}</p>
                  {step.quote ? (
                    <blockquote className="mt-7 border-l-2 border-[#D5A84E] pl-5 font-serif text-lg italic leading-8 text-[#EEE3CB]">
                      {step.quote}
                    </blockquote>
                  ) : null}
                </ScrollReveal>
              </li>
            ))}
          </ol>
        </div>

        <ScrollReveal direction="up" delay={0.2}>
          <aside className="mt-10 flex flex-col gap-5 rounded-2xl border border-[#EEF1E9]/12 bg-[#07100C]/38 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-start gap-4">
              <ContactRound aria-hidden="true" className="mt-1 size-6 shrink-0 text-[#D5A84E]" />
              <div>
                <h3 className="font-serif text-xl">Tham quan có hướng dẫn</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#EEF1E9]/62">
                  Việc tiếp cận vườn sâm phụ thuộc quy định bảo tồn và điều kiện địa phương. Hãy liên hệ đơn vị quản lý trước hành trình.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full border border-[#D5A84E]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#D5A84E]">
              Cần liên hệ trước
            </span>
          </aside>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default GinsengForestStory;
