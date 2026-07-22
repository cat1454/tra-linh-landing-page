-- Forward-only schema and security migration.
-- Back up shared data before applying. Repair with a later migration; do not
-- edit or roll this migration back after it reaches a shared environment.

alter table public.site_settings
  add column if not exists contact_email text,
  add column if not exists contact_phone text,
  add column if not exists zalo_url text,
  add column if not exists maps_url text,
  add column if not exists privacy_url text;

alter table public.contact_submissions
  add column if not exists interest text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'contact_submissions_interest_check'
      and conrelid = 'public.contact_submissions'::regclass
  ) then
    alter table public.contact_submissions
      add constraint contact_submissions_interest_check
      check (
        interest is null
        or interest in ('journey', 'culture', 'ginseng', 'partnership', 'other')
      );
  end if;
end;
$$;

-- Public reads must satisfy the same verified-content contract as the app
-- repository. Authenticated administrators retain their separate manage policy.
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
      'create policy "Public reads published content" on public.%I for select to anon, authenticated using (status = ''published''::public.content_status and is_placeholder = false and verified_at is not null and source_url is not null and char_length(trim(source_url)) > 0 and source_credit is not null and char_length(trim(source_credit)) > 0 and usage_permission is not null and usage_permission <> ''pending'')',
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
        and verification_status = 'verified'::public.verification_status
        and verified_at is not null
        and source_url is not null
        and char_length(trim(source_url)) > 0
        and source_credit is not null
        and char_length(trim(source_credit)) > 0
        and usage_permission is not null
        and usage_permission <> 'pending'
    )
  );
