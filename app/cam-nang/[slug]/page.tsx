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

type PageProps = {
  params: Promise<{ slug: string }>;
};

const repository = createContentRepository();
const getGuide = cache((slug: string) => repository.getGuideBySlug(slug));

export async function generateStaticParams() {
  const guides = await repository.getPublishedGuides();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide || guide.status !== "published") {
    return {
      title: "Không tìm thấy cẩm nang",
      robots: { index: false, follow: false },
    };
  }

  return createDetailMetadata({
    title: guide.title,
    description: guide.shortDescription,
    pathname: `/cam-nang/${guide.slug}`,
    imageUrl: guide.featuredMedia?.src,
    imageAlt: guide.featuredMedia?.altText,
  });
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide || guide.status !== "published") {
    notFound();
  }

  const pathname = `/cam-nang/${guide.slug}`;
  const guides = await repository.getPublishedGuides();
  const navigationTabs = guides.map((g) => ({
    label: g.title,
    href: `/cam-nang/${g.slug}`,
    isActive: g.slug === slug,
  }));

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", pathname: "/" },
    { name: "Cẩm nang", pathname: "/#cam-nang" },
    { name: guide.title, pathname },
  ]);
  const articleSchema =
    guide.verificationStatus === "verified"
      ? createArticleSchema({
          title: guide.title,
          description: guide.shortDescription,
          pathname,
          imageUrl: guide.featuredMedia?.src,
          dateModified: guide.updatedAt,
        })
      : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {articleSchema ? <JsonLd data={articleSchema} /> : null}
      <DetailPage
        eyebrow="Cẩm nang Trà Linh"
        title={guide.title}
        summary={guide.shortDescription}
        description={guide.description}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Cẩm nang", href: "/#cam-nang" },
          { label: guide.title, href: pathname },
        ]}
        featuredMedia={guide.featuredMedia}
        gallery={guide.gallery}
        placeholderLabel={guide.placeholderLabel}
        facts={[
          { label: "Thời gian đọc", value: guide.readTimeLabel },
          { label: "Thời điểm gợi ý", value: guide.seasonLabel },
        ]}
        sections={guide.sections.map((section) => ({
          title: section.title,
          body: section.body,
        }))}
        sourceUrl={guide.sourceUrl}
        sourceCredit={guide.sourceCredit}
        updatedAt={guide.updatedAt}
        navigationTabs={navigationTabs}
      />
    </>
  );
}
