import Link from "next/link";

export default function TourismPlaceNotFound() {
  return (
    <main id="noi-dung-chinh" className="grid min-h-[70vh] place-items-center bg-[#EEF1E9] px-5 py-28 text-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#49672D]">Bản đồ du lịch</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-[#10251A]">Không tìm thấy địa điểm</h1>
        <Link
          href="/#ban-do-du-lich"
          className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#29452C] px-5 font-semibold text-white"
        >
          Về bản đồ du lịch
        </Link>
      </div>
    </main>
  );
}
