import { CloudSun, MapPinned, ShieldCheck } from "lucide-react";

import type { HomePageContent } from "@/lib/content/types";

import { SectionIntro } from "./_shared";
import { DeferredTravelGuideAccordion } from "./DeferredTravelGuideAccordion";

type TravelGuideSectionProps = {
  guides: HomePageContent["guides"];
  section?: HomePageContent["sectionSettings"][string];
};

export function TravelGuideSection({ guides, section }: TravelGuideSectionProps) {
  if (!guides.length) return null;

  return (
    <section id="cam-nang" aria-labelledby="guide-heading" className="bg-[#EEE3CB] px-5 py-12 text-[#10251A] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto grid max-w-[1380px] gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
        <div>
          <div id="guide-heading">
            <SectionIntro
              eyebrow={section?.eyebrow ?? "Cẩm nang hành trình"}
              title={section?.title ?? "Chuẩn bị cho vùng núi cao"}
              description={section?.description ?? "Thông tin thiết thực giúp bạn đi chậm, an toàn và tôn trọng không gian sống của cộng đồng địa phương."}
            />
          </div>

          <div className="relative mt-10 min-h-72 overflow-hidden rounded-[1.5rem] bg-[#29452C] p-7 text-[#EEF1E9]">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(155,190,98,0.25),transparent_36%),linear-gradient(145deg,transparent,rgba(7,16,12,0.7))]" />
            <MapPinned aria-hidden="true" className="relative size-8 text-[#D5A84E]" />
            <p className="relative mt-8 max-w-sm font-serif text-3xl leading-tight">Trà Linh · vùng Ngọc Linh</p>
            <p className="relative mt-3 max-w-sm text-sm leading-7 text-[#EEF1E9]/66">
              {section?.secondaryText ?? "Điều kiện đường và thời tiết vùng cao có thể thay đổi. Luôn xác nhận thông tin với đầu mối địa phương trước khi khởi hành."}
            </p>
            <div className="relative mt-7 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EEF1E9]/16 px-3 py-2 text-xs"><CloudSun className="size-4 text-[#D5A84E]" aria-hidden="true" /> Theo dõi thời tiết</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#EEF1E9]/16 px-3 py-2 text-xs"><ShieldCheck className="size-4 text-[#D5A84E]" aria-hidden="true" /> Đi cùng hướng dẫn</span>
            </div>
          </div>
        </div>

        <div className="lg:pt-6">
          <DeferredTravelGuideAccordion guides={guides} />
        </div>
      </div>
    </section>
  );
}

export default TravelGuideSection;
