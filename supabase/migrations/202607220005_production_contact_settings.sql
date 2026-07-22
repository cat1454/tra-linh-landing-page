-- Production-owned configuration kept separate from reusable schema changes.
-- The contact details below were confirmed by the project owner on 2026-07-22.

insert into public.site_settings (
  id,
  site_name,
  tagline,
  description,
  primary_cta_label,
  primary_cta_href,
  legal_address,
  contact_email,
  contact_phone,
  privacy_url,
  status,
  is_placeholder,
  source_url,
  source_credit,
  usage_permission,
  verified_at,
  display_order
)
values (
  '2fb9bb8c-2be2-4aa5-b722-812a7eab87ae',
  'Trà Linh',
  'Đại ngàn Ngọc Linh',
  'Trang giới thiệu độc lập về thiên nhiên, văn hóa Xơ Đăng và vùng sâm Ngọc Linh.',
  'Khám phá hành trình',
  '#hanh-trinh',
  'Xã Trà Linh, thành phố Đà Nẵng',
  'phuh15521@gmail.com',
  '0334059776',
  '/chinh-sach-quyen-rieng',
  'published',
  false,
  'https://tralinh.danang.gov.vn/gioi-thieu/gioi-thieu-chung',
  'Chủ dự án xác nhận đầu mối liên hệ; nội dung địa phương đối chiếu Cổng thông tin điện tử xã Trà Linh',
  'client_confirmed',
  now(),
  0
)
on conflict (id) do update set
  site_name = excluded.site_name,
  tagline = excluded.tagline,
  description = excluded.description,
  primary_cta_label = excluded.primary_cta_label,
  primary_cta_href = excluded.primary_cta_href,
  legal_address = excluded.legal_address,
  contact_email = excluded.contact_email,
  contact_phone = excluded.contact_phone,
  privacy_url = excluded.privacy_url,
  status = excluded.status,
  is_placeholder = excluded.is_placeholder,
  placeholder_label = null,
  source_url = excluded.source_url,
  source_credit = excluded.source_credit,
  usage_permission = excluded.usage_permission,
  verified_at = excluded.verified_at,
  updated_at = now();

insert into public.admin_users (email, role, is_active)
values ('phuh15521@gmail.com', 'admin', true)
on conflict ((lower(email))) do update set
  role = 'admin',
  is_active = true,
  updated_at = now();
