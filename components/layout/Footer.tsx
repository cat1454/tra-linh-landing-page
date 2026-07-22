import Link from 'next/link'

import { NewsletterForm } from '@/components/forms/NewsletterForm'
import type { PublicFormAction } from '@/components/forms/types'

interface FooterProps {
  readonly isNewsletterEnabled?: boolean
  readonly newsletterAction?: PublicFormAction
}

const footerGroups = [
  {
    title: 'Khám phá',
    links: [
      { href: '/#cau-chuyen', label: 'Câu chuyện Trà Linh' },
      { href: '/#hanh-trinh', label: 'Hành trình' },
      { href: '/#vung-sam', label: 'Vùng sâm' },
      { href: '/#van-hoa', label: 'Văn hóa Xơ Đăng' },
    ],
  },
  {
    title: 'Sản vật',
    links: [
      { href: '/#san-pham-sam', label: 'Sâm Ngọc Linh' },
      { href: '/#san-vat', label: 'Dược liệu' },
      { href: '/#san-vat', label: 'Nông sản địa phương' },
      { href: '/#san-pham-sam', label: 'Sản phẩm đề xuất' },
    ],
  },
  {
    title: 'Thông tin',
    links: [
      { href: '/#cam-nang', label: 'Cẩm nang' },
      { href: '/#cam-nang', label: 'Bản đồ' },
      { href: '/#lien-he', label: 'Liên hệ' },
    ],
  },
] as const

export function Footer({
  isNewsletterEnabled = false,
  newsletterAction,
}: FooterProps) {
  return (
    <footer className="site-footer bg-[#10251A] text-[#EEF1E9]">
      <div className="site-footer__inner mx-auto w-full max-w-[1440px] px-5 py-14 md:px-8 md:py-20 xl:px-12">
        <div className="site-footer__grid grid gap-10 lg:grid-cols-[1.35fr_2fr_1.25fr] xl:gap-14">
          <div className="site-footer__identity max-w-sm">
            <Link href="/" className="inline-flex min-h-11 flex-col justify-center">
              <span className="text-2xl font-semibold tracking-[0.2em]">TRÀ LINH</span>
              <span className="mt-1 text-xs tracking-wide text-[#EEF1E9]/65">
                Đại ngàn Ngọc Linh
              </span>
            </Link>
            <p className="mt-6 text-sm leading-7 text-[#EEF1E9]/72">
              Một lát cắt về thiên nhiên, văn hóa Xơ Đăng và vùng sâm dưới tán rừng Ngọc Linh.
            </p>
            <p className="mt-4 text-xs leading-6 text-[#EEF1E9]/55">
              Nhận diện địa phương: Trà Linh – vùng Nam Trà My, Quảng Nam trước đây.
            </p>
          </div>

          <div className="site-footer__navigation grid gap-3 sm:grid-cols-3 sm:gap-6">
            {footerGroups.map((group) => (
              <details key={group.title} className="site-footer__group border-b border-white/10 pb-3 sm:border-0 sm:pb-0" open>
                <summary className="site-footer__group-title flex min-h-11 cursor-pointer items-center text-sm font-semibold uppercase tracking-[0.12em] text-[#D5A84E] sm:cursor-default">
                  {group.title}
                </summary>
                <ul className="mt-2 space-y-2.5 pb-2">
                  {group.links.map((link) => (
                    <li key={`${group.title}-${link.label}`}>
                      <a
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-sm text-[#EEF1E9]/72 transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D5A84E]"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="site-footer__newsletter">
            <NewsletterForm
              isEnabled={isNewsletterEnabled}
              serverAction={newsletterAction}
              tone="dark"
            />
          </div>
        </div>

        <div className="site-footer__legal mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-5 text-[#EEF1E9]/55 md:flex-row md:items-center md:justify-between">
          <p>Xã Trà Linh, thành phố Đà Nẵng, Việt Nam.</p>
          <p>Thông tin hành trình cần được xác nhận với đơn vị địa phương trước khi khởi hành.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
