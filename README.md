# Trà Linh Landing Page

Website giới thiệu thiên nhiên, văn hóa Xơ Đăng, sản vật và hành trình tại vùng Trà Linh – Ngọc Linh. Ứng dụng dùng Next.js, React và Mapbox; toàn bộ nội dung xuất bản được quản lý dưới dạng file trong repository.

## Kiến trúc

- Nội dung trang chủ và trang chi tiết: `lib/content/fallback-content.ts`.
- Dữ liệu bản đồ: `data/tourism-map/`.
- Ảnh, video và biểu tượng: `public/`.
- Thành phần giao diện: `components/`.
- Route công khai: `app/`.
- Không có database, CMS hoặc trang quản trị chạy trong ứng dụng.

Repository nội dung chỉ trả về bản ghi đã xuất bản, đã xác minh và có nguồn. Kết quả được sao chép trước khi trả về để tránh thay đổi dữ liệu gốc trong bộ nhớ.

## Yêu cầu

- Node.js 24.x
- npm
- Mapbox token nếu cần hiển thị bản đồ tương tác; khi không có token, danh sách địa điểm và trạng thái dự phòng vẫn hoạt động.

## Chạy local

```bash
npm ci
copy .env.example .env.local
npm run dev
```

Mở `http://localhost:3000`.

## Biến môi trường

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | URL chuẩn dùng cho canonical, sitemap và metadata |
| `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` | Không | Token Mapbox dành cho trình duyệt |
| `NEXT_PUBLIC_MAPBOX_STYLE_URL` | Không | Map style; mặc định `mapbox://styles/mapbox/standard` |

Không commit `.env.local` hoặc token thật. Token Mapbox phải được giới hạn theo origin của Development, Preview và Production.

## Cập nhật nội dung

1. Sửa dữ liệu trong `lib/content/fallback-content.ts` hoặc `data/tourism-map/`.
2. Đặt media đã được duyệt trong `public/` và dùng đường dẫn bắt đầu bằng `/images/` hoặc `/video/` phù hợp.
3. Giữ đầy đủ nguồn, credit, trạng thái xác minh và ngày xác minh.
4. Chạy các kiểm tra trước khi tạo pull request.

Ảnh ứng viên từ crawler nằm trong `asset/`, bị Git ignore và không tự xuất bản. Chỉ đưa ảnh vào `public/` sau khi xác minh đúng địa điểm, nguồn và quyền sử dụng.

## Kiểm tra chất lượng

```bash
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e:chromium
```

Các lệnh chuyên biệt cho dữ liệu bản đồ:

```bash
npm run audit:tourism-map
npm run audit:tourism-images
npm run crawl:tourism-images
npm run import:tourism-images
```

## Triển khai

Triển khai như một ứng dụng Next.js thông thường trên Vercel hoặc nền tảng tương thích:

1. Cấu hình `NEXT_PUBLIC_SITE_URL`.
2. Cấu hình token/style Mapbox nếu sử dụng bản đồ trực tiếp.
3. Chạy `npm ci && npm run build`.
4. Kiểm tra `/`, `/ban-do-du-lich`, sitemap, robots và các trang chi tiết.

Chính sách bảo mật trong `next.config.ts` chỉ cho phép kết nối đến Mapbox và Open-Meteo ngoài chính origin của website.

## Tài liệu liên quan

- `docs/TOURISM_MAP_IMPLEMENTATION.md`
- `docs/TOURISM_IMAGE_PIPELINE.md`
- `HANDOVER.md`
