# Rà soát ảnh bản đồ du lịch Trà Linh

Ngày rà soát gần nhất: 2026-07-26. Đây là ảnh chụp lịch sử của đợt staging, không phải giấy phép sử dụng media.

## Kết quả staging

- Crawler từng thu được 24 ảnh ứng viên, tổng 10.734.693 byte, cho 6 slug.
- 24/24 file có SHA-256 riêng và đều mang `licenseStatus: "permission_required"`.
- 14 request bị `robots.txt` chặn đã được bỏ qua, không dùng biện pháp vượt chặn.
- Không ứng viên nào được crawler tự động đưa vào `public`, `coverImage` hoặc `gallery`.
- Output staging ở `asset/tourism-map-candidates/` bị Git ignore và không nằm trong gói bàn giao.

## Trạng thái nguồn ảnh

Một số ảnh đã tuyển chọn cho giao diện có metadata tại [`public/images/tra-linh/CREDITS.md`](../public/images/tra-linh/CREDITS.md). Metadata trong repo chỉ giúp truy vết nguồn; bên nhận vẫn phải nhận riêng tài liệu chứng minh quyền sử dụng.

`public/assets` có khoảng 130 ảnh/video, tổng khoảng 143 MB. Các tên file kỹ thuật chưa tạo thành ánh xạ đáng tin cậy tới từng địa điểm. Không tự gán file trong thư mục này cho địa điểm bản đồ và không tuyên bố quyền sử dụng nếu chưa có chứng cứ độc lập.

## Checklist duyệt một ảnh

- Đúng địa điểm, thời điểm và ngữ cảnh.
- Có tác giả/đơn vị sở hữu và URL hoặc hồ sơ nguồn.
- Có phạm vi quyền sử dụng phù hợp với website, social preview và thời hạn phát hành.
- Có xác nhận về quyền hình ảnh của người xuất hiện nếu cần.
- Đã loại metadata nhạy cảm không cần thiết.
- Đã tối ưu định dạng, kích thước và dung lượng.
- Có alt text mô tả đúng nội dung.
- Đã ghi metadata nguồn và người duyệt.

Nếu thiếu bất kỳ bằng chứng bắt buộc nào, giữ `imageStatus: "missing"` và dùng placeholder tại `public/images/placeholders/`.

## Những nội dung không được suy diễn

- Ảnh chợ/lễ hội Sâm Ngọc Linh tại nơi khác không mặc nhiên đại diện cho Chợ phiên Trà Linh.
- Ảnh do AI tạo không phải ảnh tư liệu địa điểm.
- Việc file từng xuất hiện trên một website hoặc bộ crawler không chứng minh quyền tái sử dụng.
- Trạng thái hoặc ghi chú lịch sử trong repo không thay thế biên bản cấp quyền.
