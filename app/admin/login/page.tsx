import Link from "next/link";
import { redirect } from "next/navigation";

import { requestAdminMagicLink, signOutAdmin } from "@/app/actions/admin-auth";
import { AdminLoginSubmitButton } from "@/components/admin/AdminLoginSubmitButton";
import { getAdminAccess } from "@/lib/supabase/access";
import { getSupabaseEnvironmentStatus } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  "check-email":
    "Nếu địa chỉ thuộc danh sách quản trị, một liên kết đăng nhập đã được gửi.",
  "signed-out": "Bạn đã đăng xuất an toàn.",
  "invalid-email": "Vui lòng nhập một địa chỉ email hợp lệ.",
  "send-failed": "Chưa thể gửi liên kết đăng nhập. Vui lòng thử lại sau.",
  "rate-limited": "Đã có quá nhiều yêu cầu đăng nhập. Vui lòng thử lại sau một giờ.",
  "invalid-link": "Liên kết đăng nhập không hợp lệ hoặc đã hết hạn.",
  "session-failed": "Không thể tạo phiên quản trị. Vui lòng yêu cầu liên kết mới.",
  forbidden: "Tài khoản này không có quyền truy cập khu vực quản trị.",
  unconfigured: "CMS chưa được cấu hình đầy đủ trên máy chủ.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  const access = await getAdminAccess();
  if (access.state === "authorized") redirect("/admin");

  const params = await searchParams;
  const messageKey = params.error ?? params.notice;
  const message = messageKey ? messages[messageKey] : null;
  const environment = getSupabaseEnvironmentStatus();

  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#eef1e9] px-5 py-16 text-[#10251a]">
      <section className="mx-auto max-w-md rounded-3xl border border-[#10251a]/10 bg-white p-7 shadow-xl shadow-[#10251a]/5 sm:p-10">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-sm font-semibold uppercase tracking-[0.18em] text-[#5e7f3b]"
        >
          ← Trà Linh
        </Link>
        <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-[#5e7f3b]">
          Khu vực riêng
        </p>
        <h1 className="mt-3 font-serif text-4xl">Đăng nhập quản trị</h1>
        <p className="mt-4 leading-7 text-[#10251a]/70">
          Nhập email đã được thêm vào danh sách quản trị. Liên kết dùng một lần sẽ
          được gửi qua Supabase Auth.
        </p>

        {message ? (
          <p
            role="status"
            className="mt-6 rounded-2xl bg-[#eee3cb] px-4 py-3 text-sm leading-6"
          >
            {message}
          </p>
        ) : null}

        {environment === "ready" ? (
          <form action={requestAdminMagicLink} className="mt-7 space-y-4">
            <label className="block text-sm font-semibold" htmlFor="admin-email">
              Email quản trị
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className="min-h-12 w-full rounded-xl border border-[#10251a]/20 bg-white px-4 outline-none focus:border-[#5e7f3b] focus:ring-2 focus:ring-[#9bbe62]/40"
            />
            <AdminLoginSubmitButton />
          </form>
        ) : (
          <div className="mt-7 rounded-2xl border border-dashed border-[#5e7f3b]/40 p-5">
            <p className="font-semibold">Chưa kết nối CMS</p>
            <p className="mt-2 text-sm leading-6 text-[#10251a]/70">
              Cấu hình URL, anon key và service role trong môi trường Vercel để mở
              đăng nhập. Website công khai vẫn dùng nội dung dự phòng.
            </p>
          </div>
        )}

        {access.state === "forbidden" ? (
          <form action={signOutAdmin} className="mt-5">
            <button className="min-h-11 text-sm font-semibold underline" type="submit">
              Đăng xuất tài khoản hiện tại
            </button>
          </form>
        ) : null}
      </section>
    </main>
  );
}
