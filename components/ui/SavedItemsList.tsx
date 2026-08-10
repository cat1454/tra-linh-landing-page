"use client";

import { Bookmark, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  readSavedItems,
  SAVED_ITEMS_STORAGE_KEY,
  type SavedItem,
} from "@/components/ui/SaveShareActions";

export function SavedItemsList() {
  const [items, setItems] = useState<SavedItem[] | null>(null);

  useEffect(() => {
    const hydration = window.setTimeout(() => setItems(readSavedItems()), 0);
    return () => window.clearTimeout(hydration);
  }, []);

  function removeItem(id: string) {
    const next = (items ?? []).filter((item) => item.id !== id);
    window.localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(next));
    setItems(next);
  }

  if (items === null) {
    return <p role="status" className="text-[#536258]">Đang mở danh sách đã lưu…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-[#10251A]/10 bg-white/60 p-7 text-center sm:p-10">
        <Bookmark aria-hidden="true" className="mx-auto size-8 text-[#5E7F3B]" />
        <p className="mt-4 font-serif text-2xl">Chưa có nội dung nào được lưu</p>
        <p className="mt-2 text-sm leading-6 text-[#536258]">Hãy lưu một hành trình, cẩm nang hoặc địa điểm để mở lại trên thiết bị này.</p>
        <Link href="/#hanh-trinh" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-[#29452C] px-5 text-sm font-semibold text-white">Khám phá hành trình</Link>
      </div>
    );
  }

  return (
    <ul className="grid gap-4" aria-label="Nội dung đã lưu">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-[#10251A]/10 bg-white/70 p-5">
          <Link href={item.url} className="min-h-11 flex-1 py-2 font-semibold text-[#29452C] underline-offset-4 hover:underline">{item.title}</Link>
          <button type="button" aria-label={`Xóa ${item.title} khỏi mục đã lưu`} onClick={() => removeItem(item.id)} className="inline-grid size-11 shrink-0 place-items-center rounded-full border border-[#10251A]/15 text-[#704330] hover:bg-[#FFF4ED] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#704330]"><Trash2 aria-hidden="true" className="size-4" /></button>
        </li>
      ))}
    </ul>
  );
}
