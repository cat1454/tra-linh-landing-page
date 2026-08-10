// Centralized Data Configuration for Trà Linh Landing Page
// All text copy and image path mappings are defined here.
// You can easily edit the Vietnamese copy or swap the image paths below.

export const HERO_DATA = {
  eyebrow: "TRÀ LINH · VÙNG NGỌC LINH",
  title: "Giữa đại ngàn, một báu vật lớn lên",
  placeName: "Trà Linh",
  description:
    "Nơi rừng già, mây núi và bàn tay người Xơ Đăng cùng gìn giữ vùng sâm Ngọc Linh dưới tán đại ngàn.",
  primaryCta: { label: "Khám phá hành trình", href: "#hanh-trinh" },
  secondaryCta: { label: "Xem câu chuyện", href: "#cau-chuyen" },
  tags: ["Rừng", "Văn hóa", "Sâm Ngọc Linh"],

  // TODO: Swap this image path if it does not match the Hero landscape background.
  imagePath:
    "/assets/ThienNhien/1784805009714_7825852089651351479_g3040039768026489372_a4ceeac10fe5bc847c9a838198a913e1.jpg",

  // TODO: Swap this video path if the desktop hero background video needs to be changed.
  videoPath:
    "/assets/ThienNhien/1784805382896_7825852089651351479_g3040039768026489372.mp4",
};

export const STORY_CHAPTERS = [
  {
    id: "story-mountain",
    eyebrow: "01 · ĐẠI NGÀN KỲ VĨ",
    title: "Nơi đại ngàn ôm trọn sương mờ",
    description:
      "Trà Linh chào đón bạn bằng lớp lớp sương mù bay lãng đãng ôm lấy những sườn núi xanh ngút ngàn, mở ra không gian núi rừng ẩm ướt hoang sơ kỳ bí bậc nhất miền trung.",
    displayOrder: 1,
    // TODO: Swap this image path if it does not match the Nature chapter.
    imagePath:
      "/assets/ThienNhien/1784805009722_7825852089651351479_g3040039768026489372_74845ea8216693c89dc05f57e3f2833b.jpg",
  },
  {
    id: "story-community",
    eyebrow: "02 · BẢN SẮC XƠ ĐĂNG",
    title: "Đời sống hòa nhịp cùng hơi thở rừng",
    description:
      "Bà con người Xơ Đăng đã nương tựa vào đại ngàn Ngọc Linh qua bao thế hệ. Rừng che chở bản làng, nuôi dưỡng đất đai và ban tặng nguồn dược liệu sâm quý cứu người.",
    displayOrder: 2,
    // TODO: Swap this image path if it does not match the Culture chapter.
    imagePath:
      "/assets/ThienNhien/1784805009728_7825852089651351479_g3040039768026489372_7664e3f6d89af81a5f527ab7fabcb92b.jpg",
  },
];

