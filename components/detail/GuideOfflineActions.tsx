"use client";

import { Printer } from "lucide-react";

import { SaveShareActions } from "@/components/ui/SaveShareActions";
import type { Guide } from "@/lib/content/types";

export function GuideOfflineActions({ guide }: { guide: Guide }) {
  return (
    <section aria-labelledby="guide-offline-heading" className="my-10 rounded-3xl border border-[#10251A]/10 bg-[#EEE3CB]/55 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3D5133]">Mang theo khi không có mạng</p>
          <h2 id="guide-offline-heading" className="mt-2 font-serif text-3xl">Lưu cẩm nang ngoại tuyến</h2>
        </div>
        <button type="button" onClick={() => window.print()} className="no-print inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/25 bg-white/70 px-4 text-sm font-semibold text-[#29452C] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29452C]"><Printer aria-hidden="true" className="size-4" /> In hoặc lưu PDF</button>
      </div>
      <p className="mt-5 max-w-2xl text-sm leading-6 text-[#536258]">Bản in chứa nội dung, nguồn và ngày cập nhật hiện có. Hãy xác nhận thời tiết và điều kiện đường ngay trước khi khởi hành.</p>
      <SaveShareActions item={{ id: `guide:${guide.slug}`, title: guide.title, url: `/cam-nang/${guide.slug}` }} saveLabel="Lưu cẩm nang" savedLabel="Đã lưu cẩm nang" />
    </section>
  );
}
