# Biên bản bàn giao code – Trà Linh v1.0.0

## 1. Định danh bản bàn giao

| Trường | Giá trị |
| --- | --- |
| Phiên bản | `1.0.0` |
| Git tag | `v1.0.0` |
| Release date | `2026-07-27` |
| Commit SHA | `$Format:%H$` (được `git archive` thay bằng SHA chính xác; trong repository chạy `git rev-parse v1.0.0^{commit}`) |
| Source archive | `tra-linh-landing-page-v1.0.0.zip` |
| SHA-256 | File đi kèm `tra-linh-landing-page-v1.0.0.zip.sha256` |

Tag Git là nguồn xác thực nội dung. Archive phải được tạo bằng `git archive`, không phải copy workspace.

## 2. Phạm vi

### Được bàn giao

- Source code tại tag `v1.0.0`.
- Migration Supabase và hướng dẫn bootstrap database mới.
- Test, visual baseline và GitHub Actions workflow.
- README kỹ thuật, tài liệu bản đồ và tài liệu nguồn media hiện có.
- Source ZIP và SHA-256 tương ứng.

### Không được bàn giao

- Quyền sở hữu repository GitHub hiện tại.
- Project, deployment hoặc billing Vercel hiện tại.
- Project/database/storage Supabase hiện tại.
- Tài khoản/token/billing Mapbox hiện tại.
- Domain, DNS, email, số điện thoại hoặc tài khoản cá nhân của bên giao.
- Secrets, `.env.local`, database dump và media private production.
- Quyền sử dụng nội dung/ảnh ngoài những bằng chứng được cung cấp riêng.

Bên nhận phải import source vào repository của họ và tạo toàn bộ hạ tầng/credentials mới.

## 3. Cảnh báo migration bàn giao

`202607270001_prepare_code_handover.sql` vô hiệu hóa admin cũ và xóa contact cá nhân khỏi dữ liệu vận hành. Không chạy migration này trên project Supabase cũ nếu bên giao vẫn cần giữ quyền quản trị.

Project Supabase mới của bên nhận phải chạy đầy đủ migration theo thứ tự và bootstrap admin riêng. Không có admin mặc định trong bản bàn giao.

## 4. Checklist tiếp nhận

- [ ] Xác minh SHA-256 của source archive.

- [ ] Import source vào repository mới của bên nhận.

- [ ] Checkout tag `v1.0.0` và xác minh commit SHA.

- [ ] Cài Node.js 24 và chạy `npm ci`.

- [ ] Tạo project Supabase mới.

- [ ] Chạy toàn bộ migration theo timestamp.

- [ ] Bootstrap email admin đầu tiên bằng SQL trong README.

- [ ] Cấu hình Supabase Site URL và Auth redirect.

- [ ] Tạo Mapbox public token mới và giới hạn origin.

- [ ] Tạo project Vercel mới, Node 24, Root Directory `.`.

- [ ] Tạo toàn bộ environment variables mới.

- [ ] Deploy Preview và chạy nghiệm thu kỹ thuật.

- [ ] Đăng nhập `/admin`, cập nhật contact và nội dung do bên nhận sở hữu.

- [ ] Kiểm tra domain/canonical/sitemap/robots/callback URL.

- [ ] Chuyển DNS chỉ sau khi Preview được duyệt.

## 5. Ma trận tài khoản

| Hệ thống | Bên giao cung cấp | Bên nhận thực hiện |
| --- | --- | --- |
| GitHub | Source/tag/archive | Tạo hoặc import repository mới |
| Vercel | Không chuyển project hiện tại | Tạo project, billing và deployment mới |
| Supabase | Migration/schema | Tạo project, database, Auth, Storage và backup mới |
| Mapbox | Tên biến và style mặc định | Tạo token mới, giới hạn origin/billing |
| Domain/DNS | Không chuyển trong gói code | Cấu hình domain và DNS riêng |
| Email/điện thoại | Không cung cấp giá trị cá nhân | Nhập contact chính thức qua CMS |
| CMS admin | Không có admin mặc định | Bootstrap admin đầu tiên và quản lý allowlist |

Không ghi password, key hoặc token thật vào bảng này.