export const JOURNEY_CARDS = [
  {
    id: "journey-forest",
    slug: "trekking-duoi-tan-rung",
    title: "Trekking dưới tán rừng già",
    shortDescription:
      "Cung đường đi bộ dưới sương mù đại ngàn nguyên sinh, được dẫn dắt bởi người bản địa am hiểu địa hình.",
    description:
      "Lắng nghe hơi thở của rừng già Ngọc Linh, khám phá thảm thực vật ẩm ướt trù phú và tìm hiểu tri thức bản địa canh tác sâm dưới bóng mát cổ thụ. Cung đường đòi hỏi thể lực khá và sự tôn trọng tuyệt đối dành cho môi trường tự nhiên.",
    category: "nature" as const,
    locationLabel: "Rừng nguyên sinh Trà Linh",
    durationLabel: "1 ngày trải nghiệm",
    difficultyLabel: "Khá · cần thể lực và người dẫn đường",
    bestSeasonLabel: "Đang xác minh với đơn vị địa phương",
    itinerary: [
      { title: "Xác nhận hành trình", description: "Liên hệ đơn vị tổ chức hoặc người dẫn đường và kiểm tra điều kiện thời tiết." },
      { title: "Đi dưới tán rừng", description: "Di chuyển theo đoàn, quan sát sinh cảnh và thực vật đặc hữu." },
      { title: "Rời rừng an toàn", description: "Kiểm tra quân số, mang toàn bộ rác ra ngoài và kết thúc trước khi trời tối." },
    ],
    accessStatus: "organized_only" as const,
    accessNote:
      "Chỉ tham gia theo chương trình được phê duyệt hoặc có kiểm lâm/người dẫn đường địa phương.",
    safetyNote:
      "Chuẩn bị giày bám tốt, trang phục giữ ấm và chống vắt. Theo sát người dẫn đường.",
    highlights: [
      "Khám phá rừng già nguyên sinh",
      "Gặp gỡ thảm thực vật đặc hữu",
      "Tìm hiểu tri thức sinh cảnh",
    ],
    displayOrder: 1,
    imagePath:
      "/assets/ThienNhien/1784806521298_7825852089651351479_g3040039768026489372_383c8c61f1fd843bac1e42cee90fc9c4.jpg",
  },
  {
    id: "journey-village",
    slug: "ban-lang-trong-suong",
    title: "Bản làng Xơ Đăng trong sương",
    shortDescription:
      "Trải nghiệm không gian văn hóa cộng đồng mộc mạc bên những nếp nhà sàn truyền thống.",
    description:
      "Gặp gỡ bà con người Xơ Đăng tại Trà Linh, tìm hiểu văn hóa kiến trúc nhà sàn, nếp sinh hoạt quanh bếp lửa hồng và lắng nghe những làn điệu dân ca mang hơi thở núi rừng Ngọc Linh. Chuyến đi tôn vinh giá trị văn hóa bản địa chân thực.",
    category: "community" as const,
    locationLabel: "Nọc (bản) người Xơ Đăng, Trà Linh",
    durationLabel: "Nửa ngày hoặc ở lại qua đêm",
    difficultyLabel: "Đang xác minh với đơn vị địa phương",
    bestSeasonLabel: "Đang xác minh với đơn vị địa phương",
    itinerary: [
      { title: "Liên hệ trước", description: "Xin xác nhận của trưởng bản hoặc ban đại diện địa phương trước khi đến." },
      { title: "Tìm hiểu không gian bản", description: "Khám phá kiến trúc, sinh hoạt và câu chuyện văn hóa cùng người địa phương." },
      { title: "Khép lại có trách nhiệm", description: "Tôn trọng quyền riêng tư, xin phép trước khi chụp ảnh và giữ gìn không gian chung." },
    ],
    accessStatus: "contact_required" as const,
    accessNote:
      "Cần liên hệ với trưởng bản hoặc ban đại diện địa phương trước khi vào tham quan.",
    safetyNote:
      "Tôn trọng nếp sống và không tự ý chụp ảnh cư dân hay vào các gian thờ tự nếu chưa được phép.",
    highlights: [
      "Trải nghiệm văn hóa Xơ Đăng",
      "Nhà rông truyền thống",
      "Ẩm thực gia đình bản địa",
    ],
    displayOrder: 2,
    imagePath:
      "/assets/ThienNhien/1784806521269_7825852089651351479_g3040039768026489372_f571b9eb8dd5bdeb8e0bd2f08f21aade.jpg",
  },
  {
    id: "journey-herbs",
    slug: "cham-vao-mien-duoc-lieu",
    title: "Hành trình miền dược liệu quý",
    shortDescription:
      "Ghé thăm khu vườn ươm sâm Ngọc Linh và các thảo dược quý sinh trưởng tự nhiên.",
    description:
      "Tìm hiểu về loài sâm Ngọc Linh huyền thoại - Quốc bảo Việt Nam, quan sát cách chăm sóc thủ công tỷ mỷ từ khâu ươm hạt đến thu hoạch. Chuyến đi nâng cao nhận thức bảo tồn dược liệu quý hiếm gắn liền với việc bảo vệ rừng xanh.",
    category: "ginseng" as const,
    locationLabel: "Vườn dược liệu Trà Linh",
    durationLabel: "Tham quan theo lịch ươm giống",
    difficultyLabel: "Đang xác minh với đơn vị địa phương",
    bestSeasonLabel: "Theo lịch của đơn vị bảo tồn",
    itinerary: [
      { title: "Kiểm tra lịch mở cửa", description: "Chỉ lên đường khi đoàn đã được đơn vị quản lý xác nhận." },
      { title: "Tham quan có hướng dẫn", description: "Tìm hiểu quy trình ươm giống và bảo tồn theo tuyến được cho phép." },
      { title: "Tuân thủ bảo tồn", description: "Không chạm, hái hoặc di chuyển cây và vật liệu trong khu vực bảo tồn." },
    ],
    accessStatus: "organized_only" as const,
    accessNote:
      "Khu vực bảo tồn sâm nghiêm ngặt, chỉ mở cửa cho các chương trình khoa học hoặc đoàn được cấp phép.",
    safetyNote:
      "Không tự ý chạm vào cây trồng hay hái lá, quả sâm. Tuân thủ tuyệt đối nội quy bảo tồn.",
    highlights: [
      "Vườn sâm Ngọc Linh nguyên bản",
      "Kỹ thuật nhân giống truyền thống",
      "Giao lưu chuyên gia dược học",
    ],
    displayOrder: 3,
    imagePath:
      "/assets/DacSan/1784805009794_7825852089651351479_g3040039768026489372_80b14cbe6e64e36178140081636dca4e.jpg",
  },
];

