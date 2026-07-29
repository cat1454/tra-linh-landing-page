# Hướng dẫn sử dụng trang quản trị Trà Linh

Tài liệu này dành cho người cập nhật nội dung trên website chính thức. Không cần cài đặt phần mềm hay biết lập trình.

## 1. Địa chỉ sử dụng

- Website: <https://tra-linh-landing-page.vercel.app>
- Đăng nhập quản trị: <https://tra-linh-landing-page.vercel.app/admin/login>
- Trang quản trị sau khi đăng nhập: <https://tra-linh-landing-page.vercel.app/admin>

Chỉ đăng nhập từ địa chỉ có đuôi `vercel.app` ở trên hoặc tên miền chính thức được thông báo sau này. Không nhập email quản trị vào liên kết do người lạ gửi.

## 2. Đăng nhập bằng magic link

1. Mở trang **Đăng nhập quản trị**.
2. Nhập email đã được cấp quyền rồi bấm **Gửi liên kết đăng nhập**.
3. Mở email mới nhất từ Supabase và bấm liên kết đăng nhập.
4. Trình duyệt sẽ quay lại `/admin` trên website chính thức.

Liên kết có thời hạn và chỉ dùng được một lần. Nếu hết hạn, quay lại trang đăng nhập để yêu cầu liên kết mới. Lần đăng nhập đầu tiên tự liên kết email được cấp quyền với tài khoản Supabase Auth; không cần tạo mật khẩu.

Nếu màn hình báo **Không có quyền**, kiểm tra đúng email đã được cấp quyền. Không thử liên tục quá nhiều lần vì hệ thống có giới hạn chống spam.

## 3. Quy trình sửa nội dung

1. Trong `/admin`, chọn nhóm nội dung ở danh sách bên trái.
2. Chọn đúng bản ghi cần sửa.
3. Thay đổi một hoặc nhiều trường trong biểu mẫu.
4. Kiểm tra khung **Xem trước trực tiếp**.
5. Chọn **Lưu nháp** nếu chưa muốn công khai, hoặc **Xuất bản** khi nội dung đã được duyệt.
6. Mở liên kết **Xem vị trí thật** để kiểm tra trên website.

Backend chỉ cập nhật các trường được gửi lên. Việc đổi riêng email, số điện thoại, tiêu đề, mô tả, ảnh, ghi chú hoặc trạng thái không tự xóa các trường khác của bản ghi.

## 4. Ý nghĩa trạng thái

| Trạng thái | Khi nào dùng | Hiển thị công khai |
| --- | --- | --- |
| Nháp (`draft`) | Nội dung đang soạn hoặc chưa kiểm tra | Không |
| Chờ duyệt (`review`) | Đã nhập xong, đang kiểm tra nội dung/nguồn ảnh | Không |
| Đã xuất bản (`published`) | Nội dung đã được phê duyệt | Có, nếu không phải placeholder và đủ điều kiện xác minh |

Sau khi xuất bản, luôn tải lại trang công khai để kiểm tra tiêu đề, ảnh, liên kết và cách hiển thị trên điện thoại.

## 5. Các nhóm nội dung chính

- **Cài đặt website:** tên website, thông tin liên hệ, SEO, header, footer và video hero.
- **Khu vực trang chủ:** tiêu đề, mô tả, nút bấm, badge, thống kê và media của từng phần.
- **Hành trình:** slug, phân loại, mô tả, thời lượng, lưu ý tiếp cận/an toàn và điểm nổi bật.
- **Câu chuyện và văn hóa:** nội dung dài, trích dẫn, chú thích và hình ảnh.
- **Sản vật và sản phẩm sâm:** tên, loại, nguồn gốc, liên hệ và lưu ý pháp lý.
- **Cẩm nang:** nội dung, mùa phù hợp, thời gian đọc và các phần hướng dẫn.
- **Thư viện media:** ảnh/video, alt text, credit nguồn và quyền sử dụng.
- **Liên hệ:** xem yêu cầu khách gửi và cập nhật trạng thái xử lý.

## 6. Quy tắc nhập dữ liệu

- Tiêu đề nên ngắn, rõ nghĩa; không viết toàn bộ bằng chữ in hoa trừ tên thương hiệu.
- Slug chỉ dùng chữ thường không dấu, số và dấu gạch ngang, ví dụ `hanh-trinh-ngoc-linh`.
- URL phải bắt đầu bằng `https://`, `/` hoặc `#` tùy loại liên kết.
- Email phải đúng định dạng; số điện thoại không dài quá 30 ký tự.
- Ảnh phải có mô tả `alt text` và thông tin nguồn/quyền sử dụng.
- Không xuất bản nội dung còn đánh dấu placeholder hoặc chưa xác minh quyền sử dụng.
- Không đưa mật khẩu, API key, service-role key hay dữ liệu cá nhân nhạy cảm vào nội dung CMS.

Nếu dữ liệu không hợp lệ, hệ thống từ chối lưu và giữ nguyên dữ liệu đang có trong Supabase.

## 7. Ảnh và video

1. Tải file vào **Thư viện media**.
2. Điền tên, alt text, nguồn và quyền sử dụng.
3. Chọn media đó trong bản ghi nội dung cần chỉnh.
4. Kiểm tra xem trước rồi mới xuất bản.

Không dùng ảnh tải ngẫu nhiên từ Internet khi chưa xác minh giấy phép. Với video lớn, chờ tải hoàn tất và không đóng tab giữa chừng.

## 8. Xử lý yêu cầu liên hệ

Các yêu cầu từ form công khai được lưu trong Supabase. Người quản trị có thể đổi trạng thái:

- `new`: mới nhận;
- `in_progress`: đang xử lý;
- `resolved`: đã xử lý xong;
- `spam`: nội dung rác.

Không sao chép email, số điện thoại hoặc nội dung trao đổi sang kênh công khai.

## 9. Lỗi thường gặp

### Không nhận được email đăng nhập

- Kiểm tra thư Spam/Quảng cáo.
- Kiểm tra email nhập đúng và đã được cấp quyền.
- Chờ một phút rồi yêu cầu magic link mới; chỉ dùng email mới nhất.

### Magic link báo không hợp lệ

Liên kết đã hết hạn hoặc đã dùng. Yêu cầu liên kết mới tại `/admin/login` và mở trên cùng website production.

### Không lưu được nội dung

Kiểm tra các trường bắt buộc, định dạng email/URL/slug và dung lượng media. Nếu vẫn lỗi, chụp màn hình thông báo và ghi rõ nhóm nội dung, tên bản ghi, thời điểm xảy ra lỗi.

### Đã xuất bản nhưng website chưa đổi

Tải lại trang bằng `Ctrl+F5`, kiểm tra bản ghi không phải placeholder và trạng thái thực sự là `published`. Việc cập nhật cache có thể cần vài giây.

## 10. Kết thúc phiên làm việc

1. Đảm bảo mọi thay đổi cần thiết đã được lưu.
2. Kiểm tra lại website công khai.
3. Bấm **Đăng xuất** trong trang quản trị.
4. Không chuyển tiếp magic link cho người khác.

Việc thêm, thu hồi hoặc đổi vai trò quản trị viên phải do người phụ trách kỹ thuật thực hiện trong Supabase; người vận hành nội dung không tự sửa bảng `admin_users`.
