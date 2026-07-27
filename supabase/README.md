# Supabase setup

Hướng dẫn đầy đủ nằm trong [README.md](../README.md#9-thiết-lập-supabase-mới). Tóm tắt:

1. Tạo project Supabase mới.
2. Chạy migration trong `supabase/migrations` theo thứ tự timestamp bằng `supabase db push` hoặc SQL Editor.
3. Bootstrap admin đầu tiên bằng câu SQL trong README; không commit email thật vào migration.
4. Cấu hình local và production callback `/admin/auth/callback`.
5. Cấu hình các biến trong `.env.example`; service-role key và `RATE_LIMIT_SALT` là server-only.

Migration là forward-only. Khi một migration đã chạy trên môi trường dùng chung, tạo migration timestamp mới để sửa chữa; không chỉnh file cũ.

`202607270001_prepare_code_handover.sql` vô hiệu hóa operator cũ và xóa contact cá nhân. Không chạy file này trên hệ thống cũ nếu operator cũ vẫn cần truy cập. Project mới của bên nhận phải chạy toàn bộ migration rồi tự bootstrap admin.

Website công khai có fallback content và không bắt buộc Supabase. CMS, form và upload chỉ hoạt động khi có đủ public config và service-role key. Bucket `media` là private; khách chỉ nhận signed URL cho record đã `published`.
