-- Forward-only data migration.
-- Back up the affected tables before applying in a shared environment. This
-- intentionally preserves every row and only removes placeholders from the
-- public publication state.

update public.site_settings
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.hero_slides
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.stories
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.journeys
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.ginseng_story_steps
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.culture_stories
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.local_products
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.ginseng_products
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.travel_guides
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;

update public.media_assets
set status = 'review'::public.content_status
where status = 'published'::public.content_status and is_placeholder = true;
