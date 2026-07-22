-- Forward-only verified content seed.
-- These records mirror the sourced public fallback content so every public
-- homepage link continues to resolve when Supabase is configured.

insert into public.journeys (
  id, title, slug, category, short_description, body, image_url, alt_text,
  location_label, duration_label, access_note, safety_note, highlights,
  access_status, contact_required, status, is_placeholder, source_url,
  source_credit, usage_permission, verified_at, display_order, updated_at
) values
  (
    '4fe9ee5f-6804-46b9-8e69-b274dad99401', 'Đi dưới tán rừng',
    'trekking-duoi-tan-rung', 'nature',
    'Một gợi ý tiếp cận đại ngàn chậm rãi, có người địa phương đồng hành.',
    '[]'::jsonb, '/images/tra-linh/hanh-trinh-rung-sam.webp',
    'Người dân địa phương đi trên lối nhỏ giữa rừng vùng Ngọc Linh',
    'Vùng núi Trà Linh', 'Đi cùng người am hiểu địa hình',
    'Chỉ tham gia theo chương trình được địa phương xác nhận.',
    'Đi cùng người am hiểu địa hình và kiểm tra điều kiện thời tiết trước khi khởi hành.',
    '["Rừng nguyên sinh", "Mây núi", "Tri thức bản địa"]'::jsonb,
    'organized_only', true, 'published', false,
    'https://danang.gov.vn/vi/w/phat-trien-tra-linh-thanh-vung-duoc-lieu-trong-diem-cua-mien-trung',
    'Cổng thông tin điện tử thành phố Đà Nẵng', 'official_publication',
    '2026-07-22T00:00:00Z', 1, '2026-07-22T00:00:00Z'
  ),
  (
    '4fe9ee5f-6804-46b9-8e69-b274dad99402', 'Bản làng trong sương',
    'ban-lang-trong-suong', 'community',
    'Gặp không gian sống của cộng đồng Xơ Đăng giữa những sườn núi xanh.',
    '[]'::jsonb, '/images/tra-linh/hero-ban-lang-ngoc-linh.jpg',
    'Bản làng nép bên sườn núi xanh trong màn sương',
    'Xã Trà Linh, thành phố Đà Nẵng', 'Theo lịch hoạt động được công bố',
    'Cần xác nhận với đầu mối địa phương trước khi ghé thăm.',
    'Tôn trọng sinh hoạt, nghi lễ và quyền riêng tư của cư dân.',
    '["Bản làng", "Câu chuyện cộng đồng", "Cảnh quan vùng cao"]'::jsonb,
    'contact_required', true, 'published', false,
    'https://tralinh.danang.gov.vn/chi-tiet-tin/group/119/nid/4370/cho-phien-tra-linh-thang-4-2-26-khong-gian-van-hoa-song-dong-lan-toa-sinh-ke-va-ban-sac-vung-cao',
    'Cổng thông tin điện tử xã Trà Linh', 'official_publication',
    '2026-07-22T00:00:00Z', 2, '2026-07-22T00:00:00Z'
  ),
  (
    '4fe9ee5f-6804-46b9-8e69-b274dad99403', 'Chạm vào miền dược liệu',
    'cham-vao-mien-duoc-lieu', 'ginseng',
    'Tìm hiểu sâm Ngọc Linh và các loài dược liệu trong mối quan hệ với rừng.',
    '[]'::jsonb, '/images/tra-linh/sam-ngoc-linh-trung-bay.jpg',
    'Cây sâm Ngọc Linh được giới thiệu tại phiên chợ địa phương',
    'Vùng sâm Ngọc Linh', 'Chỉ tiếp cận theo đơn vị quản lý',
    'Vườn sâm không phải điểm tham quan tự do.',
    'Chỉ tiếp cận khu vực được đơn vị quản lý cho phép.',
    '["Sâm Ngọc Linh", "Dược liệu bản địa", "Giữ rừng"]'::jsonb,
    'organized_only', true, 'published', false,
    'https://samngoclinh.danang.gov.vn/gioi-thieu-1.html',
    'Trung tâm Phát triển Sâm Ngọc Linh và Dược liệu', 'official_publication',
    '2026-07-22T00:00:00Z', 3, '2026-07-22T00:00:00Z'
  )
on conflict ((lower(slug))) do update set
  title = excluded.title,
  category = excluded.category,
  short_description = excluded.short_description,
  body = excluded.body,
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  location_label = excluded.location_label,
  duration_label = excluded.duration_label,
  access_note = excluded.access_note,
  safety_note = excluded.safety_note,
  highlights = excluded.highlights,
  access_status = excluded.access_status,
  contact_required = excluded.contact_required,
  status = excluded.status,
  is_placeholder = excluded.is_placeholder,
  source_url = excluded.source_url,
  source_credit = excluded.source_credit,
  usage_permission = excluded.usage_permission,
  verified_at = excluded.verified_at,
  display_order = excluded.display_order,
  updated_at = excluded.updated_at;

