import { createHash } from "node:crypto";

import { JSDOM } from "jsdom";

export interface ImageReference {
  imageUrl: string;
  pageUrl: string;
  caption: string | null;
  author: string | null;
}

export interface CandidateManifestEntry extends ImageReference {
  slug: string;
  localPath: string;
  mimeType: string;
  width: number;
  height: number;
  sha256: string;
  downloadedAt: string;
  licenseStatus: "permission_required";
}

interface BuildManifestEntryInput extends Omit<CandidateManifestEntry, "sha256" | "licenseStatus"> {
  bytes: Uint8Array;
}

const ARTICLE_SELECTORS = [
  "article",
  "main",
  "[itemprop='articleBody']",
  ".article-content",
  ".article-detail",
  ".journal-content-article",
  ".news-detail",
  ".detail-content",
];
const EXCLUDED_CONTAINER_SELECTOR = [
  "header",
  "nav",
  "footer",
  "aside",
  ".related-news",
  ".related-posts",
  ".recommended",
  ".suggested",
  ".social-share",
].join(",");
const EXCLUDED_ASSET_PATTERN =
  /(?:^|[\/_\-.])(logo|avatar|icon|sprite|tracking|pixel|spinner|loader|banner-ad|advert)(?:[\/_\-.]|$)/i;

function cleanText(value: string | null | undefined): string | null {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || null;
}

function absoluteHttpUrl(value: string | null, pageUrl: string): string | null {
  if (!value || value.startsWith("data:") || value.startsWith("blob:")) return null;
  try {
    const url = new URL(value, pageUrl);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function imageSource(element: HTMLImageElement): string | null {
  const direct =
    element.getAttribute("data-src") ??
    element.getAttribute("data-original") ??
    element.getAttribute("data-lazy-src") ??
    element.getAttribute("src");
  if (direct) return direct;
  const srcset = element.getAttribute("data-srcset") ?? element.getAttribute("srcset");
  return srcset?.split(",")[0]?.trim().split(/\s+/)[0] ?? null;
}

function declaredTooSmall(element: HTMLImageElement): boolean {
  const width = Number(element.getAttribute("width"));
  const height = Number(element.getAttribute("height"));
  return (width > 0 && width < 600) || (height > 0 && height < 400);
}

function isRejectedAsset(url: string, element?: Element): boolean {
  const attributes = element
    ? `${element.getAttribute("class") ?? ""} ${element.getAttribute("id") ?? ""}`
    : "";
  return EXCLUDED_ASSET_PATTERN.test(`${url} ${attributes}`);
}

export function extractImageReferences(html: string, pageUrl: string): ImageReference[] {
  const document = new JSDOM(html, { url: pageUrl }).window.document;
  const author = cleanText(
    document.querySelector<HTMLMetaElement>('meta[name="author"]')?.content ??
      document.querySelector<HTMLMetaElement>('meta[property="article:author"]')?.content,
  );
  const references: ImageReference[] = [];
  const seen = new Set<string>();

  function addReference(imageUrl: string | null, caption: string | null) {
    const absoluteUrl = absoluteHttpUrl(imageUrl, pageUrl);
    if (!absoluteUrl || seen.has(absoluteUrl) || isRejectedAsset(absoluteUrl)) return;
    seen.add(absoluteUrl);
    references.push({ imageUrl: absoluteUrl, pageUrl, caption, author });
  }

  document
    .querySelectorAll<HTMLMetaElement>(
      'meta[property="og:image"], meta[property="og:image:url"], meta[name="twitter:image"]',
    )
    .forEach((meta) => {
      const caption = cleanText(
        document.querySelector<HTMLMetaElement>('meta[property="og:image:alt"]')?.content,
      );
      addReference(meta.content, caption);
    });

  const articleImages = document.querySelectorAll<HTMLImageElement>(
    ARTICLE_SELECTORS.map((selector) => `${selector} img`).join(","),
  );
  articleImages.forEach((image) => {
    if (image.closest(EXCLUDED_CONTAINER_SELECTOR) || declaredTooSmall(image)) return;
    const source = imageSource(image);
    const absoluteUrl = absoluteHttpUrl(source, pageUrl);
    if (!absoluteUrl || isRejectedAsset(absoluteUrl, image)) return;
    const caption = cleanText(
      image.closest("figure")?.querySelector("figcaption")?.textContent ??
        image.getAttribute("alt") ??
        image.getAttribute("title"),
    );
    addReference(absoluteUrl, caption);
  });

  return references;
}

export function buildManifestEntry(input: BuildManifestEntryInput): CandidateManifestEntry {
  const { bytes, ...entry } = input;
  return {
    ...entry,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    licenseStatus: "permission_required",
  };
}

export function deduplicateManifestEntries(
  entries: CandidateManifestEntry[],
): CandidateManifestEntry[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.sha256)) return false;
    seen.add(entry.sha256);
    return true;
  });
}