export const GINSENG_STORY_STEPS = [
  {
    id: "ginseng-canopy",
    stepNumber: 1,
    title: "Sinh trưởng dưới bóng mát cổ thụ",
    description:
      "Hạt sâm Ngọc Linh được gieo trực tiếp dưới lớp đất ẩm mùn tơi xốp, đón ánh nắng tán xạ dịu nhẹ xuyên qua tán rừng già ẩm ướt đón sương lạnh đỉnh Ngọc Linh.",
    displayOrder: 1,
    imagePath:
      "/assets/ThienNhien/1784806521346_7825852089651351479_g3040039768026489372_55873fbbdaa67eb872b7537216fd44a2.jpg",
  },
  {
    id: "ginseng-care",
    stepNumber: 2,
    title: "Bàn tay bà con tận tụy giữ gìn",
    description:
      "Sâm Ngọc Linh lớn lên hoàn toàn tự nhiên, không hóa chất. Từng luống sâm được che chắn, chăm bón tỉ mỷ bởi bàn tay cần cù, nhẫn nại của bà con người Xơ Đăng.",
    quote:
      "Giữ sâm quý chính là giữ lấy từng cây cổ thụ, giữ lấy đại ngàn bình yên.",
    displayOrder: 2,
    imagePath:
      "/assets/ThienNhien/1784806521298_7825852089651351479_g3040039768026489372_383c8c61f1fd843bac1e42cee90fc9c4.jpg",
  },
  {
    id: "ginseng-origin",
    stepNumber: 3,
    title: "Quốc bảo trân quý vươn tầm thế giới",
    description:
      "Sau hơn 6 năm lớn lên chậm rãi, củ sâm Ngọc Linh quý hiếm tích tụ hàm lượng saponin cao vượt trội, mang đến nguồn dược chất vô giá bồi bổ và phục hồi sinh lực.",
    displayOrder: 3,
    imagePath:
      "/assets/DacSan/1784804678215_7825852089651351479_g3040039768026489372_15d4bf8ed57bc91027a16d598c64efdf.jpg",
  },
];

export const CULTURE_STORIES = [
  {
    id: "culture-new-rice",
    title: "Sàng sảy lúa mới ngày mùa",
    caption: "Đồng bào Xơ Đăng sàng sảy hạt thóc vàng óng ngày mùa lúa mới.",
    displayOrder: 1,
    imagePath:
      "/assets/HoatDong/1784804678218_7825852089651351479_g3040039768026489372_3eff0a156404083bda425e1521e591df.jpg",
  },
  {
    id: "culture-rice",
    title: "Vẻ đẹp trang phục truyền thống Xơ Đăng",
    caption: "Phụ nữ Xơ Đăng trong tà áo thổ cẩm đỏ đen dệt tay truyền thống.",
    displayOrder: 2,
    imagePath:
      "/assets/ConNguoi/1784804678209_7825852089651351479_g3040039768026489372_1f79d70bfa4dfbd7124359e5ad5f86fb.jpg",
  },
];

