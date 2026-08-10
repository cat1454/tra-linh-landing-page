# Bàn giao Trà Linh Landing Page

## Phạm vi

Bản bàn giao là website Next.js sử dụng nội dung tĩnh trong repository. Không có database, CMS, tài khoản quản trị hoặc dịch vụ lưu trữ media riêng cần chuyển giao.

## Thành phần cần bàn giao

- Repository Git và lịch sử commit.
- Quyền quản lý dự án triển khai.
- Domain và DNS production.
- Tài khoản hoặc token Mapbox nếu bản đồ tương tác được bật.
- Thư viện media gốc cùng hồ sơ nguồn và quyền sử dụng.

Không gửi token hoặc file `.env.local` qua chat và không commit chúng vào Git.

## Biến môi trường production

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` nếu bật Mapbox
- `NEXT_PUBLIC_MAPBOX_STYLE_URL` nếu dùng style riêng

## Quy trình cập nhật nội dung

1. Tạo nhánh từ commit production hiện tại.
2. Sửa nội dung trong `lib/content/fallback-content.ts` hoặc dữ liệu bản đồ trong `data/tourism-map/`.
3. Thêm media đã duyệt vào `public/`.
4. Chạy kiểm thử, kiểm tra attribution và build production.
5. Review thay đổi rồi merge/deploy.

## Checklist nghiệm thu

- [ ] `npm ci` hoàn tất.
- [ ] `npm run lint` đạt.
- [ ] `npm run typecheck` đạt.
- [ ] `npm test` đạt.
- [ ] `npm run build` đạt.
- [ ] Trang chủ, bản đồ, trang chi tiết, sitemap và robots hoạt động.
- [ ] Liên kết fanpage, email, điện thoại và chỉ đường đúng.
- [ ] Token Mapbox được giới hạn đúng origin.
- [ ] Domain và HTTPS hoạt động.
- [ ] Không có secret trong Git hoặc gói bàn giao.

## Thu hồi quyền sau bàn giao

1. Xóa tài khoản bên giao khỏi Git hosting và nền tảng triển khai.
2. Thu hồi token Mapbox cũ nếu đã được chia sẻ.
3. Đổi quyền domain/DNS và xác nhận người nhận có thể tự triển khai.
4. Chụp lại commit SHA và deployment URL đã nghiệm thu.
