import type { Metadata } from "next";
import Link from "next/link";

import { TourismPlaceIntakeForm } from "@/components/tourism-map/TourismPlaceIntakeForm";
import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";

export const metadata: Metadata = {
  title: "Nhập dữ liệu địa điểm du lịch",
  description: "Biểu mẫu cục bộ để chuẩn bị dữ liệu cho bản đồ du lịch Trà Linh.",
  robots: { index: false, follow: false },
};

const entities = [...tourismPlaces, ...tourismEvents].sort(
  (left, right) => left.sortOrder - right.sortOrder,
);

export default function TourismPlaceIntakePage() {
  return (
    <main
      id="noi-dung-chinh"
      data-admin-root
      className="min-h-screen bg-[#EEF1E9] px-4 py-8 text-[#10251A] sm:px-6 sm:py-12"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5E7F3B]">
              Bản đồ du lịch Trà Linh
            </p>
            <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold sm:text-5xl">
              Nhập thủ công từng địa điểm
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-[#10251A]/68">
              Chọn địa điểm, điền phần bạn đã xác minh và lưu bản nháp. Dữ liệu không được gửi lên máy chủ hay tự động xuất bản.
            </p>
          </div>
          <Link
            href="/ban-do-du-lich"
            className="inline-flex min-h-11 items-center rounded-full border border-[#29452C]/20 bg-white px-5 text-sm font-semibold text-[#29452C]"
          >
            Xem bản đồ hiện tại
          </Link>
        </div>

        <TourismPlaceIntakeForm entities={entities} />
      </div>
    </main>
  );
}
