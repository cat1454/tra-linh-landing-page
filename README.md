# Trà Linh – Đại ngàn Ngọc Linh

Landing page giới thiệu thiên nhiên, văn hóa Xơ Đăng và vùng sâm Ngọc Linh tại xã Trà Linh, thành phố Đà Nẵng. Dự án dùng Next.js App Router, TypeScript, Tailwind, GSAP, Lenis, Framer Motion, Embla và kiến trúc dữ liệu Supabase-ready.

Production: [tra-linh-landing-page.vercel.app](https://tra-linh-landing-page.vercel.app)

## Chạy local

```bash
npm install
npm run dev
```

Mở `http://localhost:3000`. Khi chưa cấu hình Supabase, website tự dùng dữ liệu curated trong `lib/content` và khóa gửi form với thông báo rõ ràng.

## Kiểm tra chất lượng

```bash
npm run typecheck
npm run lint
npm test
npm run test:coverage
npm run build
npm run test:e2e
```

Visual baselines nằm trong `tests/e2e/visual.spec.ts-snapshots` và được duy trì trên desktop Chromium. Playwright vẫn chạy functional, accessibility và responsive checks trên Chromium, Firefox, WebKit và mobile Chromium.

## Kết nối Supabase

1. Sao chép `.env.example` thành `.env.local` và điền biến môi trường.
2. Áp dụng `supabase/migrations/202607220001_initial_schema.sql`.
3. Thêm email quản trị vào `admin_users`, sau đó cấu hình magic-link redirect.
4. Chạy lại ứng dụng; repository sẽ tự chuyển từ local fallback sang Supabase khi cấu hình hợp lệ.

Service-role key chỉ dùng phía server và không được đặt trong biến `NEXT_PUBLIC_*`. Media CMS nằm trong bucket private; nội dung đã xuất bản được cấp signed URL ngắn hạn.

## Phát hành Vercel

```bash
npx vercel --prod
```

Đặt `NEXT_PUBLIC_SITE_URL` bằng domain chính thức để canonical, Open Graph, sitemap và callback URL dùng đúng origin. Nếu chưa có Supabase, bản phát hành vẫn hoạt động đầy đủ ở chế độ nội dung fallback; `/admin` hiển thị “Chưa kết nối CMS”.

Nguồn và quyền sử dụng ảnh curated được ghi tại `public/images/tra-linh/CREDITS.md`.
