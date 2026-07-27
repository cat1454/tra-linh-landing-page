"use client";

import { Search } from "lucide-react";

import type {
  TourismCategory,
  TourismExplorerCategory,
  TourismExplorerCategoryOption,
  TourismFilterKey,
  TourismMapScope,
} from "@/data/tourism-map/types";

interface TourismFilterBarProps {
  categories: Array<TourismCategory | TourismExplorerCategoryOption>;
  activeFilter?: TourismFilterKey;
  onChange?: (filter: TourismFilterKey) => void;
  activeCategory?: TourismExplorerCategory;
  activeScope?: TourismMapScope;
  query?: string;
  onCategoryChange?: (category: TourismExplorerCategory) => void;
  onScopeChange?: (scope: TourismMapScope) => void;
  onQueryChange?: (query: string) => void;
}

export function TourismFilterBar({
  categories,
  activeFilter,
  onChange,
  activeCategory,
  activeScope,
  query = "",
  onCategoryChange,
  onScopeChange,
  onQueryChange,
}: TourismFilterBarProps) {
  const explorerMode = activeCategory !== undefined;

  return (
    <div className="space-y-3">
      {explorerMode ? (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-1">
          <label className="relative block">
            <span className="sr-only">Tìm địa điểm</span>
            <Search
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-[#29452C]/60"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange?.(event.currentTarget.value)}
              aria-label="Tìm địa điểm"
              placeholder="Tìm địa điểm"
              className="min-h-12 w-full rounded-full border border-[#10251A]/12 bg-white/90 py-3 pl-11 pr-4 text-sm text-[#10251A] shadow-sm outline-none transition placeholder:text-[#10251A]/45 focus:border-[#49672D] focus:ring-2 focus:ring-[#9BBE62]/35"
            />
          </label>
          <div
            className="grid min-w-[240px] grid-cols-2 rounded-full border border-[#10251A]/12 bg-white/80 p-1"
            aria-label="Phạm vi địa điểm"
            role="group"
          >
            {([
              ["inside_tra_linh", "Trong Trà Linh"],
              ["nearby", "Lân cận"],
            ] as const).map(([scope, label]) => {
              const active = scope === activeScope;
              return (
                <button
                  key={scope}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onScopeChange?.(scope)}
                  className={`min-h-10 rounded-full px-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] ${
                    active ? "bg-[#29452C] text-white shadow-sm" : "text-[#29452C]"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="relative">
        <div
          aria-label="Lọc địa điểm du lịch"
          className="tourism-scrollbar flex snap-x gap-2 overflow-x-auto pb-2 pr-8 lg:flex-wrap lg:overflow-visible lg:pr-0"
          role="group"
        >
          {categories.map((category) => {
            const active = explorerMode
              ? category.key === activeCategory
              : category.key === activeFilter;
            return (
              <button
                key={category.key}
                type="button"
                aria-label={category.label}
                aria-pressed={active}
                onClick={() => {
                  if (explorerMode) {
                    onCategoryChange?.(category.key as TourismExplorerCategory);
                  } else {
                    onChange?.(category.key as TourismFilterKey);
                  }
                }}
                className={`min-h-11 shrink-0 snap-start rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] lg:min-h-10 lg:px-3 lg:text-xs ${
                  active
                    ? "border-[#29452C] bg-[#29452C] text-white shadow-[0_8px_24px_rgba(41,69,44,0.18)]"
                    : "border-[#10251A]/12 bg-white/80 text-[#29452C] hover:border-[#29452C]/35 hover:bg-white"
                }`}
              >
                <span className="sm:hidden">{category.shortLabel}</span>
                <span className="hidden sm:inline">{category.label}</span>
              </button>
            );
          })}
        </div>
        <span
          className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#EEF1E9] to-transparent lg:hidden"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
