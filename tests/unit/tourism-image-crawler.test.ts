import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";

import {
  buildManifestEntry,
  deduplicateManifestEntries,
  extractImageReferences,
} from "@/lib/tourism-image-crawler";

const pageUrl = "https://example.gov.vn/tin/cho-phien-tra-linh";

describe("tourism image crawler", () => {
  it("extracts article images while excluding interface and undersized assets", () => {
    const html = `
      <html><head>
        <meta property="og:image" content="/media/market-cover.jpg">
      </head><body>
        <header><img class="site-logo" src="/theme/logo.png" width="1200" height="800"></header>
        <article>
          <figure>
            <img src="/media/market-stall.jpg" width="1200" height="800" alt="Gian hàng chợ phiên">
            <figcaption>Người dân giới thiệu nông sản tại chợ phiên.</figcaption>
          </figure>
          <img src="/media/tracking.gif" width="1" height="1">
        </article>
        <aside class="related-news"><img src="/media/other-story.jpg" width="1200" height="800"></aside>
      </body></html>`;

    expect(extractImageReferences(html, pageUrl)).toEqual([
      expect.objectContaining({
        imageUrl: "https://example.gov.vn/media/market-cover.jpg",
        pageUrl,
      }),
      expect.objectContaining({
        imageUrl: "https://example.gov.vn/media/market-stall.jpg",
        caption: "Người dân giới thiệu nông sản tại chợ phiên.",
      }),
    ]);
  });

  it("deduplicates by SHA-256 and requires permission by default", () => {
    const bytes = Buffer.from("same-image");
    const first = buildManifestEntry({
      slug: "cho-phien-tra-linh",
      localPath: "asset/tourism-map-candidates/cho-phien-tra-linh/one.jpg",
      imageUrl: "https://example.gov.vn/media/one.jpg",
      pageUrl,
      caption: "Ảnh một",
      author: "Tác giả",
      mimeType: "image/jpeg",
      width: 1200,
      height: 800,
      bytes,
      downloadedAt: "2026-07-26T00:00:00.000Z",
    });
    const duplicate = buildManifestEntry({
      ...first,
      localPath: "asset/tourism-map-candidates/cho-phien-tra-linh/two.jpg",
      imageUrl: "https://example.gov.vn/media/two.jpg",
      bytes,
    });

    expect(first.sha256).toBe(createHash("sha256").update(bytes).digest("hex"));
    expect(first.licenseStatus).toBe("permission_required");
    expect(deduplicateManifestEntries([first, duplicate])).toEqual([first]);
  });
});
