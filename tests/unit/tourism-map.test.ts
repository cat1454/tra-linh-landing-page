import { describe, expect, it } from "vitest";

import { tourismCategories } from "@/data/tourism-map/categories";
import { tourismEvents } from "@/data/tourism-map/events";
import { sanitizeTourismPlaceMedia } from "@/data/tourism-map/media";
import { tourismPlaces } from "@/data/tourism-map/places";
import {
  buildGoogleMapsDirectionsUrl,
  filterTourismEntities,
  filterTourismExplorerEntities,
  getAllTourismEntities,
  getPlaceDirectionsUrl,
  getTourismViewportEntities,
  hasVerifiedCoordinates,
  toTourismGeoJson,
} from "@/lib/tourism-map";
import type { TourismPlace } from "@/data/tourism-map/types";
import verifiedCoordinateExport from "@/data/tourism-map/tra-linh-verified-coordinates.json";

const requiredNames = [
  "Điểm du lịch Vườn sâm Ngọc Linh – Tăk Ngo",
  "Trạm Dược liệu Trà Linh",
  "Không gian văn hóa Kon Pin – Đền thờ Thần Sâm",
  "Chợ phiên Trà Linh",
  "Chợ phiên Trà Linh",
  "Khu dân cư Tăk Lang",
  "Khu dân cư Tăk Ngo",
  "Khu dân cư Măng Lùng",
  "Thác Noong Lau",
  "UBND xã Trà Linh",
  "Trạm Y tế xã Trà Linh",
  "Điểm du lịch cộng đồng Tăk Pổ",
  "Trung tâm tổ chức sự kiện Sâm Ngọc Linh",
  "Đỉnh núi Ngọc Linh (2.598m)",
  "Phiên chợ Sâm Ngọc Linh",
  "Thác 5 Tầng",
  "Suối nước nóng Tắc Tố",
  "Ruộng bậc thang Long Túc",
  "Làng văn hóa Tăk Chươm",
  "Rừng quế cổ thụ Trà My",
  "Rừng nguyên sinh Ngọc Linh",
  "Homestay cộng đồng Xơ Đăng Trà Linh",
  "Đường mòn trekking Tắk Ngo",
  "Điểm ngắm cảnh sườn Ngọc Linh",
  "Suối Tắk Ngo",
];

