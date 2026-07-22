import type { Metadata } from "next";

const FALLBACK_SITE_URL = "http://localhost:3000";

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
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    new URL(FALLBACK_SITE_URL)
  );
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
  const images = imageUrl
    ? [
        {
          url: getAbsoluteUrl(imageUrl),
          alt: imageAlt ?? title,
        },
      ]
    : undefined;

  return {
    title: `${title} | Trà Linh`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "article",
      locale: "vi_VN",
      siteName: "Trà Linh – Đại ngàn Ngọc Linh",
      title,
      description,
      url: canonical,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images?.map((image) => image.url),
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
      name: "Trà Linh – Đại ngàn Ngọc Linh",
    },
    publisher: {
      "@type": "Organization",
      name: "Trà Linh – Đại ngàn Ngọc Linh",
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