export const LOCAL_SPECIALTIES = [
  // Nhóm: Ẩm thực & Giao thương (am-thuc) - Khách du lịch thưởng thức hoặc tương tác trực tiếp
  {
    id: "specialty-fish",
    slug: "ca-nien",
    name: "Sâm Ngọc Linh củ tươi hoang dã",
    category: "duoc-lieu" as const,
    description:
      "Củ sâm Ngọc Linh tươi nguyên bản được khai thác từ lớp đất mùn ẩm ướt dưới tán rừng già nguyên sinh. Củ sâm giữ nguyên lớp rêu giữ ẩm tự nhiên và bộ rễ dài phát triển chằng chịt đặc trưng.",
    displayOrder: 1,
    // TODO: Swap this image path if it does not match "Sâm Ngọc Linh tươi trên rêu đá".
    imagePath:
      "/assets/DacSan/1784804678215_7825852089651351479_g3040039768026489372_15d4bf8ed57bc91027a16d598c64efdf.jpg",
  },
  {
    id: "specialty-chicken",
    slug: "ga-nuong",
    name: "Phiên chợ sâm Ngọc Linh Nam Trà My",
    category: "am-thuc" as const,
    description:
      "Phiên chợ sâm truyền thống tổ chức định kỳ tại huyện Nam Trà My. Đây là không gian văn hóa, giao thương nhộn nhịp, nơi du khách tận mắt chiêm ngưỡng và tìm hiểu cội nguồn sâm quý.",
    displayOrder: 2,
    // TODO: Swap this image path if it does not match "Phiên chợ sâm".
    imagePath:
      "/assets/DacSan/1784804678238_7825852089651351479_g3040039768026489372_896b9c6622894e0e1b36ca82fa8379d3.jpg",
  },
  {
    id: "specialty-pork",
    slug: "heo-ray-gac-bep",
    name: "Gian hàng sâm của hộ bản địa",
    category: "am-thuc" as const,
    description:
      "Hộ kinh doanh gia đình người Xơ Đăng tự hào giới thiệu sản phẩm sâm Ngọc Linh tự canh tác. Khách ghé thăm có thể giao lưu trò chuyện, tìm hiểu kỹ thuật ươm giống địa phương.",
    displayOrder: 3,
    // TODO: Swap this image path if it does not match "Gian hàng sâm".
    imagePath:
      "/assets/DacSan/1784804695567_7825852089651351479_g3040039768026489372_1b035c3659f7eba0eb3c4da351f8acbc.jpg",
  },
  {
    id: "specialty-soup",
    slug: "canh-boi-rau-rung",
    name: "Mầm sâm non trong vườn ươm",
    category: "nong-san" as const,
    description:
      "Những mầm sâm Ngọc Linh non tơ mọc thẳng tắp từ lớp mùn mục tự nhiên, được ươm dưỡng kỳ công trong nhà màng che chắn cẩn thận trước khi đưa ra trồng dưới tán rừng.",
    displayOrder: 4,
    // TODO: Swap this image path if it does not match "Mầm sâm giống".
    imagePath:
      "/assets/DacSan/1784804695571_7825852089651351479_g3040039768026489372_7fe3080ead93070d11a2342d388838cf.jpg",
  },

  // Nhóm: Dược liệu (duoc-lieu) - Các dạng sản phẩm thảo dược và dưỡng chất
  {
    id: "specialty-ginseng",
    slug: "sam-ngoc-linh",
    name: "Người trồng sâm Xơ Đăng",
    category: "am-thuc" as const,
    description:
      "Người dân bản địa Trà Linh rạng rỡ giới thiệu những cây sâm giống quý giá tại phiên chợ. Tri thức canh tác và tình yêu rừng của bà con là lá chắn tốt nhất bảo vệ thương hiệu quốc gia.",
    displayOrder: 5,
    // TODO: Swap this image path if it does not match "Người Xơ Đăng bán sâm".
    imagePath:
      "/assets/DacSan/1784804695573_7825852089651351479_g3040039768026489372_e28b3f4c955452778a63966ea3eb83c0.jpg",
  },
  {
    id: "specialty-tea",
    slug: "tra-la-sam",
    name: "Chăm sóc củ sâm tươi tại quầy",
    category: "am-thuc" as const,
    description:
      "Công đoạn phun sương ẩm nhẹ nhàng được thực hiện liên tục tại phiên chợ để giữ cho củ sâm tươi Ngọc Linh giữ trọn độ căng mọng, tươi mới cùng dược tính quý báu.",
    displayOrder: 6,
    // TODO: Swap this image path if it does not match "Phun sương giữ củ tươi".
    imagePath:
      "/assets/DacSan/1784804695576_7825852089651351479_g3040039768026489372_36efe783b4f6de8e3c8b48a99a30c952.jpg",
  },
  {
    id: "specialty-dangsam",
    slug: "dang-sam",
    name: "Nhánh lá sâm Ngọc Linh đón sương",
    category: "duoc-lieu" as const,
    description:
      "Cận cảnh phiến lá sâm Ngọc Linh răng cưa đặc hữu bám sương sớm mờ ảo. Lá sâm chứa hàm lượng saponin dồi dào, là nguyên liệu làm thức trà thanh nhiệt, bổ dưỡng.",
    displayOrder: 7,
    // TODO: Swap this image path if it does not match "Lá sâm răng cưa".
    imagePath:
      "/assets/DacSan/1784804732562_7825852089651351479_g3040039768026489372_5c053185d84581506bd4569487e649e8.jpg",
  },
  {
    id: "specialty-namlim",
    slug: "nam-lim-xanh",
    name: "Sâm Ngọc Linh củ khô thượng hạng",
    category: "duoc-lieu" as const,
    description:
      "Củ sâm tươi sau khi làm sạch được sấy khô tự nhiên hoặc sấy lạnh công nghệ cao để bảo toàn nguyên vẹn hàm lượng saponin phong phú phục vụ chế biến dược phẩm.",
    displayOrder: 8,
    // TODO: Swap this image path if it does not match "Sâm củ khô".
    imagePath:
      "/assets/DacSan/1784804732643_7825852089651351479_g3040039768026489372_ab3aa1c2b772c6348bc49d7afb1b5c5e.jpg",
  },

  // Nhóm: Nông sản & Canh tác (nong-san) - Hoạt động sản xuất nông lâm nghiệp
  {
    id: "specialty-bamboo",
    slug: "mang-rung-kho",
    name: "Xúc tiến thương mại sâm Ngọc Linh",
    category: "nong-san" as const,
    description:
      "Hoạt động trưng bày giới thiệu sâm Ngọc Linh tại các sự kiện xúc tiến đầu tư lớn, quảng bá rộng rãi thương hiệu sâm quốc gia ra thế giới.",
    displayOrder: 9,
    // TODO: Swap this image path if it does not match "Hội thảo thương mại".
    imagePath:
      "/assets/DacSan/1784805009778_7825852089651351479_g3040039768026489372_d66bfaf19dd2d884ad190937927267f8.jpg",
  },
  {
    id: "specialty-cheday",
    slug: "che-day",
    name: "Kỹ thuật thu hoạch sâm giống",
    category: "nong-san" as const,
    description:
      "Các chuyên gia và người trồng sâm thực hiện thu hoạch thủ công cây sâm trưởng thành trong khu vườn ươm che màng nilon bảo vệ khỏi sâu bệnh và thời tiết cực đoan.",
    displayOrder: 10,
    // TODO: Swap this image path if it does not match "Thu hoạch sâm giống".
    imagePath:
      "/assets/DacSan/1784805009784_7825852089651351479_g3040039768026489372_b478039967e2c0cef374278367b68cb6.jpg",
  },
  {
    id: "specialty-honey",
    slug: "mat-ong-rung",
    name: "Rượu sâm Ngọc Linh bình lớn",
    category: "duoc-lieu" as const,
    description:
      "Những củ sâm già nhiều năm tuổi được ngâm ủ trong bình rượu thủy tinh lớn sang trọng, là dòng sản phẩm cao cấp trưng bày tại các sự kiện ngoại giao chính thống.",
    displayOrder: 11,
    // TODO: Swap this image path if it does not match "Bình rượu sâm lớn".
    imagePath:
      "/assets/DacSan/1784805009789_7825852089651351479_g3040039768026489372_a4a2fb6f5836419b365a0df773f8f045.jpg",
  },
  {
    id: "specialty-kieu",
    slug: "kieu-ray-vung-cao",
    name: "Vườn bảo tồn giống sâm Trà Linh",
    category: "nong-san" as const,
    description:
      "Công tác nghiên cứu, đo đạc chỉ số sinh trưởng của cây sâm Ngọc Linh trong các luống đất quy chuẩn, đảm bảo nguồn gen thuần chủng quý hiếm được bảo tồn tốt nhất.",
    displayOrder: 12,
    // TODO: Swap this image path if it does not match "Luống giống sâm".
    imagePath:
      "/assets/DacSan/1784805009794_7825852089651351479_g3040039768026489372_80b14cbe6e64e36178140081636dca4e.jpg",
  },
];

