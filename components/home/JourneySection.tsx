import type { HomePageContent } from "@/lib/content/types";
import { HorizontalJourney } from "@/components/animation/HorizontalJourney";
import ScrollReveal from "@/components/animation/ScrollReveal";
import { SemanticHeadingText } from "@/components/home/SemanticHeadingText";

import { DeferredJourneyCarousel } from "./DeferredJourneyCarousel";
import { JourneyCard } from "./JourneyCard";
import { ResponsiveMediaRail } from "./ResponsiveMediaRail";
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

        {activityMedia.length > 0 && (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-16 border-t border-[#10251A]/10 pt-12">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-serif text-2xl text-[#10251A] sm:text-3xl">
                  <SemanticHeadingText text="Hình ảnh hoạt động trải nghiệm thực tế" compact />
                </h3>
                <p className="text-xs text-[#536258] uppercase tracking-[0.12em]">
                  {new Set(activityMedia.map((item) => item.id)).size} khoảnh khắc tiêu biểu
                </p>
              </div>

              <ResponsiveMediaRail media={activityMedia} tone="mist" itemSize="small" />
            </div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

export default JourneySection;
