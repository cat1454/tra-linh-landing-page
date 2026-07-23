import { describe, expect, it } from "vitest";

import {
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  validateMediaUpload,
} from "@/lib/supabase/uploads";

function fileWithBytes(
  name: string,
  type: string,
  bytes: number[],
  size = bytes.length,
) {
  const prefix = new Uint8Array(bytes);
  const payload =
    size === bytes.length
      ? prefix
      : new Blob([prefix, new Uint8Array(size - bytes.length)]);
  return new File([payload], name, { type });
}

describe("CMS media upload validation", () => {
  it("accepts a valid image up to 10 MB", async () => {
    const file = fileWithBytes(
      "cover.webp",
      "image/webp",
      [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50],
      MAX_IMAGE_SIZE,
    );

    await expect(validateMediaUpload(file)).resolves.toEqual({
      extension: ".webp",
      mediaType: "image",
      mimeType: "image/webp",
    });
  });

  it("accepts MP4 and WebM videos up to 250 MB", async () => {
    const mp4 = fileWithBytes(
      "hero.mp4",
      "video/mp4",
      [0, 0, 0, 24, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d],
    );
    const webm = fileWithBytes(
      "hero.webm",
      "video/webm",
      [0x1a, 0x45, 0xdf, 0xa3],
    );

    await expect(validateMediaUpload(mp4)).resolves.toMatchObject({
      extension: ".mp4",
      mediaType: "video",
    });
    await expect(validateMediaUpload(webm)).resolves.toMatchObject({
      extension: ".webm",
      mediaType: "video",
    });
    expect(MAX_VIDEO_SIZE).toBe(250 * 1024 * 1024);
  });

  it("rejects oversized, mismatched, and unsupported files", async () => {
    const oversized = {
      name: "large.mp4",
      type: "video/mp4",
      size: MAX_VIDEO_SIZE + 1,
      slice: () => new Blob(),
    } as File;
    const forged = fileWithBytes("fake.mp4", "video/mp4", [1, 2, 3, 4, 5, 6, 7, 8]);
    const unsupported = fileWithBytes("clip.mov", "video/quicktime", [0, 1, 2, 3]);

    await expect(validateMediaUpload(oversized)).rejects.toThrow();
    await expect(validateMediaUpload(forged)).rejects.toThrow();
    await expect(validateMediaUpload(unsupported)).rejects.toThrow();
  });
});
