# Lộ trình xây dựng bản đồ du lịch Trà Linh toàn diện

## 1. Mục tiêu sản phẩm

Xây dựng bản đồ du lịch chuyên sâu, đáng tin cậy cho Trà Linh — không sao chép quy mô toàn cầu của Google Maps. Sản phẩm phải giúp khách trả lời nhanh năm câu hỏi:

1. Có gì đáng đi?
2. Điểm đó nằm chính xác ở đâu?
3. Có được phép vào không và nên đi lúc nào?
4. Đi đến đó bằng cách nào, mất bao lâu và có rủi ro gì?
5. Thông tin được ai xác minh và cập nhật lần cuối khi nào?

## 2. Hiện trạng đã xác minh

- Nền tảng: Next.js 16, React 19, Mapbox GL JS, Supabase, Vercel.
- Bản đồ đã có: marker, cluster, danh sách đồng bộ với bản đồ, tìm kiếm nội bộ, lọc theo nhóm/phạm vi, popup, trang chi tiết, toàn màn hình, responsive, fallback khi Mapbox lỗi và liên kết chỉ đường Google Maps.
- Nguồn địa điểm hiện là dữ liệu TypeScript tĩnh trong `data/tourism-map/`.
- Trang nhập dữ liệu hiện lưu nháp trong `localStorage` và xuất JSON; chưa phải quy trình CMS nhiều người dùng.
- Dữ liệu nguồn hiện có 30 bản ghi địa điểm và 2 bản ghi sự kiện; lớp hiển thị gộp một cặp venue/event trùng tên thành 31 kết quả công khai.
- Trong 31 kết quả hiển thị có 23 điểm trong Trà Linh và 8 điểm lân cận.
- Tọa độ trên lớp hiển thị: 18 xác thực, 5 gần đúng, 8 còn thiếu. Con số phải được sinh lại bằng kiểm tra dữ liệu ở đầu mỗi PR, không sao chép thủ công từ tài liệu này.
- Ảnh: 2 địa điểm ở trạng thái sẵn sàng, 29 địa điểm còn thiếu hoặc chưa đạt yêu cầu quyền sử dụng.
- Dữ liệu có trường giờ mở cửa, giá vé, quyền tiếp cận và nguồn, nhưng độ đầy đủ chưa đồng đều.

## 3. Nguyên tắc và giới hạn

- Nguồn dữ liệu Trà Linh do địa phương kiểm soát là lợi thế chính; không phụ thuộc hoàn toàn vào dữ liệu POI bên thứ ba.
- Không hiển thị ghim chính thức nếu tọa độ chưa được xác minh.
- Không tự động công khai nội dung do người dùng gửi; mọi thay đổi phải qua kiểm duyệt.
- Không xây đánh giá sao công khai trước khi có vận hành chống spam, khiếu nại và xử lý nội dung.
- Không hứa dẫn đường an toàn trên đường rừng chỉ dựa vào API đường bộ. Tuyến trekking phải do người địa phương xác nhận.
- Không lưu/cached dữ liệu Google Places hoặc Mapbox Search trái điều khoản nhà cung cấp.
- Mọi PR bắt đầu từ nhánh sạch hoặc worktree riêng; không đưa các thay đổi đang dang dở khác vào cùng PR.

### Ranh giới dữ liệu nhà cung cấp

- Dữ liệu Trà Linh do địa phương xác minh là nguồn duy nhất được lưu lâu dài và dùng làm sự thật chuẩn cho POI.
- Mapbox chỉ cung cấp nền bản đồ, geocoding/routing tạm thời và trải nghiệm Mapbox; trước mỗi tích hợp phải kiểm tra phạm vi địa lý, điều khoản lưu trữ và attribution hiện hành.
- Không đưa dữ liệu Google Places, ảnh, đánh giá hoặc kết quả tìm kiếm Google lên bản đồ Mapbox và không nhập chúng vào cơ sở POI nội bộ.
- Google Maps chỉ được dùng dưới dạng deeplink do người dùng chủ động mở để xem địa điểm/chỉ đường/ảnh/đánh giá trên Google Maps.
- Mọi adapter nhà cung cấp phải tách biệt khỏi repository POI, có allowlist trường dữ liệu, TTL và kiểm thử ngăn ghi dữ liệu tạm vào Supabase.

