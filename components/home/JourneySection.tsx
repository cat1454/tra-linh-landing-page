import Image from "next/image";
import type { HomePageContent } from "@/lib/content/types";
import { HorizontalJourney } from "@/components/animation/HorizontalJourney";
import ScrollReveal from "@/components/animation/ScrollReveal";

import { DeferredJourneyCarousel } from "./DeferredJourneyCarousel";
import { JourneyCard } from "./JourneyCard";
import { SectionIntro } from "./_shared";

type JourneySectionProps = {
  journeys: HomePageContent["journeys"];
  section?: HomePageContent["sectionSettings"][string];
  activityMedia?: HomePageContent["media"];
};

export function JourneySection({ journeys, section, activityMedia = [] }: JourneySectionProps) {
  if (!journeys.length) return null;

  return (
    <section id="hanh-trinh" aria-labelledby="journey-heading" className="overflow-hidden bg-[#EEF1E9] px-5 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div id="journey-heading">
          <SectionIntro
            eyebrow={section?.eyebrow ?? "Hành trình"}
            title={section?.title ?? "Chạm vào nhịp sống đại ngàn"}
            description={section?.description ?? "Không phải hành trình của những điểm check-in vội vã. Trà Linh mở ra qua từng cung đường, tán rừng, bản làng và câu chuyện của người dân vùng cao."}
          />
        </div>

        <div className="mt-8 lg:mt-10">
          <DeferredJourneyCarousel journeys={journeys} />
          <HorizontalJourney className="journey-horizontal-track hidden lg:block" data-horizontal-track>
            {journeys.map((journey, index) => (
              <JourneyCard key={journey.id} journey={journey} index={index} />
            ))}
          </HorizontalJourney>
        </div>

        {/* Activity Gallery (64 real images) */}
        {activityMedia.length > 0 && (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-16 border-t border-[#10251A]/10 pt-12">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-serif text-2xl text-[#10251A] sm:text-3xl">
                  Hình ảnh hoạt động trải nghiệm thực tế
                </h3>
                <p className="text-xs text-[#536258] uppercase tracking-[0.12em]">
                  Đại ngàn qua góc máy thực tế ({activityMedia.length} ảnh)
                </p>
              </div>

              <div className="relative mt-8 w-full overflow-hidden">
                {/* Edge fade gradients for beautiful blending */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#EEF1E9] to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#EEF1E9] to-transparent z-10 pointer-events-none" />
                
                {/* Infinite Marquee flex row */}
                <div className="flex animate-marquee gap-4">
                  {/* First Set */}
                  {activityMedia.map((mediaItem) => (
                    <div
                      key={mediaItem.id}
                      className="relative h-[180px] w-[260px] shrink-0 overflow-hidden rounded-2xl bg-[#10251A]/5 group shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Image
                        src={mediaItem.src}
                        alt={mediaItem.altText}
                        fill
                        sizes="260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07100C]/82 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
                        <p className="text-[10px] text-[#EEF1E9] font-semibold uppercase tracking-wider leading-tight">
                          {mediaItem.altText}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Duplicate Set for Seamless Looping */}
                  {activityMedia.map((mediaItem) => (
                    <div
                      key={`${mediaItem.id}-dup`}
                      className="relative h-[180px] w-[260px] shrink-0 overflow-hidden rounded-2xl bg-[#10251A]/5 group shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Image
                        src={mediaItem.src}
                        alt={mediaItem.altText}
                        fill
                        sizes="260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07100C]/82 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 z-10">
                        <p className="text-[10px] text-[#EEF1E9] font-semibold uppercase tracking-wider leading-tight">
                          {mediaItem.altText}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

export default JourneySection;
