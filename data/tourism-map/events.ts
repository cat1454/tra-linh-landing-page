import type { TourismPlace } from "./types";
import { sanitizeTourismPlaceMedia } from "./media";

const tourismEventRecords: TourismPlace[] = [
  {
    id: "event-tra-linh-market",
    slug: "su-kien-cho-phien-tra-linh",
    name: "Chợ phiên Trà Linh",
    shortDescription: "Không gian giới thiệu sâm, dược liệu, nông sản, ẩm thực và sản phẩm thủ công của người dân địa phương.",
    description:
      "Chợ phiên Trà Linh được tổ chức định kỳ vào thứ Bảy và Chủ nhật tuần đầu tiên mỗi tháng tại khu Nhà văn hóa thôn 2 – Đền thờ Thần Sâm, làng Kon Pin. Chợ phiên là nơi giao thương kết nối giữa vùng cao Trà Linh và du khách, giới thiệu các sản phẩm sâm Ngọc Linh tươi, dược liệu núi rừng, nông sản sạch và đồ thủ công truyền thống của đồng bào Xơ Đăng.",
    category: "shopping",
    entityType: "recurring_event",
    scope: "inside_tra_linh",
    latitude: 15.0372,
    longitude: 108.0215,
    coordinateStatus: "verified",
    googleMapsUrl: "https://www.google.com/maps?q=15.0372,108.0215",
    currentAddress:
      "Tổ chức tại khu Nhà văn hóa thôn 2 – Đền thờ Thần Sâm, làng Kon Pin, xã Trà Linh",
    legacyAddress: null,
    coverImage: "https://tralinh.danang.gov.vn/documents/112/4350/cho-phien-tra-linh.jpg",
    gallery: [
      "https://tralinh.danang.gov.vn/documents/112/4350/cho-phien-tra-linh.jpg",
      "https://tralinh.danang.gov.vn/documents/119/4370/cho-phien-thang-4.jpg",
      "https://baodanang.vn/dataimages/202308/zoom/cho_phien_vung_cao.jpg",
    ],
    imageAlt: "Toàn cảnh Chợ phiên Trà Linh tại Kon Pin",
    imageStatus: "ready",
    openingHours: "07:00 – 17:00 (Thứ Bảy & Chủ Nhật tuần đầu tiên hàng tháng)",
    ticketPrice: "Vào cửa tự do (Miễn phí)",
    visitorAccess: "event_only",
    featured: true,
    published: true,
    sortOrder: 4,
    relatedPlaceSlug: "khong-gian-van-hoa-kon-pin-den-tho-than-sam",
    sourceUrls: [
      "https://tralinh.danang.gov.vn/chi-tiet-tin/group/112/nid/4350/ubnd-xa-tra-linh-to-chuc-hop-trien-khai-cho-phien-nam-2-26",
    ],
  },
  {
    id: "event-ngoc-linh-ginseng-market",
    slug: "phien-cho-sam-ngoc-linh",
    name: "Phiên chợ Sâm Ngọc Linh",
    shortDescription: "Phiên chợ giới thiệu sâm Ngọc Linh, dược liệu và sản phẩm địa phương tại xã Nam Trà My.",
    description:
      "Phiên chợ Sâm Ngọc Linh diễn ra định kỳ từ ngày 1 đến ngày 3 hàng tháng tại Trung tâm tổ chức sự kiện Sâm Ngọc Linh (thôn 1, Nam Trà My). Đây là thị trường giao dịch sâm Ngọc Linh củ tươi và dược liệu lớn nhất khu vực, thu hút đông đảo thương lái, nhà nghiên cứu và du khách thập phương.",
    category: "shopping",
    entityType: "recurring_event",
    scope: "nearby",
    latitude: 15.0645,
    longitude: 108.113,
    coordinateStatus: "verified",
    googleMapsUrl: "https://www.google.com/maps?q=15.0645,108.113",
    currentAddress: "Tại Trung tâm tổ chức sự kiện Sâm Ngọc Linh, thôn 1, xã Nam Trà My",
    legacyAddress: "Khu trung tâm Trà Mai, huyện Nam Trà My, tỉnh Quảng Nam",
    coverImage: "/images/tourism-map/ngoc-linh-ginseng-market.webp",
    gallery: [
      "/images/tourism-map/ngoc-linh-ginseng-market.webp",
      "/images/tourism-map/ngoc-linh-market-products.webp",
      "https://namtramy.danang.gov.vn/documents/113/4289/gian-hang-sam-tuoi.jpg",
    ],
    imageAlt: "Khu trưng bày sâm tại Phiên chợ Sâm Ngọc Linh ở Nam Trà My",
    imageStatus: "ready",
    openingHours: "07:30 – 17:30 (Từ ngày 01 đến ngày 03 hàng tháng)",
    ticketPrice: "Vào cửa tự do (Miễn phí)",
    visitorAccess: "event_only",
    featured: false,
    published: true,
    sortOrder: 13,
    relatedPlaceSlug: "trung-tam-to-chuc-su-kien-sam-ngoc-linh",
    sourceUrls: [
      "https://namtramy.danang.gov.vn/chi-tiet-tin/group/113/nid/4289/le-hoi-sam-ngoc-linh-lan-thu-vii--nam-2-25-se-dien-ra-tu-ngay-1--3-8",
    ],
  },
];

export const tourismEvents = tourismEventRecords.map(sanitizeTourismPlaceMedia);

export function getTourismEntities(): TourismPlace[] {
  return [...tourismEvents];
}
