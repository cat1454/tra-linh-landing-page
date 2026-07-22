const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGES = {
  "image/avif": { extension: ".avif", signature: "avif" },
  "image/jpeg": { extension: ".jpg", signature: "jpeg" },
  "image/png": { extension: ".png", signature: "png" },
  "image/webp": { extension: ".webp", signature: "webp" },
} as const;

export type AllowedImageMime = keyof typeof ALLOWED_IMAGES;

export interface ValidatedImageUpload {
  extension: string;
  mimeType: AllowedImageMime;
}

function hasExpectedSignature(bytes: Uint8Array, mimeType: AllowedImageMime) {
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
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return String.fromCharCode(...bytes.slice(4, 12)).includes("ftypavif");
}

export async function validateImageUpload(
  file: File,
): Promise<ValidatedImageUpload> {
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE) {
    throw new Error("Ảnh phải có dung lượng từ 1 byte đến 5 MB.");
  }

  if (!(file.type in ALLOWED_IMAGES)) {
    throw new Error("Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc AVIF.");
  }

  const mimeType = file.type as AllowedImageMime;
  const expected = ALLOWED_IMAGES[mimeType];
  const filename = file.name.toLowerCase();
  const allowedExtensions =
    mimeType === "image/jpeg" ? [".jpg", ".jpeg"] : [expected.extension];

  if (!allowedExtensions.some((extension) => filename.endsWith(extension))) {
    throw new Error("Phần mở rộng tệp không khớp với loại ảnh.");
  }

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  if (!hasExpectedSignature(bytes, mimeType)) {
    throw new Error("Nội dung tệp không khớp với định dạng ảnh khai báo.");
  }

  return { extension: expected.extension, mimeType };
}