## 4. Chỉ số thành công

### Trước khi mở rộng tính năng

- 100% địa điểm công khai có tọa độ xác thực hoặc được ghi rõ là địa điểm vùng/không gắn ghim.
- 100% địa điểm có ít nhất một ảnh có quyền sử dụng, mô tả ngắn, trạng thái tiếp cận và ngày xác minh.
- Không có slug, tên chuẩn hóa hoặc địa điểm vật lý trùng ngoài các quan hệ venue/event đã khai báo.

### Sau khi ra mắt các giai đoạn chính

- Tỷ lệ tìm kiếm có kết quả trên 90% với bộ truy vấn tiếng Việt kiểm thử.
- Tỷ lệ mở “Chỉ đường” hoặc “Lưu hành trình” được theo dõi theo địa điểm.
- Thay đổi quan trọng được kiểm duyệt trong 48 giờ.
- Bản đồ/list fallback vẫn sử dụng được trên mạng chậm hoặc khi Mapbox lỗi.
- Không có địa điểm quá 180 ngày chưa được rà soát mà không hiển thị cảnh báo “cần xác minh lại”.

## 5. Sơ đồ phụ thuộc

```text
PR1 Chuẩn dữ liệu & chống trùng
 ├── Track A AI rà soát nguồn công khai
 │    ├── PR2A Nhập tọa độ công khai đủ độ tin cậy
 │    ├── PR2B Nhập media công khai được phép sử dụng
 │    └── PR2C Nhập dữ liệu tiếp cận đã được công bố
 └── PR3 Mở rộng Supabase/admin hiện hữu cho bản đồ
      ├── PR4 Tìm kiếm & khám phá nâng cao
      └── PR6 Đóng góp & kiểm duyệt

PR2A + PR5A Quyền riêng tư/định vị ── PR5B Vị trí hiện tại & dẫn đường
PR2B + PR2C ──┬── PR7A App shell mạng yếu
              └── PR7B Gói hành trình, GPX & nội dung an toàn

PR4 + PR5B + PR6 + PR7A + PR7B ── PR8 Quan sát vận hành & phát hành
PR8 ── PR9 Cá nhân hóa và tính năng cộng đồng (tùy chọn)
```

Track A và PR3 có thể chạy song song sau khi PR1 chốt hợp đồng dữ liệu. Các PR nhập dữ liệu chỉ dùng nguồn công khai có thể truy vết và phải dùng schema đích từ PR3 hoặc adapter nhập tương thích. Trường nào AI chưa đối chiếu đủ thì giữ trạng thái `unverified`/`needs_review`, không suy đoán. PR4, PR5A và PR6 có thể chạy song song sau các phụ thuộc tương ứng.

## 6. Các bước thi công

### PR1 — Chuẩn dữ liệu, định danh và chống trùng

**Model:** strongest
**Nhánh:** `agent/map-data-contract`

**Bối cảnh lạnh:** Dữ liệu địa điểm và sự kiện hiện cùng dùng `TourismPlace`. Logic hiển thị đang chống trùng theo tên chuẩn hóa, nhưng chưa có định danh địa điểm vật lý, quan hệ venue/event tổng quát, lịch sử xác minh hoặc kiểm tra trùng theo khoảng cách.

**Công việc:**

- Tách rõ `place`, `venue`, `event`, `route` và `area` trong mô hình dữ liệu.
- Thêm `physicalPlaceId`, `parentPlaceId`, `verificationStatus`, `verifiedAt`, `verifiedBy`, `lastReviewedAt`, `dataSource` và `precisionMeters`.
- Xây bộ phát hiện trùng theo tên không dấu, địa chỉ chuẩn hóa và khoảng cách địa lý; cho phép ngoại lệ có khai báo.
- Định nghĩa quy tắc địa điểm vùng không có một ghim chính xác.
- Thêm kiểm thử hợp đồng dữ liệu và báo cáo chất lượng chạy trong CI.

**Kiểm tra:**

