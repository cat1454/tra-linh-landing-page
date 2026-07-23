"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

export function DeleteRecordButton({
  title,
  isLastRecord = false,
}: {
  title: string;
  isLastRecord?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) cancelRef.current?.focus();
  }, [open]);

  return (
    <>
      <button
        className="min-h-11 rounded-full border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
        type="button"
        onClick={() => setOpen(true)}
      >
        Xóa nội dung
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#07100c]/65 p-4" role="presentation">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-description"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <AlertTriangle className="size-8 text-red-700" aria-hidden="true" />
            <h2 id="delete-title" className="mt-4 font-serif text-2xl">Xóa “{title}”?</h2>
            <p id="delete-description" className="mt-3 text-sm leading-6 text-[#10251a]/70">
              Nội dung sẽ biến mất khỏi danh sách và không thể khôi phục.
              {isLastRecord
                ? " Đây là nội dung cuối cùng trong nhóm, nên website có thể hiển thị nội dung mẫu thay thế."
                : " Nếu chưa chắc chắn, hãy chọn “Giữ lại nội dung”."}
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-12 rounded-full border border-[#10251a]/20 px-5 font-semibold"
              >
                Giữ lại nội dung
              </button>
              <button
                type="submit"
                className="min-h-12 rounded-full bg-red-700 px-5 font-semibold text-white"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
