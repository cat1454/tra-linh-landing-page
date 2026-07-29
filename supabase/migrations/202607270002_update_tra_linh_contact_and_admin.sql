-- Apply the official UBND Tra Linh contact details supplied by the website
-- owner and provision the designated website administrator.

update public.site_settings
set
  site_name = 'Ủy ban nhân dân xã Trà Linh',
  legal_address = 'UBND xã Trà Linh, Thôn Hy Ló, xã Trà Linh, TP Đà Nẵng',
  contact_email = 'quangnh3@danang.gov.vn',
  contact_phone = '0376671456',
  footer_title = 'ỦY BAN NHÂN DÂN XÃ TRÀ LINH',
  footer_description = 'Thông tin chính thức về thiên nhiên, văn hóa, sản vật và hành trình tại xã Trà Linh.',
  source_credit = 'Ủy ban nhân dân xã Trà Linh',
  usage_permission = 'client_confirmed',
  verified_at = now(),
  updated_at = now()
where id = '2fb9bb8c-2be2-4aa5-b722-812a7eab87ae';

insert into public.admin_users (email, role, is_active)
values ('nhquang.it@mail.com', 'admin', true)
on conflict ((lower(email))) do update set
  role = 'admin',
  is_active = true,
  updated_at = now();
