-- Neutralize the previous operator's public contact and CMS access before a
-- code-only handover. This migration intentionally provisions no replacement
-- administrator. The recipient must bootstrap their first administrator with
-- the parameterized statement documented in README.md and HANDOVER.md.
--
-- Do not apply this migration to an environment that the previous operator
-- still needs to administer.

update public.site_settings
set
  contact_email = null,
  contact_phone = null,
  zalo_url = null,
  updated_at = now()
where
  lower(coalesce(contact_email, '')) = 'phuh15521@gmail.com'
  or regexp_replace(coalesce(contact_phone, ''), '[^0-9]', '', 'g') = '0334059776';

update public.admin_users
set
  is_active = false,
  updated_at = now()
where lower(email) = 'phuh15521@gmail.com';