export const PRESS_ARTICLES = [
  {
    id: "press-nhandan",
    title: "Trà Linh phát triển bền vững thương hiệu Sâm Ngọc Linh quốc gia",
    publisher: "Báo Nhân Dân",
    publishedDate: "24 Tháng 7, 2026",
    summary:
      "Bài phân tích chuyên sâu về định hướng phát triển vùng dược liệu bền vững, kết hợp bảo tồn đa dạng sinh học và nâng cao đời sống cho đồng bào Xơ Đăng dưới chân đỉnh Ngọc Linh.",
    url: "https://nhandan.vn",
    isVerified: false,
    displayOrder: 1,
    // TODO: Swap this image path if it does not match the first Press item.
    imagePath:
      "/assets/Bao/1784805009681_7825852089651351479_g3040039768026489372_47a330db4878ef213f4edf3dc054acaf.jpg",
  },
  {
    id: "press-vtv",
    title: "Ký sự giữ rừng bảo tồn dược liệu quý của người Xơ Đăng",
    publisher: "VTV1 - Đài Truyền hình Việt Nam",
    publishedDate: "18 Tháng 7, 2026",
    summary:
      "Phóng sự chân thực khắc họa đời sống, văn hóa tuần tra bảo vệ rừng già của bà con bản địa Trà Linh để gìn giữ môi trường sống tự nhiên tốt nhất cho cây sâm Ngọc Linh.",
    url: "https://vtv.vn",
    isVerified: false,
    displayOrder: 2,
    // TODO: Swap this image path if it does not match the second Press item.
    imagePath:
      "/assets/Bao/1784805009693_7825852089651351479_g3040039768026489372_d2626356e43e59031c50bfd6ea7cbed7.jpg",
  },
  {
    id: "press-tuoitre",
    title: "Hành trình sâm Ngọc Linh vươn tầm dược liệu thế giới",
    publisher: "Báo Tuổi Trẻ",
    publishedDate: "12 Tháng 7, 2026",
    summary:
      "Từ những gốc sâm mọc hoang dã nơi đại ngàn, qua bàn tay gìn giữ của bà con Trà Linh và khoa học hiện đại, sâm Ngọc Linh đã trở thành Quốc bảo vươn tầm quốc tế.",
    url: "https://tuoitre.vn",
    isVerified: false,
    displayOrder: 3,
    // TODO: Swap this image path if it does not match the third Press item.
    imagePath:
      "/assets/Bao/1784805009703_7825852089651351479_g3040039768026489372_556628dc31f2b5a3478367dc81f2a516.jpg",
  },
];

