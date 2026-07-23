"use client";

import { useFormStatus } from "react-dom";

export function EditorialActions({
  currentlyPublished = false,
}: {
  currentlyPublished?: boolean;
}) {
  const { pending, data } = useFormStatus();
  const intent = data?.get("intent");

  return (
    <div className="sticky bottom-3 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#10251a]/10 bg-white/95 p-3 shadow-lg backdrop-blur sm:col-span-2">
      <p aria-live="polite" className="text-xs leading-5 text-[#10251a]/60 sm:text-sm">
        {pending
          ? intent === "publish"
            ? "Đang xuất bản lên website…"
            : "Đang lưu bản nháp…"
          : currentlyPublished
            ? "Lưu nháp sẽ tạm gỡ nội dung này khỏi website. Xuất bản để áp dụng thay đổi."
            : "Lưu nháp để kiểm tra trước, hoặc xuất bản ngay lên website."}
      </p>
      <div className="flex flex-1 justify-end gap-2 sm:flex-none">
        <button
          type="submit"
          name="intent"
          value="save-draft"
          disabled={pending}
          className="min-h-12 flex-1 rounded-full border border-[#10251a]/20 bg-white px-5 font-semibold disabled:cursor-wait disabled:opacity-55 sm:flex-none"
        >
          {pending && intent !== "publish"
            ? "Đang lưu…"
            : currentlyPublished
              ? "Gỡ xuống & lưu nháp"
              : "Lưu nháp"}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending}
          className="min-h-12 flex-1 rounded-full bg-[#5e7f3b] px-5 font-semibold text-white disabled:cursor-wait disabled:opacity-55 sm:flex-none"
        >
          {pending && intent === "publish" ? "Đang xuất bản…" : "Xuất bản"}
        </button>
      </div>
    </div>
  );
}
