-- Forward-only data migration for editable section copy and media metadata.

update storage.buckets
set
  file_size_limit = 262144000,
  allowed_mime_types = array[
    'image/avif',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]
where id = 'media';

update public.media_assets
set
  media_type = case
    when coalesce(mime_type, '') like 'video/%'
      or lower(file_url) ~ '\.(mp4|webm)(\?.*)?$'
      then 'video'
    else 'image'
  end,
  external_url = case when storage_path is null then file_url else external_url end
where media_type = 'image' or external_url is null;

insert into public.page_sections (
  section_key,
  eyebrow,
  title,
  description,
  secondary_text,
  cta_label,
  cta_href,
  badges,
  stats,
  status,
  display_order
)
values
  ('hero', 'TRÀ LINH · VÙNG NGỌC LINH', 'Giữa đại ngàn, một báu vật lớn lên',
    'Nơi rừng già, mây núi và bàn tay người Xơ Đăng cùng gìn giữ vùng sâm Ngọc Linh dưới tán đại ngàn.',
    'Trà Linh', 'Khám phá hành trình', '#hanh-trinh',
    '["Rừng", "Văn hóa", "Sâm Ngọc Linh"]'::jsonb, '[]'::jsonb, 'published', 0),
  ('identity', null, 'Những giá trị làm nên Trà Linh', null, null, null, null,
    '[]'::jsonb,
    '[{"value":"Đại ngàn","label":"Rừng núi xanh thẳm và mây phủ theo nhịp mùa.","icon":"mountain"},{"value":"Vùng sâm","label":"Sâm Ngọc Linh được nuôi dưỡng dưới tán rừng.","icon":"sprout"},{"value":"Bản sắc","label":"Đời sống cộng đồng Xơ Đăng giàu truyền thống.","icon":"community"},{"value":"Dược liệu","label":"Tri thức bản địa đồng hành cùng việc giữ rừng.","icon":"leaf"}]'::jsonb,
    'published', 10),
  ('story', 'Câu chuyện vùng cao', 'Một vùng đất sống cùng rừng',
    'Trà Linh được kể qua cảnh quan, sinh kế và tri thức bản địa.', null, null, null,
    '["Rừng tự nhiên","Khí hậu mát ẩm","Dược liệu dưới tán","Sinh kế cộng đồng"]'::jsonb,
    '[]'::jsonb, 'published', 20),
  ('journeys', 'Khám phá có trách nhiệm', 'Những hành trình giữa đại ngàn',
    'Mỗi cung đường cần được chuẩn bị kỹ và tôn trọng hướng dẫn của địa phương.', null,
    null, null, '[]'::jsonb, '[]'::jsonb, 'published', 30),
  ('ginseng', 'Vùng sâm dưới tán rừng', 'Một hành trình lớn lên chậm rãi',
    'Sâm Ngọc Linh gắn với độ ẩm, lớp mùn và bóng râm của rừng.', 'Sống cùng rừng',
    null, null, '[]'::jsonb, '[]'::jsonb, 'published', 40),
  ('culture', 'Văn hóa & con người', 'Nhịp sống Xơ Đăng giữa đại ngàn',
    'Rừng không chỉ là cảnh quan mà còn là không gian sống và văn hóa.', null,
    null, null, '[]'::jsonb, '[]'::jsonb, 'published', 50),
  ('local_products', 'Sản vật địa phương', 'Hương vị của núi rừng',
    'Những sản vật gắn với mùa vụ, tri thức và bàn tay của cộng đồng.', null,
    null, null, '[]'::jsonb, '[]'::jsonb, 'published', 60),
  ('products', 'Sâm Ngọc Linh', 'Sản phẩm từ vùng dược liệu',
    'Thông tin giới thiệu sản phẩm và nguồn gốc địa phương.', null,
    null, null, '[]'::jsonb, '[]'::jsonb, 'published', 70),
  ('guides', 'Cẩm nang hành trình', 'Chuẩn bị cho vùng núi cao',
    'Thông tin thiết thực giúp bạn đi chậm, an toàn và tôn trọng không gian sống của cộng đồng địa phương.',
    'Điều kiện đường và thời tiết vùng cao có thể thay đổi.', null, null,
    '["Theo dõi thời tiết","Đi cùng hướng dẫn"]'::jsonb, '[]'::jsonb, 'published', 80),
  ('final_cta', 'Bắt đầu hành trình', 'Trà Linh không chỉ để ngắm nhìn',
    'Đó là hành trình chạm vào rừng, con người và câu chuyện của vùng sâm Ngọc Linh.',
    null, 'Khám phá hành trình', '#hanh-trinh', '[]'::jsonb, '[]'::jsonb, 'published', 90),
  ('contact', 'Liên hệ', 'Kết nối với Trà Linh',
    'Hãy để lại thông tin nếu bạn cần hỗ trợ cho hành trình hoặc hợp tác.', null,
    null, null, '[]'::jsonb, '[]'::jsonb, 'published', 100)
on conflict (section_key) do nothing;

