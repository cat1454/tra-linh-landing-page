import Link from 'next/link'
import { ChevronDown, Clock3, ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { FacebookIcon } from '@/components/ui/FacebookIcon'
import { PUBLIC_CONTACT } from '@/lib/site-links'

const vietnameseFooterGroups = (privacyUrl: string) => [
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
      { href: '/ban-do-du-lich', label: 'Địa điểm & bản đồ' },
      { href: '/#lien-he', label: 'Liên hệ' },
      { href: '/da-luu', label: 'Nội dung đã lưu' },
      { href: privacyUrl, label: 'Quyền riêng tư' },
      { href: 'https://tralinh.danang.gov.vn/', label: 'Cổng thông tin xã' },
    ],
  },
] as const

const englishFooterGroups = (privacyUrl: string) => [
  { title: 'Explore', links: [{ href: '/en#overview', label: 'About Tra Linh' }, { href: '/en#journeys', label: 'Journeys' }, { href: '/ban-do-du-lich', label: 'Tourism map' }, { href: '/thoi-tiet', label: 'Weather' }] },
  { title: 'Plan', links: [{ href: '/en#travel-advice', label: 'Travel advice' }, { href: '/cau-hoi-thuong-gap', label: 'FAQ (Vietnamese)' }, { href: '/tim-kiem', label: 'Search (Vietnamese)' }, { href: '/en#contact', label: 'Contact' }] },
  { title: 'Official information', links: [{ href: privacyUrl, label: 'Privacy' }, { href: 'https://tralinh.danang.gov.vn/', label: 'Commune portal' }] },
] as const

interface FooterProps {
  contactEmail?: string
  contactPhone?: string
  organizationEmail?: string
  contactName?: string
  contactRole?: string
  title?: string
  description?: string
  legalAddress?: string
  privacyUrl?: string
  facebookUrl?: string
  youtubeUrl?: string
  locale?: 'vi' | 'en'
}

