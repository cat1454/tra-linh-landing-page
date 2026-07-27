export interface NavigationItem {
  readonly href: string
  readonly label: string
}

export const PRIMARY_NAVIGATION: readonly NavigationItem[] = [
  { href: '/#cau-chuyen', label: 'Câu chuyện' },
  { href: '/#hanh-trinh', label: 'Khám phá' },
  { href: '/#vung-sam', label: 'Vùng sâm' },
  { href: '/#van-hoa', label: 'Văn hóa' },
  { href: '/#ban-do-du-lich', label: 'Bản đồ' },
  { href: '/#san-vat', label: 'Sản vật' },
  { href: '/#cam-nang', label: 'Cẩm nang' },
]
