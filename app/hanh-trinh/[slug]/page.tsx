import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DetailPage } from "@/components/detail/DetailPage";
import {
  createArticleSchema,
  createBreadcrumbSchema,
  createDetailMetadata,
  JsonLd,
} from "@/components/detail/seo";
import { createContentRepository } from "@/lib/content/repository";
import type { AccessStatus, Journey } from "@/lib/content/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const repository = createContentRepository();
const getJourney = cache((slug: string) => repository.getJourneyBySlug(slug));

const accessLabels: Record<AccessStatus, string> = {
  open: "Có thể tiếp cận theo điều kiện địa phương",
  contact_required: "Cần liên hệ trước",
  organized_only: "Chỉ tham gia theo đoàn được tổ chức",
};

const categoryLabels: Record<Journey["category"], string> = {
  nature: "Thiên nhiên",
  community: "Cộng đồng",
  heritage: "Văn hóa và di sản",
  ginseng: "Vùng sâm",
};

export async function generateStaticParams() {
  const journeys = await repository.getPublishedJourneys();
  return journeys.map((journey) => ({ slug: journey.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getJourney(slug);

  if (!journey || journey.status !== "published") {
    return {
      title: "Không tìm thấy hành trình",
      robots: { index: false, follow: false },
    };
  }

  return createDetailMetadata({
    title: journey.title,
    description: journey.shortDescription,
    pathname: `/hanh-trinh/${journey.slug}`,
    imageUrl: journey.featuredMedia?.src,
    imageAlt: journey.featuredMedia?.altText,
  });
}

export default async function JourneyDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const journey = await getJourney(slug);

  if (!journey || journey.status !== "published") {
    notFound();
  }

  const pathname = `/hanh-trinh/${journey.slug}`;
  const journeys = await repository.getPublishedJourneys();
  const navigationTabs = journeys.map((j) => ({
    label: j.title,
    href: `/hanh-trinh/${j.slug}`,
    isActive: j.slug === slug,
  }));

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", pathname: "/" },
    { name: "Hành trình", pathname: "/#hanh-trinh" },
    { name: journey.title, pathname },
  ]);
  const articleSchema =
    journey.verificationStatus === "verified"
      ? createArticleSchema({
          title: journey.title,
          description: journey.shortDescription,
          pathname,
          imageUrl: journey.featuredMedia?.src,
          dateModified: journey.updatedAt,
        })
      : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {articleSchema ? <JsonLd data={articleSchema} /> : null}
      <DetailPage
        eyebrow="Hành trình giữa đại ngàn"
        title={journey.title}
        summary={journey.shortDescription}
        description={journey.description}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Hành trình", href: "/#hanh-trinh" },
          { label: journey.title, href: pathname },
        ]}
        featuredMedia={journey.featuredMedia}
        gallery={journey.gallery}
        placeholderLabel={journey.placeholderLabel}
        facts={[
          { label: "Loại trải nghiệm", value: categoryLabels[journey.category] },
          { label: "Khu vực", value: journey.locationLabel },
          { label: "Thời lượng gợi ý", value: journey.durationLabel },
          { label: "Tiếp cận", value: accessLabels[journey.accessStatus] },
        ]}
        sections={[
          ...(journey.highlights.length
            ? [{ title: "Điểm nhấn", items: journey.highlights }]
            : []),
          {
            title: "Điều kiện tiếp cận",
            body: journey.accessNote,
            tone: "notice" as const,
          },
          {
            title: "Lưu ý an toàn",
            body: journey.safetyNote,
            tone: "notice" as const,
          },
        ]}
        sourceUrl={journey.sourceUrl}
        sourceCredit={journey.sourceCredit}
        updatedAt={journey.updatedAt}
        navigationTabs={navigationTabs}
      />
    </>
  );
}
