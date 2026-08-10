import type { Metadata } from "next";
import Link from "next/link";

import { SiteSearch } from "@/components/search/SiteSearch";

export const metadata: Metadata = { title: "Tìm kiếm", description: "Tìm hành trình, cẩm nang, thời tiết và thông tin liên hệ Trà Linh.", alternates: { canonical: "/tim-kiem" } };

export default function SearchPage() {
  return <main id="noi-dung-chinh" className="min-h-screen bg-[#EEF1E9] px-5 pb-20 pt-32 sm:px-8 lg:px-16"><div className="mx-auto max-w-5xl"><Link href="/" className="text-sm text-[#536258] underline underline-offset-4">Về trang chủ</Link><div className="mt-10"><SiteSearch /></div></div></main>;
}
