import type {
  CultureStory,
  GinsengStoryStep,
  Guide,
  HomePageContent,
  Journey,
  LocalSpecialty,
  MediaAsset,
  Product,
  StoryChapter,
} from './types'

const VERIFIED_AT = '2026-07-22'
const UPDATED_AT = '2026-07-22T00:00:00.000Z'
const OFFICIAL_PLACE_URL =
  'https://tralinh.danang.gov.vn/gioi-thieu/gioi-thieu-chung'
const OFFICIAL_CITY_URL =
  'https://danang.gov.vn/vi/w/phat-trien-tra-linh-thanh-vung-duoc-lieu-trong-diem-cua-mien-trung'
const MARKET_URL =
  'https://tralinh.danang.gov.vn/chi-tiet-tin/group/119/nid/4370/cho-phien-tra-linh-thang-4-2-26-khong-gian-van-hoa-song-dong-lan-toa-sinh-ke-va-ban-sac-vung-cao'
const GINSENG_CENTRE_URL =
  'https://samngoclinh.danang.gov.vn/gioi-thieu-1.html'
const CRAWLER_SOURCE = 'http://dulichtralinh.vn/'
const CRAWLER_CREDIT = 'Cổng thông tin du lịch Trà Linh (dữ liệu lưu trữ)'

