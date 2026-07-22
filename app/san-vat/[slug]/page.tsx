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
import type { Product } from "@/lib/content/types";

type PageProps = {
  params: Promise<{ slug: string }>;
};

const repository = createContentRepository();
const getProduct = cache((slug: string) => repository.getProductBySlug(slug));

const productTypeLabels: Record<Product["productType"], string> = {
  "fresh-ginseng": "Sâm tươi",
  "dried-ginseng": "Sâm chế biến",
  "herbal-tea": "Trà dược liệu",
};

export async function generateStaticParams() {
  const products = await repository.getPublishedProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.status !== "published") {
    return {
      title: "Không tìm thấy nội dung",
      robots: { index: false, follow: false },
    };
  }

  return createDetailMetadata({
    title: product.title,
    description: product.shortDescription,
    pathname: `/san-vat/${product.slug}`,
    imageUrl: product.featuredMedia?.src,
    imageAlt: product.featuredMedia?.altText,
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product || product.status !== "published") {
    notFound();
  }

  const pathname = `/san-vat/${product.slug}`;
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Trang chủ", pathname: "/" },
    { name: "Sản vật", pathname: "/#san-vat" },
    { name: product.title, pathname },
  ]);

  // Placeholder entries are editorial previews, never commercial Product data.
  const articleSchema =
    !product.isPlaceholder && product.verificationStatus === "verified"
      ? createArticleSchema({
          title: product.title,
          description: product.shortDescription,
          pathname,
          imageUrl: product.featuredMedia?.src,
          dateModified: product.updatedAt,
        })
      : null;

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {articleSchema ? <JsonLd data={articleSchema} /> : null}
      <DetailPage
        eyebrow="Sản vật vùng Ngọc Linh"
        title={product.title}
        summary={product.shortDescription}
        description={product.description}
        breadcrumbs={[
          { label: "Trang chủ", href: "/" },
          { label: "Sản vật", href: "/#san-vat" },
          { label: product.title, href: pathname },
        ]}
        featuredMedia={product.featuredMedia}
        gallery={product.gallery}
        placeholderLabel={
          product.isPlaceholder
            ? product.placeholderLabel ?? "Nội dung đề xuất"
            : product.placeholderLabel
        }
        facts={[
          { label: "Nhóm sản vật", value: productTypeLabels[product.productType] },
          { label: "Nguồn gốc", value: product.originNote },
        ]}
        sections={[
          {
            title: "Thông tin cần lưu ý",
            body: product.legalDisclaimer,
            tone: "notice",
          },
        ]}
        sourceUrl={product.sourceUrl}
        sourceCredit={product.sourceCredit}
        updatedAt={product.updatedAt}
      />
    </>
  );
}