export const TRAVEL_GUIDES = [
  {
    id: "guide-road",
    slug: "duong-den-tra-linh",
    title: "Đường đến bản sương mù Trà Linh",
    shortDescription:
      "Cẩm nang chuẩn bị lộ trình đi lại an toàn lên vùng cao Nam Trà My.",
    description:
      "Đường đi Trà Linh bao quanh bởi dốc đá uốn lượn và sương mù dày đặc vào sáng sớm hay chiều tối. Hãy nắm vững các lưu ý di chuyển này để bảo đảm chuyến đi trọn vẹn và an toàn.",
    readTimeLabel: "4 phút đọc",
    seasonLabel: "Tránh đi mùa mưa lũ (tháng 9-11)",
    displayOrder: 1,
    // TODO: Swap this image path if it does not match the Road Guide.
    imagePath:
      "/assets/ThienNhien/1784805009728_7825852089651351479_g3040039768026489372_7664e3f6d89af81a5f527ab7fabcb92b.jpg",
    sections: [
      {
        title: "Phương tiện phù hợp",
        body: "Khuyến khích sử dụng xe máy côn tay hoặc xe bán tải hai cầu mạnh mẽ. Kiểm tra kỹ hệ thống phanh, lốp xe và đèn sương mù trước khi leo dốc.",
      },
      {
        title: "Lộ trình di chuyển",
        body: "Khởi hành từ Đà Nẵng hoặc Tam Kỳ đi hướng huyện Nam Trà My. Nên xuất phát sớm để tới Trà Linh trước 16h00, tránh lái xe đường núi trong bóng tối và sương mù dày.",
      },
    ],
  },
  {
    id: "guide-season",
    slug: "thoi-diem-goi-y",
    title: "Thời điểm vàng khám phá đại ngàn",
    shortDescription:
      "Lựa chọn mùa đẹp nhất để ngắm mây và tìm hiểu sinh hoạt mùa vụ vùng cao.",
    description:
      "Khí hậu Trà Linh ôn đới mát mẻ quanh năm nhưng chịu ảnh hưởng sâu sắc bởi chế độ mưa vùng nhiệt đới gió mùa. Hãy chọn thời gian thích hợp nhất để ngắm cảnh.",
    readTimeLabel: "3 phút đọc",
    seasonLabel: "Gợi ý: Tháng 1 đến tháng 8",
    displayOrder: 2,
    // TODO: Swap this image path if it does not match the Season Guide.
    imagePath:
      "/assets/ThienNhien/1784805009722_7825852089651351479_g3040039768026489372_74845ea8216693c89dc05f57e3f2833b.jpg",
    sections: [
      {
        title: "Mùa xuân nắng ấm (Tháng 1-4)",
        body: "Cảnh sắc đâm chồi nảy lộc, ngàn sương bay lãng đãng quanh sườn núi, khí hậu khô ráo, rất thích hợp cho trekking săn mây.",
      },
      {
        title: "Mùa gieo hạt & văn hóa (Tháng 5-8)",
        body: "Thời gian diễn ra nhiều nghi lễ truyền thống, mùa sâm ra hoa kết trái đỏ mọng rực rỡ dưới tán rừng xanh tốt.",
      },
    ],
  },
  {
    id: "guide-forest",
    slug: "luu-y-khi-vao-rung",
    title: "Quy tắc ứng xử văn minh nơi đại ngàn",
    shortDescription:
      "Nguyên tắc du lịch bền vững bảo vệ môi trường sinh cảnh và văn hóa bản địa.",
    description:
      "Bảo vệ thiên nhiên rừng già Ngọc Linh cũng chính là bảo vệ sinh kế của bà con. Vui lòng tuân thủ các quy tắc không dấu chân để gìn giữ sự hoang sơ.",
    readTimeLabel: "5 phút đọc",
    seasonLabel: "Bắt buộc tuân thủ quanh năm",
    displayOrder: 3,
    // TODO: Swap this image path if it does not match the Forest Guide.
    imagePath:
      "/assets/ThienNhien/1784805009734_7825852089651351479_g3040039768026489372_c981dd6766cbae47515dff12ec83090b.jpg",
    sections: [
      {
        title: "Không mang rác nhựa vào rừng",
        body: "Toàn bộ rác thải cá nhân phải được mang ra khỏi rừng. Tuyệt đối không xả rác bừa bãi hay chôn lấp chất thải nhựa trong khu vực bảo tồn.",
      },
      {
        title: "Tôn trọng đời sống bản địa",
        body: "Hỏi ý kiến trước khi vào thăm nếp nhà sàn hay tham gia sinh hoạt gia đình. Không gây tiếng ồn lớn làm ảnh hưởng không gian yên bình của bản làng.",
      },
    ],
  },
];
