import type { HomePageContent } from "@/lib/content/types";
import { HorizontalJourney } from "@/components/animation/HorizontalJourney";

import { DeferredJourneyCarousel } from "./DeferredJourneyCarousel";
import { JourneyCard } from "./JourneyCard";
import { SectionIntro } from "./_shared";

type JourneySectionProps = {
  journeys: HomePageContent["journeys"];
};

export function JourneySection({ journeys }: JourneySectionProps) {
  if (!journeys.length) return null;

  return (
    <section id="hanh-trinh" aria-labelledby="journey-heading" className="overflow-hidden bg-[#EEF1E9] px-5 py-24 sm:px-8 sm:py-28 lg:px-16 lg:py-36 xl:px-20">
      <div className="mx-auto max-w-[1440px]">
        <div id="journey-heading">
          <SectionIntro
            eyebrow="Hành trình"
            title="Chạm vào nhịp sống đại ngàn"
            description="Không phải hành trình của những điểm check-in vội vã. Trà Linh mở ra qua từng cung đường, tán rừng, bản làng và câu chuyện của người dân vùng cao."
          />
        </div>

        <div className="mt-14 sm:mt-16">
          <DeferredJourneyCarousel journeys={journeys} />
          <HorizontalJourney className="journey-horizontal-track hidden lg:block" data-horizontal-track>
            {journeys.map((journey, index) => (
              <JourneyCard key={journey.id} journey={journey} index={index} />
            ))}
          </HorizontalJourney>
        </div>
      </div>
    </section>
  );
}

export default JourneySection;