```powershell
npm run lint
npm run typecheck
npm test -- --run tests/unit/tourism-map.test.ts
```

**Điều kiện hoàn thành:** Báo cáo chỉ ra rõ mọi bản ghi thiếu/trùng; dữ liệu hiện tại qua kiểm tra mà không cần điều kiện ẩn.

**Rollback:** Giữ adapter chuyển mô hình mới về `TourismPlace` cũ trong một phiên bản; rollback bằng cách chuyển nguồn đọc về adapter cũ.

### Track A — AI rà soát và làm giàu dữ liệu công khai

**Loại công việc:** tự động hóa trong repository; có thể bắt đầu ngay sau PR1.

**Bối cảnh lạnh:** Hiện còn tọa độ thiếu/gần đúng, ảnh chưa sẵn sàng và nguồn chưa đồng đều. AI chỉ công bố điều có thể truy vết từ nguồn mở; dữ liệu chưa đủ bằng chứng được hiển thị là đang cập nhật.

**Công việc:**

- Tìm và đối chiếu chéo tọa độ từ cổng thông tin chính quyền, dữ liệu mở và trang chính thức; lưu URL, ngày rà soát và độ chính xác công bố.
- Địa điểm vùng phải dùng polygon/đường biên từ nguồn mở; không tạo pin trung tâm giả.
- Chỉ nhập ảnh nội bộ, ảnh có giấy phép mở rõ ràng hoặc media do hệ thống sở hữu; lưu tác giả, nguồn và loại giấy phép.
- Thu giờ mở cửa, mùa phù hợp, phí, liên hệ và điều kiện tiếp cận từ thông báo công khai; thông tin chưa công bố giữ `unknown`.
- Chạy audit chống trùng và kiểm tra nguồn trước mỗi lần xuất bản; không tự động nâng trạng thái lên `verified` khi chưa đủ bằng chứng.

**Đầu ra:** ba lô dữ liệu có thể truy vết: `coordinates`, `licensed-media`, `published-access`. Mỗi lô có manifest URL, thời điểm thu thập và checksum.

### PR2A/PR2B/PR2C — Nhập từng lô dữ liệu AI đã đối chiếu

**Model:** default
**Nhánh:** lần lượt `agent/map-coordinates-batch`, `agent/map-media-batch`, `agent/map-safety-data-batch`

**Công việc:**

- PR2A chỉ nhập tọa độ/polygon cùng nguồn công khai và mức chính xác.
- PR2B chỉ nhập media có giấy phép rõ ràng và metadata tác giả/nguồn.
- PR2C chỉ nhập giờ, phí, tiếp cận và mùa đã được công bố; dữ liệu chưa có giữ `unknown`.
- Chia tiếp theo nhóm 5–10 địa điểm nếu diff hoặc media quá lớn.

**Kiểm tra:**

```powershell
npm test -- --run tests/unit/tourism-map-intake.test.tsx tests/unit/tourism-map.test.ts tests/unit/tourism-image-crawler.test.ts
npm run crawl:tourism-images
```

**Điều kiện hoàn thành:** Mỗi trường nhập được truy ngược đến manifest nguồn; không suy đoán dữ liệu thiếu bằng chứng.

**Rollback:** Hoàn tác riêng từng lô; bản ghi chưa đạt giữ ở `review` và không ảnh hưởng dữ liệu công khai.

### PR3 — Mở rộng Supabase/admin hiện hữu cho dữ liệu bản đồ

**Model:** strongest
**Nhánh:** `agent/map-supabase-cms`

**Bối cảnh lạnh:** Repository đã có Supabase auth, admin UI, media upload, RLS và fallback repository cho nội dung. Dữ liệu bản đồ vẫn là file TypeScript. PR này phải mở rộng kiến trúc hiện hữu, không dựng một CMS thứ hai.

**Công việc:**

