import { createHash } from "node:crypto";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { applyApprovedTourismMedia } from "@/data/tourism-map/media";
import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";
import {
  MAX_TOURISM_IMAGE_BYTES,
  auditTourismMediaFiles,
  auditTourismMediaManifest,
  buildTourismMediaManifestEntry,
  optimizeTourismImage,
  type TourismMediaManifestEntry,
} from "@/lib/tourism-image-pipeline";

function manifestEntry(
  overrides: Partial<TourismMediaManifestEntry> = {},
): TourismMediaManifestEntry {
  return {
    assetId: "thac-noong-lau-cover",
    slug: "thac-noong-lau",
    role: "cover",
    publicPath: "/images/tourism-map/thac-noong-lau/cover.webp",
    sourcePageUrl: "https://baodanang.vn/video-trai-nghiem-thac-noong-lau-3127291.html",
    sourceImageUrl: "https://baodanang.vn/example.jpg",
    credit: "Báo Đà Nẵng",
    license: "official_publication",
    representation: "documentary",
    mimeType: "image/webp",
    width: 1200,
    height: 675,
    bytes: 200_000,
    sha256: "a".repeat(64),
    importedAt: "2026-07-29T00:00:00.000Z",
    ...overrides,
  };
}

describe("tourism image pipeline", () => {
  it("creates a bounded WebP and strips source metadata", async () => {
    const source = await sharp({
      create: {
        width: 2400,
        height: 1600,
        channels: 3,
        background: "#49672d",
      },
    })
      .jpeg()
      .withExif({ IFD0: { Copyright: "metadata must not survive" } })
      .toBuffer();

    const optimized = await optimizeTourismImage(source);
    const metadata = await sharp(optimized.bytes).metadata();

    expect(optimized.mimeType).toBe("image/webp");
    expect(optimized.width).toBeLessThanOrEqual(1600);
    expect(optimized.height).toBeLessThanOrEqual(1200);
    expect(optimized.bytes.byteLength).toBeLessThanOrEqual(MAX_TOURISM_IMAGE_BYTES);
    expect(metadata.exif).toBeUndefined();
    expect(optimized.sha256).toBe(
      createHash("sha256").update(optimized.bytes).digest("hex"),
    );
  });

  it("builds traceable manifest metadata for an optimized image", async () => {
    const optimized = await optimizeTourismImage(
      await sharp({
        create: { width: 1200, height: 800, channels: 3, background: "#d5a84e" },
      })
        .png()
        .toBuffer(),
    );

    expect(
      buildTourismMediaManifestEntry({
        assetId: "sample-cover",
        slug: "sample",
        role: "cover",
        publicPath: "/images/tourism-map/sample/cover.webp",
        sourcePageUrl: "https://example.gov.vn/sample",
        sourceImageUrl: "https://example.gov.vn/sample.jpg",
        credit: "Cổng thông tin mẫu",
        license: "official_publication",
        representation: "documentary",
        importedAt: "2026-07-29T00:00:00.000Z",
        optimized,
      }),
    ).toEqual(
      expect.objectContaining({
        publicPath: "/images/tourism-map/sample/cover.webp",
        mimeType: "image/webp",
        sha256: optimized.sha256,
        bytes: optimized.bytes.byteLength,
      }),
    );
  });

  it("rejects unapproved, external, duplicate, and oversized assets", () => {
    const issues = auditTourismMediaManifest([
      manifestEntry({ license: "permission_required" }),
      manifestEntry({
        assetId: "external",
        slug: "external",
        publicPath: "https://example.com/image.webp",
        sha256: "b".repeat(64),
      }),
      manifestEntry({
        assetId: "duplicate-content",
        slug: "another-place",
        publicPath: "/images/tourism-map/another-place/cover.webp",
      }),
      manifestEntry({
        assetId: "oversized",
        slug: "oversized",
        publicPath: "/images/tourism-map/oversized/cover.webp",
        sha256: "c".repeat(64),
        bytes: MAX_TOURISM_IMAGE_BYTES + 1,
      }),
    ]);

    expect(issues.map(({ code }) => code)).toEqual(
      expect.arrayContaining([
        "unapproved_license",
        "external_public_path",
        "duplicate_content",
        "image_too_large",
      ]),
    );
  });

  it("allows one asset to represent a declared venue and event", () => {
    const cover = manifestEntry();
    const relatedEvent = manifestEntry({
      assetId: "tra-linh-market-event-cover",
      slug: "su-kien-cho-phien-tra-linh",
      publicPath: cover.publicPath,
    });

    expect(
      auditTourismMediaManifest([cover, relatedEvent], {
        sharedAssetGroups: [[cover.assetId, relatedEvent.assetId]],
      }).filter(({ severity }) => severity === "error"),
    ).toEqual([]);
  });

  it("hydrates a place from the approved manifest instead of an external URL", () => {
    const cover = manifestEntry();
    const gallery = manifestEntry({
      assetId: "thac-noong-lau-gallery-01",
      role: "gallery",
      publicPath: "/images/tourism-map/thac-noong-lau/gallery-01.webp",
      sha256: "d".repeat(64),
    });
    const place = {
      ...tourismPlaces[0],
      slug: "thac-noong-lau",
      coverImage: "https://untrusted.example/cover.jpg",
      gallery: ["https://untrusted.example/gallery.jpg"],
      imageStatus: "missing" as const,
    };

    const hydrated = applyApprovedTourismMedia(place, [cover, gallery]);

    expect(hydrated.coverImage).toBe(cover.publicPath);
    expect(hydrated.gallery).toEqual([gallery.publicPath]);
    expect(hydrated.imageStatus).toBe("ready");
    expect(hydrated.mediaAttribution).toEqual([
      expect.objectContaining({ assetId: cover.assetId, credit: cover.credit }),
      expect.objectContaining({ assetId: gallery.assetId, credit: gallery.credit }),
    ]);
  });

  it("publishes only local optimized images from the approved catalog", () => {
    const entities = [...tourismPlaces, ...tourismEvents];
    const ready = entities.filter(({ imageStatus }) => imageStatus === "ready");

    expect(ready).toHaveLength(entities.length);
    expect(
      ready.every(
        ({ coverImage, gallery }) =>
          (!coverImage || coverImage.startsWith("/images/")) &&
          gallery.every((image) => image.startsWith("/images/")),
      ),
    ).toBe(true);
    expect(
      entities.find(({ slug }) => slug === "thac-noong-lau")?.coverImage,
    ).toBe("/images/tourism-map/thac-noong-lau/cover.webp");
  });

  it("provides an approved local cover for every tourism record", () => {
    const entities = [...tourismPlaces, ...tourismEvents];

    expect(entities.filter(({ imageStatus }) => imageStatus === "ready")).toHaveLength(
      entities.length,
    );
    expect(
      entities.every(
        ({ coverImage, mediaAttribution }) =>
          coverImage?.startsWith("/images/tourism-map/") &&
          mediaAttribution?.some(({ role }) => role === "cover"),
      ),
    ).toBe(true);
  });

  it("detects when a committed image no longer matches its manifest", async () => {
    const entry = manifestEntry();
    const issues = await auditTourismMediaFiles([entry], async () => Buffer.from("changed"));

    expect(issues.map(({ code }) => code)).toEqual(
      expect.arrayContaining(["file_hash_mismatch", "file_size_mismatch", "unreadable_image"]),
    );
  });
});
