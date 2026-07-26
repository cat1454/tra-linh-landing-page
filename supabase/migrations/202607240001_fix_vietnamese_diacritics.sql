-- Correct Vietnamese diacritics in the published hero copy.
update public.page_sections
set
  eyebrow = 'TRÀ LINH · VÙNG NGỌC LINH',
  title = 'Giữa đại ngàn, một báu vật lớn lên',
  updated_at = now()
where section_key = 'hero';
