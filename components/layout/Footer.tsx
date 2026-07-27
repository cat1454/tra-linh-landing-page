import Link from 'next/link'

// ─── Navigation Groups ──────────────────────────────────────────────────────

const footerGroups = (privacyUrl: string) => [
  {
    title: 'Khám Phá',
    links: [
      { href: '/#cau-chuyen', label: 'Câu chuyện Trà Linh' },
      { href: '/#hanh-trinh', label: 'Hành trình' },
      { href: '/#ban-do-du-lich', label: 'Bản đồ du lịch' },
      { href: '/#van-hoa', label: 'Văn hóa Xơ Đăng' },
    ],
  },
  {
    title: 'Sản Vật & Thiên Nhiên',
    links: [
      { href: '/#vung-sam', label: 'Vùng sâm Ngọc Linh' },
      { href: '/#san-vat', label: 'Dược liệu rừng' },
      { href: '/#san-vat', label: 'Nông sản địa phương' },
      { href: '/#cam-nang', label: 'Cẩm nang du lịch' },
    ],
  },
  {
    title: 'Thông Tin',
    links: [
      { href: '/dia-diem', label: 'Địa điểm' },
      { href: '/#lien-he', label: 'Liên hệ' },
      { href: privacyUrl, label: 'Quyền riêng tư' },
      { href: 'https://tralinh.danang.gov.vn/', label: 'Cổng thông tin xã' },
    ],
  },
] as const

// ─── Social Icons ────────────────────────────────────────────────────────────

function FacebookIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface FooterProps {
  contactEmail?: string
  contactPhone?: string
  title?: string
  description?: string
  legalAddress?: string
  privacyUrl?: string
  facebookUrl?: string
  youtubeUrl?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function Footer({
  contactEmail,
  contactPhone,
  title = 'TRÀ LINH',
  description,
  legalAddress,
  privacyUrl = '/chinh-sach-quyen-rieng',
  facebookUrl,
  youtubeUrl,
}: FooterProps = {}) {
  const hasSocial = facebookUrl || youtubeUrl
  const hasContact = contactEmail || contactPhone
  const groups = footerGroups(privacyUrl)

  return (
    <footer className="site-footer bg-[#0D1F15] text-[#EEF1E9]">
      {/* ── Main body ─────────────────────────────────────────────────── */}
      <div className="site-footer__inner mx-auto w-full max-w-[1440px] px-5 py-14 md:px-8 md:py-20 xl:px-12">
        <div className="site-footer__grid grid gap-12 lg:grid-cols-[1.25fr_repeat(3,_1fr)] xl:gap-16">

          {/* Brand column */}
          <div className="site-footer__identity">
            {/* Logo */}
            <Link href="/" className="inline-flex flex-col justify-center">
              <span className="text-2xl font-semibold tracking-[0.22em] text-[#EEF1E9]">
                {title}
              </span>
              <span className="mt-1 text-[11px] tracking-widest text-[#A8C4A0]/80 uppercase">
                Đại ngàn Ngọc Linh
              </span>
            </Link>

            {/* Location badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#D5A84E]/30 bg-[#D5A84E]/8 px-3 py-1">
              <svg width="11" height="14" viewBox="0 0 11 14" fill="none" aria-hidden="true">
                <path
                  d="M5.5 0C2.462 0 0 2.462 0 5.5c0 4.125 5.5 8.5 5.5 8.5S11 9.625 11 5.5C11 2.462 8.538 0 5.5 0zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
                  fill="#D5A84E"
                />
              </svg>
              <span className="text-[11px] font-medium tracking-wide text-[#D5A84E]">
                Xã Trà Linh · Đà Nẵng
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm leading-7 text-[#EEF1E9]/68">
              {description ??
                'Một lát cắt về thiên nhiên, văn hóa Xơ Đăng và vùng sâm dưới tán rừng Ngọc Linh.'}
            </p>

            <p className="mt-3 text-xs leading-6 text-[#EEF1E9]/60">
              Trang giới thiệu độc lập — không phải cổng thông tin chính thức hay website bán tour.
            </p>

            {/* Social links */}
            {hasSocial && (
              <div className="mt-6 flex items-center gap-2">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook Trà Linh"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-[#EEF1E9]/60 transition-all duration-200 hover:border-[#1877F2]/60 hover:bg-[#1877F2]/15 hover:text-[#1877F2]"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="YouTube Trà Linh"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-[#EEF1E9]/60 transition-all duration-200 hover:border-[#FF0000]/60 hover:bg-[#FF0000]/15 hover:text-[#FF0000]"
                  >
                    <YoutubeIcon />
                  </a>
                )}
              </div>
            )}

            {/* Contact */}
            {hasContact && (
              <address className="mt-5 flex flex-col items-start gap-1.5 text-sm not-italic">
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="inline-flex min-h-8 items-center gap-2 text-[#EEF1E9]/72 transition-colors hover:text-[#D5A84E]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                    </svg>
                    {contactPhone}
                  </a>
                )}
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex min-h-8 items-center gap-2 text-[#EEF1E9]/72 transition-colors hover:text-[#D5A84E]"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    {contactEmail}
                  </a>
                )}
              </address>
            )}
          </div>

          {/* Nav columns */}
          {groups.map((group) => (
            <div key={group.title} className="site-footer__group">
              {/* Mobile: collapsible; Desktop: always open */}
              <details className="group/details border-b border-white/10 pb-3 sm:border-0 sm:pb-0" open>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D5A84E] sm:cursor-default sm:mb-1">
                  {group.title}
                  {/* Chevron – only visible on mobile */}
                  <svg
                    className="h-4 w-4 transition-transform group-open/details:rotate-180 sm:hidden"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>

                <ul className="mt-2 space-y-2 pb-2">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <a
                        href={link.href}
                        {...(link.href.startsWith('http')
                          ? { target: '_blank', rel: 'noreferrer' }
                          : {})}
                        className="group/link inline-flex min-h-9 items-center text-sm text-[#EEF1E9]/65 transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
                      >
                        <span className="relative">
                          {link.label}
                          <span className="absolute -bottom-px left-0 h-px w-0 bg-[#D5A84E]/60 transition-all duration-300 group-hover/link:w-full" />
                        </span>
                        {link.href.startsWith('http') && (
                          <svg
                            className="ml-1.5 h-3 w-3 opacity-40"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </div>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        {/* ── Legal bar ─────────────────────────────────────────────────── */}
        <div className="site-footer__legal mt-6 flex flex-col gap-3 text-xs leading-5 text-[#EEF1E9]/60 md:flex-row md:items-center md:justify-between">
          <p>
            © 2026&ensp;·&ensp;
            {legalAddress ?? 'Xã Trà Linh, thành phố Đà Nẵng'}
          </p>
          <p className="max-w-md text-right">
            Thông tin hành trình cần được xác nhận với đơn vị địa phương trước khi khởi hành.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
