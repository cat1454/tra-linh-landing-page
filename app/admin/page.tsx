import Link from "next/link";
import { redirect } from "next/navigation";

import {
  createContentItemAction,
  deleteContentItemAction,
  updateContentItemAction,
  uploadMediaAction,
} from "@/app/actions/admin-content";
import { signOutAdmin } from "@/app/actions/admin-auth";
import { getAdminAccess } from "@/lib/supabase/access";
import { getSupabaseEnvironmentStatus } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ContentStatus, ContentTableName } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const contentTables: { name: ContentTableName; label: string }[] = [
  { name: "site_settings", label: "Thiết lập" },
  { name: "hero_slides", label: "Hero" },
  { name: "stories", label: "Câu chuyện" },
  { name: "journeys", label: "Hành trình" },
  { name: "ginseng_story_steps", label: "Vùng sâm" },
  { name: "culture_stories", label: "Văn hóa" },
  { name: "local_products", label: "Sản vật" },
  { name: "ginseng_products", label: "Sản phẩm sâm" },
  { name: "travel_guides", label: "Cẩm nang" },
  { name: "media_assets", label: "Thư viện ảnh" },
];

const noticeMessages: Record<string, string> = {
  created: "Đã tạo nội dung mới.",
  updated: "Đã cập nhật trạng thái nội dung.",
  deleted: "Đã xóa nội dung.",
  uploaded: "Đã tải ảnh lên ở trạng thái chờ duyệt.",
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
}

function isContentTableName(value: string | undefined): value is ContentTableName {
  return contentTables.some((table) => table.name === value);
}

function rowTitle(row: AdminPreview): string {
  return row.title ?? row.name ?? row.site_name ?? row.slug ?? row.file_url ?? row.id;
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
  searchParams: Promise<{ table?: string; notice?: string; error?: string }>;
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
  const supabase = await createServerSupabaseClient();
  if (!supabase) return <CmsUnavailable partial={false} />;

  const { data, error } = await supabase
    .from(selectedTable)
    .select("*")
    .order("display_order", { ascending: true })
    .limit(100);
  const rows = (data ?? []) as unknown as AdminPreview[];
  const flash = params.error
    ? errorMessages[params.error] ?? "Có lỗi xảy ra."
    : params.notice
      ? noticeMessages[params.notice]
      : null;

  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#eef1e9] text-[#10251a]">
      <header className="border-b border-[#10251a]/10 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/" className="font-serif text-2xl font-bold tracking-wide">
              TRÀ LINH
            </Link>
            <p className="mt-1 text-xs text-[#10251a]/60">
              {access.email} · {access.role}
            </p>
          </div>
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="min-h-11 rounded-full border border-[#10251a]/20 px-5 text-sm font-semibold"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <nav aria-label="Nhóm nội dung" className="rounded-3xl bg-[#10251a] p-3 text-white lg:self-start">
          {contentTables.map((table) => (
            <Link
              key={table.name}
              href={`/admin?table=${table.name}`}
              aria-current={selectedTable === table.name ? "page" : undefined}
              className={`flex min-h-11 items-center rounded-2xl px-4 text-sm font-semibold transition ${
                selectedTable === table.name
                  ? "bg-[#9bbe62] text-[#10251a]"
                  : "hover:bg-white/10"
              }`}
            >
              {table.label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0 space-y-6">
          <section className="rounded-3xl bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5e7f3b]">
                  Supabase CMS
                </p>
                <h1 className="mt-2 font-serif text-3xl">
                  {contentTables.find((item) => item.name === selectedTable)?.label}
                </h1>
              </div>
              <p className="rounded-full bg-[#eef1e9] px-4 py-2 text-sm font-semibold">
                {rows.length} bản ghi
              </p>
            </div>

            {flash ? (
              <p role="status" className="mt-5 rounded-2xl bg-[#eee3cb] px-4 py-3 text-sm">
                {flash}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                Không thể tải dữ liệu. Kiểm tra migration và RLS của dự án Supabase.
              </p>
            ) : null}
          </section>

          {selectedTable === "media_assets" ? (
            <MediaUploadForm />
          ) : (
            <CreateContentForm table={selectedTable} />
          )}

          <section className="overflow-hidden rounded-3xl bg-white">
            <h2 className="px-6 pt-6 font-serif text-2xl sm:px-8">Nội dung hiện có</h2>
            {rows.length ? (
              <div className="mt-5 divide-y divide-[#10251a]/10">
                {rows.map((row) => (
                  <article key={row.id} className="grid gap-4 px-6 py-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center sm:px-8">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{rowTitle(row)}</h3>
                      <p className="mt-1 truncate text-xs text-[#10251a]/55">
                        {row.slug ?? row.id}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <form action={updateContentItemAction} className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="table" value={selectedTable} />
                        <input type="hidden" name="id" value={row.id} />
                        <label className="sr-only" htmlFor={`status-${row.id}`}>Trạng thái</label>
                        <select
                          id={`status-${row.id}`}
                          name="status"
                          defaultValue={row.status}
                          className="min-h-11 rounded-xl border border-[#10251a]/15 px-3 text-sm"
                        >
                          <option value="draft">Bản nháp</option>
                          <option value="review">Chờ duyệt</option>
                          <option value="published">Đã xuất bản</option>
                        </select>
                        <label className="flex min-h-11 items-center gap-2 text-xs">
                          <input type="checkbox" name="is_placeholder" defaultChecked={row.is_placeholder} />
                          Nội dung đề xuất
                        </label>
                        <label className="sr-only" htmlFor={`order-${row.id}`}>Thứ tự</label>
                        <input
                          id={`order-${row.id}`}
                          name="display_order"
                          type="number"
                          min="0"
                          max="10000"
                          defaultValue={row.display_order}
                          className="min-h-11 w-20 rounded-xl border border-[#10251a]/15 px-3 text-sm"
                        />
                        <button className="min-h-11 rounded-full bg-[#5e7f3b] px-4 text-sm font-semibold text-white" type="submit">
                          Lưu
                        </button>
                      </form>
                      <form action={deleteContentItemAction}>
                        <input type="hidden" name="table" value={selectedTable} />
                        <input type="hidden" name="id" value={row.id} />
                        <button className="min-h-11 rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700" type="submit">
                          Xóa
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="px-6 py-10 text-[#10251a]/60 sm:px-8">Chưa có bản ghi nào trong nhóm này.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function CreateContentForm({ table }: { table: Exclude<ContentTableName, "media_assets"> }) {
  const needsSlug = ["journeys", "local_products", "ginseng_products", "travel_guides"].includes(table);
  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8">
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
            <option value="review">Chờ duyệt</option>
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

function MediaUploadForm() {
  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8">
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} defaultValue={defaultValue} className="min-h-12 w-full rounded-xl border border-[#10251a]/15 px-4 outline-none focus:ring-2 focus:ring-[#9bbe62]/40" />
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
