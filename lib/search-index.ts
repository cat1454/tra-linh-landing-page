import { JOURNEY_CARDS, TRAVEL_GUIDES } from "@/lib/content/landing-data";

export interface SiteSearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  category: string;
}

const coreEntries: SiteSearchResult[] = [
  { id: "weather", title: "Dự báo thời tiết Trà Linh", description: "Dự báo 7 ngày, nhiệt độ, khả năng mưa và lưu ý vùng cao.", href: "/thoi-tiet", category: "Chuẩn bị" },
  { id: "map", title: "Bản đồ du lịch", description: "Khám phá các địa điểm và thông tin tiếp cận tại Trà Linh.", href: "/ban-do-du-lich", category: "Bản đồ" },
  { id: "faq", title: "Câu hỏi thường gặp", description: "Giải đáp về lịch trình, liên hệ, thời tiết và quy tắc tham quan.", href: "/cau-hoi-thuong-gap", category: "Hỗ trợ" },
  { id: "contact", title: "Liên hệ địa phương", description: "Facebook, điện thoại và email chính thức để xác nhận hành trình.", href: "/#lien-he", category: "Liên hệ" },
  { id: "saved", title: "Nội dung đã lưu", description: "Mở lại hành trình, cẩm nang và địa điểm đã lưu trên thiết bị.", href: "/da-luu", category: "Cá nhân hóa" },
];

export const SITE_SEARCH_INDEX: SiteSearchResult[] = [
  ...coreEntries,
  ...JOURNEY_CARDS.map((journey) => ({ id: journey.id, title: journey.title, description: journey.shortDescription, href: `/hanh-trinh/${journey.slug}`, category: "Hành trình" })),
  ...TRAVEL_GUIDES.map((guide) => ({ id: guide.id, title: guide.title, description: guide.shortDescription, href: `/cam-nang/${guide.slug}`, category: "Cẩm nang" })),
];

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLocaleLowerCase("vi");
}

export function searchSiteContent(query: string): SiteSearchResult[] {
  const normalizedQuery = normalize(query.trim());
  if (!normalizedQuery) return SITE_SEARCH_INDEX;
  const terms = normalizedQuery.split(/\s+/);
  return SITE_SEARCH_INDEX.filter((entry) => {
    const haystack = normalize(`${entry.title} ${entry.description} ${entry.category}`);
    return terms.every((term) => haystack.includes(term));
  });
}
