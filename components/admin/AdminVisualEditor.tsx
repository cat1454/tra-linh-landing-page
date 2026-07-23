"use client";

import type { FormEvent, ReactNode } from "react";
import { useMemo, useState } from "react";
import { ExternalLink, ImageIcon, Play, Sparkles } from "lucide-react";

import type {
  AdminMediaPreviewOption,
} from "@/lib/cms/admin-preview";
import { getAdminPublicAnchor } from "@/lib/cms/admin-preview";
import type { ContentStatus, ContentTableName } from "@/lib/supabase/types";

interface AdminVisualRow {
  id: string;
  status: ContentStatus;
  display_order: number;
  is_placeholder: boolean;
  [key: string]: unknown;
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function initialValues(row: AdminVisualRow): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(row).flatMap(([key, value]) =>
        typeof value === "string" || typeof value === "number"
          ? [[key, String(value)]]
          : [],
      ),
    ),
    title: text(row.title || row.name || row.site_name),
    description: text(
      row.description || row.short_description || row.excerpt || row.tagline,
    ),
  };
}

function safePreviewUrl(value?: string): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("/")) return value;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function PreviewMedia({
  url,
  isVideo,
  alt,
  poster,
}: {
  url?: string;
  isVideo: boolean;
  alt: string;
  poster?: string;
}) {
  const [videoFailed, setVideoFailed] = useState(false);

  if (!url) {
    return (
      <div className="flex h-full min-h-44 items-center justify-center bg-gradient-to-br from-[#dfe7d8] to-[#eee3cb] text-[#10251a]/55">
        <div className="text-center">
          <ImageIcon className="mx-auto" aria-hidden="true" />
          <p className="mt-2 text-xs font-semibold">Chưa chọn ảnh hoặc video</p>
        </div>
      </div>
    );
  }

  if (isVideo) {
    if (videoFailed) {
      return (
        <div className="flex h-full min-h-44 items-center justify-center bg-[#07100c] px-6 text-center text-white/70">
          <div>
            <Play className="mx-auto" aria-hidden="true" />
            <p className="mt-2 text-xs font-semibold">Video ngoài không phát được trong preview</p>
            <a className="mt-2 inline-block text-xs underline" href={url} target="_blank" rel="noreferrer">
              Mở video trong tab mới
            </a>
          </div>
        </div>
      );
    }
    return (
      <div className="relative h-full min-h-44 overflow-hidden bg-[#07100c]">
        <video
          key={url}
          src={url}
          muted
          playsInline
          preload="metadata"
          poster={poster}
          onError={() => setVideoFailed(true)}
          className="h-full w-full object-cover opacity-80"
          aria-label={alt}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-[#10251a] shadow-lg">
            <Play aria-hidden="true" className="ml-1" />
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="h-full min-h-44 bg-cover bg-center"
      style={{ backgroundImage: `url(${JSON.stringify(url)})` }}
    />
  );
}

function SiteSettingsPreview({ values }: { values: Record<string, string> }) {
  const title = values.header_title || values.site_name || "TRÀ LINH";
  const subtitle = values.header_subtitle || values.tagline || "Đại ngàn Ngọc Linh";
  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#eef1e9] shadow-2xl shadow-black/10">
      <div className="flex items-center justify-between bg-[#10251a] px-4 py-3 text-white">
        <div>
          <p data-preview-title className="text-xs font-bold tracking-[0.2em]">{title}</p>
          <p className="mt-0.5 text-[0.58rem] text-white/65">{subtitle}</p>
        </div>
        <span className="rounded-full bg-white px-3 py-1.5 text-[0.58rem] font-bold text-[#10251a]">
          Khám phá
        </span>
      </div>
      <div className="p-5">
        <p className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[#5e7f3b]">
          Thông tin liên hệ
        </p>
        <p className="mt-2 font-serif text-xl">{values.footer_title || title}</p>
        <p className="mt-2 text-xs leading-5 text-[#10251a]/65">
          {values.footer_description || values.description || "Mô tả website sẽ hiển thị tại đây."}
        </p>
        <div className="mt-4 space-y-1.5 rounded-xl bg-[#eee3cb] p-3 text-[0.68rem]">
          <p>{values.contact_phone || "Số điện thoại"}</p>
          <p>{values.contact_email || "Email liên hệ"}</p>
          <p>{values.legal_address || "Địa chỉ"}</p>
        </div>
      </div>
    </div>
  );
}

function SectionPreview({
  values,
  media,
}: {
  values: Record<string, string>;
  media?: AdminMediaPreviewOption;
}) {
  const key = values.section_key;
  const hero = key === "hero";
  const dark = hero || key === "ginseng" || key === "products" || key === "final_cta";
  const mediaUrl = media?.previewUrl ?? safePreviewUrl(values.image_url);
  const title = values.title || "Tiêu đề khu vực";
  const description = values.description || "Mô tả của khu vực sẽ xuất hiện tại đây.";

  return (
    <div
      className={`relative overflow-hidden rounded-[1.4rem] border shadow-2xl shadow-black/10 ${
        dark ? "border-white/10 bg-[#10251a] text-white" : "border-[#10251a]/10 bg-[#eef1e9] text-[#10251a]"
      }`}
    >
      {hero ? (
        <div className="absolute inset-0">
          <PreviewMedia
            url={mediaUrl}
            isVideo={media?.mediaType === "video"}
            alt={values.alt_text || title}
            poster={media?.posterUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07100c]/90 via-[#10251a]/65 to-transparent" />
        </div>
      ) : null}
      <div className={`relative ${hero ? "min-h-[360px] p-7 pt-24" : "p-6"}`}>
        {!hero && mediaUrl ? (
          <div className="mb-5 h-44 overflow-hidden rounded-2xl">
            <PreviewMedia
              url={mediaUrl}
              isVideo={media?.mediaType === "video"}
              alt={values.alt_text || title}
              poster={media?.posterUrl}
            />
          </div>
        ) : null}
        <p className={`text-[0.62rem] font-bold uppercase tracking-[0.2em] ${dark ? "text-[#d5a84e]" : "text-[#5e7f3b]"}`}>
          {values.eyebrow || "Nhãn nhỏ"}
        </p>
        <h3 data-preview-title className={`mt-3 font-serif leading-tight ${hero ? "text-4xl" : "text-3xl"}`}>
          {title}
        </h3>
        <p className={`mt-4 max-w-md text-sm leading-6 ${dark ? "text-white/72" : "text-[#10251a]/65"}`}>
          {description}
        </p>
        {values.cta_label ? (
          <span className={`mt-5 inline-flex rounded-full px-4 py-2 text-xs font-bold ${
            dark ? "bg-white text-[#10251a]" : "bg-[#10251a] text-white"
          }`}>
            {values.cta_label}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function ContentPreview({
  values,
  media,
}: {
  values: Record<string, string>;
  media?: AdminMediaPreviewOption;
}) {
  const title = values.title || "Tiêu đề nội dung";
  const description = values.description || "Mô tả nội dung sẽ xuất hiện tại đây.";
  const mediaUrl =
    media?.previewUrl ??
    safePreviewUrl(values.external_url || values.file_url || values.image_url);

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-[#10251a]/10 bg-white shadow-2xl shadow-black/10">
      <div className="h-56 overflow-hidden">
        <PreviewMedia
          url={mediaUrl}
          isVideo={media?.mediaType === "video" || values.media_type === "video"}
          alt={values.alt_text || title}
          poster={media?.posterUrl}
        />
      </div>
      <div className="p-6">
        <p className="text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[#5e7f3b]">
          {values.category || values.product_type || values.eyebrow || "Nội dung Trà Linh"}
        </p>
        <h3 data-preview-title className="mt-3 font-serif text-2xl leading-tight">{title}</h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-[#10251a]/65">{description}</p>
      </div>
    </div>
  );
}

export function AdminVisualEditor({
  table,
  row,
  mediaOptions,
  children,
}: {
  table: ContentTableName;
  row: AdminVisualRow;
  mediaOptions: AdminMediaPreviewOption[];
  children: ReactNode;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(row));
  const [dirty, setDirty] = useState(false);
  const selectedMedia = useMemo(() => {
    const selectedId =
      table === "media_assets"
        ? row.id
        : values.media_asset_id ||
          values.hero_video_asset_id ||
          values.poster_asset_id;
    return mediaOptions.find((item) => item.id === selectedId);
  }, [mediaOptions, row.id, table, values]);
  const anchor = getAdminPublicAnchor(table, values.section_key || row.section_key);

  function updatePreview(event: FormEvent<HTMLDivElement>) {
    const target = event.target;
    if (
      !(target instanceof HTMLInputElement) &&
      !(target instanceof HTMLTextAreaElement) &&
      !(target instanceof HTMLSelectElement)
    ) {
      return;
    }
    if (!target.name) return;

    setValues((current) => ({ ...current, [target.name]: target.value }));
    setDirty(true);
  }

  return (
    <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(300px,0.82fr)_minmax(420px,1.18fr)]" onInput={updatePreview} onChange={updatePreview}>
      <aside className="xl:sticky xl:top-5 xl:self-start">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#5e7f3b]">
              <Sparkles size={14} aria-hidden="true" />
              Xem trước trực tiếp
            </p>
            <p aria-live="polite" className={`mt-1 text-xs font-semibold ${dirty ? "text-amber-700" : "text-[#10251a]/55"}`}>
              {dirty
                ? "Thay đổi chưa lưu"
                : row.status === "published"
                  ? "Nội dung đang được xuất bản"
                  : "Nội dung đang là bản nháp"}
            </p>
          </div>
          <a
            href={`/${anchor}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#10251a]/15 bg-white px-4 text-xs font-bold"
          >
            Xem vị trí thật
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
        {table === "site_settings" ? (
          <SiteSettingsPreview values={values} />
        ) : table === "page_sections" ? (
          <SectionPreview values={values} media={selectedMedia} />
        ) : (
          <ContentPreview values={values} media={selectedMedia} />
        )}
        <p className="mt-3 rounded-xl bg-[#eee3cb]/75 px-4 py-3 text-xs leading-5 text-[#10251a]/65">
          Đây là bản xem trước. Website thật chỉ thay đổi sau khi bạn bấm <strong>Xuất bản</strong>.
        </p>
      </aside>
      <section aria-label="Biểu mẫu chỉnh sửa" className="min-w-0 rounded-2xl border border-[#10251a]/10 bg-white p-4 sm:p-5">
        {children}
      </section>
    </div>
  );
}
