"use client";

export function DeleteRecordButton({ title }: { title: string }) {
  return (
    <button
      className="min-h-11 rounded-full border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50"
      type="submit"
      onClick={(event) => {
        if (!window.confirm(`Xóa “${title}”? Thao tác này không thể hoàn tác.`)) {
          event.preventDefault();
        }
      }}
    >
      Xóa
    </button>
  );
}

