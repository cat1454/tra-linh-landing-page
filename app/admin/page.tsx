import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createContentItemAction,
  createExternalMediaAction,
  deleteContentItemAction,
  updateContentItemAction,
  uploadMediaAction,
} from "@/app/actions/admin-content";
import { signOutAdmin } from "@/app/actions/admin-auth";
import { updateContactSubmissionStatusAction } from "@/app/actions/admin-leads";
import { AdminVisualEditor } from "@/components/admin/AdminVisualEditor";
import { DeleteRecordButton } from "@/components/admin/DeleteRecordButton";
import { MediaUploadManager } from "@/components/admin/MediaUploadManager";
import {
  ADMIN_NAV_GROUPS,
  getAdminPublicAnchor,
  getAdminTableLabel,
  type AdminMediaPreviewOption,
} from "@/lib/cms/admin-preview";
import { getAdminAccess } from "@/lib/supabase/access";
import { getMediaBucketName, getSupabaseEnvironmentStatus } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentStatus, ContentTableName } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const contentTables = ADMIN_NAV_GROUPS.flatMap((group) =>
  group.items.flatMap((item) =>
    item.table ? [{ name: item.table, label: item.label }] : [],
  ),
);

const noticeMessages: Record<string, string> = {
  created: "Đã tạo nội dung mới.",
  updated: "Đã lưu toàn bộ thay đổi.",
  "draft-saved": "Đã lưu bản nháp. Website công khai chưa thay đổi.",
  published: "Đã xuất bản. Nội dung mới đang hiển thị trên website.",
  deleted: "Đã xóa nội dung.",
  uploaded: "Đã tải ảnh lên ở trạng thái chờ duyệt.",
  "lead-updated": "Đã cập nhật trạng thái liên hệ.",
};

const errorMessages: Record<string, string> = {
  "cms-unavailable": "Không thể kết nối CMS.",
  "invalid-content": "Nội dung chưa hợp lệ hoặc thiếu trường bắt buộc.",
  "invalid-slug": "Slug chỉ được gồm chữ thường không dấu, số và dấu gạch ngang.",
  "missing-image": "Loại nội dung này cần URL ảnh và mô tả alt.",
  "missing-required-fields": "Vui lòng bổ sung đầy đủ slug, ảnh và mô tả alt.",
  "use-media-upload": "Hãy dùng biểu mẫu tải ảnh cho thư viện media.",
  "save-failed": "Không thể lưu. Kiểm tra dữ liệu trùng hoặc quyền truy cập.",
  "update-failed": "Không thể cập nhật nội dung.",
  "delete-failed": "Không thể xóa nội dung.",
  "invalid-update": "Yêu cầu cập nhật không hợp lệ.",
  "invalid-delete": "Yêu cầu xóa không hợp lệ.",
  "missing-file": "Vui lòng chọn một tệp ảnh.",
  "invalid-file": "Ảnh không đúng định dạng hoặc lớn hơn 5 MB.",
  "invalid-metadata": "Ảnh cần đủ alt text, nguồn, credit và quyền sử dụng.",
  "upload-failed": "Không thể tải ảnh lên storage.",
  "invalid-lead-update": "Yêu cầu cập nhật liên hệ không hợp lệ.",
  "lead-update-failed": "Không thể cập nhật trạng thái liên hệ.",
};

interface AdminPreview {
  id: string;
  status: ContentStatus;
  is_placeholder: boolean;
  display_order: number;
  title?: string;
  name?: string;
  site_name?: string;
  slug?: string;
  file_url?: string;
  [key: string]: unknown;
}

type MediaOption = AdminMediaPreviewOption;

interface RawMediaOption {
  id: string;
  title: string;
  media_type: "image" | "video";
  storage_path: string | null;
  external_url: string | null;
  file_url: string | null;
  poster_asset_id: string | null;
}

interface ContactSubmissionPreview {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: "journey" | "culture" | "ginseng" | "partnership" | "other" | null;
  message: string;
  status: "new" | "in_progress" | "resolved" | "spam";
  created_at: string;
}

const interestLabels: Record<NonNullable<ContactSubmissionPreview["interest"]>, string> = {
  journey: "Hành trình",
  culture: "Văn hóa",
  ginseng: "Sâm và dược liệu",
  partnership: "Hợp tác",
  other: "Khác",
};

function isContentTableName(value: string | undefined): value is ContentTableName {
  return contentTables.some((table) => table.name === value);
}

function rowTitle(row: AdminPreview): string {
  return row.title ?? row.name ?? row.site_name ?? row.slug ?? row.file_url ?? row.id;
}

const sectionNames: Record<string, string> = {
  hero: "Đầu trang nổi bật",
  identity: "Dải số liệu giới thiệu",
  story: "Câu chuyện Trà Linh",
  journeys: "Các hành trình",
  ginseng: "Vùng sâm Ngọc Linh",
  culture: "Văn hóa Xơ Đăng",
  local_products: "Sản vật địa phương",
  products: "Sản phẩm sâm",
  guides: "Cẩm nang chuyến đi",
  final_cta: "Lời mời cuối trang",
  contact: "Biểu mẫu liên hệ",
};