describe("tourism map data", () => {
  it("matches the 25 reviewed current and legacy addresses", () => {
    const entities = [...tourismPlaces, ...tourismEvents];
    const addresses = Object.fromEntries(
      entities.map(({ slug, currentAddress, legacyAddress }) => [
        slug,
        [currentAddress, legacyAddress ?? null],
      ]),
    );

    expect(addresses).toEqual({
      "diem-du-lich-vuon-sam-ngoc-linh-tak-ngo": [
        "Xã Trà Linh, thành phố Đà Nẵng",
        "Xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "tram-duoc-lieu-tra-linh": [
        "Xã Trà Linh, thành phố Đà Nẵng",
        "Xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "khong-gian-van-hoa-kon-pin-den-tho-than-sam": [
        "Làng Kon Pin, xã Trà Linh, thành phố Đà Nẵng",
        "Làng Kon Pin, thôn 2, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "cho-phien-tra-linh": [
        "Khu trung tâm xã Trà Linh, thành phố Đà Nẵng",
        "Xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "su-kien-cho-phien-tra-linh": [
        "Tổ chức tại khu Nhà văn hóa thôn 2 – Đền thờ Thần Sâm, làng Kon Pin, xã Trà Linh",
        null,
      ],
      "khu-dan-cu-tak-lang": [
        "Khu dân cư Tắk Lang, thôn Hy Ló, xã Trà Linh, thành phố Đà Nẵng",
        "Nóc Tắk Lang, thôn 3, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "khu-dan-cu-tak-ngo": [
        "Khu vực Tắk Ngo, xã Trà Linh, thành phố Đà Nẵng",
        "Làng Tắk Ngo, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "khu-dan-cu-mang-lung": [
        "Khu dân cư Măng Lùng, thôn Ngọc Linh, xã Trà Linh, thành phố Đà Nẵng",
        "Măng Lùng, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "thac-noong-lau": [
        "Xã Trà Linh, thành phố Đà Nẵng",
        "Xã Trà Nam, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "ubnd-xa-tra-linh": [
        "Trang giới thiệu của xã hiện ghi: Thôn 3, xã Trà Linh, thành phố Đà Nẵng",
        null,
      ],
      "tram-y-te-xa-tra-linh": ["Xã Trà Linh, thành phố Đà Nẵng", null],
      "diem-du-lich-cong-dong-tak-po": [
        "Thôn 6, xã Trà Tập, thành phố Đà Nẵng",
        "Nóc Tắk Pổ, xã Trà Tập, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "trung-tam-to-chuc-su-kien-sam-ngoc-linh": [
        "Thôn 1, xã Nam Trà My, thành phố Đà Nẵng",
        "Khu trung tâm Trà Mai, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "dinh-nui-ngoc-linh": [
        "Đỉnh Ngọc Linh, xã Trà Linh, thành phố Đà Nẵng",
        "Đỉnh núi Ngọc Linh, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "phien-cho-sam-ngoc-linh": [
        "Tại Trung tâm tổ chức sự kiện Sâm Ngọc Linh, thôn 1, xã Nam Trà My",
        "Khu trung tâm Trà Mai, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "thac-5-tang": [
        "Xã Trà Mai, thành phố Đà Nẵng",
        "Xã Trà Mai, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "suoi-nuoc-nong-tac-to": [
        "Xã Trà Don, thành phố Đà Nẵng",
        "Xã Trà Don, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "ruong-bac-thang-long-tuc": [
        "Thôn Long Túc, xã Trà Nam, thành phố Đà Nẵng",
        "Thôn Long Túc, xã Trà Nam, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "lang-van-hoa-tak-chuom": [
        "Làng Tắk Chươm, xã Trà Cang, thành phố Đà Nẵng",
        "Làng Tắk Chươm, xã Trà Cang, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "rung-que-co-thu-tra-my": [
        "Xã Trà Vân, thành phố Đà Nẵng",
        "Xã Trà Vân, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "rung-nguyen-sinh-ngoc-linh": [
        "Vùng rừng phòng hộ Ngọc Linh, xã Trà Linh, thành phố Đà Nẵng",
        "Rừng Ngọc Linh, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "homestay-xa-tra-linh": [
        "Các thôn Tắk Ngo, Kon Pin, Tắk Lang – xã Trà Linh, thành phố Đà Nẵng",
        "Xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "duong-mon-trekking-tak-ngo": [
        "Xuất phát từ khu dân cư Tắk Ngo, xã Trà Linh, thành phố Đà Nẵng",
        "Nóc Tắk Ngo, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "diem-ngam-canh-suon-ngoc-linh": [
        "Sườn đông núi Ngọc Linh, xã Trà Linh, thành phố Đà Nẵng",
        "Vùng núi Ngọc Linh, xã Tra Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
      "suoi-tak-ngo": [
        "Khu vực suối Tắk Ngo, xã Trà Linh, thành phố Đà Nẵng",
        "Tắk Ngo, xã Trà Linh, huyện Nam Trà My, tỉnh Quảng Nam",
      ],
    });

    const sourceUrls = new Set(entities.flatMap((entity) => entity.sourceUrls ?? []));
    expect(sourceUrls.size).toBe(23);
  });

  it("keeps the 18 reviewed coordinate records and emits 22 mappable features", () => {
    expect(verifiedCoordinateExport.records).toHaveLength(18);
    expect(verifiedCoordinateExport.assigned).toBe(18);
    expect(verifiedCoordinateExport.records.every((record) => Array.isArray(record.coordinate))).toBe(
      true,
    );
    expect(toTourismGeoJson([...tourismPlaces, ...tourismEvents]).features).toHaveLength(22);
  });

  it("keeps every required place and event with the official name", () => {
    const entities = [...tourismPlaces, ...tourismEvents].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    );

    expect(entities).toHaveLength(25);
    expect(entities.map((entity) => entity.name)).toEqual(requiredNames);
    expect(new Set(entities.map((entity) => entity.slug)).size).toBe(25);
  });

  it("publishes the eight required filters in their specified order", () => {
    expect(tourismCategories.map((category) => category.label)).toEqual([
      "Tất cả",
      "Sâm & dược liệu",
      "Văn hóa",
      "Cộng đồng",
      "Thiên nhiên",
      "Chợ & đặc sản",
      "Dịch vụ công",
      "Lân cận",
    ]);
  });

  it("filters nearby entities by scope without mutating the source list", () => {
    const entities = [...tourismPlaces, ...tourismEvents];
    const nearby = filterTourismEntities(entities, "nearby");

    expect(nearby.map((entity) => entity.name)).toEqual([
      "Điểm du lịch cộng đồng Tăk Pổ",
      "Trung tâm tổ chức sự kiện Sâm Ngọc Linh",
      "Thác 5 Tầng",
      "Suối nước nóng Tắc Tố",
      "Ruộng bậc thang Long Túc",
      "Làng văn hóa Tăk Chươm",
      "Rừng quế cổ thụ Trà My",
      "Phiên chợ Sâm Ngọc Linh",
    ]);
    expect(entities).toHaveLength(25);
  });
});

