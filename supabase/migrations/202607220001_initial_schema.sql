-- Trà Linh CMS initial schema.
-- Forward-only migration: if this has reached a shared environment, repair it
-- with a new timestamped migration instead of editing or reverting this file.

create extension if not exists pgcrypto;

create type public.content_status as enum ('draft', 'review', 'published');
create type public.verification_status as enum ('placeholder', 'verified');
create type public.access_status as enum ('open', 'contact_required', 'organized_only');

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null,
  tagline text,
  description text,
  primary_cta_label text,
  primary_cta_href text,
  legal_address text,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  description text,
  image_url text not null,
  alt_text text not null check (char_length(alt_text) >= 5),
  cta_label text,
  cta_href text,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  eyebrow text,
  title text not null,
  description text,
  body jsonb not null default '[]'::jsonb,
  quote text,
  image_url text,
  alt_text text,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint stories_image_alt_check check (
    image_url is null or (alt_text is not null and char_length(alt_text) >= 5)
  )
);

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  category text not null,
  short_description text not null,
  body jsonb not null default '[]'::jsonb,
  image_url text not null,
  alt_text text not null check (char_length(alt_text) >= 5),
  location_label text,
  duration_label text,
  access_note text,
  safety_note text,
  highlights jsonb not null default '[]'::jsonb,
  access_status public.access_status not null default 'contact_required',
  contact_required boolean not null default true,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint journeys_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint journeys_access_check check (access_status = 'open' or contact_required)
);

create unique index journeys_slug_unique on public.journeys (lower(slug));

create table public.ginseng_story_steps (
  id uuid primary key default gen_random_uuid(),
  step_number integer not null check (step_number > 0),
  title text not null,
  description text not null,
  quote text,
  image_url text,
  alt_text text,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ginseng_story_steps_image_alt_check check (
    image_url is null or (alt_text is not null and char_length(alt_text) >= 5)
  )
);

create table public.culture_stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text not null,
  alt_text text not null check (char_length(alt_text) >= 5),
  caption text,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.local_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  category text not null,
  description text not null,
  image_url text not null,
  alt_text text not null check (char_length(alt_text) >= 5),
  origin_note text,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint local_products_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create unique index local_products_slug_unique on public.local_products (lower(slug));

create table public.ginseng_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  product_type text not null,
  short_description text not null,
  image_url text not null,
  alt_text text not null check (char_length(alt_text) >= 5),
  contact_url text,
  origin_note text,
  legal_disclaimer text not null check (char_length(legal_disclaimer) >= 20),
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ginseng_products_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create unique index ginseng_products_slug_unique on public.ginseng_products (lower(slug));

create table public.travel_guides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  category text not null,
  excerpt text not null,
  body jsonb not null default '[]'::jsonb,
  image_url text,
  alt_text text,
  read_time_label text,
  season_label text,
  sections jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text,
  source_credit text,
  usage_permission text,
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint travel_guides_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint travel_guides_image_alt_check check (
    image_url is null or (alt_text is not null and char_length(alt_text) >= 5)
  )
);

create unique index travel_guides_slug_unique on public.travel_guides (lower(slug));

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_url text not null,
  storage_path text unique,
  alt_text text not null check (char_length(alt_text) >= 5),
  section text,
  verification_status public.verification_status not null default 'placeholder',
  status public.content_status not null default 'draft',
  is_placeholder boolean not null default true,
  source_url text not null,
  source_credit text not null,
  usage_permission text not null check (usage_permission in ('client_confirmed', 'official_publication', 'pending')),
  verified_at timestamptz,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  email text not null,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  is_active boolean not null default true,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_email_normalized check (email = lower(trim(email)))
);

create unique index admin_users_email_unique on public.admin_users (lower(email));

create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254),
  phone text,
  message text not null check (char_length(message) between 10 and 3000),
  consent boolean not null check (consent),
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved', 'spam')),
  request_fingerprint text not null check (char_length(request_fingerprint) = 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index contact_submissions_status_created_idx
  on public.contact_submissions (status, created_at desc);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  consent boolean not null check (consent),
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  request_fingerprint text not null check (char_length(request_fingerprint) = 64),
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_email_normalized check (email = lower(trim(email)))
);

create unique index newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

create table public.rate_limits (
  key text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 1 check (request_count > 0),
  updated_at timestamptz not null default now()
);