function friendlyRowTitle(table: ContentTableName, row: AdminPreview): string {
  if (table === "page_sections") {
    const key = rowText(row, "section_key");
    return sectionNames[key] ?? rowTitle(row);
  }
  return rowTitle(row);
}

function safeAdminPreviewUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const candidate = value.trim();
  if (candidate.startsWith("/")) return candidate;
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function rowPreviewUrl(row: AdminPreview, mediaOptions: MediaOption[]): string | undefined {
  const mediaId =
    rowText(row, "media_asset_id") ||
    rowText(row, "hero_video_asset_id") ||
    (rowText(row, "media_type") ? row.id : "");
  return (
    mediaOptions.find((item) => item.id === mediaId)?.previewUrl ??
    safeAdminPreviewUrl(row.image_url) ??
    safeAdminPreviewUrl(row.external_url) ??
    safeAdminPreviewUrl(row.file_url)
  );
}

function CmsUnavailable({ partial }: { partial: boolean }) {
  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#eef1e9] px-5 py-16 text-[#10251a]">
      <section className="mx-auto max-w-2xl rounded-3xl bg-white p-8 shadow-xl shadow-[#10251a]/5 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5e7f3b]">
          Quản trị nội dung
        </p>
        <h1 className="mt-4 font-serif text-4xl">Chưa kết nối CMS</h1>
        <p className="mt-5 max-w-xl leading-7 text-[#10251a]/70">
          {partial
            ? "Đã có cấu hình public nhưng thiếu service role server-side. Khu vực quản trị và biểu mẫu công khai vẫn bị khóa để tránh mất dữ liệu."
            : "Ứng dụng đang chạy an toàn bằng nội dung dự phòng. Thêm các biến môi trường Supabase rồi áp migration để kích hoạt quản trị."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-[#10251a] px-6 font-semibold text-white"
        >
          Về trang chủ
        </Link>
      </section>
    </main>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; id?: string; view?: string; notice?: string; error?: string }>;
}) {
  const environment = getSupabaseEnvironmentStatus();
  if (environment !== "ready") {
    return <CmsUnavailable partial={environment === "public-only"} />;
  }

  const access = await getAdminAccess();
  if (access.state === "anonymous") redirect("/admin/login");
  if (access.state !== "authorized") redirect("/admin/login?error=forbidden");

  const params = await searchParams;
  const selectedTable = isContentTableName(params.table)
    ? params.table
    : "journeys";
  const showLeads = params.view === "contacts";
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <CmsUnavailable partial={false} />;

  const contentResult = showLeads
    ? null
    : await supabase
        .from(selectedTable)
        .select("*")
        .order("display_order", { ascending: true })
        .limit(100);
  const leadsResult = showLeads
    ? await supabase
        .from("contact_submissions")
        .select("id, name, email, phone, interest, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    : null;
  const mediaResult = showLeads
    ? null
    : await supabase
        .from("media_assets")
        .select("id, title, media_type, storage_path, external_url, file_url, poster_asset_id")
        .order("title", { ascending: true })
        .limit(500);
  const rows = (contentResult?.data ?? []) as unknown as AdminPreview[];
  const leads = (leadsResult?.data ?? []) as unknown as ContactSubmissionPreview[];
  const rawMediaOptions = (mediaResult?.data ?? []) as unknown as RawMediaOption[];
  const bucket = supabase.storage.from(getMediaBucketName());
  const signedMediaOptions = await Promise.all(
    rawMediaOptions.map(async (item): Promise<MediaOption> => {
      let previewUrl =
        safeAdminPreviewUrl(item.external_url) ??
        safeAdminPreviewUrl(item.file_url);
      if (item.storage_path && !item.storage_path.includes("..")) {
        const { data } = await bucket.createSignedUrl(item.storage_path, 3600);
        previewUrl = data?.signedUrl ?? previewUrl;
      }
      return {
        id: item.id,
        title: item.title,
        mediaType: item.media_type,
        previewUrl,
        posterUrl: undefined,
      };
    }),
  );
  const mediaById = new Map(signedMediaOptions.map((item) => [item.id, item]));
  const mediaOptions = signedMediaOptions.map((item) => {
    const raw = rawMediaOptions.find((candidate) => candidate.id === item.id);
    const poster = raw?.poster_asset_id
      ? mediaById.get(raw.poster_asset_id)?.previewUrl
      : undefined;
    return poster ? { ...item, posterUrl: poster } : item;
  });
  const selectedRow =
    rows.find((row) => row.id === params.id) ??
    rows[0] ??
    null;
  const loadError = contentResult?.error ?? leadsResult?.error;
  const flash = params.error
    ? errorMessages[params.error] ?? "Có lỗi xảy ra."
    : params.notice
      ? noticeMessages[params.notice]
      : null;

  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#eef1e9] text-[#10251a]" data-testid="visual-admin">
      <header className="border-b border-[#10251a]/10 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1580px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5e7f3b]">Trà Linh CMS</p>
            <h1 className="mt-1 font-serif text-2xl font-bold">Quản trị website</h1>
            <p className="mt-1 text-xs text-[#10251a]/60">
              {access.email} · {access.role}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-[#10251a] px-5 text-sm font-semibold text-white">
              Mở website
            </a>
            <form action={signOutAdmin}>
              <button type="submit" className="min-h-11 rounded-full border border-[#10251a]/20 px-5 text-sm font-semibold">
                Đăng xuất
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1580px] gap-6 px-4 py-6 sm:px-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <nav aria-label="Nhóm quản trị" className="rounded-3xl bg-[#10251a] p-3 text-white lg:sticky lg:top-5 lg:self-start">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <p className="px-4 pb-2 pt-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-white/45">
                {group.label}
              </p>
              {group.items.map((item) => {
                const active = item.table
                  ? !showLeads && selectedTable === item.table
                  : showLeads && item.view === "contacts";
                const href = item.table ? `/admin?table=${item.table}` : "/admin?view=contacts";
                return (
                  <Link
                    key={item.label}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`mb-1 block rounded-2xl px-4 py-3 transition ${
                      active ? "bg-[#9bbe62] text-[#10251a]" : "hover:bg-white/10"
                    }`}
                  >
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className={`mt-1 block text-[0.68rem] leading-4 ${active ? "text-[#10251a]/65" : "text-white/50"}`}>
                      {item.description}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5e7f3b]">
                  {showLeads ? "Hộp thư liên hệ" : "Chọn → Sửa → Xuất bản"}
                </p>
                <h1 className="mt-2 font-serif text-3xl">
                  {showLeads
                    ? "Yêu cầu đã nhận"
                    : getAdminTableLabel(selectedTable)}
                </h1>
              </div>
              <p className="rounded-full bg-[#eef1e9] px-4 py-2 text-sm font-semibold">
                {showLeads ? leads.length : rows.length} bản ghi
              </p>
            </div>

            {!showLeads ? (
              <ol className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Chọn khu vực", "Chọn một thẻ nội dung bên dưới."],
                  ["2", "Sửa và xem trước", "Gõ tới đâu, preview đổi tới đó."],
                  ["3", "Lưu hoặc xuất bản", "Bản nháp không hiện ra website."],
                ].map(([step, title, description]) => (
                  <li key={step} className="flex gap-3 rounded-2xl bg-[#eef1e9] p-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#10251a] text-xs font-bold text-white">{step}</span>
                    <span>
                      <strong className="block text-sm">{title}</strong>
                      <span className="mt-0.5 block text-xs leading-5 text-[#10251a]/60">{description}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}

            {flash ? (
              <p role="status" className="mt-5 rounded-2xl bg-[#eee3cb] px-4 py-3 text-sm">
                {flash}
              </p>
            ) : null}
            {loadError ? (
              <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                Không thể tải dữ liệu. Kiểm tra migration và RLS của dự án Supabase.
              </p>
            ) : null}
          </section>

          {showLeads ? (
            <ContactSubmissionList leads={leads} />
          ) : (
            <>
              {selectedTable === "media_assets" ? (
                <MediaUploadForm />
              ) : !["site_settings", "page_sections"].includes(selectedTable) ? (
                <details className="rounded-3xl bg-white p-5 sm:p-7">
                  <summary className="cursor-pointer font-semibold">＋ Tạo nội dung mới</summary>
                  <CreateContentForm table={selectedTable} embedded />
                </details>
              ) : null}

              <section className="rounded-3xl bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5e7f3b]">Bước 1</p>
                    <h2 className="mt-2 font-serif text-2xl">Chọn nội dung cần sửa</h2>
                  </div>
                  <p className="text-xs text-[#10251a]/55">Thẻ có viền xanh đang được chọn</p>
                </div>
                {rows.length ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {rows.map((row) => {
                      const selected = selectedRow?.id === row.id;
                      const previewUrl = rowPreviewUrl(row, mediaOptions);
                      return (
                        <Link
                          key={row.id}
                          href={`/admin?table=${selectedTable}&id=${row.id}#trinh-chinh-sua`}
                          aria-current={selected ? "true" : undefined}
                          className={`group overflow-hidden rounded-2xl border-2 bg-white transition hover:-translate-y-0.5 hover:shadow-lg ${
                            selected ? "border-[#5e7f3b] shadow-md" : "border-[#10251a]/10"
                          }`}
                        >
                          <div
                            className="flex h-28 items-end bg-gradient-to-br from-[#dfe7d8] to-[#eee3cb] bg-cover bg-center p-3"
                            style={previewUrl ? { backgroundImage: `linear-gradient(0deg, rgba(7,16,12,.72), rgba(7,16,12,.05)), url(${JSON.stringify(previewUrl)})` } : undefined}
                          >
                            <span className={`rounded-full px-2.5 py-1 text-[0.65rem] font-bold ${
                              previewUrl ? "bg-white/90 text-[#10251a]" : "bg-[#10251a] text-white"
                            }`}>
                              {row.status === "published" ? "Đang hiển thị" : "Bản nháp"}
                            </span>
                          </div>
                          <div className="p-4">
                            <h3 className="line-clamp-2 font-semibold">{friendlyRowTitle(selectedTable, row)}</h3>
                            <p className="mt-2 text-xs font-bold text-[#5e7f3b]">
                              {selected ? "Đang chỉnh sửa" : "Sửa khu vực này →"}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl bg-[#eef1e9] px-5 py-8 text-center text-sm text-[#10251a]/60">
                    Chưa có nội dung trong nhóm này.
                  </p>
                )}
              </section>

              {selectedRow ? (
                <section id="trinh-chinh-sua" className="scroll-mt-5 rounded-3xl bg-white p-5 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5e7f3b]">Bước 2 & 3</p>
                      <h2 className="mt-2 font-serif text-2xl">{friendlyRowTitle(selectedTable, selectedRow)}</h2>
                      <p className="mt-2 text-sm text-[#10251a]/60">
                        {selectedRow.status === "published" ? "Nội dung này đang hiển thị trên website." : "Nội dung này đang là bản nháp."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/${getAdminPublicAnchor(selectedTable, selectedRow.section_key)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-11 items-center rounded-full border border-[#10251a]/15 px-4 text-sm font-semibold"
                      >
                        Xem trên website
                      </a>
                      <form action={deleteContentItemAction}>
                        <input type="hidden" name="table" value={selectedTable} />
                        <input type="hidden" name="id" value={selectedRow.id} />
                        <DeleteRecordButton title={friendlyRowTitle(selectedTable, selectedRow)} />
                      </form>
                    </div>
                  </div>
                  <AdminVisualEditor table={selectedTable} row={selectedRow} mediaOptions={mediaOptions}>
                    <EditContentForm table={selectedTable} row={selectedRow} mediaOptions={mediaOptions} />
                  </AdminVisualEditor>
                </section>
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ContactSubmissionList({ leads }: { leads: ContactSubmissionPreview[] }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white">
      <h2 className="px-6 pt-6 font-serif text-2xl sm:px-8">Danh sách liên hệ</h2>
      {leads.length ? (
        <div className="mt-5 divide-y divide-[#10251a]/10">
          {leads.map((lead) => (
            <article key={lead.id} className="grid gap-5 px-6 py-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start sm:px-8">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h3 className="font-semibold">{lead.name}</h3>
                  <span className="rounded-full bg-[#eef1e9] px-3 py-1 text-xs font-semibold">
                    {lead.interest ? interestLabels[lead.interest] : "Lead cũ · chưa phân nhóm"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#10251a]/65">
                  <a className="underline-offset-4 hover:underline" href={`mailto:${lead.email}`}>{lead.email}</a>
                  {lead.phone ? <> · <a className="underline-offset-4 hover:underline" href={`tel:${lead.phone}`}>{lead.phone}</a></> : null}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#10251a]/80">{lead.message}</p>
                <time className="mt-3 block text-xs text-[#10251a]/50" dateTime={lead.created_at}>
                  {new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lead.created_at))}
                </time>
              </div>
              <form action={updateContactSubmissionStatusAction} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={lead.id} />
                <label className="sr-only" htmlFor={`lead-status-${lead.id}`}>Trạng thái xử lý</label>
                <select
                  id={`lead-status-${lead.id}`}
                  name="status"
                  defaultValue={lead.status}
                  className="min-h-11 rounded-xl border border-[#10251a]/15 px-3 text-sm"
                >
                  <option value="new">Mới</option>
                  <option value="in_progress">Đang xử lý</option>
                  <option value="resolved">Đã xử lý</option>
                  <option value="spam">Spam</option>
                </select>
                <button className="min-h-11 rounded-full bg-[#5e7f3b] px-4 text-sm font-semibold text-white" type="submit">
                  Lưu
                </button>
              </form>
            </article>
          ))}
        </div>
      ) : (
        <p className="px-6 py-10 text-[#10251a]/60 sm:px-8">Chưa có yêu cầu liên hệ nào.</p>
      )}
    </section>
  );
}

function CreateContentForm({
  table,
  embedded = false,
}: {
  table: Exclude<ContentTableName, "media_assets">;
  embedded?: boolean;
}) {
  const needsSlug = ["journeys", "local_products", "ginseng_products", "travel_guides"].includes(table);
  return (
    <section className={embedded ? "pt-6" : "rounded-3xl bg-white p-6 sm:p-8"}>
      <h2 className="font-serif text-2xl">Tạo nội dung</h2>
      <p className="mt-2 text-sm leading-6 text-[#10251a]/60">
        Nội dung mới mặc định có thể giữ ở bản nháp hoặc chờ duyệt trước khi xuất bản.
      </p>
      <form action={createContentItemAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="table" value={table} />
        <Field label="Tiêu đề / tên" name="title" required />
        {needsSlug ? <Field label="Slug" name="slug" placeholder="hanh-trinh-vi-du" required /> : null}
        {table === "journeys" ? (
          <SelectField
            label="Loại hành trình"
            name="category"
            defaultValue="nature"
            options={[
              { value: "nature", label: "Thiên nhiên" },
              { value: "community", label: "Cộng đồng" },
              { value: "heritage", label: "Di sản" },
              { value: "ginseng", label: "Sâm Ngọc Linh" },
            ]}
          />
        ) : table === "local_products" ? (
          <SelectField
            label="Loại sản vật"
            name="category"
            defaultValue="am-thuc"
            options={[
              { value: "am-thuc", label: "Ẩm thực" },
              { value: "duoc-lieu", label: "Dược liệu" },
              { value: "nong-san", label: "Nông sản" },
            ]}
          />
        ) : table === "ginseng_products" ? (
          <SelectField
            label="Loại sản phẩm sâm"
            name="product_type"
            defaultValue="fresh-ginseng"
            options={[
              { value: "fresh-ginseng", label: "Sâm tươi" },
              { value: "dried-ginseng", label: "Sâm khô" },
              { value: "herbal-tea", label: "Trà thảo dược" },
            ]}
          />
        ) : (
          <Field label="Nhóm / danh mục" name="category" />
        )}
        <Field label="URL ảnh" name="image_url" placeholder="/images/... hoặc https://..." />
        <Field label="Mô tả ảnh (alt)" name="alt_text" />
        <Field label="URL nguồn" name="source_url" type="url" />
        <Field label="Credit nguồn" name="source_credit" />
        <SelectField
          label="Quyền sử dụng"
          name="usage_permission"
          defaultValue="pending"
          options={[
            { value: "pending", label: "Đang chờ xác minh" },
            { value: "client_confirmed", label: "Chủ dự án xác nhận" },
            { value: "official_publication", label: "Nguồn công bố chính thức" },
          ]}
        />
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Mô tả</span>
          <textarea name="description" required minLength={10} maxLength={8000} rows={5} className="w-full rounded-2xl border border-[#10251a]/15 px-4 py-3 outline-none focus:ring-2 focus:ring-[#9bbe62]/40" />
        </label>
        {table === "journeys" ? (
          <label>
            <span className="mb-2 block text-sm font-semibold">Quyền tiếp cận</span>
            <select name="access_status" defaultValue="contact_required" className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-3">
              <option value="open">Mở</option>
              <option value="contact_required">Cần liên hệ</option>
              <option value="organized_only">Chỉ đi có tổ chức</option>
            </select>
          </label>
        ) : null}
        <label>
          <span className="mb-2 block text-sm font-semibold">Trạng thái</span>
          <select name="status" defaultValue="draft" className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-3">
            <option value="draft">Bản nháp</option>
            <option value="published">Đã xuất bản</option>
          </select>
        </label>
        <Field label="Thứ tự" name="display_order" type="number" defaultValue="0" />
        <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="is_placeholder" defaultChecked />
          Gắn nhãn “Nội dung đề xuất”
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="min-h-12 rounded-full bg-[#10251a] px-7 font-semibold text-white">Tạo nội dung</button>
        </div>
      </form>
    </section>
  );
}

function rowText(row: AdminPreview, key: string): string {
  const value = row[key];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function rowLines(row: AdminPreview, key: string): string {
  const value = row[key];
  if (!Array.isArray(value)) return "";
  return value.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      if (record.value && record.label) {
        return [record.value, record.label, record.icon].filter(Boolean).join("|");
      }
      if (record.body) return String(record.body);
    }
    return "";
  }).filter(Boolean).join("\n");
}

function MediaSelect({
  name = "media_asset_id",
  value,
  options,
  label = "Media từ thư viện",
  only,
}: {
  name?: string;
  value?: string;
  options: MediaOption[];
  label?: string;
  only?: "image" | "video";
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-3">
        <option value="">Không chọn</option>
        {options.filter((item) => !only || item.mediaType === only).map((item) => (
          <option key={item.id} value={item.id}>{item.title} · {item.mediaType === "video" ? "Video" : "Ảnh"}</option>
        ))}
      </select>
    </label>
  );
}

function EditContentForm({
  table,
  row,
  mediaOptions,
}: {
  table: ContentTableName;
  row: AdminPreview;
  mediaOptions: MediaOption[];
}) {
  const statusFields = (
    <>
      <Field label="Thứ tự" name="display_order" type="number" defaultValue={String(row.display_order ?? 0)} />
      {table !== "page_sections" ? (
        <label className="flex min-h-12 items-center gap-3 text-sm font-semibold">
          <input type="checkbox" name="is_placeholder" defaultChecked={Boolean(row.is_placeholder)} />
          Nội dung đề xuất
        </label>
      ) : null}
    </>
  );

  if (table === "site_settings") {
    return (
      <form action={updateContentItemAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={row.id} />
        <Field label="Tên website" name="site_name" defaultValue={rowText(row, "site_name")} required />
        <Field label="Khẩu hiệu" name="tagline" defaultValue={rowText(row, "tagline")} />
        <TextArea label="Mô tả chung" name="description" defaultValue={rowText(row, "description")} />
        <Field label="Địa chỉ" name="legal_address" defaultValue={rowText(row, "legal_address")} />
        <Field label="Email liên hệ" name="contact_email" type="email" defaultValue={rowText(row, "contact_email")} />
        <Field label="Số điện thoại" name="contact_phone" type="tel" defaultValue={rowText(row, "contact_phone")} />
        <Field label="URL Zalo" name="zalo_url" type="url" defaultValue={rowText(row, "zalo_url")} />
        <Field label="URL Google Maps" name="maps_url" type="url" defaultValue={rowText(row, "maps_url")} />
        <Field label="URL chính sách riêng tư" name="privacy_url" defaultValue={rowText(row, "privacy_url")} />
        <Field label="Tên trên header" name="header_title" defaultValue={rowText(row, "header_title")} />
        <Field label="Dòng phụ header" name="header_subtitle" defaultValue={rowText(row, "header_subtitle")} />
        <Field label="Tiêu đề footer" name="footer_title" defaultValue={rowText(row, "footer_title")} />
        <TextArea label="Mô tả footer" name="footer_description" defaultValue={rowText(row, "footer_description")} />
        <Field label="SEO title" name="seo_title" defaultValue={rowText(row, "seo_title")} />
        <TextArea label="SEO description" name="seo_description" defaultValue={rowText(row, "seo_description")} />
        <Field label="Nhãn CTA chính" name="primary_cta_label" defaultValue={rowText(row, "primary_cta_label")} />
        <Field label="URL CTA chính" name="primary_cta_href" defaultValue={rowText(row, "primary_cta_href")} />
        <MediaSelect name="hero_video_asset_id" label="Video Hero" value={rowText(row, "hero_video_asset_id")} options={mediaOptions} only="video" />
        <Field label="Hoặc URL video Hero" name="hero_video_url" type="url" defaultValue={rowText(row, "hero_video_url")} />
        <MediaSelect name="hero_mobile_poster_asset_id" label="Poster Hero mobile" value={rowText(row, "hero_mobile_poster_asset_id")} options={mediaOptions} only="image" />
        <Field label="Hoặc URL poster mobile" name="hero_mobile_poster_url" type="url" defaultValue={rowText(row, "hero_mobile_poster_url")} />
        {statusFields}
        <SaveButton />
      </form>
    );
  }

  if (table === "page_sections") {
    return (
      <form action={updateContentItemAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={row.id} />
        <Field label="Nhãn nhỏ" name="eyebrow" defaultValue={rowText(row, "eyebrow")} />
        <Field label="Tiêu đề" name="title" defaultValue={rowText(row, "title")} required />
        <TextArea label="Mô tả" name="description" defaultValue={rowText(row, "description")} />
        <TextArea label="Nội dung phụ" name="secondary_text" defaultValue={rowText(row, "secondary_text")} />
        <Field label="Nhãn CTA" name="cta_label" defaultValue={rowText(row, "cta_label")} />
        <Field label="URL CTA" name="cta_href" defaultValue={rowText(row, "cta_href")} />
        <TextArea label="Nhãn/badge — mỗi dòng một mục" name="badges" defaultValue={rowLines(row, "badges")} />
        <TextArea label="Số liệu — giá trị|nhãn|icon, mỗi dòng" name="stats" defaultValue={rowLines(row, "stats")} />
        <MediaSelect value={rowText(row, "media_asset_id")} options={mediaOptions} />
        {statusFields}
        <SaveButton />
      </form>
    );
  }

  if (table === "media_assets") {
    return (
      <form action={updateContentItemAction} className="mt-5 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={row.id} />
        <Field label="Tiêu đề" name="title" defaultValue={rowText(row, "title")} required />
        <Field label="Mô tả media" name="alt_text" defaultValue={rowText(row, "alt_text")} required />
        <Field label="Khu vực sử dụng" name="section" defaultValue={rowText(row, "section")} />
        <Field label="URL nguồn" name="source_url" type="url" defaultValue={rowText(row, "source_url")} />
        <Field label="Credit nguồn" name="source_credit" defaultValue={rowText(row, "source_credit")} />
        <SelectField label="Quyền sử dụng" name="usage_permission" defaultValue={rowText(row, "usage_permission") || "client_confirmed"} options={[
          { value: "client_confirmed", label: "Chủ website xác nhận" },
          { value: "official_publication", label: "Nguồn công bố chính thức" },
          { value: "pending", label: "Đang xác minh" },
        ]} />
        <MediaSelect name="poster_asset_id" label="Poster cho video" value={rowText(row, "poster_asset_id")} options={mediaOptions} only="image" />
        {statusFields}
        <SaveButton />
      </form>
    );
  }

  const recordTitle = rowText(row, "title") || rowText(row, "name");
  const recordDescription =
    rowText(row, "description") ||
    rowText(row, "short_description") ||
    rowText(row, "excerpt");
  return (
    <form action={updateContentItemAction} className="mt-5 grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={row.id} />
      <Field label="Tiêu đề / tên" name="title" defaultValue={recordTitle} required />
      {["journeys", "local_products", "ginseng_products", "travel_guides"].includes(table) ? (
        <Field label="Slug" name="slug" defaultValue={rowText(row, "slug")} required />
      ) : null}
      <Field label="Nhãn nhỏ" name="eyebrow" defaultValue={rowText(row, "eyebrow")} />
      <TextArea label="Mô tả" name="description" defaultValue={recordDescription} required />
      <TextArea label="Nội dung chi tiết — mỗi đoạn một dòng" name="body" defaultValue={rowLines(row, "body")} />
      <Field label="URL ảnh/video ngoài" name="image_url" defaultValue={rowText(row, "image_url")} />
      <MediaSelect value={rowText(row, "media_asset_id")} options={mediaOptions} />
      <Field label="Mô tả media" name="alt_text" defaultValue={rowText(row, "alt_text")} />
      <Field label="URL nguồn" name="source_url" type="url" defaultValue={rowText(row, "source_url")} />
      <Field label="Credit nguồn" name="source_credit" defaultValue={rowText(row, "source_credit")} />
      <SelectField label="Quyền sử dụng" name="usage_permission" defaultValue={rowText(row, "usage_permission") || "client_confirmed"} options={[
        { value: "client_confirmed", label: "Chủ website xác nhận" },
        { value: "official_publication", label: "Nguồn công bố chính thức" },
        { value: "pending", label: "Đang xác minh" },
      ]} />
      <SpecificFields table={table} row={row} />
      {statusFields}
      <SaveButton />
    </form>
  );
}

function SpecificFields({ table, row }: { table: ContentTableName; row: AdminPreview }) {
  if (table === "journeys") return (
    <>
      <SelectField label="Loại hành trình" name="category" defaultValue={rowText(row, "category") || "nature"} options={[
        { value: "nature", label: "Thiên nhiên" }, { value: "community", label: "Cộng đồng" },
        { value: "heritage", label: "Di sản" }, { value: "ginseng", label: "Sâm Ngọc Linh" },
      ]} />
      <SelectField label="Quyền tiếp cận" name="access_status" defaultValue={rowText(row, "access_status") || "contact_required"} options={[
        { value: "open", label: "Mở" }, { value: "contact_required", label: "Cần liên hệ" },
        { value: "organized_only", label: "Chỉ đi có tổ chức" },
      ]} />
      <Field label="Địa điểm" name="location_label" defaultValue={rowText(row, "location_label")} />
      <Field label="Thời lượng" name="duration_label" defaultValue={rowText(row, "duration_label")} />
      <TextArea label="Lưu ý tiếp cận" name="access_note" defaultValue={rowText(row, "access_note")} />
      <TextArea label="Lưu ý an toàn" name="safety_note" defaultValue={rowText(row, "safety_note")} />
      <TextArea label="Điểm nổi bật — mỗi dòng một mục" name="highlights" defaultValue={rowLines(row, "highlights")} />
    </>
  );
  if (table === "local_products") return (
    <>
      <SelectField label="Danh mục" name="category" defaultValue={rowText(row, "category") || "am-thuc"} options={[
        { value: "am-thuc", label: "Ẩm thực" }, { value: "duoc-lieu", label: "Dược liệu" }, { value: "nong-san", label: "Nông sản" },
      ]} />
      <Field label="Ghi chú nguồn gốc" name="origin_note" defaultValue={rowText(row, "origin_note")} />
    </>
  );
  if (table === "ginseng_products") return (
    <>
      <SelectField label="Loại sản phẩm" name="product_type" defaultValue={rowText(row, "product_type") || "fresh-ginseng"} options={[
        { value: "fresh-ginseng", label: "Sâm tươi" }, { value: "dried-ginseng", label: "Sâm khô" }, { value: "herbal-tea", label: "Trà thảo dược" },
      ]} />
      <Field label="URL liên hệ" name="contact_url" defaultValue={rowText(row, "contact_url")} />
      <Field label="Ghi chú nguồn gốc" name="origin_note" defaultValue={rowText(row, "origin_note")} />
      <TextArea label="Tuyên bố pháp lý" name="legal_disclaimer" defaultValue={rowText(row, "legal_disclaimer")} />
    </>
  );
  if (table === "ginseng_story_steps") return (
    <>
      <Field label="Số bước" name="step_number" type="number" defaultValue={rowText(row, "step_number") || "1"} />
      <TextArea label="Trích dẫn" name="quote" defaultValue={rowText(row, "quote")} />
    </>
  );
  if (table === "hero_slides") return (
    <>
      <Field label="Nhãn CTA" name="cta_label" defaultValue={rowText(row, "cta_label")} />
      <Field label="URL CTA" name="cta_href" defaultValue={rowText(row, "cta_href")} />
    </>
  );
  if (table === "culture_stories") return <Field label="Chú thích" name="caption" defaultValue={rowText(row, "caption")} />;
  if (table === "travel_guides") return (
    <>
      <Field label="Danh mục" name="category" defaultValue={rowText(row, "category")} />
      <Field label="Thời gian đọc" name="read_time_label" defaultValue={rowText(row, "read_time_label")} />
      <Field label="Mùa phù hợp" name="season_label" defaultValue={rowText(row, "season_label")} />
      <TextArea label="Các phần — mỗi dòng một phần" name="sections" defaultValue={rowLines(row, "sections")} />
    </>
  );
  return null;
}

function TextArea({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="sm:col-span-2">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <textarea name={name} defaultValue={defaultValue} required={required} rows={4} className="w-full rounded-xl border border-[#10251a]/15 px-4 py-3" />
    </label>
  );
}

function SaveButton() {
  return (
    <div className="sticky bottom-3 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#10251a]/10 bg-white/95 p-3 shadow-lg backdrop-blur sm:col-span-2">
      <p className="text-xs leading-5 text-[#10251a]/60 sm:text-sm">
        Lưu nháp để kiểm tra trước, hoặc xuất bản ngay lên website.
      </p>
      <div className="flex flex-1 justify-end gap-2 sm:flex-none">
        <button
          type="submit"
          name="intent"
          value="save-draft"
          className="min-h-12 flex-1 rounded-full border border-[#10251a]/20 bg-white px-5 font-semibold sm:flex-none"
        >
          Lưu nháp
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          className="min-h-12 flex-1 rounded-full bg-[#5e7f3b] px-5 font-semibold text-white sm:flex-none"
        >
          Xuất bản
        </button>
      </div>
    </div>
  );
}

function MediaUploadForm() {
  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8">
      <h2 className="font-serif text-2xl">Tải ảnh hoặc video</h2>
      <p className="mt-2 text-sm leading-6 text-[#10251a]/60">
        Upload có thể tiếp tục khi mạng gián đoạn; ảnh tối đa 10 MB, video tối đa 250 MB.
      </p>
      <MediaUploadManager />
      <div className="my-8 border-t border-[#10251a]/10" />
      <h2 className="font-serif text-2xl">Tải ảnh có nguồn</h2>
      <p className="mt-2 text-sm leading-6 text-[#10251a]/60">JPEG, PNG, WebP hoặc AVIF; tối đa 5 MB. Alt text, nguồn, credit và quyền sử dụng đều bắt buộc.</p>
      <form action={uploadMediaAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Tiêu đề" name="title" required />
        <Field label="Mô tả ảnh (alt)" name="alt_text" required />
        <Field label="URL nguồn" name="source_url" type="url" required />
        <Field label="Credit nguồn" name="source_credit" required />
        <label>
          <span className="mb-2 block text-sm font-semibold">Quyền sử dụng</span>
          <select name="usage_permission" defaultValue="client_confirmed" className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-3">
            <option value="client_confirmed">Client xác nhận</option>
            <option value="official_publication">Nguồn công bố chính thức</option>
            <option value="pending">Đang chờ xác minh quyền</option>
          </select>
        </label>
        <Field label="Khu vực sử dụng" name="section" placeholder="hero, culture..." />
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-semibold">Tệp ảnh</span>
          <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" required className="min-h-12 w-full rounded-xl border border-dashed border-[#10251a]/25 px-4 py-3" />
        </label>
        <div className="sm:col-span-2">
          <button type="submit" className="min-h-12 rounded-full bg-[#10251a] px-7 font-semibold text-white">Tải ảnh lên</button>
        </div>
      </form>
      <div className="my-8 border-t border-[#10251a]/10" />
      <h2 className="font-serif text-2xl">Thêm media từ URL</h2>
      <form action={createExternalMediaAction} className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Tiêu đề" name="title" required />
        <Field label="Mô tả ảnh/video" name="alt_text" required />
        <Field label="URL media" name="external_url" type="url" required />
        <SelectField
          label="Loại media"
          name="media_type"
          defaultValue="image"
          options={[
            { value: "image", label: "Ảnh" },
            { value: "video", label: "Video" },
          ]}
        />
        <Field label="Credit nguồn" name="source_credit" />
        <Field label="Khu vực sử dụng" name="section" />
        <div className="sm:col-span-2">
          <button type="submit" className="min-h-12 rounded-full bg-[#10251a] px-7 font-semibold text-white">
            Thêm vào thư viện
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
  defaultValue,
  readOnly = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  readOnly?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        readOnly={readOnly}
        className={`min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4 outline-none focus:ring-2 focus:ring-[#9bbe62]/40 ${
          readOnly ? "cursor-not-allowed bg-[#10251a]/5 text-[#10251a]/60" : ""
        }`}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-3 outline-none focus:ring-2 focus:ring-[#9bbe62]/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
