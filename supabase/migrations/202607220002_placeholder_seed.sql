-- Data/configuration migration kept separate from schema DDL.
-- Placeholder rows stay in review and are never exposed by the public RLS policy.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into public.site_settings (
  id,
  site_name,
  tagline,
  description,
  primary_cta_label,
  primary_cta_href,
  legal_address,
  status,
  is_placeholder,
  placeholder_label,
  display_order
)
values (
  '2fb9bb8c-2be2-4aa5-b722-812a7eab87ae',
  'Trà Linh',
  'Đại ngàn Ngọc Linh',
  'Nội dung khởi tạo để biên tập trước khi xuất bản.',
  'Khám phá hành trình',
  '#hanh-trinh',
  'Xã Trà Linh, thành phố Đà Nẵng',
  'review',
  true,
  'Nội dung đề xuất',
  0
)
on conflict (id) do nothing;

insert into public.hero_slides (
  id,
  eyebrow,
  title,
  description,
  image_url,
  alt_text,
  cta_label,
  cta_href,
  status,
  is_placeholder,
  placeholder_label,
  source_credit,
  usage_permission,
  display_order
)
values (
  '8ee0aaf5-589e-4b3f-a84f-2c9c9784db43',
  'Trà Linh · vùng Nam Trà My',
  'Khám phá Trà Linh giữa đại ngàn Ngọc Linh',
  'Ảnh và nội dung đề xuất cần được chủ dự án xác minh trước khi xuất bản.',
  '/images/tra-linh/hero-ban-lang-ngoc-linh.jpg',
  'Bản làng vùng cao giữa núi rừng Ngọc Linh trong sương sớm',
  'Khám phá hành trình',
  '#hanh-trinh',
  'review',
  true,
  'Nội dung đề xuất',
  'Dữ liệu crawler đã tuyển chọn',
  'client_confirmed',
  0
)
on conflict (id) do nothing;

-- Bootstrap the first administrator manually after applying migrations:
-- insert into public.admin_users (email, role)
-- values (lower('admin@example.com'), 'admin');
-- Replace the example address; never commit a real private address here.