export function Footer({
  contactEmail = PUBLIC_CONTACT.contactEmail,
  contactPhone = PUBLIC_CONTACT.phone,
  organizationEmail = PUBLIC_CONTACT.email,
  contactName = 'Ông Nguyễn Hữu Quang',
  contactRole = 'Trưởng phòng Văn hoá - Xã hội',
  title = 'ỦY BAN NHÂN DÂN XÃ TRÀ LINH',
  description,
  legalAddress,
  privacyUrl = '/chinh-sach-quyen-rieng',
  facebookUrl,
  youtubeUrl,
  locale = 'vi',
}: FooterProps = {}) {
  const address = legalAddress ?? 'UBND xã Trà Linh, Thôn Hy Ló, xã Trà Linh, TP Đà Nẵng'
  const phoneHref = contactPhone?.replace(/[^\d+]/g, '')
  const phoneLabel = phoneHref === '0376671456' ? '037.667.1456' : contactPhone
  const groups = locale === 'en' ? englishFooterGroups(privacyUrl) : vietnameseFooterGroups(privacyUrl)

  return (
    <footer id="lien-he" className="site-footer scroll-mt-20 bg-[#0D1F15] text-[#EEF1E9]">
      <div className="site-footer__inner mx-auto w-full max-w-[1280px] px-5 py-12 md:px-8 md:py-16 xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,_0.85fr)_minmax(0,_1.55fr)] lg:items-start lg:gap-16">
          <div className="max-w-lg">
            <Link href={locale === 'en' ? '/en' : '/'} className="inline-flex flex-col justify-center">
              <span className="text-2xl font-semibold tracking-[0.2em] text-[#EEF1E9]">
                {locale === 'en' && title === 'ỦY BAN NHÂN DÂN XÃ TRÀ LINH' ? 'TRA LINH COMMUNE' : title}
              </span>
              <span className="mt-1 text-[11px] uppercase tracking-widest text-[#A8C4A0]/80">
                {locale === 'en' ? 'Ngoc Linh highlands' : 'Đại ngàn Ngọc Linh'}
              </span>
            </Link>

            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[#D5A84E]/30 bg-[#D5A84E]/8 px-3 py-1.5">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-[#D5A84E]" />
              <span className="text-[11px] font-medium tracking-wide text-[#D5A84E]">
                Xã Trà Linh · Đà Nẵng
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-[#EEF1E9]/68">
              {description ?? (locale === 'en'
                ? 'Nature, Xe Dang culture and the Ngoc Linh ginseng region, presented for responsible travel.'
                : 'Một lát cắt về thiên nhiên, văn hóa Xơ Đăng và vùng sâm dưới tán rừng Ngọc Linh.')}
            </p>
            <p className="mt-3 text-xs leading-6 text-[#EEF1E9]/55">
              {locale === 'en' ? 'Published by the People’s Committee of Tra Linh Commune.' : 'Cơ quan chủ quản: Ủy ban nhân dân xã Trà Linh.'}
            </p>

            {youtubeUrl && (
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                <a className="rounded-full border border-white/12 px-3 py-2 text-[#EEF1E9]/65 hover:border-[#D5A84E]/50 hover:text-[#D5A84E]" href={youtubeUrl} target="_blank" rel="noreferrer">
                  YouTube
                </a>
              </div>
            )}
          </div>

          <section aria-labelledby="footer-contact-title" className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6 lg:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D5A84E]">
              {locale === 'en' ? 'Official support' : 'Thông tin chính thức'}
            </p>
            <h2 id="footer-contact-title" className="mt-2 font-serif text-2xl leading-tight text-[#EEF1E9] sm:text-3xl">
              {locale === 'en' ? 'Contact and travel support' : 'Liên hệ & hỗ trợ chuyến đi'}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#EEF1E9]/65">
              {locale === 'en'
                ? 'Confirm road conditions, visiting schedules and access rules before departure.'
                : 'Xác nhận điều kiện đường, lịch tham quan và quy định tiếp cận trước khi khởi hành.'}
            </p>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {contactPhone && (
                <a
                  href={`tel:${phoneHref}`}
                  aria-label={`${locale === 'en' ? 'Call' : 'Gọi'} ${phoneLabel}`}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-xl bg-[#D5A84E] px-4 text-sm font-semibold text-[#10251A] transition-colors hover:bg-[#E1BB69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
                >
                  <Phone aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {phoneLabel}
                </a>
              )}
              <a
                href={`mailto:${organizationEmail}`}
                aria-label={`${locale === 'en' ? 'Email' : 'Gửi email'} ${organizationEmail}`}
                className="inline-flex min-h-12 min-w-0 items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-[#EEF1E9] transition-colors hover:border-[#D5A84E]/50 hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
              >
                <Mail aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{locale === 'en' ? 'Send email' : 'Gửi email'}</span>
              </a>
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${locale === 'en' ? 'Message' : 'Nhắn'} Fanpage Xứ sở Sâm Ngọc Linh (${locale === 'en' ? 'opens in a new tab' : 'mở trong tab mới'})`}
                  className="inline-flex min-h-12 items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.045] px-4 text-sm font-semibold text-[#EEF1E9] transition-colors hover:border-[#D5A84E]/50 hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E] sm:col-span-2 xl:col-span-1"
                >
                  <FacebookIcon className="h-4 w-4 shrink-0" />
                  {locale === 'en' ? 'Message fanpage' : 'Nhắn Fanpage'}
                </a>
              )}
            </div>

            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#EEF1E9]/58">
              <Clock3 aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D5A84E]" />
              {locale === 'en' ? 'Replies during office hours when the local contact is available.' : PUBLIC_CONTACT.responseExpectation}
            </p>

            <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 text-sm sm:grid-cols-2 sm:gap-0">
              <address className="not-italic sm:pr-7">
                <p className="font-semibold text-[#EEF1E9]">Thông tin cơ quan</p>
                <p className="mt-2 font-medium leading-6 text-[#EEF1E9]/85">
                  Ủy ban nhân dân xã Trà Linh
                </p>
                <p className="mt-1 leading-6 text-[#EEF1E9]/65">{address}</p>
                <a href={`mailto:${organizationEmail}`} className="mt-2 inline-flex min-h-8 items-center gap-2 break-all text-[#EEF1E9]/72 transition-colors hover:text-[#D5A84E]">
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  {organizationEmail}
                </a>
              </address>

              <address className="border-t border-white/10 pt-6 not-italic sm:border-t-0 sm:border-l sm:pt-0 sm:pl-7">
                <p className="font-semibold text-[#EEF1E9]">Liên hệ</p>
                <p className="mt-2 font-medium leading-6 text-[#EEF1E9]/85">{contactName}</p>
                <p className="mt-1 leading-6 text-[#EEF1E9]/65">{contactRole}</p>

                <div className="mt-3 flex flex-col items-start gap-1">
                  {contactPhone && (
                    <a href={`tel:${phoneHref}`} className="inline-flex min-h-8 items-center gap-2 text-[#EEF1E9]/72 transition-colors hover:text-[#D5A84E]">
                      <Phone aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      {phoneLabel}
                    </a>
                  )}
                  {contactEmail && (
                    <a href={`mailto:${contactEmail}`} className="inline-flex min-h-8 items-center gap-2 break-all text-[#EEF1E9]/72 transition-colors hover:text-[#D5A84E]">
                      <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                      {contactEmail}
                    </a>
                  )}
                </div>
              </address>
            </div>
          </section>
        </div>

        <nav aria-label={locale === 'en' ? 'Footer links' : 'Liên kết cuối trang'} className="mt-10 grid gap-2 border-t border-white/10 pt-7 sm:grid-cols-3 sm:gap-8 lg:mt-12 lg:gap-12">
          {groups.map((group) => (
            <div key={group.title} className="site-footer__group">
              <details className="group/details border-b border-white/10 pb-3 sm:border-0 sm:pb-0" open>
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between text-[11px] font-semibold uppercase tracking-[0.14em] text-[#D5A84E] sm:mb-1 sm:cursor-default">
                  {group.title}
                  <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform group-open/details:rotate-180 sm:hidden" />
                </summary>
                <ul className="mt-1 space-y-1 pb-2">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <a
                        href={link.href}
                        {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}
                        className="inline-flex min-h-9 items-center gap-1.5 text-sm text-[#EEF1E9]/65 transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
                      >
                        {link.label}
                        {link.href.startsWith('http') && <ExternalLink aria-hidden="true" className="h-3 w-3 opacity-45" />}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </nav>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="site-footer__legal grid gap-5 text-[13px] leading-6 text-[#EEF1E9]/55 sm:text-xs sm:leading-5 md:grid-cols-[minmax(0,_0.75fr)_minmax(0,_1.25fr)] md:items-start md:gap-8">
            <p>
              <span className="font-medium text-[#EEF1E9]/65">© 2026</span>
              <span aria-hidden="true" className="hidden sm:inline"> · </span>
              <span className="block sm:inline">{address}</span>
            </p>
            <p
              data-testid="footer-project-credit"
              className="max-w-2xl text-pretty text-xs leading-5 text-[#EEF1E9]/55 md:justify-self-end md:text-right md:text-[11px]"
            >
              Công trình Chuyển đổi số du lịch do Trường Đại học Bách khoa - Đại học Đà Nẵng hỗ trợ triển khai trong Chiến dịch Mùa hè Xanh 2026
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
