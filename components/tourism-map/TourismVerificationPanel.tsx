import { AlertCircle, ExternalLink, ShieldCheck } from "lucide-react";

import type { TourismPlace } from "@/data/tourism-map/types";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatReviewDate(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : dateFormatter.format(date);
}

export function TourismVerificationPanel({ place }: { place: TourismPlace }) {
  const verified = place.verificationStatus === "verified";
  const reviewedAt = formatReviewDate(place.lastReviewedAt ?? place.verifiedAt);
  const sourceUrls = place.sourceUrls ?? [];
  const Icon = verified ? ShieldCheck : AlertCircle;

  return (
    <section aria-labelledby="place-verification-heading" className="mt-7 rounded-2xl border border-[#10251A]/10 bg-white/65 p-5">
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className={`mt-0.5 size-5 shrink-0 ${verified ? "text-[#49672D]" : "text-[#8A633D]"}`} />
        <div>
          <h2 id="place-verification-heading" className="font-serif text-xl">{verified ? "Đã xác minh" : "Đang xác minh"}</h2>
          <p className="mt-1 text-sm leading-6 text-[#536258]">
            {verified
              ? `Địa điểm đã được đối chiếu${place.verifiedBy ? ` qua ${place.verifiedBy}` : " với nguồn công khai"}.`
              : "Tọa độ hoặc thông tin vận hành chưa được xác nhận đầy đủ; không dùng như cam kết đặt chỗ."}
          </p>
          {reviewedAt ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#49672D]">Rà soát: {reviewedAt}</p> : null}
        </div>
      </div>

      {sourceUrls.length ? (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Nguồn tham khảo">
          {sourceUrls.map((sourceUrl, index) => (
            <li key={sourceUrl}>
              <a href={sourceUrl} target="_blank" rel="noreferrer" aria-label={`Nguồn tham khảo ${index + 1} (mở trong tab mới)`} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#29452C]/15 px-3 text-xs font-semibold text-[#29452C] hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]">Nguồn tham khảo {index + 1}<ExternalLink aria-hidden="true" className="size-3.5" /></a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[#704330]">Chưa có liên kết nguồn công khai đủ để xác minh.</p>
      )}

      <p className="mt-4 border-t border-[#10251A]/10 pt-4 text-sm leading-6 text-[#704330]">Giờ mở cửa và chi phí có thể thay đổi; hãy xác nhận trực tiếp với đơn vị quản lý trước khi đi hoặc thanh toán.</p>
    </section>
  );
}
