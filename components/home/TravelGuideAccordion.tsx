"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";

import { SemanticHeadingText } from "@/components/home/SemanticHeadingText";
import type { HomePageContent } from "@/lib/content/types";

import { PlaceholderPill } from "./_shared";

type TravelGuideAccordionProps = {
  guides: HomePageContent["guides"];
};

export function TravelGuideAccordion({ guides }: TravelGuideAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(guides[0]?.id ?? null);
  const baseId = useId();
  const reduceMotion = useReducedMotion();

  return (
    <div className="divide-y divide-[#10251A]/15 border-y border-[#10251A]/15">
      {guides.map((guide) => {
        const isOpen = guide.id === openId;
        const triggerId = `${baseId}-trigger-${guide.id}`;
        const panelId = `${baseId}-panel-${guide.id}`;

        return (
          <article key={guide.id}>
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : guide.id)}
                className="group flex min-h-20 w-full items-center justify-between gap-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]"
              >
                <span className="flex min-w-0 items-center gap-4">
                  <span className="font-serif text-2xl text-[#10251A] sm:text-3xl">
                    <SemanticHeadingText text={guide.title} compact />
                  </span>
                  {guide.isPlaceholder ? <span className="hidden sm:inline-flex"><PlaceholderPill label={guide.placeholderLabel} /></span> : null}
                </span>
                <span className="grid size-11 shrink-0 place-items-center rounded-full border border-[#10251A]/20 transition-colors group-hover:border-[#5E7F3B] group-hover:text-[#5E7F3B]">
                  <ChevronDown aria-hidden="true" className={`size-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="max-w-3xl pb-7 pr-12">
                    <p className="text-base leading-8 text-[#10251A]/70">{guide.shortDescription}</p>
                    {guide.sections.slice(0, 2).map((section) => (
                      <div key={section.title} className="mt-5">
                        <h4 className="text-sm font-semibold text-[#29452C]">
                          <SemanticHeadingText text={section.title} compact />
                        </h4>
                        <p className="mt-1 text-sm leading-7 text-[#3D5133]">{section.body}</p>
                      </div>
                    ))}
                    <Link
                      href={`/cam-nang/${guide.slug}`}
                      className="mt-5 inline-flex min-h-11 items-center border-b border-[#5E7F3B] text-sm font-semibold text-[#29452C] hover:text-[#5E7F3B] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]"
                    >
                      Đọc cẩm nang <span aria-hidden="true" className="ml-2">↗</span>
                    </Link>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </article>
        );
      })}
    </div>
  );
}
