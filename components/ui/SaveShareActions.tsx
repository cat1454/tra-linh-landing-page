"use client";

import { Bookmark, BookmarkCheck, Share2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export const SAVED_ITEMS_STORAGE_KEY = "tra-linh:saved-items";

export interface SavedItem {
  id: string;
  title: string;
  url: string;
}

export function readSavedItems(): SavedItem[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(SAVED_ITEMS_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is SavedItem => Boolean(item && typeof item === "object" && "id" in item && "title" in item && "url" in item)) : [];
  } catch {
    return [];
  }
}

type SaveShareActionsProps = {
  item: SavedItem;
  saveLabel?: string;
  savedLabel?: string;
};

export function SaveShareActions({
  item,
  saveLabel = "Lưu hành trình",
  savedLabel = "Đã lưu",
}: SaveShareActionsProps) {
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const hydration = window.setTimeout(() => {
      setSaved(readSavedItems().some((savedItem) => savedItem.id === item.id));
    }, 0);
    return () => window.clearTimeout(hydration);
  }, [item.id]);

  function toggleSaved() {
    const items = readSavedItems();
    const exists = items.some((savedItem) => savedItem.id === item.id);
    const next = exists ? items.filter((savedItem) => savedItem.id !== item.id) : [...items, item];
    window.localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(next));
    setSaved(!exists);
    setMessage(exists ? "Đã bỏ khỏi danh sách lưu" : "Đã lưu trên thiết bị này");
  }

  async function share() {
    const url = new URL(item.url, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, url });
        setMessage("Đã mở bảng chia sẻ");
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Đã sao chép liên kết");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") setMessage("Không thể chia sẻ lúc này");
    }
  }

  return (
    <div className="no-print mt-6 flex flex-wrap items-center gap-3">
      <button type="button" aria-pressed={saved} onClick={toggleSaved} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/25 bg-white/75 px-4 text-sm font-semibold text-[#29452C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29452C]">
        {saved ? <BookmarkCheck aria-hidden="true" className="size-4" /> : <Bookmark aria-hidden="true" className="size-4" />} {saved ? savedLabel : saveLabel}
      </button>
      <button type="button" onClick={() => void share()} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#29452C]/25 bg-white/75 px-4 text-sm font-semibold text-[#29452C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29452C]"><Share2 aria-hidden="true" className="size-4" /> Chia sẻ</button>
      <Link href="/da-luu" className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-[#49672D] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#29452C]">Xem mục đã lưu</Link>
      <span aria-live="polite" className="text-sm text-[#536258]">{message}</span>
    </div>
  );
}
