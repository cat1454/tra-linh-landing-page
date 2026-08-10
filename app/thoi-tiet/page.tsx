import type { Metadata } from "next";
import Link from "next/link";

import { WeatherForecastPanel } from "@/components/weather/WeatherForecastPanel";

export const metadata: Metadata = {
  title: "Dự báo thời tiết Trà Linh",
  description: "Theo dõi dự báo thời tiết 7 ngày tại trung tâm xã Trà Linh để chuẩn bị hành trình vùng cao an toàn.",
  alternates: { canonical: "/thoi-tiet" },
};

export default function WeatherPage() {
  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#EEF1E9] px-5 pb-20 pt-32 sm:px-8 lg:px-16">
      <div className="mx-auto max-w-[1380px]">
        <nav aria-label="Đường dẫn" className="text-sm text-[#536258]"><Link href="/" className="underline underline-offset-4">Trang chủ</Link> <span aria-hidden="true">/</span> Thời tiết</nav>
        <header className="max-w-3xl py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5E7F3B]">Chuẩn bị hành trình</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-[#10251A] sm:text-6xl">Thời tiết Trà Linh</h1>
          <p className="mt-5 text-lg leading-8 text-[#405347]">Kiểm tra dự báo trước khi đi và luôn xác nhận điều kiện đường, mưa và sương mù với đầu mối địa phương.</p>
        </header>
        <WeatherForecastPanel />
      </div>
    </main>
  );
}
