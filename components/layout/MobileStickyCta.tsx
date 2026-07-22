import { MapPinned, MessageCircle, Phone } from "lucide-react";

const DEFAULT_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=UBND+x%C3%A3+Tr%C3%A0+Linh%2C+th%C3%A0nh+ph%E1%BB%91+%C4%90%C3%A0+N%E1%BA%B5ng";

interface MobileStickyCtaProps {
  mapsUrl?: string;
  zaloUrl?: string;
  contactPhone?: string;
}

export function MobileStickyCta({
  mapsUrl = DEFAULT_MAPS_URL,
  zaloUrl,
  contactPhone,
}: MobileStickyCtaProps) {
  const contactHref = zaloUrl ?? (contactPhone ? `tel:${contactPhone}` : "/#lien-he");
  const contactLabel = zaloUrl ? "Zalo" : contactPhone ? "Gọi điện" : "Liên hệ";

  return (
    <nav
      aria-label="Thao tác nhanh"
      className="mobile-sticky-cta fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2 border-t border-[#10251A]/10 bg-[#EEF1E9]/95 px-3 pt-2 shadow-[0_-12px_36px_rgba(16,37,26,0.12)] backdrop-blur-xl md:hidden"
    >
      <a
        href={mapsUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#10251A]/15 bg-white px-4 text-sm font-semibold text-[#10251A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]"
      >
        <MapPinned aria-hidden="true" size={18} />
        Chỉ đường
      </a>
      <a
        href={contactHref}
        {...(zaloUrl ? { target: "_blank", rel: "noreferrer" } : {})}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#10251A] px-4 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5E7F3B]"
      >
        {contactPhone && !zaloUrl ? (
          <Phone aria-hidden="true" size={18} />
        ) : (
          <MessageCircle aria-hidden="true" size={18} />
        )}
        {contactLabel}
      </a>
    </nav>
  );
}
