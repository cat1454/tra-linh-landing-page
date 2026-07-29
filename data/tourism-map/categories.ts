import type {
  TourismCategory,
  TourismExplorerCategoryOption,
  TourismPlaceCategory,
} from "./types";

export const TOURISM_CATEGORY_COLORS: Record<TourismPlaceCategory, string> = {
  ginseng: "#B58A58",
  culture: "#9A725F",
  community: "#6E8E70",
  nature: "#6D9DB0",
  shopping: "#BC7D42",
  administrative: "#667085",
};

export const tourismCategories: TourismCategory[] = [
  { key: "all", label: "Tất cả", shortLabel: "Tất cả", color: "#29452C" },
  { key: "ginseng", label: "Sâm & dược liệu", shortLabel: "Sâm", color: TOURISM_CATEGORY_COLORS.ginseng },
  { key: "culture", label: "Văn hóa", shortLabel: "Văn hóa", color: TOURISM_CATEGORY_COLORS.culture },
  { key: "community", label: "Cơ sở lưu trú", shortLabel: "Lưu trú", color: TOURISM_CATEGORY_COLORS.community },
  { key: "nature", label: "Thiên nhiên", shortLabel: "Thiên nhiên", color: TOURISM_CATEGORY_COLORS.nature },
  { key: "shopping", label: "Chợ & đặc sản", shortLabel: "Chợ", color: TOURISM_CATEGORY_COLORS.shopping },
  { key: "administrative", label: "Dịch vụ công", shortLabel: "Dịch vụ", color: TOURISM_CATEGORY_COLORS.administrative },
  { key: "nearby", label: "Lân cận", shortLabel: "Lân cận", color: "#7B6CA8" },
];

export const tourismExplorerCategories: TourismExplorerCategoryOption[] = [
  { key: "all", label: "Tất cả", shortLabel: "Tất cả", color: "#29452C" },
  {
    key: "ginseng",
    label: "Sâm & dược liệu",
    shortLabel: "Sâm",
    color: TOURISM_CATEGORY_COLORS.ginseng,
  },
  {
    key: "culture_community",
    label: "Văn hóa & cơ sở lưu trú",
    shortLabel: "Văn hóa",
    color: TOURISM_CATEGORY_COLORS.culture,
  },
  {
    key: "nature",
    label: "Thiên nhiên",
    shortLabel: "Thiên nhiên",
    color: TOURISM_CATEGORY_COLORS.nature,
  },
  {
    key: "shopping",
    label: "Chợ & đặc sản",
    shortLabel: "Chợ",
    color: TOURISM_CATEGORY_COLORS.shopping,
  },
  {
    key: "administrative",
    label: "Tiện ích",
    shortLabel: "Tiện ích",
    color: TOURISM_CATEGORY_COLORS.administrative,
  },
];

export function getTourismCategoryLabel(category: TourismPlaceCategory): string {
  return tourismCategories.find((item) => item.key === category)?.label ?? category;
}
