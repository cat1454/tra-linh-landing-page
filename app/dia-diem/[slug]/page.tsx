import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPin, Navigation, Ticket } from "lucide-react";

import { getTourismCategoryLabel } from "@/data/tourism-map/categories";
import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";
import { TOURISM_PLACEHOLDER_IMAGE } from "@/data/tourism-map/media";
import {
  getAllTourismEntities,
  getPlaceDirectionsUrl,
  hasVerifiedCoordinates,
} from "@/lib/tourism-map";

const entities = getAllTourismEntities(tourismPlaces, tourismEvents);

export function generateStaticParams() {
  return entities.map((entity) => ({ slug: entity.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const place = entities.find((entity) => entity.slug === slug);
  if (!place) return {};
  return {
    title: place.name,
    description: place.shortDescription,
    alternates: { canonical: `/dia-diem/${place.slug}` },
    ...(place.coverImage
      ? { openGraph: { images: [{ url: place.coverImage, alt: place.imageAlt }] } }
      : {}),
  };
}

export default async function TourismPlacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = entities.find((entity) => entity.slug === slug);
  if (!place) notFound();
  const directionsUrl = getPlaceDirectionsUrl(place);

  return (
    <main id="noi-dung-chinh" className="bg-[#EEF1E9] px-5 pb-20 pt-28 text-[#10251A] sm:px-8 lg:px-16">
      <article className="mx-auto max-w-6xl">
        <Link
          href="/#ban-do-du-lich"
          className="inline-flex min-h-11 items-center gap-2 rounded-full text-sm font-semibold text-[#49672D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Về bản đồ du lịch
        </Link>

        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#49672D]">
              {getTourismCategoryLabel(place.category)}
              {place.scope === "nearby" ? " · Địa điểm lân cận" : ""}
            </p>
            <h1 className="mt-4 font-serif text-[clamp(2.5rem,6vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.04em]">
              {place.name}
            </h1>
            <p className="mt-6 text-lg leading-8 text-[#10251A]/72">{place.shortDescription}</p>
            {place.description ? (
              <div className="mt-6 space-y-4 border-t border-[#10251A]/10 pt-6 text-base leading-7 text-[#10251A]/85">
                {place.description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex items-start gap-2 rounded-2xl bg-white/65 p-4 text-sm leading-6">
              <MapPin className="mt-1 size-4 shrink-0 text-[#49672D]" aria-hidden="true" />
              <div>
                <p className="font-semibold">{place.currentAddress}</p>
                {!hasVerifiedCoordinates(place) ? (
                  <p className="text-[#8A633D]">
                    Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps
                  </p>
                ) : null}
              </div>
            </div>
            {place.openingHours || place.ticketPrice ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {place.openingHours ? (
                  <div className="flex items-start gap-2 rounded-2xl bg-white/65 p-4 text-sm leading-6">
                    <Clock className="mt-1 size-4 shrink-0 text-[#49672D]" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#49672D]">Thời gian / Giờ mở cửa</p>
                      <p className="mt-0.5 font-medium">{place.openingHours}</p>
                    </div>
                  </div>
                ) : null}
                {place.ticketPrice ? (
                  <div className="flex items-start gap-2 rounded-2xl bg-white/65 p-4 text-sm leading-6">
                    <Ticket className="mt-1 size-4 shrink-0 text-[#49672D]" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#49672D]">Chi phí / Giá vé</p>
                      <p className="mt-0.5 font-medium">{place.ticketPrice}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {directionsUrl ? (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Chỉ đường đến ${place.name} bằng Google Maps`}
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#29452C] px-6 font-semibold text-white"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Chỉ đường bằng Google Maps
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 inline-flex min-h-12 cursor-not-allowed items-center gap-2 rounded-full bg-[#10251A]/8 px-6 font-semibold text-[#10251A]/45"
              >
                <Navigation className="size-4" aria-hidden="true" />
                Chỉ đường đang cập nhật
              </button>
            )}
          </div>

          <figure>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] bg-[#DDE5D5] shadow-[0_24px_70px_rgba(16,37,26,0.14)]">
              <Image
                src={place.coverImage ?? TOURISM_PLACEHOLDER_IMAGE}
                alt={place.imageAlt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
            {place.imageStatus !== "ready" ? (
              <figcaption className="mt-3 text-sm text-[#10251A]/60">
                Ảnh đúng địa điểm đang được bổ sung và xác minh quyền sử dụng.
              </figcaption>
            ) : null}
          </figure>
        </div>

        {place.gallery.length ? (
          <section className="mt-16" aria-labelledby="tourism-gallery-heading">
            <h2 id="tourism-gallery-heading" className="font-serif text-3xl font-semibold">
              Hình ảnh liên quan
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {place.gallery.map((image, index) => (
                <div key={image} className="relative aspect-[3/2] overflow-hidden rounded-[1.5rem] bg-[#DDE5D5]">
                  <Image
                    src={image}
                    alt={`${place.imageAlt} — hình ${index + 1}`}
                    fill
                    sizes="(max-width: 639px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </main>
  );
}
