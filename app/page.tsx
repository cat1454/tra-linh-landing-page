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
  PressSection,
} from "@/components/home";
import { createContentRepository } from "@/lib/content/repository";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { TourismMapSection } from "@/components/tourism-map/TourismMapSection";
import {
  BRAND_LOGO_PATH,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  getAbsoluteUrl,
} from "@/components/detail/seo";

const destinationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${getAbsoluteUrl("/")}#website`,
      url: getAbsoluteUrl("/"),
      name: SITE_NAME,
      description: DEFAULT_DESCRIPTION,
      inLanguage: "vi-VN",
    },
    {
      "@type": "TouristDestination",
      "@id": `${getAbsoluteUrl("/")}#destination`,
      name: "Trà Linh – vùng cao Nam Trà My",
      url: getAbsoluteUrl("/"),
      description:
        "Trà Linh là vùng cao Nam Trà My, Quảng Nam trước đây, nay thuộc thành phố Đà Nẵng; nổi bật với thiên nhiên núi rừng, văn hóa Xơ Đăng, sâm Ngọc Linh và dược liệu địa phương.",
      image: getAbsoluteUrl(BRAND_LOGO_PATH),
      touristType: [
        "Du khách yêu thiên nhiên",
        "Người tìm hiểu văn hóa bản địa",
        "Người quan tâm du lịch có trách nhiệm",
      ],
    },
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
      <TraLinhStory chapters={home.storyChapters} section={home.sectionSettings.story} />
      <JourneySection
        journeys={home.journeys}
        section={home.sectionSettings.journeys}
        activityMedia={home.media.filter((item) => item.id.startsWith("media-activity-"))}
      />
      <GinsengForestStory steps={home.ginsengStorySteps} section={home.sectionSettings.ginseng} />
      <XoDangCultureSection
        stories={home.cultureStories}
        section={home.sectionSettings.culture}
        peopleMedia={home.media.filter((item) => item.id.startsWith("media-people-"))}
      />
      <TourismMapSection mode="preview" />
      <LocalProduceSection items={home.localSpecialties} section={home.sectionSettings.local_products} />
      {home.products.length ? <GinsengProductsSection products={home.products} section={home.sectionSettings.products} /> : null}
      <TravelGuideSection guides={home.guides} section={home.sectionSettings.guides} />
      {home.pressArticles && home.pressArticles.length ? (
        <PressSection articles={home.pressArticles} section={home.sectionSettings.press} />
      ) : null}
      <FinalCTA media={home.sectionSettings.final_cta?.media ?? finalMedia} section={home.sectionSettings.final_cta} />
      <div id="lien-he" className="bg-[#EEF1E9] px-5 py-12 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-3xl rounded-[1.75rem] border border-[#10251A]/10 bg-[#EEE3CB]/70 p-6 shadow-[0_24px_80px_rgba(16,37,26,0.08)] sm:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3D5133]">
              {home.sectionSettings.contact?.eyebrow ?? "Liên hệ"}
            </p>
            <h2 className="mt-3 font-serif text-3xl">
              {home.sectionSettings.contact?.title ?? "Kết nối với Trà Linh"}
            </h2>
            {home.sectionSettings.contact?.description ? (
              <p className="mt-3 leading-7 text-[#10251A]/70">{home.sectionSettings.contact.description}</p>
            ) : null}
          </div>
          <ContactForm
            isEnabled={formsEnabled}
            serverAction={submitContactAction}
          />
        </div>
      </div>
    </main>
  );
}