- Bổ sung các bảng `tourism_places`, `tourism_events`, `tourism_routes`, `tourism_media`, `tourism_verifications` và `tourism_change_log` vào schema/admin/repository hiện hữu.
- Thêm RLS: công khai chỉ đọc bản ghi `published`; biên tập viên sửa nháp; quản trị viên duyệt/xuất bản.
- Viết migration nhập dữ liệu hiện tại, giữ slug và quan hệ.
- Xây repository có fallback tĩnh để website không trắng khi Supabase lỗi.
- Tích hợp `/nhap-dia-diem` vào admin hiện có với lưu máy chủ, xem trước, lịch sử và hoàn tác; tái sử dụng auth, upload và field config hiện có.
- Thêm cập nhật cache/revalidation sau khi xuất bản.
- Giai đoạn đầu chỉ dual-read: dữ liệu tĩnh vẫn là nguồn chuẩn, Supabase chạy shadow-read và so sánh kết quả. Chỉ chuyển nguồn chuẩn sau một cutover được ghi ngày.
- Nếu phải quay lại sau cutover, xuất mọi chỉnh sửa mới từ change log thành patch có thể replay vào nguồn tĩnh; không bật cờ ngược khi chưa có bản export này.

**Kiểm tra:**

```powershell
npm run typecheck
npm test -- --run tests/unit/migrations.test.ts tests/unit/repository.test.ts tests/unit/security-config.test.ts
npm run build
```

**Điều kiện hoàn thành:** Một biên tập viên có thể tạo/sửa/duyệt địa điểm mà không sửa code; trang công khai vẫn có fallback khi database lỗi.

**Rollback:** Migration chỉ tiến. Trước cutover, tắt `TOURISM_CMS_ENABLED` để về dữ liệu tĩnh. Sau cutover, phải export/replay change log rồi mới chuyển read flag; không dual-write âm thầm.

### PR4 — Tìm kiếm và khám phá nâng cao

**Model:** default
**Nhánh:** `agent/map-discovery-search`

**Bối cảnh lạnh:** Tìm kiếm hiện chỉ so khớp chuỗi không dấu trên tên, địa chỉ và mô tả. Mapbox Search Box không phải lựa chọn phù hợp làm nguồn chính cho Trà Linh; dữ liệu POI địa phương cần được tìm trong hệ thống trước.

**Công việc:**

- Thêm chỉ mục tìm kiếm tiếng Việt cho tên, tên cũ, bí danh, thôn, loại trải nghiệm và từ khóa.
- Đồng bộ bộ lọc vào URL để chia sẻ được trạng thái bản đồ.
- Thêm “Gần tôi”, sắp xếp theo khoảng cách, “đang mở”, “cần xin phép”, “phù hợp gia đình” và “mùa nên đi”.
- Hiển thị vùng tìm kiếm hiện tại và nút “Tìm trong khu vực này”.
- Không dùng Mapbox Search Box làm nguồn POI cho Việt Nam. Tìm kiếm địa phương chạy trên dữ liệu Supabase; geocoding ngoài hệ thống chỉ tạm thời, đi qua adapter nhà cung cấp và không được ghi vào repository POI.

**Kiểm tra:**

```powershell
npm test -- --run tests/unit/tourism-map.test.ts tests/unit/tourism-map-ui.test.tsx
npm run test:e2e:chromium -- tests/e2e/tourism-map.spec.ts
```

**Điều kiện hoàn thành:** Bộ truy vấn chuẩn tiếng Việt/không dấu/sai chính tả nhẹ đạt tỷ lệ tìm thấy trên 90%; URL chia sẻ khôi phục đúng bộ lọc và viewport.

**Rollback:** Tìm kiếm mới nằm sau feature flag; quay về lọc client hiện tại khi dịch vụ tìm kiếm lỗi.

### PR5A — Cổng quyền riêng tư và quyền định vị

**Model:** strongest
**Nhánh:** `agent/map-geolocation-privacy-gate`

**Bối cảnh lạnh:** `next.config.ts` hiện chặn geolocation bằng Permissions Policy và tài liệu triển khai cũng coi đây là chủ đích. Không được thêm “Gần tôi” hoặc vị trí hiện tại trước khi thay đổi chính sách, UX đồng thuận và kiểm thử từ chối quyền.

**Công việc:**

