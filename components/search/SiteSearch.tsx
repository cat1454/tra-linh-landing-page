"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { searchSiteContent } from "@/lib/search-index";

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchSiteContent(query), [query]);

  return (
    <section aria-labelledby="search-heading">
      <h1 id="search-heading" className="font-serif text-4xl text-[#10251A] sm:text-6xl">Tìm thông tin Trà Linh</h1>
      <label className="mt-8 flex min-h-14 items-center gap-3 rounded-2xl border border-[#10251A]/15 bg-white px-5 shadow-sm focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#5E7F3B]">
        <Search aria-hidden="true" className="size-5 text-[#5E7F3B]" />
        <span className="sr-only">Từ khóa tìm kiếm</span>
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: thời tiết, trekking, liên hệ…" className="min-w-0 flex-1 bg-transparent py-4 outline-none" />
      </label>
      <p aria-live="polite" className="mt-4 text-sm text-[#536258]">{results.length} kết quả</p>
      {results.length ? (
        <ul className="mt-7 grid gap-4 sm:grid-cols-2">
          {results.map((result) => (
            <li key={result.id}><Link href={result.href} className="block h-full rounded-2xl border border-[#10251A]/10 bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]"><span className="text-xs font-semibold uppercase tracking-wide text-[#5E7F3B]">{result.category}</span><h2 className="mt-2 font-serif text-2xl text-[#10251A]">{result.title}</h2><p className="mt-3 text-sm leading-6 text-[#405347]">{result.description}</p></Link></li>
          ))}
        </ul>
      ) : <div className="mt-7 rounded-2xl border border-[#10251A]/10 bg-white p-8 text-[#405347]">Không tìm thấy nội dung phù hợp. Hãy thử từ khóa ngắn hơn hoặc liên hệ đầu mối địa phương.</div>}
    </section>
  );
}
