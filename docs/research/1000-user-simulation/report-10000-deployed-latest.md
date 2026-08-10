# Báo cáo mô phỏng 10.000 người dùng — production mới nhất

Ngày chạy: 10/08/2026

Website: <https://tra-linh-landing-page.vercel.app/>

Vercel production deployment: `dpl_2JVgTjjgcPNMjKYKHbHc5z1c5tFi` (`READY`)

Git checkpoint sản phẩm: `700adca`

Quy mô: 10.000 persona tổng hợp, seed cố định `20260810`

> Đây là mô phỏng có kiểm soát dựa trên audit trình duyệt, không phải khảo sát 10.000 người thật. Kết quả chỉ dùng để kiểm tra hồi quy và phân loại backlog nội bộ.

## Kết luận

Không còn phản hồi khả thi nào cần chỉnh sửa trong phạm vi đã chốt: **0/10.000 phản hồi actionable**, không có lỗi P0/P1. Trong 10.000 persona:

- 7.612 (76,12%) hài lòng và không yêu cầu thay đổi.
- 2.388 (23,88%) đề xuất chức năng đang bị chặn bởi dữ liệu hoặc trách nhiệm vận hành bên ngoài.
- 0 phản hồi được phân loại là lỗi hoặc cải tiến khả thi còn tồn đọng.

Ba mục tiêu chính đều vượt ngưỡng:

| Mục tiêu | Baseline | Sau lộ trình trước | Production mới nhất | Ngưỡng | Kết quả |
| --- | ---: | ---: | ---: | ---: | --- |
| Lập kế hoạch | 2,51 | 3,71 | **4,03** | ≥ 3,40 | Đạt |
| Khả năng tiếp cận | 3,05 | 4,30 | **4,48** | ≥ 4,00 | Đạt |
| Điều hướng | 3,31 | 4,12 | **4,41** | ≥ 3,80 | Đạt |

## Bằng chứng production

| Kiểm tra | Kết quả |
| --- | ---: |
| HTTP trang chủ | 200 |
| Link nội bộ hỏng | 0/25 |
| Hash target thiếu | 0 |
| Axe violations | 0 |
| HTTP response lỗi trong audit | 0 |
| Console error | 0 |
| Request lỗi ngoài các request chủ động hủy | 0 |
| Font/glyph 404 | 0 |
| Mobile overflow 390 px | 0 px |
| Marker Mapbox dùng bàn phím | `button`, Enter chọn được |
| Sản vật hiển thị ban đầu | 6 mục |
| Điểm bản đồ preview | 6 mục |
| Mỗi media rail | 6 ảnh, 0 bản sao khi reduced motion |
| Transfer full-scroll desktop | **3,00 MB** |
| Transfer mobile viewport | **0,85 MB** |
| LCP desktop | **1.992 ms** |
| CLS desktop | **0,0071** |
| LCP mobile | **1.036 ms** |
| CLS mobile | **0,0021** |

LCP, CLS và ngân sách tải đều đạt mục tiêu. INP của lượt headless là 0 ms vì không đủ mẫu Event Timing để kết luận; cần tiếp tục theo dõi dữ liệu người dùng thật qua Vercel Speed Insights để xác nhận INP ≤ 200 ms.

Bốn request `ERR_ABORTED` là Next.js prefetch hoặc ảnh art-direction bị trình duyệt chủ động hủy khi chuyển trang/viewport. Không có response ≥ 400, lỗi console hay request thất bại ngoài nhóm chủ động hủy này.

## Capability đã xác minh trực tiếp

