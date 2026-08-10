"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, UtensilsCrossed, Wheat } from "lucide-react";
import ScrollReveal from "@/components/animation/ScrollReveal";

import type { HomePageContent, LocalSpecialty } from "@/lib/content/types";
import { SpecialtyStoryModal } from "@/components/ui/SpecialtyStoryModal";
import { SemanticHeadingText } from "@/components/home/SemanticHeadingText";

import { MediaFrame, PlaceholderPill, SectionIntro } from "./_shared";

type LocalProduceSectionProps = {
  items: HomePageContent["localSpecialties"];
  section?: HomePageContent["sectionSettings"][string];
};

const categoryMeta = {
  "am-thuc": { label: "Ẩm thực", icon: UtensilsCrossed },
  "duoc-lieu": { label: "Dược liệu", icon: Leaf },
  "nong-san": { label: "Nông sản", icon: Wheat },
};

const filterTabs = [
  { id: "all", label: "Tất cả", icon: null },
  { id: "am-thuc", label: "Ẩm thực", icon: UtensilsCrossed },
  { id: "duoc-lieu", label: "Dược liệu", icon: Leaf },
  { id: "nong-san", label: "Nông sản", icon: Wheat },
];

export function LocalProduceSection({ items, section }: LocalProduceSectionProps) {
  const [selectedSpecialty, setSelectedSpecialty] = useState<LocalSpecialty | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(6);

  if (!items.length) return null;

  const filteredItems = activeCategory === "all"
    ? items
    : items.filter(item => item.category === activeCategory);
  const visibleItems = filteredItems.slice(0, visibleCount);
  const remainingCount = filteredItems.length - visibleItems.length;

  return (
    <section id="san-vat" aria-labelledby="produce-heading" className="bg-[#EEF1E9] px-5 py-12 text-[#10251A] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto max-w-[1380px]">
        <ScrollReveal direction="up">
          <div id="produce-heading">
            <SectionIntro
              eyebrow={section?.eyebrow ?? "Sản vật địa phương"}
              title={section?.title ?? "Hương vị được nuôi bởi rừng"}
              description={section?.description ?? "Từ bữa cơm vùng cao đến những sản vật theo mùa, mỗi câu chuyện đều bắt đầu bằng khí hậu, thổ nhưỡng và bàn tay người bản địa."}
            />
          </div>
        </ScrollReveal>

        {/* Tab Filters */}
        <ScrollReveal direction="up" delay={0.15}>
          <div className="mt-8 flex flex-wrap gap-2.5 justify-start border-b border-[#10251A]/10 pb-5">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => {
                    setActiveCategory(tab.id);
                    setVisibleCount(6);
                  }}
                  className={`inline-flex min-h-12 items-center gap-2 rounded-full px-5 py-2 text-xs font-bold uppercase tracking-[0.1em] transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B] active:scale-95 ${
                    isActive
                      ? "bg-[#29452C] text-[#EEF1E9] shadow-[0_8px_20px_rgba(41,69,44,0.2)] scale-[1.02]"
                      : "bg-[#10251A]/5 text-[#10251A]/70 hover:bg-[#10251A]/10 hover:text-[#10251A]"
                  }`}
                >
                  {Icon && <Icon className="size-4 text-[#D5A84E]" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollReveal>

        {/* Grid List */}
        <motion.div
          layout
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visibleItems.map((item) => {
              const meta = categoryMeta[item.category];
              const Icon = meta.icon;

              return (
                <motion.article
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  key={item.id}
                  className="produce-card group relative isolate h-[360px] overflow-hidden rounded-[1.5rem] bg-[#29452C] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  <button
                    type="button"
                    aria-label={`Xem câu chuyện ${item.name}`}
                    aria-haspopup="dialog"
                    onClick={() => setSelectedSpecialty(item)}
                    className="absolute inset-0 z-20 rounded-[1.5rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
                  />
                  <MediaFrame hoverReveal={true} media={item.media} className="absolute inset-0 -z-20" sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw" imageClassName="transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#07100C]/95 via-[#07100C]/25 to-transparent" />
                  <div className="pointer-events-none flex h-full flex-col justify-between p-6 sm:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#07100C]/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#EEE3CB] backdrop-blur-sm">
                        <Icon aria-hidden="true" className="size-4 text-[#D5A84E]" />
                        {meta.label}
                      </span>
                      {item.isPlaceholder ? <PlaceholderPill label={item.placeholderLabel} /> : null}
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-[#EEF1E9] sm:text-3xl leading-tight">
                        <SemanticHeadingText text={item.name} compact />
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#EEF1E9]/78">{item.description}</p>
                      <div
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#D5A84E] group-hover:text-[#EEF1E9] transition-colors"
                      >
                        <span>Câu chuyện sản vật địa phương</span>
                        <span aria-hidden="true">→</span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {remainingCount > 0 ? (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount((count) => Math.min(count + 6, filteredItems.length))}
              className="inline-flex min-h-12 items-center rounded-full border border-[#29452C]/25 bg-white/70 px-6 text-sm font-semibold text-[#29452C] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]"
            >
              Xem thêm {remainingCount} sản vật
            </button>
          </div>
        ) : null}
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
