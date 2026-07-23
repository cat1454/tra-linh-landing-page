-- Expand the existing Trà Linh CMS without changing deployed migrations.
-- Forward-only schema migration. Roll forward with a later migration if needed.

alter table public.media_assets
  add column if not exists media_type text not null default 'image',
  add column if not exists mime_type text,
  add column if not exists file_size_bytes bigint,
  add column if not exists external_url text,
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists poster_asset_id uuid references public.media_assets(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'media_assets_media_type_check'
      and conrelid = 'public.media_assets'::regclass
  ) then
    alter table public.media_assets
      add constraint media_assets_media_type_check
      check (media_type in ('image', 'video'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname = 'media_assets_file_size_check'
      and conrelid = 'public.media_assets'::regclass
  ) then
    alter table public.media_assets
      add constraint media_assets_file_size_check
      check (file_size_bytes is null or file_size_bytes between 1 and 262144000);
  end if;
end;
$$;

alter table public.site_settings
  add column if not exists header_title text,
  add column if not exists header_subtitle text,
  add column if not exists footer_title text,
  add column if not exists footer_description text,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists navigation jsonb not null default '[]'::jsonb,
  add column if not exists hero_video_url text,
  add column if not exists hero_video_asset_id uuid references public.media_assets(id) on delete set null,
  add column if not exists hero_mobile_poster_url text,
  add column if not exists hero_mobile_poster_asset_id uuid references public.media_assets(id) on delete set null;

create table public.page_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  eyebrow text,
  title text not null,
  description text,
  secondary_text text,
  cta_label text,
  cta_href text,
  badges jsonb not null default '[]'::jsonb,
  stats jsonb not null default '[]'::jsonb,
  media_asset_id uuid references public.media_assets(id) on delete set null,
  status public.content_status not null default 'draft',
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint page_sections_key_check check (section_key ~ '^[a-z0-9]+(_[a-z0-9]+)*$')
);

create trigger page_sections_set_updated_at
  before update on public.page_sections
  for each row execute function public.set_updated_at();

alter table public.page_sections enable row level security;

create policy "Public reads published page sections"
  on public.page_sections for select to anon, authenticated
  using (status = 'published'::public.content_status);

create policy "Allowlisted users manage page sections"
  on public.page_sections for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

grant select on table public.page_sections to anon, authenticated;
grant insert, update, delete on table public.page_sections to authenticated;

alter table public.hero_slides
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  alter column image_url drop not null;
alter table public.stories
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;
alter table public.journeys
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  alter column image_url drop not null;
alter table public.ginseng_story_steps
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;
alter table public.culture_stories
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  alter column image_url drop not null;
alter table public.local_products
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  alter column image_url drop not null;
alter table public.ginseng_products
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null,
  alter column image_url drop not null;
alter table public.travel_guides
  add column if not exists media_asset_id uuid references public.media_assets(id) on delete set null;

-- Owner-supplied content can publish without pretending to have an external URL.
-- External media remains validated by the application before publication.
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
      'drop policy if exists "Public reads published content" on public.%I',
      table_name
    );
    execute format(
      'create policy "Public reads published content" on public.%I for select to anon, authenticated using (status = ''published''::public.content_status and is_placeholder = false)',
      table_name
    );
  end loop;
end;
$$;

drop policy if exists "Public reads published media files" on storage.objects;
create policy "Public reads published media files"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'media'
    and exists (
      select 1
      from public.media_assets
      where storage_path = storage.objects.name
        and status = 'published'::public.content_status
        and is_placeholder = false
    )
  );

