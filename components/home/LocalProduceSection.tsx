"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Leaf, UtensilsCrossed, Wheat } from "lucide-react";
import ScrollReveal from "@/components/animation/ScrollReveal";

import type { HomePageContent, LocalSpecialty } from "@/lib/content/types";
import { SpecialtyStoryModal } from "@/components/ui/SpecialtyStoryModal";

import { MediaFrame, PlaceholderPill, SectionIntro } from "./_shared";

type LocalProduceSectionProps = {
  items: HomePageContent["localSpecialties"];
};

const categoryMeta = {
  "am-thuc": { label: "Ẩm thực", icon: UtensilsCrossed },
  "duoc-lieu": { label: "Dược liệu", icon: Leaf },
  "nong-san": { label: "Nông sản", icon: Wheat },
};

export function LocalProduceSection({ items }: LocalProduceSectionProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<LocalSpecialty | null>(null);

  if (!items.length) return null;

  return (
    <section id="san-vat" aria-labelledby="produce-heading" className="bg-[#EEF1E9] px-5 py-24 text-[#10251A] sm:px-8 sm:py-28 lg:px-16 lg:py-36 xl:px-20">
      <div className="mx-auto max-w-[1380px]">
        <ScrollReveal direction="up">
          <div id="produce-heading">
            <SectionIntro
              eyebrow="Sản vật địa phương"
              title="Hương vị được nuôi bởi rừng"
              description="Từ bữa cơm vùng cao đến những sản vật theo mùa, mỗi câu chuyện đều bắt đầu bằng khí hậu, thổ nhưỡng và bàn tay người bản địa."
            />
          </div>
        </ScrollReveal>

        <div className="mt-14 grid auto-rows-[360px] gap-5 md:grid-cols-2 lg:grid-cols-12">
          {items.map((item, index) => {
            const meta = categoryMeta[item.category];
            const Icon = meta.icon;

            return (
              <article
                key={item.id}
                className={`produce-card group relative isolate overflow-hidden rounded-[1.5rem] bg-[#29452C] ${
                  index % 4 === 0 || index % 4 === 3 ? "lg:col-span-7" : "lg:col-span-5"
                }`}
              >
                <ScrollReveal direction="up" delay={0.15 * (index % 4)} className="h-full w-full block">
                <MediaFrame hoverReveal={true} media={item.media} className="absolute inset-0 -z-20" sizes="(min-width: 1024px) 58vw, 100vw" imageClassName="transition duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07100C]/95 via-[#07100C]/25 to-transparent" />
                <div className="flex h-full flex-col justify-between p-6 sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#07100C]/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#EEE3CB] backdrop-blur-sm">
                      <Icon aria-hidden="true" className="size-4 text-[#D5A84E]" />
                      {meta.label}
                    </span>
                    {item.isPlaceholder ? <PlaceholderPill label={item.placeholderLabel} /> : null}
                  </div>
                  <div>
                    <h3 className="font-serif text-3xl text-[#EEF1E9] sm:text-4xl">{item.name}</h3>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-[#EEF1E9]/70">{item.description}</p>
                    <button
                      type="button"
                      onClick={() => setSelectedSpecialty(item)}
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#D5A84E] hover:text-[#EEF1E9] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D5A84E] rounded transition-colors text-left"
                    >
                      <span>Câu chuyện sản vật địa phương</span>
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
                </ScrollReveal>
              </article>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {selectedSpecialty && (
          <SpecialtyStoryModal
            isOpen={selectedSpecialty !== null}
            onClose={() => setSelectedSpecialty(null)}
            specialty={selectedSpecialty}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

export default LocalProduceSection;
