import Link from "next/link";

export default function NotFound() {
  return (
    <main id="noi-dung-chinh" className="flex min-h-[78svh] items-center bg-[#10251A] px-5 pb-20 pt-32 text-[#EEF1E9] sm:px-8 lg:px-16">
      <section className="mx-auto w-full max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#D5A84E]">Lối này chưa có nội dung</p>
        <h1 className="mt-5 max-w-[12ch] font-serif text-5xl leading-[0.95] sm:text-7xl">Không tìm thấy trang bạn cần</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-[#EEF1E9]/72">Đường dẫn có thể đã được gỡ vì nội dung chưa đủ nguồn xác minh, hoặc địa chỉ đã được nhập sai.</p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-[#D5A84E] px-6 font-semibold text-[#10251A]">Về trang chủ</Link>
          <Link href="/#cam-nang" className="inline-flex min-h-12 items-center rounded-full border border-white/25 px-6 font-semibold text-white">Xem cẩm nang</Link>
        </div>
      </section>
    </main>
  );
}
