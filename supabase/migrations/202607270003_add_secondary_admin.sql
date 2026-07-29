-- Keep the additional administrator active after the ownership handover
-- migrations are applied in order.

insert into public.admin_users (email, role, is_active)
values ('phuh15521@gmail.com', 'admin', true)
on conflict ((lower(email))) do update set
  role = 'admin',
  is_active = true,
  updated_at = now();