-- All editorial records share an explicit placeholder label so fallback and
-- Supabase adapters expose the same public interface.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings', 'hero_slides', 'stories', 'journeys',
    'ginseng_story_steps', 'culture_stories', 'local_products',
    'ginseng_products', 'travel_guides', 'media_assets'
  ]
  loop
    execute format(
      'alter table public.%I add column placeholder_label text default ''Nội dung đề xuất'', add constraint %I check (not is_placeholder or (placeholder_label is not null and char_length(placeholder_label) > 0)), add constraint %I check (status <> ''published''::public.content_status or is_placeholder or (source_url is not null and source_credit is not null and char_length(source_credit) > 0 and usage_permission is not null and char_length(usage_permission) > 0 and usage_permission <> ''pending'' and verified_at is not null))',
      table_name,
      table_name || '_placeholder_label_check',
      table_name || '_publication_verification_check'
    );
  end loop;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings', 'hero_slides', 'stories', 'journeys',
    'ginseng_story_steps', 'culture_stories', 'local_products',
    'ginseng_products', 'travel_guides', 'media_assets', 'admin_users',
    'contact_submissions', 'newsletter_subscribers', 'rate_limits'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      table_name || '_set_updated_at',
      table_name
    );
  end loop;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and user_id = auth.uid()
      and is_active = true
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
      and user_id = auth.uid()
      and is_active = true
      and role = 'admin'
  );
$$;

revoke all on function public.is_super_admin() from public, anon;
grant execute on function public.is_super_admin() to authenticated;

create or replace function public.consume_rate_limit(
  p_key text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_count integer;
begin
  if p_key is null or char_length(p_key) < 8 or p_limit < 1 or p_window_seconds < 1 then
    return false;
  end if;

  insert into public.rate_limits as limits (key, window_started_at, request_count)
  values (p_key, now(), 1)
  on conflict (key) do update
  set
    window_started_at = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now()
      else limits.window_started_at
    end,
    request_count = case
      when limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1
      else limits.request_count + 1
    end,
    updated_at = now()
  returning request_count into current_count;

  return current_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_rate_limit(text, integer, integer) to service_role;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings', 'hero_slides', 'stories', 'journeys',
    'ginseng_story_steps', 'culture_stories', 'local_products',
    'ginseng_products', 'travel_guides', 'media_assets', 'admin_users',
    'contact_submissions', 'newsletter_subscribers', 'rate_limits'
  ]
  loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings', 'hero_slides', 'stories', 'journeys',
    'ginseng_story_steps', 'culture_stories', 'local_products',
    'ginseng_products', 'travel_guides', 'media_assets'
  ]
  loop
    execute format(
      'create policy "Public reads published content" on public.%I for select to anon, authenticated using (status = ''published''::public.content_status)',
      table_name
    );
    execute format(
      'create policy "Allowlisted users manage content" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      table_name
    );
  end loop;
end;
$$;

create policy "Allowlisted users view allowlist"
  on public.admin_users for select to authenticated
  using (public.is_admin());

create policy "Administrators manage allowlist"
  on public.admin_users for all to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

create policy "Allowlisted users read contact submissions"
  on public.contact_submissions for select to authenticated
  using (public.is_admin());

create policy "Allowlisted users update contact submissions"
  on public.contact_submissions for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Allowlisted users read newsletter subscriptions"
  on public.newsletter_subscribers for select to authenticated
  using (public.is_admin());

create policy "Allowlisted users update newsletter subscriptions"
  on public.newsletter_subscribers for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

grant select on table
  public.site_settings,
  public.hero_slides,
  public.stories,
  public.journeys,
  public.ginseng_story_steps,
  public.culture_stories,
  public.local_products,
  public.ginseng_products,
  public.travel_guides,
  public.media_assets
to anon, authenticated;

grant insert, update, delete on table
  public.site_settings,
  public.hero_slides,
  public.stories,
  public.journeys,
  public.ginseng_story_steps,
  public.culture_stories,
  public.local_products,
  public.ginseng_products,
  public.travel_guides,
  public.media_assets
to authenticated;

grant select on table public.admin_users to authenticated;
grant insert, update, delete on table public.admin_users to authenticated;
grant select, update on table public.contact_submissions to authenticated;
grant select, update on table public.newsletter_subscribers to authenticated;

-- No anon/authenticated insert policies exist for leads or rate_limits. Public
-- form writes and rate-limit mutations happen only through the server-held
-- service role. The service role bypasses RLS by design.

create policy "Public reads published media files"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1
      from public.media_assets
      where storage_path = storage.objects.name
        and status = 'published'::public.content_status
    )
  );

create policy "Allowlisted users read media files"
  on storage.objects for select to authenticated
  using (bucket_id = 'media' and public.is_admin());

create policy "Allowlisted users upload media files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "Allowlisted users update media files"
  on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "Allowlisted users delete media files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
