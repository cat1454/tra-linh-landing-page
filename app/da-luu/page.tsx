import type { Metadata } from "next";

import { SavedItemsList } from "@/components/ui/SavedItemsList";

export const metadata: Metadata = {
  title: "Nội dung đã lưu",
  description: "Mở lại các hành trình, cẩm nang và địa điểm đã lưu trên thiết bị này.",
  alternates: { canonical: "/da-luu" },
  robots: { index: false, follow: true },
};

export default function SavedItemsPage() {
  return (
    <main id="noi-dung-chinh" className="min-h-[70vh] bg-[#EEF1E9] px-5 pb-20 pt-32 text-[#10251A] sm:px-8 lg:px-16">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5E7F3B]">Lưu trên thiết bị</p>
        <h1 className="mt-4 font-serif text-5xl sm:text-7xl">Nội dung đã lưu</h1>
        <p className="mt-5 max-w-2xl leading-7 text-[#536258]">Danh sách chỉ nằm trong trình duyệt hiện tại, không cần tài khoản và không gửi dữ liệu cá nhân lên máy chủ.</p>
        <div className="mt-10"><SavedItemsList /></div>
      </div>
    </main>
  );
}