- Cập nhật chính sách quyền riêng tư với mục đích, thời gian lưu và cam kết không thu GPS nền.
- Chỉ nới Permissions Policy cho chính origin; không cấp cho iframe/third party.
- Thiết kế pre-permission explanation và chỉ gọi API sau thao tác rõ ràng của người dùng.
- Thêm hành vi từ chối, timeout, trình duyệt không hỗ trợ và vị trí sai số lớn.
- Thêm kiểm thử header bảo mật, quyền riêng tư và telemetry không chứa GPS thô.

**Kiểm tra:**

```powershell
npm test -- --run tests/unit/security-config.test.ts tests/unit/public-shell.test.tsx
npm run build
```

**Điều kiện hoàn thành:** Chính sách, header và UX đồng thuận nhất quán; từ chối quyền không làm hỏng bản đồ; không gửi/lưu GPS thô.

**Rollback:** Khôi phục `geolocation=()` và ẩn toàn bộ control định vị bằng feature flag.

### PR5B — Vị trí hiện tại, tuyến đường và hành trình

**Model:** strongest
**Nhánh:** `agent/map-routing-itinerary`

**Bối cảnh lạnh:** Chỉ bắt đầu sau PR5A. Nút hiện tại mở Google Maps đến đích. Bản đồ chưa hiển thị vị trí người dùng, tuyến, ETA, nhiều điểm dừng hay đường trekking do địa phương xác nhận.

**Công việc:**

- Xin quyền vị trí theo quy trình PR5A; hiển thị sai số GPS và chỉ giữ vị trí trong bộ nhớ phiên.
- Thêm route preview lái xe/đi bộ bằng Directions API, khoảng cách và ETA; giữ nút mở Google Maps làm fallback.
- Cho phép tạo hành trình nhiều điểm, đổi thứ tự và chia sẻ link.
- Tuyến trekking dùng GeoJSON/GPX do địa phương duyệt, có độ khó, độ cao, thời lượng, điểm thoát và cảnh báo; không coi tuyến API tự động là nguồn an toàn.
- Thêm deeplink theo marker và viewport.

**Kiểm tra:**

```powershell
npm test -- --run tests/unit/tourism-map.test.ts tests/unit/security-config.test.ts
npm run test:e2e:mapbox
```

**Điều kiện hoàn thành:** Người dùng có thể xem vị trí, route preview và ETA; từ chối quyền vị trí vẫn dùng bản đồ bình thường; trekking chỉ hiển thị tuyến đã duyệt.

**Rollback:** Tắt route overlay và trở về liên kết Google Maps hiện có.

### PR6 — Góp ý địa điểm và quy trình kiểm duyệt

**Model:** strongest
**Nhánh:** `agent/map-contribution-moderation`

**Bối cảnh lạnh:** Chưa có luồng công khai để báo sai vị trí, giờ đóng cửa hoặc đề xuất địa điểm. Đây là điều cần thiết để dữ liệu sống, nhưng cũng tạo rủi ro spam và nội dung xấu.

**Công việc:**

- Thêm “Báo thông tin sai” và “Đề xuất địa điểm” với loại thay đổi cụ thể.
- Cho phép tải ảnh có giới hạn dung lượng/định dạng, khai báo bản quyền và xóa metadata nhạy cảm khi cần.
- Thêm Turnstile, rate limit, hàng đợi kiểm duyệt, trạng thái xử lý và audit log.
- Gửi thông báo cho quản trị viên; không công khai tự động.
- Thêm cơ chế hợp nhất đề xuất trùng và hoàn tác bản cập nhật.

**Kiểm tra:**

```powershell
npm test -- --run tests/unit/validation.test.ts tests/unit/security-config.test.ts tests/unit/media-uploads.test.ts
npm run test:e2e:chromium
```

**Điều kiện hoàn thành:** Mọi đề xuất đều có nguồn gốc, trạng thái, người duyệt và lịch sử; spam không tạo bản ghi công khai.

**Rollback:** Đóng form bằng feature flag; dữ liệu đã gửi vẫn giữ trong hàng đợi quản trị.

### PR7A — App shell và chế độ mạng yếu

**Model:** strongest
**Nhánh:** `agent/map-low-connectivity-shell`

**Bối cảnh lạnh:** Trà Linh có địa hình núi và vùng sóng yếu. Bản đồ đã có fallback dạng danh sách nhưng chưa có app shell/PWA tối thiểu.