describe("tourism map helpers", () => {
  it("combines search, scope, and grouped category filters without accents", () => {
    const entities = [...tourismPlaces, ...tourismEvents];

    expect(
      filterTourismExplorerEntities(entities, {
        query: "van hoa",
        scope: "inside_tra_linh",
        category: "culture_community",
      }).map((entity) => entity.name),
    ).toEqual(["Không gian văn hóa Kon Pin – Đền thờ Thần Sâm"]);

    expect(
      filterTourismExplorerEntities(entities, {
        query: "thac",
        scope: "nearby",
        category: "nature",
      }).map((entity) => entity.name),
    ).toEqual(["Thác 5 Tầng"]);
  });

  it("keeps every category available when only the scope changes", () => {
    const entities = [...tourismPlaces, ...tourismEvents];
    const nearby = filterTourismExplorerEntities(entities, {
      query: "",
      scope: "nearby",
      category: "all",
    });

    expect(nearby).not.toHaveLength(0);
    expect(nearby.every((entity) => entity.scope === "nearby")).toBe(true);
  });

  it("returns only published entities in display order", () => {
    const unpublished = { ...tourismPlaces[0], published: false, sortOrder: 99 };
    const published = { ...tourismPlaces[1], sortOrder: 1 };

    expect(getAllTourismEntities([unpublished, published], [])).toEqual([published]);
  });

  it("supports all and category filters", () => {
    const entities = [...tourismPlaces, ...tourismEvents];

    expect(filterTourismEntities(entities, "all")).toEqual(entities);
    expect(
      filterTourismEntities(entities, "ginseng").every(
        (entity) => entity.category === "ginseng" && entity.scope === "inside_tra_linh",
      ),
    ).toBe(true);
  });

  it("keeps the initial viewport inside Tra Linh until nearby is selected", () => {
    const entities = [...tourismPlaces, ...tourismEvents];

    expect(
      getTourismViewportEntities(entities, "all").every(
        (entity) => entity.scope === "inside_tra_linh",
      ),
    ).toBe(true);
    expect(
      getTourismViewportEntities(entities, "nearby").every(
        (entity) => entity.scope === "nearby",
      ),
    ).toBe(true);
    expect(
      getTourismViewportEntities(entities, "nature").every(
        (entity) => entity.scope === "inside_tra_linh" && entity.category === "nature",
      ),
    ).toBe(true);
  });

  it("removes untrusted press images while retaining local tourism media", () => {
    const sanitized = sanitizeTourismPlaceMedia({
      ...tourismPlaces[0],
      coverImage: "https://example.com/broken.jpg",
      gallery: [
        "/images/tourism-map/tak-ngo-ginseng-cover.webp",
        "https://example.com/broken-gallery.jpg",
      ],
      imageStatus: "ready",
    });

    expect(sanitized.coverImage).toBeNull();
    expect(sanitized.gallery).toEqual([
      "/images/tourism-map/tak-ngo-ginseng-cover.webp",
    ]);
    expect(sanitized.imageStatus).toBe("ready");
  });

  it("excludes missing coordinates and emits longitude before latitude", () => {
    const sample: TourismPlace[] = [
      {
        ...tourismPlaces[0],
        latitude: null,
        longitude: null,
        coordinateStatus: "missing",
      },
      {
        ...tourismPlaces[1],
        id: "verified-location",
        slug: "verified-location",
        latitude: 15.123,
        longitude: 108.456,
        coordinateStatus: "verified",
      },
    ];

    const geoJson = toTourismGeoJson(sample);

    expect(geoJson.features).toHaveLength(1);
    expect(geoJson.features[0].id).toBe("verified-location");
    expect(geoJson.features[0].geometry.coordinates).toEqual([108.456, 15.123]);
  });

  it("builds a safe Google Maps driving directions URL", () => {
    const url = new URL(buildGoogleMapsDirectionsUrl("15.123,108.456"));

    expect(url.origin + url.pathname).toBe("https://www.google.com/maps/dir/");
    expect(url.searchParams.get("api")).toBe("1");
    expect(url.searchParams.get("destination")).toBe("15.123,108.456");
    expect(url.searchParams.get("travelmode")).toBe("driving");
    expect(url.searchParams.get("dir_action")).toBe("navigate");
    expect(url.searchParams.has("origin")).toBe(false);
  });

  it("prioritizes verified coordinates for a place destination", () => {
    const place: TourismPlace = {
      ...tourismPlaces[1],
      latitude: 15.123,
      longitude: 108.456,
      coordinateStatus: "verified",
    };

    const url = new URL(getPlaceDirectionsUrl(place)!);

    expect(url.searchParams.get("destination")).toBe("15.123,108.456");
    expect(url.searchParams.has("origin")).toBe(false);
    expect(hasVerifiedCoordinates(place)).toBe(true);
  });

  it("rejects invalid or unverified coordinates for precise directions", () => {
    expect(
      hasVerifiedCoordinates({
        ...tourismPlaces[1],
        latitude: Number.NaN,
        longitude: 108.456,
        coordinateStatus: "verified",
      }),
    ).toBe(false);
    expect(
      hasVerifiedCoordinates({
        ...tourismPlaces[1],
        latitude: 15.123,
        longitude: 108.456,
        coordinateStatus: "approximate",
      }),
    ).toBe(false);
  });

  it("falls back to the official place name and current address", () => {
    const place: TourismPlace = {
      ...tourismPlaces[1],
      latitude: null,
      longitude: null,
      coordinateStatus: "missing",
    };
    const url = new URL(getPlaceDirectionsUrl(place)!);

    expect(url.searchParams.get("destination")).toBe(
      `${place.name}, ${place.currentAddress}`,
    );
    expect(url.searchParams.get("dir_action")).toBe("navigate");
    expect(url.searchParams.has("origin")).toBe(false);
  });

  it("does not create a directions link without a usable destination", () => {
    const place: TourismPlace = {
      ...tourismPlaces[1],
      latitude: null,
      longitude: null,
      coordinateStatus: "missing",
      name: " ",
      currentAddress: " ",
    };

    expect(getPlaceDirectionsUrl(place)).toBeNull();
  });
});
