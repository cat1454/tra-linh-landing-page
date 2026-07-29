import {
  BedDouble,
  Building2,
  Drum,
  House,
  Landmark,
  Leaf,
  Mountain,
  ShoppingBasket,
  Waves,
  type LucideIcon,
} from "lucide-react";

import {
  getTourismCategoryLabel,
  TOURISM_CATEGORY_COLORS,
} from "@/data/tourism-map/categories";
import type {
  TourismPlace,
  TourismPlaceCategory,
} from "@/data/tourism-map/types";

interface CategoryArtworkConfig {
  Icon: LucideIcon;
  SecondaryIcon?: LucideIcon;
  deepColor: string;
}

const categoryArtwork: Record<TourismPlaceCategory, CategoryArtworkConfig> = {
  ginseng: { Icon: Leaf, deepColor: "#5B4A2F" },
  nature: { Icon: Mountain, SecondaryIcon: Waves, deepColor: "#315D6D" },
  culture: { Icon: Landmark, SecondaryIcon: Drum, deepColor: "#654738" },
  community: { Icon: House, SecondaryIcon: BedDouble, deepColor: "#365E43" },
  shopping: { Icon: ShoppingBasket, deepColor: "#71441F" },
  administrative: { Icon: Building2, deepColor: "#3F4B5C" },
};

interface TourismCategoryArtworkProps {
  place: TourismPlace;
  variant?: "thumbnail" | "hero";
}

export function TourismCategoryArtwork({
  place,
  variant = "thumbnail",
}: TourismCategoryArtworkProps) {
  const { Icon, SecondaryIcon, deepColor } = categoryArtwork[place.category];
  const accent = TOURISM_CATEGORY_COLORS[place.category];
  const label = getTourismCategoryLabel(place.category);
  const hero = variant === "hero";

  return (
    <div
      role="img"
      aria-label={`Minh họa danh mục ${label} cho ${place.name}`}
      data-testid="tourism-category-artwork"
      data-category={place.category}
      className="absolute inset-0 isolate overflow-hidden"
      style={{
        backgroundColor: accent,
        backgroundImage: `linear-gradient(145deg, ${accent} 0%, ${deepColor} 100%)`,
      }}
    >
      <span
        className="absolute -right-[18%] -top-[22%] size-[78%] rounded-full border border-white/20 bg-white/10"
        aria-hidden="true"
      />
      <span
        className="absolute -bottom-[32%] -left-[25%] size-[90%] rounded-full border border-white/15 bg-black/5"
        aria-hidden="true"
      />
      <span
        className="absolute inset-0 opacity-30"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,.55) 1px, transparent 0)",
          backgroundSize: hero ? "22px 22px" : "14px 14px",
        }}
      />

      <span className="relative flex h-full flex-col items-center justify-center text-white">
        <span
          className={`relative grid place-items-center rounded-full border border-white/35 bg-white/16 shadow-[0_12px_30px_rgba(0,0,0,0.16)] backdrop-blur-sm ${
            hero ? "size-28 sm:size-36" : "size-14"
          }`}
          aria-hidden="true"
        >
          <Icon className={hero ? "size-14 sm:size-18" : "size-7"} strokeWidth={1.6} />
          {SecondaryIcon ? (
            <span
              className={`absolute grid place-items-center rounded-full bg-white text-[#29452C] shadow-md ${
                hero ? "-bottom-2 -right-2 size-11" : "-bottom-1 -right-1 size-6"
              }`}
            >
              <SecondaryIcon className={hero ? "size-5" : "size-3"} strokeWidth={1.8} />
            </span>
          ) : null}
        </span>

        {hero ? (
          <span className="mt-6 rounded-full border border-white/25 bg-black/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] backdrop-blur-sm">
            Minh họa · {label}
          </span>
        ) : null}
      </span>
    </div>
  );
}