**Công việc:**

- Tạo PWA chỉ cache app shell và dữ liệu POI nội bộ đã duyệt theo allowlist/version.
- Không cache tile hoặc dữ liệu bên thứ ba nếu điều khoản không cho phép.
- Khi mất mạng, hiển thị danh sách, tọa độ đã lưu và trạng thái “bản đồ nền không khả dụng”.
- Tối ưu ảnh, bundle và chế độ tiết kiệm dữ liệu; có nút xóa dữ liệu offline.

**Kiểm tra:**

```powershell
npm run build
npm run test:e2e:chromium
```

Thực hiện thêm kiểm thử DevTools ở chế độ Offline và Slow 3G.

**Điều kiện hoàn thành:** Sau một lần tải, người dùng vẫn xem được POI nội bộ đã lưu khi offline; cache manifest chứng minh không có tài nguyên bị cache trái phép.

**Rollback:** Gỡ đăng ký service worker và xóa cache theo version; website online tiếp tục hoạt động.

### PR7B — Gói hành trình, GPX và nội dung an toàn

**Model:** strongest
**Nhánh:** `agent/map-trip-pack-safety`

**Bối cảnh lạnh:** Chỉ bắt đầu khi PR2C có dữ liệu tiếp cận/an toàn đã duyệt. Nội dung an toàn hết hạn có thể nguy hiểm hơn không có nội dung.

**Công việc:**

- Thêm gói chuyến đi gồm điểm đã lưu, lưu ý đường đi, liên hệ, cảnh báo và GPX do địa phương sở hữu/cấp quyền.
- Mỗi cảnh báo phải có nguồn, chủ sở hữu địa phương, ngày cập nhật, ngày hết hạn và trạng thái stale.
- Chỉ hiển thị số trợ giúp đã được cơ quan địa phương xác nhận; nếu dữ liệu stale thì ẩn CTA cụ thể và hướng người dùng liên hệ chính quyền/đơn vị quản lý.
- Hiển thị disclaimer rõ rằng thông tin không thay thế hướng dẫn tại chỗ và tình trạng đường có thể thay đổi.
- Kiểm thử chữ ký/checksum gói, dữ liệu hết hạn và hành vi khi thiếu liên hệ.

**Điều kiện hoàn thành:** Gói chỉ chứa tài sản được phép lưu; dữ liệu an toàn stale không được trình bày như thông tin hiện hành.

**Rollback:** Tắt tải gói/GPX độc lập; app shell PR7A vẫn hoạt động.

### PR8 — Quan sát vận hành, chất lượng và phát hành

**Model:** default
**Nhánh:** `agent/map-operations-observability`

**Bối cảnh lạnh:** Một bản đồ toàn diện cần quy trình vận hành lâu dài, không chỉ nhiều nút. Cần biết tìm kiếm nào thất bại, điểm nào cũ, API nào tốn chi phí và tuyến nào gây lỗi.

**Công việc:**

- Chốt telemetry contract trước khi viết event: allowlist trường, cấm GPS thô và free-text, thời hạn lưu, mức tổng hợp, quyền truy cập và lịch xóa.
- Theo dõi lỗi tải bản đồ, API, tìm kiếm không kết quả, click chỉ đường và báo sai thông tin; không thu vị trí chính xác nếu không cần.
- Dashboard về độ đầy đủ dữ liệu, tuổi bản ghi, thời gian kiểm duyệt, chi phí Mapbox/Supabase và lỗi theo thiết bị.
- Cảnh báo địa điểm quá hạn xác minh, ảnh hỏng, tọa độ xung đột và chi phí vượt ngưỡng.
- Sao lưu database/media, diễn tập phục hồi và viết runbook sự cố.
- Phát hành theo phần trăm người dùng và đo Core Web Vitals trước/sau.

**Kiểm tra:**

```powershell
npm run test:handover
```

**Điều kiện hoàn thành:** Có telemetry contract, dashboard, cảnh báo, ngân sách API, backup và runbook; không có event chứa GPS thô/free-text; một đợt canary không làm giảm chỉ số hiệu năng hoặc tỷ lệ hoàn thành tác vụ.

