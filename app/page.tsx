import { submitContactAction } from "@/app/actions/forms";
import { ContactForm } from "@/components/forms/ContactForm";
import {
  FinalCTA,
  GinsengForestStory,
  GinsengProductsSection,
  HeroSection,
  IdentityStrip,
  JourneySection,
  LocalProduceSection,
  TraLinhStory,
  TravelGuideSection,
  XoDangCultureSection,
} from "@/components/home";
import { createContentRepository } from "@/lib/content/repository";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

const destinationSchema = {
  "@context": "https://schema.org",
  "@type": "TouristDestination",
  name: "Trà Linh – Đại ngàn Ngọc Linh",
  description:
    "Điểm đến vùng núi gắn với thiên nhiên Ngọc Linh, văn hóa Xơ Đăng và vùng trồng sâm dưới tán rừng.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Xã Trà Linh",
    addressRegion: "Thành phố Đà Nẵng",
    addressCountry: "VN",
  },
  touristType: [
    "Du khách yêu thiên nhiên",
    "Người tìm hiểu văn hóa bản địa",
    "Người quan tâm du lịch có trách nhiệm",
  ],
  sameAs: [
    "https://tralinh.danang.gov.vn/",
    "https://samngoclinh.danang.gov.vn/gioi-thieu-1.html",
  ],
};

function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(destinationSchema).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export default async function Home() {
  const repository = createContentRepository();
  const home = await repository.getHomePageContent();
  const formsEnabled = isSupabaseAdminConfigured();
  const finalMedia = home.media.find((item) => item.id === "media-village") ?? home.hero.backgroundMedia;

  return (
    <main id="noi-dung-chinh" className="min-w-0 overflow-x-clip">
      <JsonLd />
      <HeroSection hero={home.hero} />
      <IdentityStrip items={home.identityValues} />
      <TraLinhStory chapters={home.storyChapters} />
      <JourneySection journeys={home.journeys} />
      <GinsengForestStory steps={home.ginsengStorySteps} />
      <XoDangCultureSection stories={home.cultureStories} />
      <LocalProduceSection items={home.localSpecialties} />
      {home.products.length ? <GinsengProductsSection products={home.products} /> : null}
      <TravelGuideSection guides={home.guides} />
      <FinalCTA media={finalMedia} />
      <div id="lien-he" className="bg-[#EEF1E9] px-5 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[#10251A]/10 bg-[#EEE3CB]/70 p-6 shadow-[0_24px_80px_rgba(16,37,26,0.08)] sm:p-10">
          <ContactForm
            isEnabled={formsEnabled}
            serverAction={submitContactAction}
          />
        </div>
      </div>
    </main>
  );
}
