import type { ContentStatus, ContentTableName } from "@/lib/supabase/types";

export interface AdminNavItem {
  label: string;
  description: string;
  table?: ContentTableName;
  view?: "contacts";
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export interface AdminMediaPreviewOption {
  id: string;
  title: string;
  mediaType: "image" | "video";
  previewUrl?: string;
  posterUrl?: string;
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Trang chủ",
    items: [
      {
        table: "page_sections",
        label: "Các vùng trên trang chủ",
        description: "Tiêu đề, mô tả và nút bấm từng vùng",
      },
      {
        table: "site_settings",
        label: "Thông tin chung & liên hệ",
        description: "Tên website, điện thoại, email và SEO",
      },
      {
        table: "hero_slides",
        label: "Ảnh nền đầu trang",
        description: "Hình ảnh nổi bật khi mở website",
      },
    ],
  },
  {
    label: "Bài viết & sản phẩm",
    items: [
      { table: "stories", label: "Câu chuyện", description: "Các chương giới thiệu Trà Linh" },
      { table: "journeys", label: "Hành trình", description: "Điểm đến và trải nghiệm" },
      { table: "ginseng_story_steps", label: "Vùng sâm", description: "Các bước trong câu chuyện sâm" },
      { table: "culture_stories", label: "Văn hóa", description: "Văn hóa và cộng đồng Xơ Đăng" },
      { table: "local_products", label: "Sản vật địa phương", description: "Ẩm thực, dược liệu và nông sản" },
      { table: "ginseng_products", label: "Sản phẩm sâm", description: "Các sản phẩm từ sâm Ngọc Linh" },
      { table: "travel_guides", label: "Cẩm nang", description: "Thông tin chuẩn bị chuyến đi" },
    ],
  },
  {
    label: "Ảnh & video",
    items: [
      {
        table: "media_assets",
        label: "Kho ảnh & video",
        description: "Tải lên và quản lý media dùng trên website",
      },
    ],
  },
  {
    label: "Khách hàng",
    items: [
      {
        view: "contacts",
        label: "Tin nhắn liên hệ",
        description: "Các yêu cầu gửi từ website",
      },
    ],
  },
];

const SECTION_ANCHORS: Record<string, string> = {
  hero: "#dau-trang",
  identity: "#dau-trang",
  story: "#cau-chuyen",
  journeys: "#hanh-trinh",
  ginseng: "#vung-sam",
  culture: "#van-hoa",
  local_products: "#san-vat",
  products: "#san-pham-sam",
  guides: "#cam-nang",
  final_cta: "#lien-he",
  contact: "#lien-he",
};

const TABLE_ANCHORS: Partial<Record<ContentTableName, string>> = {
  site_settings: "#dau-trang",
  hero_slides: "#dau-trang",
  stories: "#cau-chuyen",
  journeys: "#hanh-trinh",
  ginseng_story_steps: "#vung-sam",
  culture_stories: "#van-hoa",
  local_products: "#san-vat",
  ginseng_products: "#san-pham-sam",
  travel_guides: "#cam-nang",
};

export function getAdminPublicAnchor(
  table: ContentTableName,
  sectionKey?: unknown,
): string {
  if (table === "page_sections" && typeof sectionKey === "string") {
    return SECTION_ANCHORS[sectionKey] ?? "#dau-trang";
  }
  return TABLE_ANCHORS[table] ?? "#dau-trang";
}

export function getAdminTableLabel(table: ContentTableName): string {
  return (
    ADMIN_NAV_GROUPS.flatMap((group) => group.items)
      .find((item) => item.table === table)?.label ?? "Nội dung"
  );
}

export function resolveEditorialIntent(intent: unknown): ContentStatus {
  if (intent === "save-draft") return "draft";
  if (intent === "publish") return "published";
  throw new Error("invalid-editorial-intent");
}

