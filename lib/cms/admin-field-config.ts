export type PageSectionFieldKey =
  | "eyebrow"
  | "title"
  | "description"
  | "secondary_text"
  | "cta_label"
  | "cta_href"
  | "badges"
  | "stats"
  | "media_asset_id";

const COMMON_HEADING: PageSectionFieldKey[] = [
  "eyebrow",
  "title",
  "description",
];

const SECTION_FIELDS: Record<string, PageSectionFieldKey[]> = {
  hero: [...COMMON_HEADING, "secondary_text", "cta_label", "cta_href", "badges"],
  identity: ["stats"],
  story: [...COMMON_HEADING, "secondary_text"],
  journeys: COMMON_HEADING,
  ginseng: [...COMMON_HEADING, "secondary_text"],
  culture: [...COMMON_HEADING, "secondary_text"],
  local_products: COMMON_HEADING,
  products: COMMON_HEADING,
  guides: [...COMMON_HEADING, "secondary_text"],
  final_cta: [...COMMON_HEADING, "cta_label", "cta_href", "media_asset_id"],
  contact: COMMON_HEADING,
};

const SECTION_HELP: Record<string, string> = {
  hero: "Phần lớn đầu tiên khi khách mở website.",
  identity: "4 ô giới thiệu ngắn nằm ngay dưới ảnh đầu trang.",
  story: "Tiêu đề và lời giới thiệu cho khu vực Câu chuyện Trà Linh.",
  journeys: "Tiêu đề nằm trên danh sách các hành trình.",
  ginseng: "Tiêu đề và lời dẫn cho câu chuyện vùng sâm.",
  culture: "Tiêu đề và lời dẫn cho khu vực Văn hóa Xơ Đăng.",
  local_products: "Tiêu đề nằm trên danh sách sản vật địa phương.",
  products: "Tiêu đề nằm trên danh sách sản phẩm sâm.",
  guides: "Tiêu đề và lưu ý nằm cạnh danh sách cẩm nang.",
  final_cta: "Lời mời và nút bấm lớn ở gần cuối trang.",
  contact: "Tiêu đề nằm ngay trên biểu mẫu liên hệ cuối trang.",
};

export function getPageSectionFieldKeys(sectionKey: string): PageSectionFieldKey[] {
  return [...(SECTION_FIELDS[sectionKey] ?? COMMON_HEADING)];
}

export function getPageSectionHelp(sectionKey: string): string {
  return SECTION_HELP[sectionKey] ?? "Nội dung giới thiệu của khu vực này trên trang chủ.";
}

export function slugifyVietnamese(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