- `/thoi-tiet`, `/tim-kiem`, `/cau-hoi-thuong-gap`, `/en` và `/da-luu` đều HTTP 200; `/en` trả `lang="en"`.
- Trang hành trình có thông tin chuyến đi, độ khó, mùa phù hợp, lịch trình, trạng thái xác minh, In/Lưu PDF, lưu và chia sẻ.
- Cẩm nang có In/Lưu PDF, lưu và chia sẻ; địa điểm có trạng thái xác minh, ngày rà soát, nguồn tham khảo, lưu và chia sẻ.
- Mục đã lưu hoạt động bằng `localStorage`, không cần tài khoản và không thu thập PII.
- Data Saver lưu trạng thái, tháo video hero khỏi DOM và vô hiệu hóa bản sao marquee.
- Trang chủ chỉ mở 6 sản vật và 6 điểm preview; có điều hướng tác vụ sticky và nút quay lại đầu trang.
- FAQ giải thích website không cấp tem/chứng nhận sâm và hướng người dùng tới hồ sơ truy xuất cùng đầu mối có thẩm quyền.
- Facebook, điện thoại và email chính thức đều hiện diện; không có form thu thập dữ liệu cá nhân.

## Điểm tổng hợp 10.000 persona

| Trục | Điểm / 5 | So với baseline |
| --- | ---: | ---: |
| Thị giác | **4,60** | +0,34 |
| Mobile | **4,41** | +0,50 |
| Khả năng tiếp cận | **4,48** | +1,43 |
| Điều hướng | **4,41** | +1,10 |
| Tin cậy | **4,32** | +0,72 |
| Dễ hiểu | **4,22** | +0,83 |
| Lập kế hoạch chuyến đi | **4,03** | +1,52 |
| Khả năng giới thiệu | **8,17 / 10** | +2,08 |

Synthetic NPS là **+28**. Đây chỉ là chỉ số mô phỏng nội bộ.

Phân bố cảm xúc:

- 6.376 tích cực (63,76%).
- 2.983 lẫn lộn (29,83%).
- 641 tiêu cực (6,41%).

Kết quả hành trình:

- 6.871 hoàn thành (68,71%).
- 2.402 hoàn thành một phần (24,02%).
- 727 bỏ cuộc (7,27%).

## Phản hồi còn lại và trạng thái xử lý

| Nhóm phản hồi | Persona | Tỷ lệ | Trạng thái | Lý do |
| --- | ---: | ---: | --- | --- |
| Hài lòng, không yêu cầu chỉnh sửa | 7.612 | 76,12% | Đã ổn | Không có hành động tiếp theo |
| Quãng đường, chi phí hoặc lịch nhận khách | 1.529 | 15,29% | Bị chặn bên ngoài | Chỉ xuất bản khi địa phương/đơn vị cung cấp dịch vụ xác minh |
| Truy xuất nguồn gốc sâm | 449 | 4,49% | Bị chặn bên ngoài | Website không có thẩm quyền cấp tem/chứng nhận hoặc tự tạo dữ liệu truy xuất |
| Lịch sự kiện và cảnh báo chủ động | 410 | 4,10% | Bị chặn bên ngoài | Chưa có feed chính thức, lịch cập nhật và đơn vị chịu trách nhiệm vận hành |

Các yêu cầu bị chặn không được coi là lỗi sản phẩm và không được triển khai bằng dữ liệu tự ước tính. Khi có nguồn chính thức, cần mở một vòng xác minh dữ liệu riêng trước khi bổ sung.

## Dữ liệu tái tạo

- `evidence-deployed-latest.json`: bằng chứng trình duyệt trên alias production.
- `feedback-10000-deployed-latest.csv`: 10.000 dòng để lọc bằng Excel/Sheets.
- `feedback-10000-deployed-latest.jsonl`: cùng dữ liệu ở định dạng máy đọc.
- `summary-10000-deployed-latest.json`: điểm, phân bố, trạng thái xử lý và website facts.
- `issue-catalog-10000-deployed-latest.json`: taxonomy phản hồi, trạng thái và evidence reference.

Mỗi ID và nhận xét đều duy nhất: **10.000/10.000**. Harness dùng seed cố định nên có thể chạy lại để so sánh giữa các deployment.
