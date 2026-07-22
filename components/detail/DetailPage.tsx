import Image from "next/image";
import Link from "next/link";

import type { MediaAsset } from "@/lib/content/types";

type Breadcrumb = {
  label: string;
  href: string;
};

type DetailFact = {
  label: string;
  value: string;
};

type DetailSection = {
  title: string;
  body?: string;
  items?: string[];
  tone?: "default" | "notice";
};

type DetailPageProps = {
  eyebrow: string;
  title: string;
  summary: string;
  description: string;
  breadcrumbs: Breadcrumb[];
  featuredMedia?: MediaAsset;
  gallery?: MediaAsset[];
  facts?: DetailFact[];
  sections?: DetailSection[];
  placeholderLabel?: string;
  sourceUrl?: string;
  sourceCredit?: string;
  updatedAt?: string;
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

function MediaCredit({ media }: { media: MediaAsset }) {
  if (!media.sourceCredit && !media.caption) {
    return null;
  }

  return (
    <figcaption className="mt-3 flex flex-wrap justify-between gap-2 text-xs leading-5 text-[#536258]">
      <span>{media.caption}</span>
      {media.sourceCredit ? <span>Nguồn ảnh: {media.sourceCredit}</span> : null}
    </figcaption>
  );
}

export function DetailPage({
  eyebrow,
  title,
  summary,
  description,
  breadcrumbs,
  featuredMedia,
  gallery = [],
  facts = [],
  sections = [],
  placeholderLabel,
  sourceUrl,
  sourceCredit,
  updatedAt,
}: DetailPageProps) {
  const formattedDate = updatedAt ? formatDate(updatedAt) : null;
  const galleryItems = gallery.filter(
    (media) => media.id !== featuredMedia?.id,
  );

  return (
    <main id="noi-dung-chinh" className="flex-1 overflow-hidden bg-[#EEF1E9] text-[#10251A]">
      <section className="relative isolate border-b border-[#10251A]/10 px-5 pb-14 pt-28 sm:px-8 sm:pb-20 sm:pt-32 lg:px-14 lg:pb-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_12%,rgba(155,190,98,0.3),transparent_30%),linear-gradient(180deg,#EEF1E9_0%,#EEE3CB_100%)]"
        />
        <div className="mx-auto w-full max-w-[1360px]">
          <nav aria-label="Đường dẫn" className="mb-10 sm:mb-14">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#536258]">
              {breadcrumbs.map((item, index) => (
                <li key={item.href} className="flex items-center gap-2">
                  {index > 0 ? <span aria-hidden="true">/</span> : null}
                  {index === breadcrumbs.length - 1 ? (
                    <span aria-current="page" className="line-clamp-1 max-w-60">
                      {item.label}
                    </span>
                  ) : (
                    <Link
                      className="inline-flex min-h-11 items-center rounded-full underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.88fr)_minmax(460px,1.12fr)] lg:gap-16">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-[#5E7F3B] sm:text-sm">
                {eyebrow}
              </p>
              {placeholderLabel ? (
                <span className="mb-5 inline-flex min-h-8 items-center rounded-full border border-[#D5A84E]/60 bg-[#FFF8E7] px-3 text-xs font-semibold text-[#77570D]">
                  {placeholderLabel}
                </span>
              ) : null}
              <h1 className="max-w-4xl font-serif text-[clamp(2.6rem,7vw,6.5rem)] font-semibold leading-[0.96] tracking-[-0.045em] text-balance">
                {title}
              </h1>
              <p className="mt-7 max-w-2xl text-[clamp(1.05rem,2vw,1.35rem)] leading-8 text-[#35483B]">
                {summary}
              </p>
            </div>

            {featuredMedia ? (
              <figure>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-[#D8DDCF] shadow-[0_24px_80px_rgba(16,37,26,0.16)] sm:rounded-[2.5rem]">
                  <Image
                    src={featuredMedia.src}
                    alt={featuredMedia.altText}
                    fill
                    priority
                    sizes="(max-width: 1023px) 100vw, 56vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#10251A]/25 via-transparent to-white/10"
                  />
                </div>
                <MediaCredit media={featuredMedia} />
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-14 lg:py-28">
        <div className="mx-auto grid w-full max-w-[1180px] gap-12 lg:grid-cols-[minmax(0,1fr)_310px] lg:gap-20">
          <article className="min-w-0">
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] font-semibold tracking-[-0.035em]">
              Câu chuyện
            </h2>
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-[#35483B]">
              {description}
            </p>

            {sections.map((section) => (
              <section
                key={section.title}
                className={`mt-10 rounded-[1.5rem] border p-6 sm:p-8 ${
                  section.tone === "notice"
                    ? "border-[#D5A84E]/45 bg-[#FFF8E7]"
                    : "border-[#10251A]/10 bg-white/55"
                }`}
              >
                <h2 className="font-serif text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                  {section.title}
                </h2>
                {section.body ? (
                  <p className="mt-4 whitespace-pre-line leading-7 text-[#435348]">
                    {section.body}
                  </p>
                ) : null}
                {section.items?.length ? (
                  <ul className="mt-5 grid gap-3" role="list">
                    {section.items.map((item) => (
                      <li key={item} className="flex gap-3 leading-7 text-[#35483B]">
                        <span
                          aria-hidden="true"
                          className="mt-[0.7rem] size-1.5 shrink-0 rounded-full bg-[#5E7F3B]"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            {galleryItems.length ? (
              <section className="mt-14" aria-labelledby="gallery-heading">
                <h2
                  id="gallery-heading"
                  className="font-serif text-3xl font-semibold tracking-[-0.03em] sm:text-4xl"
                >
                  Hình ảnh liên quan
                </h2>
                <div className="mt-7 grid gap-8 sm:grid-cols-2">
                  {galleryItems.map((media) => (
                    <figure key={media.id}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] bg-[#D8DDCF]">
                        <Image
                          src={media.src}
                          alt={media.altText}
                          fill
                          sizes="(max-width: 639px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                      <MediaCredit media={media} />
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <aside className="h-fit rounded-[1.75rem] bg-[#10251A] p-6 text-[#EEF1E9] sm:p-8 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl font-semibold">Thông tin nhanh</h2>
            {facts.length ? (
              <dl className="mt-6 grid gap-5">
                {facts.map((fact) => (
                  <div key={fact.label} className="border-t border-white/15 pt-5">
                    <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9BBE62]">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 leading-6 text-[#E5EBDD]">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {formattedDate ? (
              <p className="mt-7 border-t border-white/15 pt-5 text-sm text-[#C9D4C3]">
                Cập nhật: {formattedDate}
              </p>
            ) : null}

            {sourceUrl && sourceCredit ? (
              <a
                className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[#9BBE62]/60 px-4 text-sm font-semibold text-[#DDE7D2] transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Xem nguồn: {sourceCredit}
              </a>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="bg-[#EEE3CB] px-5 py-14 text-center sm:px-8 sm:py-20">
        <p className="mx-auto max-w-2xl font-serif text-2xl font-semibold leading-snug sm:text-3xl">
          Khám phá Trà Linh với sự tôn trọng dành cho rừng và cộng đồng bản địa.
        </p>
        <Link
          href="/#hanh-trinh"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[#5E7F3B] px-6 font-semibold text-white transition-colors hover:bg-[#46652A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#10251A]"
        >
          Khám phá hành trình
        </Link>
      </section>
    </main>
  );
}