## 6. Environment variables bên nhận phải tạo

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `NEXT_PUBLIC_MAPBOX_STYLE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RATE_LIMIT_SALT`
- `SUPABASE_MEDIA_BUCKET`

`NEXT_PUBLIC_SUPABASE_ANON_KEY` chỉ là lựa chọn legacy. Giá trị Production và Preview phải được quản lý trong Vercel, không gửi qua chat hoặc commit.

## 7. Nghiệm thu kỹ thuật

Chạy trên clean checkout:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

- [ ] Lint không lỗi.

- [ ] Typecheck không lỗi.

- [ ] Unit test và coverage threshold đạt.

- [ ] Production build hoàn tất.

- [ ] Chromium, Firefox, WebKit và mobile Chromium đạt trong chế độ không credentials.

- [ ] Live Mapbox E2E đạt với token của bên nhận.

- [ ] Không có secret trong tracked files/archive.

- [ ] `npm audit` không có vulnerability chưa xử lý.

- [ ] `git status` sạch tại tag.

## 8. Nghiệm thu nội dung/CMS

- [ ] Trang chủ, menu, footer và mobile sticky CTA đúng nội dung.

- [ ] Tất cả route chi tiết đã publish trả về HTTP 200.

- [ ] Slug không trùng và sitemap chứa đúng URL.

- [ ] Bản đồ fallback hoạt động khi không có token.

- [ ] Bản đồ live tải marker, popup, filter và mobile sheet.

- [ ] Magic link chỉ chấp nhận admin active trong allowlist.

- [ ] Admin có thể sửa draft, review và publish.

- [ ] Upload ảnh/video vào private bucket thành công.

- [ ] Contact chính thức của bên nhận hiển thị đúng.

- [ ] Form liên hệ ghi được dữ liệu và không lộ thông tin trong log.

- [ ] Canonical, Open Graph, sitemap và robots dùng domain mới.

## 9. Runbook vận hành

### Backup

1. Tạo database backup trước mỗi migration dữ liệu/policy.
2. Backup private media bucket riêng.
3. Ghi thời điểm, người thực hiện và checksum bản backup.
4. Thử restore định kỳ vào môi trường không phải Production.

### Deploy

1. Merge thay đổi đã review vào nhánh production của bên nhận.
2. Chờ CI đạt.
3. Deploy Preview và smoke test.
4. Promote/deploy Production.
5. Kiểm tra trang chủ, bản đồ, login CMS và form.

### Rollback ứng dụng

1. Chọn deployment Vercel cuối cùng đã ổn định hoặc checkout tag trước.
2. Redeploy ứng dụng.
3. Không sửa migration đã chạy để rollback database.
4. Nếu schema cần sửa, tạo migration tiến và kiểm tra trên bản backup.

### Thu hồi admin

1. Đặt `admin_users.is_active = false`.
2. Thu hồi session trong Supabase Auth.
3. Xoay vòng secrets nếu nghi ngờ credential đã lộ.
4. Ghi lại thời gian và người phê duyệt.

## 10. Giới hạn và tài sản cần xác nhận riêng

- `public/` hiện khoảng 143 MB; file lớn nhất là video khoảng 37 MB. Nên chuyển media lớn sang CDN/Storage trong đợt tối ưu sau.
- `public/assets` là media runtime của landing page. Hồ sơ nguồn và quyền sử dụng đầy đủ không nằm trọn trong repository; bên nhận chỉ phát hành khi đã nhận/xác nhận chứng cứ riêng.
- Hạ tầng và dữ liệu Production hiện tại không nằm trong gói code.
- Live Mapbox E2E cần token public của bên nhận; CI mặc định kiểm tra fallback không credentials.
- Visual baseline được duy trì bằng Chromium trên Windows và phải được duyệt bằng ảnh diff.

## 11. Xác nhận bàn giao

| Vai trò | Họ và tên | Chữ ký | Ngày |
| --- | --- | --- | --- |
| Người bàn giao | ____________________ | ____________________ | ____/____/________ |
| Người tiếp nhận | ____________________ | ____________________ | ____/____/________ |

Ngày nghiệm thu chính thức: ____/____/________
