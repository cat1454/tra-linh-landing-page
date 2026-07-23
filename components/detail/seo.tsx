import type { Metadata } from "next";

export const SITE_URL = "https://tra-linh-landing-page.vercel.app";
export const SITE_NAME = "Du lịch Trà Linh";
export const DEFAULT_TITLE =
  "Du lịch Trà Linh | Khám phá vùng cao Nam Trà My";
export const DEFAULT_DESCRIPTION =
  "Khám phá Trà Linh – vùng cao Nam Trà My, Quảng Nam trước đây, nay thuộc thành phố Đà Nẵng; nơi hội tụ thiên nhiên hùng vĩ, văn hóa Xơ Đăng, sâm Ngọc Linh và những sản phẩm đặc trưng của núi rừng.";
export const BRAND_LOGO_PATH = "/images/brand/logo_tra_linh.jpg";
export const SOCIAL_IMAGE_ALT =
  "Thiên nhiên và văn hóa vùng cao Trà Linh, Nam Trà My";

function normalizeSiteUrl(value: string | undefined): URL | null {
  if (!value?.trim()) {
    return null;
  }

  const withProtocol = /^https?:\/\//i.test(value)
    ? value.trim()
    : `https://${value.trim()}`;

  try {
    const url = new URL(withProtocol);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

export function getSiteUrl(): URL {
  const configured = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  const isLocal =
    configured?.hostname === "localhost" ||
    configured?.hostname === "127.0.0.1";

  return configured && !isLocal ? configured : new URL(SITE_URL);
}

export function getAbsoluteUrl(pathname = "/"): string {
  return new URL(pathname, getSiteUrl()).toString();
}

type DetailMetadataInput = {
  title: string;
  description: string;
  pathname: string;
  imageUrl?: string;
  imageAlt?: string;
};

export function createDetailMetadata({
  title,
  description,
  pathname,
  imageUrl,
  imageAlt,
}: DetailMetadataInput): Metadata {
  const canonical = getAbsoluteUrl(pathname);
  const resolvedImageUrl = imageUrl ?? BRAND_LOGO_PATH;
  const images = [
    {
      url: getAbsoluteUrl(resolvedImageUrl),
      alt: imageAlt ?? (imageUrl ? title : SOCIAL_IMAGE_ALT),
      ...(imageUrl ? {} : { width: 570, height: 350 }),
    },
  ];

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      locale: "vi_VN",
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

type BreadcrumbItem = {
  name: string;
  pathname: string;
};

export function createBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: getAbsoluteUrl(item.pathname),
    })),
  };
}

type ArticleSchemaInput = {
  title: string;
  description: string;
  pathname: string;
  imageUrl?: string;
  datePublished?: string;
  dateModified?: string;
};

export function createArticleSchema({
  title,
  description,
  pathname,
  imageUrl,
  datePublished,
  dateModified,
}: ArticleSchemaInput) {
  const canonical = getAbsoluteUrl(pathname);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: canonical,
    mainEntityOfPage: canonical,
    ...(imageUrl ? { image: getAbsoluteUrl(imageUrl) } : {}),
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    inLanguage: "vi-VN",
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json">
      {JSON.stringify(data).replaceAll("<", "\\u003c")}
    </script>
  );
}