**Rollback:** Tắt telemetry/feature flags độc lập; rollback deployment không làm mất dữ liệu đóng góp.

### PR9 — Cá nhân hóa và cộng đồng, chỉ làm sau khi vận hành ổn định

**Model:** strongest
**Nhánh:** `agent/map-personalization-community`

**Bối cảnh lạnh:** Favorites, đánh giá và nội dung cộng đồng tạo giá trị nhưng làm tăng đáng kể yêu cầu tài khoản, riêng tư, kiểm duyệt và hỗ trợ người dùng.

**Công việc:**

- Ưu tiên “Lưu địa điểm”, “Hành trình của tôi” và chia sẻ trước khi xây hệ thống đánh giá sao.
- Nếu cần tài khoản, hỗ trợ đăng nhập tối giản và xuất/xóa dữ liệu cá nhân.
- Chỉ mở đánh giá/ảnh cộng đồng khi có chính sách, báo cáo vi phạm, chống gian lận, quyền phản hồi và nhân sự kiểm duyệt.
- Có thể liên kết sang đánh giá/ảnh Google Maps thay vì sao chép dữ liệu; tuân thủ attribution và hạn chế lưu trữ.

**Kiểm tra:**

```powershell
npm test
npm run test:e2e:chromium
```

**Điều kiện hoàn thành:** Người dùng kiểm soát được dữ liệu cá nhân; nội dung cộng đồng có kiểm duyệt và cơ chế khiếu nại đầy đủ.

**Rollback:** Tắt tính năng cộng đồng nhưng giữ export/xóa dữ liệu và công cụ quản trị.

## 7. Thứ tự đầu tư đề xuất

### 0–30 ngày

1. Hoàn tất PR1.
2. Khởi động Track F, ưu tiên 8 điểm thiếu tọa độ, 5 điểm gần đúng và 29 điểm thiếu ảnh.
3. Chốt người chịu trách nhiệm duyệt dữ liệu và chu kỳ rà soát.
4. Thiết kế PR3 trên admin/Supabase hiện hữu; chưa cutover nguồn đọc.

### 31–90 ngày

1. Hoàn tất PR3.
2. Nhập các lô PR2A/PR2B/PR2C đã đủ bằng chứng.
3. Thực hiện PR4 và PR5A song song; chỉ bắt đầu PR5B sau khi cổng quyền riêng tư đạt.
4. Mở PR6 ở chế độ chỉ nhận góp ý, chưa tự xuất bản.

### 3–6 tháng

1. Hoàn tất PR5B, PR7A, PR7B và PR8.
2. Đánh giá dữ liệu sử dụng thực tế trước khi quyết định PR9.

## 8. Hàng đợi tự động AI thực hiện tiếp

- Tìm nguồn công khai cho các bản ghi đang thiếu và lưu vết trích dẫn.
- Đối chiếu tọa độ; chỉ nâng trạng thái khi nhiều nguồn độc lập nhất quán.
- Tìm media có giấy phép mở rõ ràng, tối ưu và nhập vào kho ảnh nội bộ.
- Đồng bộ giờ hoạt động, mùa phù hợp, phí và điều kiện tiếp cận đã công bố; trường chưa biết giữ `unknown`.
- Theo dõi thay đổi nguồn, chạy audit định kỳ và đưa bản ghi quá hạn về `needs_review`.
- Theo dõi mức dùng Mapbox/Supabase; Google Maps chỉ là deeplink, không phải nguồn POI lưu vào hệ thống.
- Tự động gom báo sai thông tin vào hàng đợi kiểm duyệt và lưu lịch sử thay đổi.

## 9. Cổng rà soát trước mỗi PR

- Không làm tăng số điểm thiếu tọa độ/ảnh/nguồn.
- Không công khai dữ liệu chưa duyệt.
- Không thu hoặc lưu vị trí người dùng ngoài mục đích rõ ràng.
- Không cache nội dung bên thứ ba trái điều khoản.
- Có kiểm thử mobile, bàn phím, reduced motion, mạng lỗi và dữ liệu trống.
- Có rollback độc lập và không xóa dữ liệu người dùng khi rollback giao diện.
