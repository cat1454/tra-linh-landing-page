import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chính sách quyền riêng tư",
  description: "Cách trang giới thiệu Trà Linh tiếp nhận và bảo vệ thông tin liên hệ.",
  alternates: { canonical: "/chinh-sach-quyen-rieng" },
};

export default function PrivacyPage() {
  return (
    <main id="noi-dung-chinh" className="min-h-screen bg-[#EEF1E9] px-5 pb-20 pt-32 text-[#10251A] sm:px-8 lg:px-16">
      <article className="mx-auto max-w-3xl rounded-[2rem] border border-[#10251A]/10 bg-white p-6 shadow-[0_24px_80px_rgba(16,37,26,0.06)] sm:p-10 lg:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#5E7F3B]">Thông tin pháp lý</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">Chính sách quyền riêng tư</h1>
        <p className="mt-6 text-sm leading-7 text-[#10251A]/72">
          Trang giới thiệu độc lập này chỉ tiếp nhận thông tin khi bạn chủ động gửi biểu mẫu liên hệ. Đây không phải cổng thông tin chính thức của cơ quan nhà nước và không thực hiện bán tour hay sản phẩm.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-[#10251A]/78">
          <section>
            <h2 className="font-serif text-2xl text-[#10251A]">Thông tin được tiếp nhận</h2>
            <p className="mt-3">Họ tên, số điện thoại, email, nhóm quan tâm, nội dung tin nhắn và xác nhận đồng ý của bạn.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-[#10251A]">Mục đích sử dụng</h2>
            <p className="mt-3">Thông tin chỉ được dùng để đọc, phân loại và phản hồi yêu cầu bạn đã gửi; không dùng để công bố công khai hoặc đưa ra tuyên bố thương mại thay cho một đơn vị vận hành.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-[#10251A]">Lưu trữ và bảo vệ</h2>
            <p className="mt-3">Dữ liệu biểu mẫu được gửi qua máy chủ, giới hạn tần suất và chỉ tài khoản quản trị được cấp quyền mới có thể xem. Dữ liệu được giữ trong thời gian cần thiết để xử lý yêu cầu hoặc đáp ứng nghĩa vụ hợp pháp.</p>
          </section>
          <section>
            <h2 className="font-serif text-2xl text-[#10251A]">Lựa chọn của bạn</h2>
            <p className="mt-3">Bạn có thể không gửi biểu mẫu và vẫn đọc toàn bộ nội dung công khai. Khi chưa có đầu mối liên hệ trực tiếp được cấu hình, trang sẽ dẫn tới kênh thông tin công khai của địa phương.</p>
          </section>
        </div>

        <Link href="/" className="mt-10 inline-flex min-h-12 items-center rounded-full bg-[#10251A] px-6 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#5E7F3B]">
          Trở về trang chủ
        </Link>
      </article>
    </main>
  );
}