const media = {
  hero: {
    id: 'media-hero-ngoc-linh',
    src: '/images/tra-linh/hero-ban-lang-ngoc-linh-desktop.webp',
    title: 'Mây núi vùng Ngọc Linh',
    altText: 'Mây phủ trên những sườn núi xanh ở vùng Ngọc Linh',
    caption: 'Không gian núi rừng vùng Ngọc Linh.',
    sourceUrl:
      'http://dulichtralinh.vn/cac-diem-du-lich-hap-dan/tham-nhung-ngoi-lang-tren-vach-nui-324324',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  village: {
    id: 'media-village',
    src: '/images/tra-linh/hero-ban-lang-ngoc-linh.jpg',
    title: 'Bản làng vùng núi cao',
    altText: 'Bản làng nép bên sườn núi xanh trong màn sương',
    caption: 'Bản làng giữa núi rừng Trà Linh.',
    sourceUrl:
      'http://dulichtralinh.vn/cac-diem-du-lich-hap-dan/tham-nhung-ngoi-lang-tren-vach-nui-324324',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  forest: {
    id: 'media-forest',
    src: '/images/tra-linh/duoi-tan-rung-sam.webp',
    title: 'Rừng già Ngọc Linh',
    altText: 'Lối nhỏ đi dưới tán rừng xanh ẩm của vùng Ngọc Linh',
    sourceUrl:
      'http://dulichtralinh.vn/cac-diem-du-lich-hap-dan/du-lich-xanh-ve-vung-sam-ngoc-linh-323560',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  journey: {
    id: 'media-journey',
    src: '/images/tra-linh/hanh-trinh-rung-sam.webp',
    title: 'Hành trình giữa rừng',
    altText: 'Người dân địa phương đi trên lối nhỏ giữa rừng vùng Ngọc Linh',
    sourceUrl:
      'http://dulichtralinh.vn/cac-diem-du-lich-hap-dan/du-lich-xanh-ve-vung-sam-ngoc-linh-323560',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  ginseng: {
    id: 'media-ginseng',
    src: '/images/tra-linh/sam-ngoc-linh-trung-bay.jpg',
    title: 'Sâm Ngọc Linh',
    altText: 'Cây sâm Ngọc Linh được giới thiệu tại phiên chợ địa phương',
    caption: 'Hình ảnh tư liệu về sâm Ngọc Linh.',
    sourceUrl:
      'http://dulichtralinh.vn/su-kien/mua-sam-ngoc-linh-chuan-o-dau-327402',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  culture: {
    id: 'media-culture',
    src: '/images/tra-linh/le-mung-lua-moi.jpg',
    title: 'Lễ mừng lúa mới',
    altText: 'Cộng đồng Xơ Đăng trong không gian lễ mừng lúa mới',
    caption: 'Không gian cộng đồng trong lễ mừng lúa mới.',
    sourceUrl:
      'http://dulichtralinh.vn/tin-tuc-su-kien/le-hoi-an-mung-lua-moi-lan-thu-i-nam-2024-cua-dong-bao-dan-toc-xo-dang-tai-noc-kon-pin-thon-2-xa-tra-linh-327383',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  rice: {
    id: 'media-new-rice',
    src: '/images/tra-linh/hat-lua-moi.jpg',
    title: 'Hạt lúa mới',
    altText: 'Những hạt lúa mới trong không gian lễ hội của cộng đồng Xơ Đăng',
    caption: 'Hạt lúa mới gợi nhắc nhịp mùa và đời sống cộng đồng.',
    sourceUrl:
      'http://dulichtralinh.vn/tin-tuc-su-kien/le-hoi-an-mung-lua-moi-lan-thu-i-nam-2024-cua-dong-bao-dan-toc-xo-dang-tai-noc-kon-pin-thon-2-xa-tra-linh-327383',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  market: {
    id: 'media-ginseng-market',
    src: '/images/tra-linh/phien-cho-sam.jpg',
    title: 'Phiên chợ sâm',
    altText: 'Sâm Ngọc Linh được giới thiệu tại phiên chợ vùng cao',
    caption: 'Hình ảnh tư liệu tại phiên chợ sâm.',
    sourceUrl:
      'http://dulichtralinh.vn/su-kien/mua-sam-ngoc-linh-chuan-o-dau-327402',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  fish: {
    id: 'media-fish',
    src: '/images/tra-linh/ca-nien-nuong.webp',
    title: 'Cá niên',
    altText: 'Món cá niên nướng được trình bày trên đĩa',
    sourceUrl:
      'http://dulichtralinh.vn/am-thuc/dac-san-ca-nien-tra-linh-324318',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  bamboo: {
    id: 'media-bamboo',
    src: '/images/tra-linh/mang-rung.webp',
    title: 'Măng rừng',
    altText: 'Măng rừng được sơ chế theo cách của người địa phương',
    sourceUrl: 'http://dulichtralinh.vn/am-thuc/mang-chua-rung-324317',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
  chicken: {
    id: 'media-chicken',
    src: '/images/tra-linh/ga-nuong.webp',
    title: 'Gà nướng',
    altText: 'Món gà nướng vàng thơm theo phong vị vùng cao',
    sourceUrl: 'http://dulichtralinh.vn/am-thuc/ga-nuong-tra-linh-324319',
    sourceCredit: CRAWLER_CREDIT,
    usagePermission: 'client_confirmed',
    verifiedAt: VERIFIED_AT,
  },
} satisfies Record<string, MediaAsset>

const journeys: Journey[] = [
  {
    id: 'journey-forest',
    slug: 'trekking-duoi-tan-rung',
    title: 'Đi dưới tán rừng',
    shortDescription:
      'Một gợi ý tiếp cận đại ngàn chậm rãi, có người địa phương đồng hành.',
    description:
      'Lắng nghe nhịp rừng, quan sát thảm thực vật và tìm hiểu cách cộng đồng gìn giữ sinh cảnh vùng Ngọc Linh.',
    status: 'published',
    verificationStatus: 'verified',
    isPlaceholder: false,
    sourceUrl: OFFICIAL_CITY_URL,
    sourceCredit: 'Cổng thông tin điện tử thành phố Đà Nẵng',
    verifiedAt: VERIFIED_AT,
    displayOrder: 1,
    featuredMedia: media.journey,
    gallery: [media.journey, media.forest],
    updatedAt: UPDATED_AT,
    category: 'nature',
    locationLabel: 'Vùng núi Trà Linh',
    durationLabel: 'Đi cùng người am hiểu địa hình',
    accessStatus: 'organized_only',
    accessNote: 'Chỉ tham gia theo chương trình được địa phương xác nhận.',
    safetyNote:
      'Đi cùng người am hiểu địa hình và kiểm tra điều kiện thời tiết trước khi khởi hành.',
    highlights: ['Rừng nguyên sinh', 'Mây núi', 'Tri thức bản địa'],
  },
  {
    id: 'journey-village',
    slug: 'ban-lang-trong-suong',
    title: 'Bản làng trong sương',
    shortDescription:
      'Gặp không gian sống của cộng đồng Xơ Đăng giữa những sườn núi xanh.',
    description:
      'Một hành trình đề cao sự tôn trọng đời sống bản địa, lắng nghe câu chuyện và giữ gìn không gian chung.',
    status: 'published',
    verificationStatus: 'verified',
    isPlaceholder: false,
    sourceUrl: MARKET_URL,
    sourceCredit: 'Cổng thông tin điện tử xã Trà Linh',
    verifiedAt: VERIFIED_AT,
    displayOrder: 2,
    featuredMedia: media.village,
    gallery: [media.village],
    updatedAt: UPDATED_AT,
    category: 'community',
    locationLabel: 'Xã Trà Linh, thành phố Đà Nẵng',
    durationLabel: 'Theo lịch hoạt động được công bố',
    accessStatus: 'contact_required',
    accessNote: 'Cần xác nhận với đầu mối địa phương trước khi ghé thăm.',
    safetyNote: 'Tôn trọng sinh hoạt, nghi lễ và quyền riêng tư của cư dân.',
    highlights: ['Bản làng', 'Câu chuyện cộng đồng', 'Cảnh quan vùng cao'],
  },
  {
    id: 'journey-herbs',
    slug: 'cham-vao-mien-duoc-lieu',
    title: 'Chạm vào miền dược liệu',
    shortDescription:
      'Tìm hiểu sâm Ngọc Linh và các loài dược liệu trong mối quan hệ với rừng.',
    description:
      'Nội dung tập trung vào câu chuyện bảo tồn, nguồn gốc và tri thức canh tác; không thay thế tư vấn y khoa.',
    status: 'published',
    verificationStatus: 'verified',
    isPlaceholder: false,
    sourceUrl: GINSENG_CENTRE_URL,
    sourceCredit: 'Trung tâm Phát triển Sâm Ngọc Linh và Dược liệu',
    verifiedAt: VERIFIED_AT,
    displayOrder: 3,
    featuredMedia: media.ginseng,
    gallery: [media.ginseng, media.forest],
    updatedAt: UPDATED_AT,
    category: 'ginseng',
    locationLabel: 'Vùng sâm Ngọc Linh',
    durationLabel: 'Chỉ tiếp cận theo đơn vị quản lý',
    accessStatus: 'organized_only',
    accessNote: 'Vườn sâm không phải điểm tham quan tự do.',
    safetyNote: 'Chỉ tiếp cận khu vực được đơn vị quản lý cho phép.',
    highlights: ['Sâm Ngọc Linh', 'Dược liệu bản địa', 'Giữ rừng'],
  },
]

const products: Product[] = []

const guides: Guide[] = [
  {
    id: 'guide-road',
    slug: 'duong-den-tra-linh',
    title: 'Đường đến Trà Linh',
    shortDescription: 'Những điều nên kiểm tra trước khi bắt đầu hành trình vùng cao.',
    description:
      'Điều kiện đường và thời tiết có thể thay đổi. Hãy xác nhận lộ trình với cơ quan hoặc đầu mối địa phương trước khi đi.',
    status: 'published',
    verificationStatus: 'verified',
    isPlaceholder: false,
    sourceUrl: OFFICIAL_CITY_URL,
    sourceCredit: 'Cổng thông tin điện tử thành phố Đà Nẵng',
    verifiedAt: VERIFIED_AT,
    displayOrder: 1,
    featuredMedia: media.hero,
    gallery: [media.hero],
    updatedAt: UPDATED_AT,
    readTimeLabel: '3 phút đọc',
    seasonLabel: 'Kiểm tra thời tiết trước chuyến đi',
    sections: [
      {
        title: 'Trước khi khởi hành',
        body: 'Theo dõi dự báo thời tiết, chuẩn bị phương tiện phù hợp và lưu đầu mối hỗ trợ tại địa phương.',
      },
      {
        title: 'Trên đường',
        body: 'Di chuyển thận trọng trên đường núi, không tự ý rẽ vào đường rừng hoặc khu vực hạn chế.',
      },
    ],
  },
  {
    id: 'guide-season',
    slug: 'thoi-diem-goi-y',
    title: 'Kiểm tra trước khi đi',
    shortDescription: 'Theo dõi thông báo địa phương và dành khoảng trống cho thay đổi thời tiết.',
    description:
      'Khí hậu vùng núi biến đổi nhanh; lịch trình nên linh hoạt và ưu tiên thông báo chính thức tại thời điểm đi.',
    status: 'published',
    verificationStatus: 'verified',
    isPlaceholder: false,
    sourceUrl: OFFICIAL_PLACE_URL,
    sourceCredit: 'Cổng thông tin điện tử xã Trà Linh',
    verifiedAt: VERIFIED_AT,
    displayOrder: 2,
    featuredMedia: media.village,
    gallery: [media.village],
    updatedAt: UPDATED_AT,
    readTimeLabel: '2 phút đọc',
    seasonLabel: 'Theo thông báo tại thời điểm đi',
    sections: [
      {
        title: 'Ưu tiên an toàn',
        body: 'Không khởi hành vào lúc có cảnh báo mưa lớn, sạt lở hoặc tầm nhìn hạn chế.',
      },
    ],
  },
  {
    id: 'guide-forest',
    slug: 'luu-y-khi-vao-rung',
    title: 'Lưu ý khi vào rừng',
    shortDescription: 'Đi có tổ chức, để lại ít dấu vết và tôn trọng sinh cảnh.',
    description:
      'Không tự ý vào rừng, không lấy mẫu vật và không công bố vị trí nhạy cảm của khu vực trồng sâm.',
    status: 'published',
    verificationStatus: 'verified',
    isPlaceholder: false,
    sourceUrl: GINSENG_CENTRE_URL,
    sourceCredit: 'Trung tâm Phát triển Sâm Ngọc Linh và Dược liệu',
    verifiedAt: VERIFIED_AT,
    displayOrder: 3,
    featuredMedia: media.forest,
    gallery: [media.forest],
    updatedAt: UPDATED_AT,
    readTimeLabel: '4 phút đọc',
    seasonLabel: 'Mọi thời điểm',
    sections: [
      {
        title: 'Tôn trọng ranh giới',
        body: 'Chỉ đi trên lối được hướng dẫn và tuân thủ yêu cầu của đơn vị quản lý.',
      },
      {
        title: 'Bảo vệ đại ngàn',
        body: 'Mang rác trở ra, hạn chế tiếng ồn và không tác động vào thực vật bản địa.',
      },
    ],
  },
]

const storyChapters: StoryChapter[] = [
  {
    id: 'story-mountain',
    eyebrow: '01 · ĐẠI NGÀN',
    title: 'Nơi mây đi qua những sườn rừng',
    description:
      'Trà Linh mở ra bằng những lớp núi, rừng ẩm và bản làng nép trong sương.',
    media: media.hero,
    displayOrder: 1,
  },
  {
    id: 'story-community',
    eyebrow: '02 · CON NGƯỜI',
    title: 'Nhịp sống được gìn giữ qua nhiều thế hệ',
    description:
      'Câu chuyện địa phương hiện diện trong nếp nhà, mùa lúa và cách cộng đồng sống cùng rừng.',
    media: media.village,
    displayOrder: 2,
  },
]

const ginsengStorySteps: GinsengStoryStep[] = [
  {
    id: 'ginseng-canopy',
    stepNumber: 1,
    title: 'Dưới tán rừng',
    description:
      'Sâm Ngọc Linh gắn với sinh cảnh rừng và câu chuyện bảo tồn lâu dài.',
    media: media.forest,
    displayOrder: 1,
  },
  {
    id: 'ginseng-care',
    stepNumber: 2,
    title: 'Bàn tay gìn giữ',
    description:
      'Người trồng chăm từng luống sâm trong điều kiện tự nhiên đặc thù của vùng núi.',
    quote: 'Giữ sâm bắt đầu từ việc giữ rừng.',
    media: media.ginseng,
    displayOrder: 2,
  },
  {
    id: 'ginseng-origin',
    stepNumber: 3,
    title: 'Trân trọng nguồn gốc',
    description:
      'Thông tin nguồn gốc và xác thực sản phẩm là điều cần được kiểm tra trước mọi quyết định.',
    media: media.ginseng,
    displayOrder: 3,
  },
]

const cultureStories: CultureStory[] = [
  {
    id: 'culture-new-rice',
    title: 'Mừng lúa mới',
    description:
      'Một dịp cộng đồng Xơ Đăng cùng sẻ chia niềm vui mùa màng và nhắc nhớ mối gắn bó với đất, rừng.',
    caption: 'Tư liệu về lễ mừng lúa mới tại Trà Linh.',
    media: media.culture,
    displayOrder: 1,
  },
  {
    id: 'culture-rice',
    title: 'Hạt lúa và nhịp mùa',
    description:
      'Từ mùa gieo trồng đến ngày sum họp, hạt lúa nối câu chuyện lao động với đời sống tinh thần của cộng đồng.',
    caption: 'Hạt lúa mới trong không gian văn hóa địa phương.',
    media: media.rice,
    displayOrder: 2,
  },
]

const localSpecialties: LocalSpecialty[] = [
  {
    id: 'specialty-fish',
    slug: 'ca-nien',
    name: 'Cá niên',
    category: 'am-thuc',
    description: 'Một sản vật suối được nhắc đến trong câu chuyện ẩm thực địa phương.',
    media: media.fish,
    isPlaceholder: false,
    sourceUrl: media.fish.sourceUrl,
    sourceCredit: CRAWLER_CREDIT,
    displayOrder: 1,
  },
  {
    id: 'specialty-bamboo',
    slug: 'mang-rung',
    name: 'Măng rừng',
    category: 'nong-san',
    description: 'Măng được chế biến thành những món ăn mộc mạc của vùng cao.',
    media: media.bamboo,
    isPlaceholder: false,
    sourceUrl: media.bamboo.sourceUrl,
    sourceCredit: CRAWLER_CREDIT,
    displayOrder: 2,
  },
  {
    id: 'specialty-chicken',
    slug: 'ga-nuong',
    name: 'Gà nướng',
    category: 'am-thuc',
    description: 'Món nướng ấm lửa, phù hợp để kể câu chuyện về bữa ăn vùng núi.',
    media: media.chicken,
    isPlaceholder: false,
    sourceUrl: media.chicken.sourceUrl,
    sourceCredit: CRAWLER_CREDIT,
    displayOrder: 3,
  },
]

export const fallbackContent: HomePageContent = {
  source: 'fallback',
  hero: {
    eyebrow: 'TRÀ LINH · VÙNG NGỌC LINH',
    title: 'Giữa đại ngàn, một báu vật lớn lên',
    placeName: 'Trà Linh',
    description:
      'Nơi rừng già, mây núi và bàn tay người Xơ Đăng cùng gìn giữ vùng sâm Ngọc Linh dưới tán đại ngàn.',
    primaryCta: { label: 'Khám phá hành trình', href: '#hanh-trinh' },
    secondaryCta: { label: 'Xem câu chuyện', href: '#cau-chuyen' },
    tags: ['Rừng', 'Văn hóa', 'Sâm Ngọc Linh'],
    backgroundMedia: media.hero,
  },
  sectionSettings: {
    hero: {
      key: 'hero',
      eyebrow: 'TRÀ LINH · VÙNG NGỌC LINH',
      title: 'Giữa đại ngàn, một báu vật lớn lên',
      description:
        'Nơi rừng già, mây núi và bàn tay người Xơ Đăng cùng gìn giữ vùng sâm Ngọc Linh dưới tán đại ngàn.',
      secondaryText: 'Trà Linh',
      cta: { label: 'Khám phá hành trình', href: '#hanh-trinh' },
      badges: ['Rừng', 'Văn hóa', 'Sâm Ngọc Linh'],
      stats: [],
    },
    story: {
      key: 'story',
      eyebrow: 'Câu chuyện vùng cao',
      title: 'Một vùng đất sống cùng rừng',
      description: 'Trà Linh được kể qua cảnh quan, sinh kế và tri thức bản địa.',
      badges: ['Rừng tự nhiên', 'Khí hậu mát ẩm', 'Dược liệu dưới tán', 'Sinh kế cộng đồng'],
      stats: [],
    },
    journeys: {
      key: 'journeys',
      eyebrow: 'Khám phá có trách nhiệm',
      title: 'Những hành trình giữa đại ngàn',
      description: 'Mỗi cung đường cần được chuẩn bị kỹ và tôn trọng hướng dẫn của địa phương.',
      badges: [],
      stats: [],
    },
    ginseng: {
      key: 'ginseng',
      eyebrow: 'Vùng sâm dưới tán rừng',
      title: 'Một hành trình lớn lên chậm rãi',
      description: 'Sâm Ngọc Linh gắn với độ ẩm, lớp mùn và bóng râm của rừng.',
      badges: [],
      stats: [],
    },
    culture: {
      key: 'culture',
      eyebrow: 'Văn hóa & con người',
      title: 'Nhịp sống Xơ Đăng giữa đại ngàn',
      description: 'Rừng không chỉ là cảnh quan mà còn là không gian sống và văn hóa.',
      badges: [],
      stats: [],
    },
    local_products: {
      key: 'local_products',
      eyebrow: 'Sản vật địa phương',
      title: 'Hương vị của núi rừng',
      description: 'Những sản vật gắn với mùa vụ, tri thức và bàn tay của cộng đồng.',
      badges: [],
      stats: [],
    },
    products: {
      key: 'products',
      eyebrow: 'Sâm Ngọc Linh',
      title: 'Sản phẩm từ vùng dược liệu',
      description: 'Thông tin giới thiệu sản phẩm và nguồn gốc địa phương.',
      badges: [],
      stats: [],
    },
    guides: {
      key: 'guides',
      eyebrow: 'Cẩm nang hành trình',
      title: 'Chuẩn bị cho vùng núi cao',
      description: 'Thông tin thiết thực giúp bạn đi chậm, an toàn và tôn trọng không gian sống của cộng đồng địa phương.',
      badges: ['Theo dõi thời tiết', 'Đi cùng hướng dẫn'],
      stats: [],
    },
    final_cta: {
      key: 'final_cta',
      eyebrow: 'Bắt đầu hành trình',
      title: 'Trà Linh không chỉ để ngắm nhìn',
      description: 'Đó là hành trình chạm vào rừng, con người và câu chuyện của vùng sâm Ngọc Linh.',
      cta: { label: 'Khám phá hành trình', href: '#hanh-trinh' },
      badges: [],
      stats: [],
    },
    contact: {
      key: 'contact',
      eyebrow: 'Liên hệ',
      title: 'Kết nối với Trà Linh',
      description: 'Hãy để lại thông tin nếu bạn cần hỗ trợ cho hành trình hoặc hợp tác.',
      badges: [],
      stats: [],
    },
  },
  identityValues: [
    {
      id: 'identity-mountain',
      title: 'Đại ngàn',
      description: 'Rừng núi xanh thẳm và mây phủ theo nhịp mùa.',
      icon: 'mountain',
    },
    {
      id: 'identity-ginseng',
      title: 'Vùng sâm',
      description: 'Sâm Ngọc Linh được nuôi dưỡng dưới tán rừng.',
      icon: 'sprout',
    },
    {
      id: 'identity-culture',
      title: 'Bản sắc',
      description: 'Đời sống cộng đồng Xơ Đăng giàu truyền thống.',
      icon: 'community',
    },
    {
      id: 'identity-herbs',
      title: 'Dược liệu',
      description: 'Tri thức bản địa đồng hành cùng việc giữ rừng.',
      icon: 'leaf',
    },
  ],
  storyChapters,
  journeys,
  ginsengStorySteps,
  cultureStories,
  localSpecialties,
  products,
  guides,
  media: Object.values(media),
}

export const fallbackJourneys = journeys
export const fallbackProducts = products
export const fallbackGuides = guides
export const fallbackMedia = Object.values(media)

export const contentSources = {
  officialPlace: OFFICIAL_PLACE_URL,
  ginsengCentre: GINSENG_CENTRE_URL,
  crawler: CRAWLER_SOURCE,
} as const
