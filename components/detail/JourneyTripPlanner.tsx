"use client";

import { CalendarDays, Gauge, Printer, Route } from "lucide-react";

import { SaveShareActions } from "@/components/ui/SaveShareActions";
import type { Journey } from "@/lib/content/types";

export function JourneyTripPlanner({ journey }: { journey: Journey }) {
  return (
    <section aria-labelledby="trip-planner-heading" className="trip-planner my-10 rounded-3xl border border-[#10251A]/10 bg-[#EEE3CB]/55 p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3D5133]">Chuẩn bị trước khi đi</p>
          <h2 id="trip-planner-heading" className="mt-2 font-serif text-3xl text-[#10251A]">Thông tin chuyến đi</h2>
        </div>
        <button type="button" onClick={() => window.print()} className="no-print inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/25 bg-white/70 px-4 text-sm font-semibold text-[#29452C] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29452C]">
          <Printer aria-hidden="true" className="size-4" /> In hoặc lưu PDF
        </button>
      </div>
      <dl className="mt-7 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white/70 p-4"><dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#536258]"><Gauge aria-hidden="true" className="size-4" /> Độ khó</dt><dd className="mt-2 font-medium text-[#10251A]">{journey.difficultyLabel || "Đang xác minh"}</dd></div>
        <div className="rounded-2xl bg-white/70 p-4"><dt className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#536258]"><CalendarDays aria-hidden="true" className="size-4" /> Mùa phù hợp</dt><dd className="mt-2 font-medium text-[#10251A]">{journey.bestSeasonLabel || "Đang xác minh"}</dd></div>
      </dl>
      <h3 className="mt-8 inline-flex items-center gap-2 font-serif text-2xl text-[#10251A]"><Route aria-hidden="true" className="size-5 text-[#5E7F3B]" /> Lịch trình gợi ý</h3>
      <ol className="mt-5 grid gap-4">
        {journey.itinerary.map((step, index) => (
          <li key={step.title} className="grid grid-cols-[2rem_1fr] gap-3 rounded-2xl border border-[#10251A]/8 bg-white/60 p-4">
            <span aria-hidden="true" className="grid size-8 place-items-center rounded-full bg-[#29452C] text-sm font-semibold text-white">{index + 1}</span>
            <div><h4 className="font-semibold text-[#10251A]">{step.title}</h4><p className="mt-1 text-sm leading-6 text-[#405347]">{step.description}</p></div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm leading-6 text-[#536258]">Trạng thái xác minh: {journey.verificationStatus === "verified" ? "Đã đối chiếu với nguồn nội dung công khai" : "Đang xác minh"}. Không hiển thị quãng đường hoặc chi phí khi chưa có dữ liệu chính thức.</p>
      <SaveShareActions item={{ id: `journey:${journey.slug}`, title: journey.title, url: `/hanh-trinh/${journey.slug}` }} />
    </section>
  );
}
