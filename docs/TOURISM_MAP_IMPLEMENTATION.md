# Triển khai module bản đồ du lịch Trà Linh

Tài liệu này mô tả trạng thái module ở phiên bản `v1.0.0`. Hướng dẫn vận hành tổng thể nằm trong [`README.md`](../README.md).

## Kiến trúc hiện tại

- `TourismMapSection.tsx` là Server Component, lấy dữ liệu tĩnh đã publish và truyền xuống loader.
- `TourismMapLoader.tsx` chỉ tải bundle Mapbox khi khu vực bản đồ đến gần viewport; dynamic import dùng `ssr: false`.
- `TourismMapClient.tsx` quản lý một Mapbox GL JS instance, GeoJSON source, camera, bộ lọc, popup và cleanup khi unmount.
- `TourismMapPointMarker.tsx` cung cấp marker tương tác và trạng thái địa điểm đang chọn.
- `TourismMapErrorFallback.tsx` giữ danh sách địa điểm và liên kết chi tiết sử dụng được khi thiếu token, WebGL không khả dụng hoặc Mapbox không tải được.
- Popup được render bằng React; không ghép HTML không tin cậy từ dữ liệu.

Module dùng Mapbox làm nền bản đồ. Hai biến cần cho bản đồ live là:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.example
NEXT_PUBLIC_MAPBOX_STYLE_URL=mapbox://styles/mapbox/outdoors-v12
```

Nếu thiếu token, ứng dụng phải hiện fallback rõ ràng thay vì làm hỏng trang.

## Dữ liệu

| Nội dung | Vị trí |
| --- | --- |
| Địa điểm | `data/tourism-map/places.ts` |
| Sự kiện lặp lại | `data/tourism-map/events.ts` |
| Category và màu marker | `data/tourism-map/categories.ts` |
| Media map | `data/tourism-map/media.ts` |
| Kiểu dữ liệu | `data/tourism-map/types.ts` |
| Tọa độ đã rà soát | `data/tourism-map/tra-linh-verified-coordinates.json` |
| Lọc, GeoJSON và Google Maps URL | `lib/tourism-map.ts` |
| Cấu hình Mapbox | `lib/tourism-map-basemap.ts` |

Phiên bản `v1.0.0` có 25 thực thể, gồm 23 địa điểm và 2 sự kiện. Có 22 thực thể đủ điều kiện tạo GeoJSON marker; sự kiện lặp lại liên kết với địa điểm tổ chức để tránh marker chồng nhau.

## Thêm địa điểm hoặc sự kiện

1. Thêm record đúng interface trong `places.ts` hoặc `events.ts`.
2. Dùng `slug` duy nhất trên toàn bộ địa điểm và sự kiện.
3. Giữ `published: false` trong lúc biên tập.
4. Chỉ thêm tọa độ sau khi đối chiếu nguồn; cập nhật `coordinateStatus` và file export tọa độ.
5. Thêm `coverImage`, `gallery`, `imageAlt` và bằng chứng quyền sử dụng. Nếu chưa đủ bằng chứng, giữ trạng thái thiếu và dùng placeholder.
6. Chạy test dữ liệu trước khi chuyển sang `published: true`.

```bash
npm test -- tests/unit/tourism-map.test.ts
npm run typecheck
```

Route `/dia-diem/[slug]`, sitemap, bộ lọc và danh sách sẽ tự nhận record đã publish.

## Tọa độ và chỉ đường

- Không tự suy đoán tọa độ.
- Marker chỉ được tạo khi kinh độ/vĩ độ hữu hạn và trạng thái tọa độ cho phép hiển thị.
- Liên kết Google Maps ưu tiên tọa độ đã xác minh; nếu chưa có thì dùng tên chính thức và địa chỉ làm truy vấn tham khảo.
- Website không đọc hoặc lưu vị trí thiết bị; `Permissions-Policy` tiếp tục chặn `geolocation`.
- Sau mỗi thay đổi, xuất lại dữ liệu rà soát bằng lệnh được mô tả trong `README.md`.

## Ảnh và crawler staging

Crawler chỉ thu thập ứng viên từ allowlist, tôn trọng `robots.txt`, giới hạn tốc độ và deduplicate bằng SHA-256:

```bash
npm run crawl:tourism-images
```

Output nằm trong `asset/tourism-map-candidates/`. Toàn bộ thư mục `asset/` bị Git ignore và không nằm trong release. Crawler không tự cập nhật `coverImage`, `gallery` hoặc cấp quyền sử dụng.

Quy trình duyệt:

1. Xác minh đúng địa điểm, tác giả/nguồn và quyền sử dụng bằng chứng được.
2. Tối ưu ảnh sang WebP/AVIF, không upscale ảnh nhỏ.
3. Chép file được duyệt vào thư mục public phù hợp.
4. Cập nhật alt text, metadata nguồn và record dữ liệu.
5. Chạy unit test và visual test.

Xem thêm [`TOURISM_MAP_IMAGE_AUDIT.md`](./TOURISM_MAP_IMAGE_AUDIT.md). Các file trong `public/assets` đang phục vụ giao diện chung; không được tự động coi là ảnh của một địa điểm hoặc coi là đã có quyền sử dụng.

## Kiểm thử Mapbox

Bộ E2E mặc định không cần credentials và kiểm tra fallback:

```bash
npm run test:e2e
```

Live Mapbox test chỉ chạy khi truyền credentials riêng cho E2E:

```bash
E2E_MAPBOX_ACCESS_TOKEN=pk.example \
E2E_MAPBOX_STYLE_URL=mapbox://styles/mapbox/outdoors-v12 \
npm run test:e2e:mapbox
```

Không đưa token thật vào source, fixture, ảnh chụp hoặc log CI.

## Giới hạn v1.0.0

- Bản đồ hiện đọc dữ liệu tĩnh trong repo, chưa đồng bộ các thực thể bản đồ từ Supabase CMS.
- Cần tiếp tục rà soát độ chính xác của tọa độ và bằng chứng quyền sử dụng media trước mỗi lần publish.
- Khi số marker tăng đáng kể, cân nhắc clustering và tải dữ liệu theo vùng nhìn.