insert into public.travel_guides (
  id, title, slug, category, excerpt, body, image_url, alt_text,
  read_time_label, season_label, sections, status, is_placeholder,
  source_url, source_credit, usage_permission, verified_at, display_order,
  updated_at
) values
  (
    '856751a7-d358-4fa1-b8c7-b8e7884c1201', 'Đường đến Trà Linh',
    'duong-den-tra-linh', 'journey',
    'Điều kiện đường và thời tiết có thể thay đổi. Hãy xác nhận lộ trình với cơ quan hoặc đầu mối địa phương trước khi đi.',
    '[]'::jsonb, '/images/tra-linh/hero-ban-lang-ngoc-linh-desktop.webp',
    'Mây phủ trên những sườn núi xanh ở vùng Ngọc Linh', '3 phút đọc',
    'Kiểm tra thời tiết trước chuyến đi',
    '[{"title":"Trước khi khởi hành","body":"Theo dõi dự báo thời tiết, chuẩn bị phương tiện phù hợp và lưu đầu mối hỗ trợ tại địa phương."},{"title":"Trên đường","body":"Di chuyển thận trọng trên đường núi, không tự ý rẽ vào đường rừng hoặc khu vực hạn chế."}]'::jsonb,
    'published', false,
    'https://danang.gov.vn/vi/w/phat-trien-tra-linh-thanh-vung-duoc-lieu-trong-diem-cua-mien-trung',
    'Cổng thông tin điện tử thành phố Đà Nẵng', 'official_publication',
    '2026-07-22T00:00:00Z', 1, '2026-07-22T00:00:00Z'
  ),
  (
    '856751a7-d358-4fa1-b8c7-b8e7884c1202', 'Kiểm tra trước khi đi',
    'thoi-diem-goi-y', 'safety',
    'Khí hậu vùng núi biến đổi nhanh; lịch trình nên linh hoạt và ưu tiên thông báo chính thức tại thời điểm đi.',
    '[]'::jsonb, '/images/tra-linh/hero-ban-lang-ngoc-linh.jpg',
    'Bản làng nép bên sườn núi xanh trong màn sương', '2 phút đọc',
    'Theo thông báo tại thời điểm đi',
    '[{"title":"Ưu tiên an toàn","body":"Không khởi hành vào lúc có cảnh báo mưa lớn, sạt lở hoặc tầm nhìn hạn chế."}]'::jsonb,
    'published', false,
    'https://tralinh.danang.gov.vn/gioi-thieu/gioi-thieu-chung',
    'Cổng thông tin điện tử xã Trà Linh', 'official_publication',
    '2026-07-22T00:00:00Z', 2, '2026-07-22T00:00:00Z'
  ),
  (
    '856751a7-d358-4fa1-b8c7-b8e7884c1203', 'Lưu ý khi vào rừng',
    'luu-y-khi-vao-rung', 'safety',
    'Không tự ý vào rừng, không lấy mẫu vật và không công bố vị trí nhạy cảm của khu vực trồng sâm.',
    '[]'::jsonb, '/images/tra-linh/duoi-tan-rung-sam.webp',
    'Lối nhỏ đi dưới tán rừng xanh ẩm của vùng Ngọc Linh', '4 phút đọc',
    'Mọi thời điểm',
    '[{"title":"Tôn trọng ranh giới","body":"Chỉ đi trên lối được hướng dẫn và tuân thủ yêu cầu của đơn vị quản lý."},{"title":"Bảo vệ đại ngàn","body":"Mang rác trở ra, hạn chế tiếng ồn và không tác động vào thực vật bản địa."}]'::jsonb,
    'published', false,
    'https://samngoclinh.danang.gov.vn/gioi-thieu-1.html',
    'Trung tâm Phát triển Sâm Ngọc Linh và Dược liệu', 'official_publication',
    '2026-07-22T00:00:00Z', 3, '2026-07-22T00:00:00Z'
  )
on conflict ((lower(slug))) do update set
  title = excluded.title,
  category = excluded.category,
  excerpt = excluded.excerpt,
  body = excluded.body,
  image_url = excluded.image_url,
  alt_text = excluded.alt_text,
  read_time_label = excluded.read_time_label,
  season_label = excluded.season_label,
  sections = excluded.sections,
  status = excluded.status,
  is_placeholder = excluded.is_placeholder,
  source_url = excluded.source_url,
  source_credit = excluded.source_credit,
  usage_permission = excluded.usage_permission,
  verified_at = excluded.verified_at,
  display_order = excluded.display_order,
  updated_at = excluded.updated_at;
