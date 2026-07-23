export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
export const MAX_VIDEO_SIZE = 250 * 1024 * 1024;

const ALLOWED_MEDIA = {
  "image/avif": { extension: ".avif", mediaType: "image" },
  "image/jpeg": { extension: ".jpg", mediaType: "image" },
  "image/png": { extension: ".png", mediaType: "image" },
  "image/webp": { extension: ".webp", mediaType: "image" },
  "video/mp4": { extension: ".mp4", mediaType: "video" },
  "video/webm": { extension: ".webm", mediaType: "video" },
} as const;

export type AllowedMediaMime = keyof typeof ALLOWED_MEDIA;
export type MediaType = "image" | "video";

export interface ValidatedMediaUpload {
  extension: string;
  mediaType: MediaType;
  mimeType: AllowedMediaMime;
}

function ascii(bytes: Uint8Array, start: number, end: number) {
  return String.fromCharCode(...bytes.slice(start, end));
}

function hasExpectedSignature(bytes: Uint8Array, mimeType: AllowedMediaMime) {
  if (mimeType === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );
  }
  if (mimeType === "image/webp") {
    return ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP";
  }
  if (mimeType === "image/avif") {
    return ascii(bytes, 4, 16).includes("ftypavif");
  }
  if (mimeType === "video/mp4") {
    return ascii(bytes, 4, 8) === "ftyp";
  }
  return (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  );
}

function allowedExtensions(mimeType: AllowedMediaMime): string[] {
  if (mimeType === "image/jpeg") return [".jpg", ".jpeg"];
  return [ALLOWED_MEDIA[mimeType].extension];
}

export async function validateMediaUpload(
  file: File,
): Promise<ValidatedMediaUpload> {
  if (!(file.type in ALLOWED_MEDIA)) {
    throw new Error("Chỉ chấp nhận JPEG, PNG, WebP, AVIF, MP4 hoặc WebM.");
  }

  const mimeType = file.type as AllowedMediaMime;
  const definition = ALLOWED_MEDIA[mimeType];
  const sizeLimit =
    definition.mediaType === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

  if (file.size <= 0 || file.size > sizeLimit) {
    throw new Error(
      definition.mediaType === "video"
        ? "Video phải có dung lượng từ 1 byte đến 250 MB."
        : "Ảnh phải có dung lượng từ 1 byte đến 10 MB.",
    );
  }

  const filename = file.name.toLowerCase();
  if (!allowedExtensions(mimeType).some((extension) => filename.endsWith(extension))) {
    throw new Error("Phần mở rộng tệp không khớp với định dạng khai báo.");
  }

  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  if (!hasExpectedSignature(bytes, mimeType)) {
    throw new Error("Nội dung tệp không khớp với định dạng khai báo.");
  }

  return {
    extension: definition.extension,
    mediaType: definition.mediaType,
    mimeType,
  };
}

export async function validateImageUpload(file: File) {
  const validated = await validateMediaUpload(file);
  if (validated.mediaType !== "image") {
    throw new Error("Tệp đã chọn không phải là ảnh.");
  }
  return validated;
}
