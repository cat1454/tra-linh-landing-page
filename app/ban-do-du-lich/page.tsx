import type { Metadata } from "next";

import { TourismMapSection } from "@/components/tourism-map/TourismMapSection";

export const metadata: Metadata = {
  title: "Bản đồ du lịch Trà Linh",
  description:
    "Khám phá các điểm đến thiên nhiên, văn hóa, sâm Ngọc Linh và đời sống cộng đồng tại vùng Trà Linh.",
  alternates: { canonical: "/ban-do-du-lich" },
};

export default function TourismMapPage() {
  return (
    <main id="noi-dung-chinh" className="bg-[#EEF1E9] pt-20">
      <TourismMapSection eager mode="explorer" />
    </main>
  );
}
