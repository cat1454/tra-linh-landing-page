import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const outputDirectory = resolve(process.cwd(), "docs/research/1000-user-simulation");
const evidenceLabel = process.env.EVIDENCE_LABEL?.trim() || "production";
const outputLabel = process.env.OUTPUT_LABEL?.trim() || (evidenceLabel === "production" ? "" : evidenceLabel);
const outputSuffix = outputLabel ? `-${outputLabel.replace(/[^a-z0-9-]+/gi, "-").toLowerCase()}` : "";
const evidenceFileName = `evidence-${evidenceLabel}.json`;
const sampleSize = Number.parseInt(process.env.SAMPLE_SIZE ?? "1000", 10);
if (!Number.isInteger(sampleSize) || sampleSize < 1000 || sampleSize % 1000 !== 0) {
  throw new Error("SAMPLE_SIZE must be a positive multiple of 1000.");
}
const quotaScale = sampleSize / 1000;
const evidence = JSON.parse(
  await readFile(resolve(outputDirectory, evidenceFileName), "utf8"),
);

function mulberry32(seed) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const random = mulberry32(20260810);
const choose = (items) => items[Math.floor(random() * items.length)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function quota(entries) {
  return shuffled(entries.flatMap(([value, count]) => Array.from({ length: count * quotaScale }, () => value)));
}

function weightedChoice(weightedItems) {
  const positive = weightedItems.filter(([, weight]) => weight > 0);
  const total = positive.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = random() * total;
  for (const [value, weight] of positive) {
    cursor -= weight;
    if (cursor <= 0) return value;
  }
  return positive.at(-1)[0];
}

const ages = quota([
  ["18-24", 180], ["25-34", 300], ["35-44", 220],
  ["45-54", 140], ["55-64", 100], ["65+", 60],
]);
const devices = quota([["mobile", 720], ["desktop", 220], ["tablet", 60]]);
const networks = quota([["wifi", 260], ["4g_good", 380], ["4g_weak", 220], ["3g", 140]]);
const intents = quota([
  ["trip_planning", 260], ["inspiration", 170], ["trekking", 130],
  ["ginseng_products", 110], ["xo_dang_culture", 90], ["map_directions", 90],
  ["local_official", 50], ["international", 50], ["accessibility", 50],
]);
const regions = quota([
  ["Da Nang_Quang Nam", 220], ["Central Vietnam", 160], ["Ho Chi Minh_South", 220],
  ["Ha Noi_North", 180], ["Other Vietnam", 130], ["Overseas Vietnamese", 40],
  ["International", 50],
]);
const roles = quota([
  ["office_worker", 250], ["family_trip_planner", 160], ["student", 100],
  ["trekker", 110], ["retired_traveler", 70], ["content_creator", 60],
  ["tourism_professional", 50], ["teacher_public_sector", 40],
  ["small_business", 60], ["general_traveler", 100],
]);
const accessibilityNeeds = quota([
  ["none", 950], ["low_vision", 15], ["motor", 10], ["screen_reader", 8],
  ["cognitive", 9], ["motion_sensitivity", 8],
]);
const literacy = quota([["basic", 220], ["average", 520], ["advanced", 260]]);

const issues = {
  TRIP_INFO_GAPS: {
    label: "Thiếu dữ liệu đủ để chốt chuyến đi",
    evidence: "inferred",
    base: 18,
    score: { planning: -1.5, clarity: -0.4, trust: -0.3 },
    criticism: [
      "Tôi thấy nhiều câu chuyện đẹp nhưng chưa gom được thời lượng, độ khó, chi phí dự kiến và điều kiện tham gia thành một chỗ.",
      "Thông tin truyền cảm hứng tốt, còn dữ liệu để quyết định đi ngày nào, đi bao lâu và chuẩn bị bao nhiêu tiền vẫn rời rạc.",
      "Tôi mở trang với ý định chốt lịch nhưng chưa thấy bảng tóm tắt độ khó, thời gian, giá và lịch nhận khách.",
      "Phần hành trình chưa trả lời nhanh các câu hỏi thực dụng: mất mấy giờ, phù hợp ai, cần người dẫn đường hay không và dự trù chi phí thế nào.",
    ],
    features: ["trip_facts", "sample_itinerary", "booking_availability", "cost_estimator"],
  },
  WEATHER_DEAD_LINK: {
    label: "Link Theo dõi thời tiết không dẫn đi đâu",
    evidence: "observed",
    base: 8,
    score: { navigation: -1.2, planning: -1.1, trust: -0.4 },
    criticism: [
      "Nút “Theo dõi thời tiết” chỉ đổi URL thành dấu # nên tôi tưởng trang bị lỗi.",
      "Tôi bấm xem thời tiết để chuẩn bị đồ nhưng nút không mở nguồn dự báo nào.",
      "Khối thời tiết ở đầu trang hữu ích, tiếc là CTA theo dõi chi tiết hiện là link rỗng.",
      "Một nút quan trọng cho vùng núi lại không có đích đến, làm tôi giảm tin tưởng vào phần chuẩn bị hành trình.",
    ],
    features: ["working_weather_link", "weather_forecast", "rain_alert"],
  },
  DESTINATIONS_404: {
    label: "Link Địa điểm ở footer trả 404",
    evidence: "observed",
    base: 4,
    score: { navigation: -1.7, trust: -0.7 },
    criticism: [
      "Link “Địa điểm” ở cuối trang đưa tôi tới trang 404 dù bản đồ có nhiều điểm chi tiết.",
      "Tôi đi theo menu footer để xem toàn bộ địa điểm nhưng gặp trang không tồn tại.",
      "Đường dẫn /dia-diem bị hỏng; đây là lối tôi kỳ vọng sẽ có danh sách điểm đến.",
      "Bản đồ hoạt động nhưng link tổng hợp Địa điểm ở footer lại gãy, khiến cấu trúc website có vẻ chưa hoàn thiện.",
    ],
    features: ["destinations_index", "fix_footer_link", "site_search"],
  },
  PAGE_TOO_DENSE: {
    label: "Trang chủ quá dài và dày nội dung",
    evidence: "inferred",
    base: 14,
    score: { clarity: -0.8, navigation: -0.3, mobile: -0.5 },
    criticism: [
      "Trang rất đẹp nhưng kéo quá lâu; đến cuối tôi không còn nhớ phần nào quan trọng nhất.",
      "Nhiều block ảnh và tiêu đề nối tiếp làm tôi có cảm giác đang xem cả một tạp chí trên một trang duy nhất.",
      "Trên điện thoại, lượng nội dung dài khiến tôi mỏi tay và bỏ qua khá nhiều thẻ.",
      "Tôi muốn trang chủ ngắn hơn, dẫn rõ sang từng chuyên mục thay vì hiển thị gần như mọi thứ cùng lúc.",
    ],
    features: ["shorter_homepage", "sticky_section_progress", "content_summary", "back_to_top"],
  },
  MEDIA_DATA_COST: {
    label: "Tải media nặng trên mạng yếu",
    evidence: "inferred",
    base: 8,
    score: { mobile: -1.0, visual: -0.2, planning: -0.2 },
    criticism: [
      "Ảnh và video tạo cảm xúc tốt nhưng trên mạng yếu tôi phải chờ khá lâu mới thấy đủ nội dung.",
      "Tôi lo trang dùng nhiều dữ liệu di động; phiên duyệt đầy đủ có quá nhiều media cho một landing page.",
      "Mạng chập chờn làm các dải ảnh hiện dần, nên trải nghiệm không liền mạch như khi dùng Wi‑Fi.",
      "Video nền và nhiều ảnh lớn hợp để quảng bá, nhưng cần chế độ tiết kiệm dữ liệu cho người đi vùng núi.",
    ],
    features: ["data_saver", "lighter_images", "disable_video", "offline_guide"],
  },
  CONTRAST: {
    label: "Một số chữ nhỏ thiếu tương phản WCAG AA",
    evidence: "observed",
    base: 4,
    score: { accessibility: -1.7, clarity: -0.5 },
    criticism: [
      "Chữ nguồn dữ liệu và vài link nhỏ trên nền xanh hơi mờ; tôi phải phóng to mới đọc thoải mái.",
      "Một số dòng chữ nhỏ có độ tương phản thấp, đặc biệt bất tiện với mắt yếu.",
      "Màu xanh trầm đẹp nhưng phần chữ phụ nhạt quá, không đạt cảm giác dễ đọc như nội dung chính.",
      "Tôi dùng chế độ phóng to và vẫn thấy phần ghi chú nguồn khó phân biệt với nền.",
    ],
    features: ["wcag_contrast", "text_size_control", "high_contrast_mode"],
  },
  MAP_ACCESSIBILITY: {
    label: "Marker bản đồ có điều khiển tương tác lồng nhau",
    evidence: "observed",
    base: 4,
    score: { accessibility: -1.8, navigation: -0.5 },
    criticism: [
      "Trình đọc màn hình gặp cấu trúc tương tác lồng nhau ở các marker, nên duyệt bản đồ không gọn.",
      "Các ghim bản đồ tạo nhiều điểm focus khó đoán đối với người dùng bàn phím.",
      "Bản đồ trực quan nhưng cấu trúc marker chưa thân thiện với công nghệ hỗ trợ.",
      "Tôi muốn có danh sách địa điểm tương đương hoàn toàn với bản đồ để không phải thao tác trên ghim.",
    ],
    features: ["accessible_map_markers", "keyboard_map_list", "skip_map"],
  },
  MAP_FONT_ERRORS: {
    label: "Font Mapbox trả 404",
    evidence: "observed",
    base: 3,
    score: { visual: -0.4, trust: -0.2, navigation: -0.2 },
    criticism: [
      "Bản đồ gọi các font Crimson nhưng máy chủ trả 404, nên nhãn có nguy cơ hiển thị không nhất quán.",
      "Một số tài nguyên font của Mapbox bị lỗi tải; tôi lo nhãn địa danh sẽ khác giữa thiết bị.",
      "Bản đồ hiện được nhưng có sáu request font lỗi, tạo cảm giác phần tích hợp chưa được dọn sạch.",
      "Kiểu chữ bản đồ không ổn định vì font cấu hình không tồn tại trên Mapbox.",
    ],
    features: ["fix_map_fonts", "map_fallback_font", "map_resource_monitoring"],
  },
  FORM_FRICTION: {
    label: "Form liên hệ yêu cầu nhiều thông tin",
    evidence: "inferred",
    base: 7,
    score: { planning: -0.5, trust: -0.2, navigation: -0.2 },
    criticism: [
      "Tôi chỉ muốn hỏi nhanh nhưng form bắt buộc tên, điện thoại, email, chủ đề, lời nhắn và đồng ý chính sách.",
      "Biểu mẫu đầy đủ nhưng hơi nặng cho một câu hỏi đơn giản; tôi có xu hướng gọi điện hoặc rời trang.",
      "Yêu cầu cả số điện thoại lẫn email làm tôi ngại gửi thông tin cá nhân.",
      "Form phù hợp với yêu cầu chính thức, chưa phù hợp với người chỉ cần hỏi một câu về đường đi.",
    ],
    features: ["short_contact_form", "zalo_chat", "faq", "contact_response_time"],
  },
  LANGUAGE_GAP: {
    label: "Thiếu phiên bản ngôn ngữ khác",
    evidence: "inferred",
    base: 5,
    score: { clarity: -1.2, planning: -0.7 },
    criticism: [
      "Hình ảnh hấp dẫn nhưng tôi không tìm thấy bản tiếng Anh để hiểu hướng dẫn và quy tắc ứng xử.",
      "Khách quốc tế có thể xem ảnh nhưng khó tự lập kế hoạch vì toàn bộ nội dung chỉ bằng tiếng Việt.",
      "Tên riêng dễ nhận biết, còn thông tin an toàn, liên hệ và hành trình cần ít nhất bản tiếng Anh.",
      "Tôi muốn chia sẻ trang cho bạn nước ngoài nhưng chưa có nút đổi ngôn ngữ.",
    ],
    features: ["english_version", "language_switcher", "translated_safety_guide"],
  },
  CONTENT_REPETITION: {
    label: "Nội dung và card lặp lại",
    evidence: "inferred",
    base: 8,
    score: { clarity: -0.5, visual: -0.2 },
    criticism: [
      "Một số hành trình và nhóm ảnh lặp lại tiêu đề, nên tôi khó nhận ra đâu là thông tin mới.",
      "Các card có phong cách giống nhau và xuất hiện dày khiến nội dung bắt đầu hòa lẫn vào nhau.",
      "Tôi gặp lại cùng tên hành trình ở nhiều vị trí; nên rút gọn và làm rõ vai trò từng block.",
      "Phần kể chuyện có chiều sâu nhưng thiếu nhịp nghỉ, khiến nhiều đoạn tốt bị giảm tác dụng.",
    ],
    features: ["deduplicate_cards", "editorial_hierarchy", "personalized_sections"],
  },
  TRUST_DETAILS: {
    label: "Cần làm nổi bật nguồn và trạng thái xác minh",
    evidence: "inferred",
    base: 7,
    score: { trust: -0.8, planning: -0.3 },
    criticism: [
      "Website có dáng vẻ chính thống nhưng tôi muốn thấy ngày cập nhật và nguồn ngay cạnh thông tin quan trọng.",
      "Thông tin sâm và điểm đến nên có nhãn đã xác minh, đơn vị chịu trách nhiệm và ngày rà soát rõ hơn.",
      "Tôi thấy thông tin liên hệ cơ quan ở cuối trang, nhưng các khẳng định trong từng mục chưa luôn gắn nguồn nổi bật.",
      "Với sản vật giá trị cao như sâm, tôi cần cách kiểm tra nguồn gốc và cảnh báo hàng giả rõ ràng hơn.",
    ],
    features: ["verification_badges", "last_updated_dates", "ginseng_authenticity", "source_panel"],
  },
  POSITIVE_WITH_IDEA: {
    label: "Hài lòng, chủ yếu đề xuất mở rộng",
    evidence: "preference",
    base: 20,
    score: { visual: 0.4, clarity: 0.2, trust: 0.2, mobile: 0.2 },
    criticism: [
      "Tổng thể đã thuyết phục; tôi chỉ muốn có cách lưu các địa điểm yêu thích cho chuyến đi sau.",
      "Trang kể chuyện rất có cảm xúc và đủ khiến tôi muốn đi, nếu có lịch trình mẫu thì sẽ tiện hơn.",
      "Bản đồ, ảnh và thông tin cơ quan tạo cảm giác đáng tin; thêm chức năng chia sẻ hành trình sẽ hoàn chỉnh hơn.",
      "Trải nghiệm mobile mượt và không bị tràn ngang, tôi muốn có bản cẩm nang tải về để xem khi mất sóng.",
    ],
    features: ["favorites", "share_trip", "offline_guide", "sample_itinerary", "events_calendar"],
  },
};

if (evidence.pageFacts.forms === 0) {
  delete issues.FORM_FRICTION;
  issues.CONTACT_CHANNEL_GAP = {
    label: "Thiếu kênh hỏi nhanh ngay trên website",
    evidence: "inferred",
    base: 7,
    score: { planning: -0.6, navigation: -0.3, trust: -0.1 },
    criticism: [
      "Tôi muốn hỏi một câu ngắn nhưng trang hiện ưu tiên điều hướng sang kênh liên hệ khác thay vì cho gửi ngay tại chỗ.",
      "Thông tin cơ quan có đầy đủ, còn luồng hỏi nhanh trên website chưa thật liền mạch.",
      "Không có form gửi yêu cầu trực tiếp nên tôi phải đổi sang gọi điện, email hoặc fanpage.",
      "Kênh liên hệ công khai đáng tin nhưng thiếu lời hứa về thời gian phản hồi và trạng thái tiếp nhận.",
    ],
    features: ["short_contact_form", "zalo_chat", "faq", "contact_response_time"],
  };
}

const contactIssueCode = evidence.pageFacts.forms === 0 ? "CONTACT_CHANNEL_GAP" : "FORM_FRICTION";

// Retire fixed baseline issues only when the deployed-browser evidence proves
// that the corresponding acceptance criterion is now satisfied.
const checks = evidence.featureChecks ?? {};
const violationIds = new Set(evidence.accessibility?.violations?.map(({ id }) => id) ?? []);
const brokenInternalLinks = evidence.internalLinkStatus.filter(({ status }) => status === null || status >= 400);
const hasMapFontFailure = evidence.badResponses.some(
  ({ url, status }) => status >= 400 && /api\.mapbox\.com\/fonts/i.test(url),
);
const removeIssue = (code) => {
  delete issues[code];
};

if (checks.weatherRoute && evidence.hashTargets.every(({ href, exists }) => href !== "#" && exists)) {
  removeIssue("WEATHER_DEAD_LINK");
}
if (brokenInternalLinks.length === 0) removeIssue("DESTINATIONS_404");
if (!violationIds.has("color-contrast")) removeIssue("CONTRAST");
if (!violationIds.has("nested-interactive") && evidence.mapKeyboard?.selectedAfterEnter) {
  removeIssue("MAP_ACCESSIBILITY");
}
if (!hasMapFontFailure) removeIssue("MAP_FONT_ERRORS");
if (checks.englishRoute && checks.englishLang === "en") removeIssue("LANGUAGE_GAP");
if (checks.contactPhone && checks.contactEmail && checks.contactFacebook) {
  removeIssue("CONTACT_CHANNEL_GAP");
  removeIssue("FORM_FRICTION");
}

const planningReady = checks.journeyTripInfo
  && checks.journeyItinerary
  && checks.journeyPrint
  && checks.journeyVerification
  && checks.weatherRoute;
if (planningReady && issues.TRIP_INFO_GAPS) {
  issues.TRIP_INFO_GAPS.base = 6;
  issues.TRIP_INFO_GAPS.status = "blocked_external";
  issues.TRIP_INFO_GAPS.evidence = "blocked_by_official_source";
  issues.TRIP_INFO_GAPS.score = { planning: -0.2, clarity: 0, trust: 0.1 };
  issues.TRIP_INFO_GAPS.label = "Chờ dữ liệu chính thức về quãng đường, chi phí hoặc lịch nhận khách";
  issues.TRIP_INFO_GAPS.criticism = [
    "Khối thông tin chuyến đi đã rõ thời lượng, độ khó và từng chặng; tôi vẫn muốn quãng đường khi địa phương xác minh xong.",
    "Lịch trình mẫu và nút lưu PDF hữu ích, còn chi phí được ghi đang xác minh nên tôi cần liên hệ trước khi chốt ngân sách.",
    "Trang không tự ước tính dữ liệu chưa chắc chắn, nhưng tôi mong lần cập nhật sau bổ sung quãng đường đã kiểm chứng.",
    "Tôi đã có mùa phù hợp, cách tiếp cận và đầu mối liên hệ; phần còn thiếu là chi phí chính thức nếu sau này có nguồn.",
  ];
  issues.TRIP_INFO_GAPS.features = ["verified_route_distance", "official_costs", "booking_availability"];
}

const fullPageTransferMb = evidence.pageFacts.resourceSummary.transferSize / 1024 / 1024;
const densityReady = checks.boundedSpecialties
  && checks.boundedMapPreview
  && checks.shortcutBarAbsent
  && checks.backToTop;
if (densityReady) removeIssue("PAGE_TOO_DENSE");

const mediaReady = fullPageTransferMb <= 4.5
  && checks.reducedMotionUnloadsVideo
  && checks.boundedMediaRails
  && checks.guideOffline;
if (mediaReady) removeIssue("MEDIA_DATA_COST");
if (checks.boundedMediaRails && checks.boundedSpecialties && checks.boundedMapPreview) {
  removeIssue("CONTENT_REPETITION");
}

const trustReady = checks.journeyVerification
  && checks.placeVerification
  && checks.placeSources
  && checks.faqAuthenticityGuidance;
if (trustReady) removeIssue("TRUST_DETAILS");

const expansionReady = checks.journeyItinerary
  && checks.journeySaveShare
  && checks.savedRoute
  && checks.guideOffline
  && checks.guideSaveShare
  && checks.placeSaveShare;
if (expansionReady) {
  removeIssue("POSITIVE_WITH_IDEA");
  issues.SATISFIED_NO_CHANGE = {
    label: "Hài lòng, không yêu cầu chỉnh sửa",
    evidence: "preference",
    status: "satisfied",
    base: 60,
    score: { visual: 0.45, clarity: 0.35, navigation: 0.35, planning: 0.35, trust: 0.35, mobile: 0.35, accessibility: 0.25 },
    criticism: [
      "Các tác vụ chính đã rõ, tôi không thấy điểm nào cần sửa thêm ở thời điểm này.",
      "Tôi có thể xem hành trình, lưu nội dung, chia sẻ và dùng cẩm nang khi cần; trải nghiệm hiện tại đã đủ dùng.",
      "Trang vẫn giàu hình ảnh nhưng đã có lối tắt, danh sách rút gọn và chế độ tiết kiệm dữ liệu nên tôi không đề xuất thay đổi thêm.",
      "Nguồn, trạng thái xác minh và kênh liên hệ đã rõ hơn; tôi sẽ dùng website như điểm bắt đầu trước khi liên hệ địa phương.",
    ],
    features: ["no_change"],
  };
  issues.OFFICIAL_EVENTS_REQUEST = {
    label: "Chờ nguồn chính thức cho lịch sự kiện và cảnh báo chủ động",
    evidence: "blocked_by_official_source",
    status: "blocked_external",
    base: 3,
    score: { planning: -0.1, trust: 0.1 },
    criticism: [
      "Nếu địa phương công bố lịch sự kiện và đầu mối cập nhật ổn định, tôi muốn website bổ sung sau; hiện tại không nên tự suy đoán.",
      "Cảnh báo thời tiết hoặc đường đi chủ động chỉ nên bật khi có nguồn chính thức và người chịu trách nhiệm vận hành.",
    ],
    features: ["official_events_feed", "official_travel_alerts"],
  };
  issues.PRODUCT_TRACEABILITY_REQUEST = {
    label: "Chờ hệ thống truy xuất nguồn gốc sâm từ đơn vị có thẩm quyền",
    evidence: "blocked_by_official_source",
    status: "blocked_external",
    base: 3,
    score: { trust: -0.05 },
    criticism: [
      "Hướng dẫn kiểm tra nguồn gốc đã thận trọng; chức năng tra cứu thật chỉ nên thêm khi có dữ liệu chứng nhận chính thức.",
      "Website không nên tự cấp tem hay xác nhận sản phẩm; tôi sẽ chờ hệ thống truy xuất của đơn vị có thẩm quyền.",
    ],
    features: ["official_ginseng_traceability"],
  };
}

const evidenceRefs = {
  TRIP_INFO_GAPS: `${evidenceFileName}#pageFacts.headings,anchors`,
  WEATHER_DEAD_LINK: `${evidenceFileName}#hashTargets[href=#]`,
  DESTINATIONS_404: `${evidenceFileName}#internalLinkStatus[/dia-diem]`,
  PAGE_TOO_DENSE: `${evidenceFileName}#pageFacts.bodyTextLength,scrollHeight,headings`,
  MEDIA_DATA_COST: `${evidenceFileName}#pageFacts.resourceSummary`,
  CONTRAST: `${evidenceFileName}#accessibility.violations[color-contrast]`,
  MAP_ACCESSIBILITY: `${evidenceFileName}#accessibility.violations[nested-interactive]`,
  MAP_FONT_ERRORS: `${evidenceFileName}#badResponses[api.mapbox.com/fonts]`,
  FORM_FRICTION: `${evidenceFileName}#pageFacts.formFields`,
  CONTACT_CHANNEL_GAP: `${evidenceFileName}#pageFacts.forms,anchors`,
  LANGUAGE_GAP: `${evidenceFileName}#pageFacts.language`,
  CONTENT_REPETITION: `${evidenceFileName}#pageFacts.headings`,
  TRUST_DETAILS: `${evidenceFileName}#pageFacts.anchors,headings`,
  POSITIVE_WITH_IDEA: `${evidenceLabel}-hero-desktop.png,${evidenceLabel}-mobile-full.png`,
  SATISFIED_NO_CHANGE: `${evidenceFileName}#featureChecks`,
  OFFICIAL_EVENTS_REQUEST: `${evidenceFileName}#featureChecks`,
  PRODUCT_TRACEABILITY_REQUEST: `${evidenceFileName}#featureChecks.faqAuthenticityGuidance`,
};

const featureLabels = {
  trip_facts: "bảng tóm tắt thời lượng, độ khó, giá và yêu cầu",
  sample_itinerary: "lịch trình mẫu 1–3 ngày",
  booking_availability: "lịch nhận khách và nút đặt/chuyển đầu mối",
  cost_estimator: "ước tính chi phí",
  working_weather_link: "link dự báo thời tiết hoạt động",
  weather_forecast: "dự báo 7 ngày theo địa điểm",
  rain_alert: "cảnh báo mưa và đường xấu",
  destinations_index: "trang danh sách toàn bộ địa điểm",
  fix_footer_link: "sửa link Địa điểm ở footer",
  site_search: "tìm kiếm toàn website",
  shorter_homepage: "trang chủ ngắn gọn hơn",
  sticky_section_progress: "mục lục/progress cố định",
  content_summary: "tóm tắt nhanh theo nhu cầu",
  back_to_top: "nút quay lên đầu trang",
  data_saver: "chế độ tiết kiệm dữ liệu",
  lighter_images: "ảnh nhẹ và tải thích ứng",
  disable_video: "tắt video nền",
  offline_guide: "cẩm nang offline/PDF",
  wcag_contrast: "tăng tương phản đạt WCAG AA",
  text_size_control: "điều chỉnh cỡ chữ",
  high_contrast_mode: "chế độ tương phản cao",
  accessible_map_markers: "marker bản đồ hỗ trợ screen reader",
  keyboard_map_list: "danh sách bản đồ dùng bàn phím",
  skip_map: "bỏ qua bản đồ tới danh sách",
  fix_map_fonts: "sửa font Mapbox bị 404",
  map_fallback_font: "font dự phòng cho bản đồ",
  map_resource_monitoring: "giám sát lỗi tài nguyên bản đồ",
  short_contact_form: "form hỏi nhanh ít trường hơn",
  zalo_chat: "kênh chat/Zalo chính thức",
  faq: "FAQ về đường đi và tham quan",
  contact_response_time: "cam kết thời gian phản hồi",
  english_version: "phiên bản tiếng Anh",
  language_switcher: "nút đổi ngôn ngữ",
  translated_safety_guide: "hướng dẫn an toàn đa ngôn ngữ",
  deduplicate_cards: "giảm card/nội dung lặp",
  editorial_hierarchy: "phân cấp nội dung rõ hơn",
  personalized_sections: "lọc nội dung theo mục đích chuyến đi",
  verification_badges: "nhãn xác minh thông tin",
  last_updated_dates: "ngày cập nhật từng mục",
  ginseng_authenticity: "tra cứu nguồn gốc sâm",
  source_panel: "bảng nguồn tham khảo rõ ràng",
  favorites: "lưu địa điểm yêu thích",
  share_trip: "chia sẻ kế hoạch chuyến đi",
  events_calendar: "lịch lễ hội và phiên chợ",
  verified_route_distance: "quãng đường đã được địa phương đo và xác nhận",
  official_costs: "chi phí chính thức từ đơn vị cung cấp dịch vụ",
  official_events_feed: "nguồn lịch sự kiện chính thức có lịch cập nhật",
  official_travel_alerts: "cảnh báo chủ động có đơn vị chịu trách nhiệm",
  official_ginseng_traceability: "hệ thống truy xuất sâm của đơn vị có thẩm quyền",
  no_change: "giữ nguyên trải nghiệm hiện tại",
};

const intentContext = {
  trip_planning: "Tôi vào trang để lên kế hoạch chuyến đi thật",
  inspiration: "Tôi chủ yếu tìm cảm hứng cho một điểm đến mới",
  trekking: "Tôi quan tâm trekking và an toàn đường rừng",
  ginseng_products: "Tôi muốn tìm hiểu sâm Ngọc Linh và sản vật",
  xo_dang_culture: "Tôi muốn hiểu văn hóa Xơ Đăng một cách tôn trọng",
  map_directions: "Tôi cần bản đồ và đường đi cụ thể",
  local_official: "Tôi xem trang như một kênh thông tin địa phương",
  international: "Tôi xem với góc nhìn của khách không nói tiếng Việt",
  accessibility: "Tôi kiểm tra trang với nhu cầu hỗ trợ tiếp cận",
};

const roleContext = {
  office_worker: "Tôi thường so sánh kỹ trước khi xin nghỉ phép",
  family_trip_planner: "Tôi phải cân nhắc an toàn và sức của cả gia đình",
  student: "Tôi ưu tiên thông tin ngắn gọn và chi phí vừa túi tiền",
  trekker: "Tôi quen kiểm tra độ khó, quãng đường và rủi ro trước khi đi",
  retired_traveler: "Tôi cần chữ dễ đọc và nhịp tham quan không quá gấp",
  content_creator: "Tôi chú ý câu chuyện, hình ảnh và khả năng chia sẻ",
  tourism_professional: "Tôi xem cả trải nghiệm khách lẫn tính chính xác vận hành",
  teacher_public_sector: "Tôi quan tâm nguồn, tính chính thống và giá trị giáo dục",
  small_business: "Tôi để ý đầu mối liên hệ và cơ hội kết nối địa phương",
  general_traveler: "Tôi muốn hiểu nhanh nơi này có phù hợp với mình hay không",
};

const regionContext = {
  "Da Nang_Quang Nam": "và có thể xuất phát từ khu vực Đà Nẵng–Quảng Nam",
  "Central Vietnam": "và dự tính di chuyển từ miền Trung",
  "Ho Chi Minh_South": "và cần tính thêm chặng dài từ phía Nam",
  "Ha Noi_North": "và cần tính thêm chặng dài từ phía Bắc",
  "Other Vietnam": "và chưa quen đường đến Trà Linh",
  "Overseas Vietnamese": "và muốn chia sẻ thông tin rõ ràng cho người thân ở nước ngoài",
  International: "và không thể dựa hoàn toàn vào nội dung tiếng Việt",
};

const deviceContext = {
  mobile: ["trên điện thoại", "bằng điện thoại", "ở màn hình nhỏ"],
  desktop: ["trên laptop", "ở màn hình desktop", "bằng máy tính"],
  tablet: ["trên máy tính bảng", "ở màn hình tablet", "bằng tablet"],
};

const positives = [
  "Ảnh mở đầu và bảng màu xanh tạo cảm giác Trà Linh rất riêng.",
  "Bản đồ có nhiều điểm và phần liên hệ cơ quan giúp trang đáng tin hơn.",
  "CTA trên mobile dễ chạm, đặc biệt là gọi điện và chỉ đường.",
  "Câu chuyện về rừng, người Xơ Đăng và vùng sâm được kết nối khá mạch lạc.",
  "Thiết kế có chất tạp chí, khác với nhiều trang giới thiệu địa phương thông thường.",
  "Trang không bị tràn ngang trên điện thoại và chữ chính nhìn rõ.",
  "Thông tin liên hệ cuối trang cụ thể, có điện thoại và email.",
  "Phần hero tạo ấn tượng mạnh và cho tôi biết ngay chủ đề chính.",
];

function issueWeights(persona) {
  const weights = Object.entries(issues).map(([code, issue]) => [code, issue.base]);
  const boost = (code, amount) => {
    const entry = weights.find(([candidate]) => candidate === code);
    if (entry) entry[1] += amount;
  };

  if (["trip_planning", "trekking"].includes(persona.intent)) {
    boost("TRIP_INFO_GAPS", 18);
    boost("WEATHER_DEAD_LINK", 10);
    boost(contactIssueCode, 5);
  }
  if (persona.intent === "map_directions") {
    boost("DESTINATIONS_404", 12);
    boost("MAP_FONT_ERRORS", 6);
    boost("MAP_ACCESSIBILITY", 4);
  }
  if (persona.intent === "international" || persona.region === "International") {
    boost("LANGUAGE_GAP", 35);
  }
  if (persona.intent === "ginseng_products") boost("TRUST_DETAILS", 18);
  if (persona.intent === "ginseng_products") boost("PRODUCT_TRACEABILITY_REQUEST", 5);
  if (persona.intent === "xo_dang_culture") boost("CONTENT_REPETITION", 8);
  if (persona.intent === "accessibility" || persona.accessibilityNeed !== "none") {
    boost("CONTRAST", 22);
    boost("MAP_ACCESSIBILITY", 22);
  }
  if (["4g_weak", "3g"].includes(persona.network)) boost("MEDIA_DATA_COST", 24);
  if (persona.device === "mobile") boost("PAGE_TOO_DENSE", 8);
  if (["55-64", "65+"].includes(persona.age)) boost("CONTRAST", 7);
  if (persona.literacy === "basic") boost("PAGE_TOO_DENSE", 5);
  return weights;
}

function scorePersona(issue) {
  const jitter = () => (random() - 0.5) * 1.25;
  const base = {
    visual: 4.3,
    clarity: planningReady ? 3.95 : 3.65,
    navigation: brokenInternalLinks.length === 0 && checks.weatherRoute ? 4.15 : 3.55,
    planning: planningReady ? 3.8 : 2.95,
    trust: checks.journeyVerification ? 4.05 : 3.75,
    mobile: evidence.mobile?.horizontalOverflow === 0 ? 4.15 : 4.05,
    accessibility: evidence.accessibility?.violationCount === 0 && evidence.mapKeyboard?.selectedAfterEnter ? 4.3 : 3.2,
  };
  for (const [metric, adjustment] of Object.entries(issue.score)) base[metric] += adjustment;
  return Object.fromEntries(
    Object.entries(base).map(([metric, value]) => [metric, Number(clamp(value + jitter(), 1, 5).toFixed(1))]),
  );
}

function completionFor(code) {
  const hardStops = ["DESTINATIONS_404", "WEATHER_DEAD_LINK", "LANGUAGE_GAP", "MAP_ACCESSIBILITY"];
  const partial = ["TRIP_INFO_GAPS", "FORM_FRICTION", "MEDIA_DATA_COST", "PAGE_TOO_DENSE"];
  const roll = random();
  if (hardStops.includes(code)) return roll < 0.3 ? "abandoned" : roll < 0.8 ? "partial" : "completed";
  if (partial.includes(code)) return roll < 0.12 ? "abandoned" : roll < 0.62 ? "partial" : "completed";
  return roll < 0.06 ? "abandoned" : roll < 0.25 ? "partial" : "completed";
}

const feedback = [];
const commentSet = new Set();

for (let index = 0; index < sampleSize; index += 1) {
  const persona = {
    id: `U${String(index + 1).padStart(Math.max(4, String(sampleSize).length), "0")}`,
    age: ages[index], device: devices[index], network: networks[index],
    intent: intents[index], region: regions[index], role: roles[index],
    accessibilityNeed: accessibilityNeeds[index], literacy: literacy[index],
  };
  const issueCode = weightedChoice(issueWeights(persona));
  const issue = issues[issueCode];
  const featureCode = choose(issue.features);
  const scores = scorePersona(issue);
  const mean = Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length;
  const nps = Math.round(clamp((mean - 1) * 2.5 + (random() - 0.5) * 6.5, 0, 10));
  const sentiment = nps >= 8 ? "positive" : nps <= 5 ? "negative" : "mixed";
  const completion = completionFor(issueCode);
  const networkPhrase = persona.network === "3g"
    ? "với mạng 3G"
    : persona.network === "4g_weak"
      ? "với 4G yếu"
      : persona.network === "wifi"
        ? "qua Wi‑Fi"
        : "qua 4G ổn định";
  const positivePool = persona.device === "mobile"
    ? positives
    : positives.filter((note) => !note.includes("CTA trên mobile") && !note.includes("trên điện thoại"));
  const positiveNote = choose(positivePool);
  const criticism = choose(issue.criticism);
  const requestSentence = issue.status === "satisfied"
    ? "Hiện tại tôi không yêu cầu chỉnh sửa."
    : issue.status === "blocked_external"
      ? `Đề xuất ${featureLabels[featureCode]} chỉ nên triển khai khi có nguồn chính thức và đơn vị chịu trách nhiệm.`
      : `Tôi muốn có ${featureLabels[featureCode]}.`;
  let comment = `${intentContext[persona.intent]} ${choose(deviceContext[persona.device])} ${networkPhrase}. ${roleContext[persona.role]} ${regionContext[persona.region]}. ${positiveNote} ${criticism} ${requestSentence}`;
  if (commentSet.has(comment)) comment += ` Bối cảnh persona tổng hợp: ${persona.id}.`;
  commentSet.add(comment);

  feedback.push({
    id: persona.id,
    age_band: persona.age,
    region: persona.region,
    role: persona.role,
    device: persona.device,
    network: persona.network,
    digital_literacy: persona.literacy,
    intent: persona.intent,
    accessibility_need: persona.accessibilityNeed,
    journey_completion: completion,
    sentiment,
    primary_issue_code: issueCode,
    primary_issue: issue.label,
    resolution_status: issue.status ?? "actionable",
    evidence_level: issue.evidence,
    evidence_ref: evidenceRefs[issueCode],
    requested_feature_code: featureCode,
    requested_feature: featureLabels[featureCode],
    score_visual: scores.visual,
    score_clarity: scores.clarity,
    score_navigation: scores.navigation,
    score_planning: scores.planning,
    score_trust: scores.trust,
    score_mobile: scores.mobile,
    score_accessibility: scores.accessibility,
    recommend_0_10: nps,
    positive_note: positiveNote,
    criticism,
    comment,
  });
}

function countBy(key) {
  return Object.fromEntries(
    Object.entries(feedback.reduce((counts, row) => {
      counts[row[key]] = (counts[row[key]] ?? 0) + 1;
      return counts;
    }, {})).sort((left, right) => right[1] - left[1]),
  );
}

function average(key) {
  return Number((feedback.reduce((sum, row) => sum + Number(row[key]), 0) / feedback.length).toFixed(2));
}

const metricKeys = [
  "score_visual", "score_clarity", "score_navigation", "score_planning",
  "score_trust", "score_mobile", "score_accessibility", "recommend_0_10",
];
const promoters = feedback.filter(({ recommend_0_10: score }) => score >= 9).length;
const detractors = feedback.filter(({ recommend_0_10: score }) => score <= 6).length;

const summary = {
  generatedAt: new Date().toISOString(),
  evidenceLabel,
  evidenceFile: evidenceFileName,
  targetUrl: evidence.targetUrl,
  methodology: "Deterministic synthetic personas grounded in browser/code evidence; not real survey respondents.",
  seed: 20260810,
  sampleSize: feedback.length,
  uniqueComments: commentSet.size,
  quotas: {
    age_band: countBy("age_band"), device: countBy("device"), network: countBy("network"),
    intent: countBy("intent"), accessibility_need: countBy("accessibility_need"),
  },
  averages: Object.fromEntries(metricKeys.map((key) => [key, average(key)])),
  syntheticNps: Math.round(((promoters - detractors) / feedback.length) * 100),
  sentiment: countBy("sentiment"),
  completion: countBy("journey_completion"),
  resolutionStatus: countBy("resolution_status"),
  actionableFeedbackCount: feedback.filter(({ resolution_status: status }) => status === "actionable").length,
  actionableIssueCodes: [...new Set(feedback.filter(({ resolution_status: status }) => status === "actionable").map(({ primary_issue_code: code }) => code))],
  issues: countBy("primary_issue_code"),
  features: countBy("requested_feature_code"),
  evidenceLevels: countBy("evidence_level"),
  observedWebsiteFacts: {
    status: evidence.mainStatus,
    title: evidence.pageFacts.title,
    bodyTextLength: evidence.pageFacts.bodyTextLength,
    scrollHeight: evidence.pageFacts.scrollHeight,
    headings: evidence.pageFacts.headings.length,
    imagesInDom: evidence.pageFacts.images.length,
    mapMarkers: evidence.pageFacts.mapMarkers,
    transferSizeMB: Number((evidence.pageFacts.resourceSummary.transferSize / 1024 / 1024).toFixed(2)),
    brokenInternalLinks: evidence.internalLinkStatus.filter(({ status }) => status === null || status >= 400),
    missingHashTargets: evidence.hashTargets.filter(({ exists }) => !exists),
    accessibilityViolations: evidence.accessibility.violations.map(({ id, impact, nodes }) => ({ id, impact, nodes: nodes.length })),
    badResponses: [...new Map(evidence.badResponses.map((item) => [`${item.status}:${item.url}`, item])).values()],
    mobileOverflow: evidence.mobile.horizontalOverflow,
    featureChecks: evidence.featureChecks ?? null,
    mapKeyboard: evidence.mapKeyboard ?? null,
    performance: evidence.performance ?? null,
    mobilePerformance: evidence.mobile?.performance ?? null,
    consoleErrors: evidence.consoleErrors ?? [],
  },
};

const columns = Object.keys(feedback[0]);
const escapeCsv = (value) => {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = [columns.join(","), ...feedback.map((row) => columns.map((column) => escapeCsv(row[column])).join(","))].join("\n");

const feedbackStem = `feedback-${sampleSize}${outputSuffix}`;
const summaryFileName = sampleSize === 1000 && !outputSuffix ? "summary.json" : `summary-${sampleSize}${outputSuffix}.json`;
const catalogFileName = sampleSize === 1000 && !outputSuffix ? "issue-catalog.json" : `issue-catalog-${sampleSize}${outputSuffix}.json`;

await writeFile(resolve(outputDirectory, `${feedbackStem}.csv`), `${csv}\n`, "utf8");
await writeFile(
  resolve(outputDirectory, `${feedbackStem}.jsonl`),
  `${feedback.map((row) => JSON.stringify(row)).join("\n")}\n`,
  "utf8",
);
await writeFile(resolve(outputDirectory, summaryFileName), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
await writeFile(
  resolve(outputDirectory, catalogFileName),
  `${JSON.stringify(Object.fromEntries(Object.entries(issues).map(([code, issue]) => [code, {
    label: issue.label,
    evidence: issue.evidence,
    evidenceRef: evidenceRefs[code],
    requestedFeatures: issue.features,
    resolutionStatus: issue.status ?? "actionable",
  }])), null, 2)}\n`,
  "utf8",
);

console.log(JSON.stringify({
  evidenceLabel,
  targetUrl: evidence.targetUrl,
  rows: feedback.length,
  uniqueIds: new Set(feedback.map(({ id }) => id)).size,
  uniqueComments: commentSet.size,
  averages: summary.averages,
  syntheticNps: summary.syntheticNps,
  topIssues: Object.entries(summary.issues).slice(0, 8),
  topFeatures: Object.entries(summary.features).slice(0, 8),
}, null, 2));
