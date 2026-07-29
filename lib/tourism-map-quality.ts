import type { TourismPlace } from "@/data/tourism-map/types";

export type TourismDataQualitySeverity = "error" | "warning" | "info";

export type TourismDataQualityIssueCode =
  | "duplicate_id"
  | "duplicate_slug"
  | "duplicate_name"
  | "declared_duplicate_name"
  | "shared_address"
  | "nearby_coordinates"
  | "declared_shared_location"
  | "invalid_coordinates"
  | "missing_coordinates"
  | "area_has_center_pin"
  | "missing_media"
  | "missing_source"
  | "not_recently_reviewed";

export interface TourismDataQualityIssue {
  code: TourismDataQualityIssueCode;
  severity: TourismDataQualitySeverity;
  entityIds: string[];
  message: string;
  distanceMeters?: number;
}

export interface TourismDataQualityReport {
  entities: TourismPlace[];
  issues: TourismDataQualityIssue[];
}

export interface TourismDataQualitySummary {
  total: number;
  coordinates: Record<TourismPlace["coordinateStatus"], number>;
  media: Record<TourismPlace["imageStatus"], number>;
  sources: { withSources: number; missing: number };
  verification: Record<TourismPlace["verificationStatus"], number>;
  issues: Record<TourismDataQualitySeverity, number>;
}

export function normalizeTourismIdentity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLocaleLowerCase("vi")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function haversineDistanceMeters(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const firstLatitude = toRadians(latitudeA);
  const secondLatitude = toRadians(latitudeB);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function hasFiniteCoordinates(
  entity: TourismPlace,
): entity is TourismPlace & { latitude: number; longitude: number } {
  return (
    typeof entity.latitude === "number" &&
    Number.isFinite(entity.latitude) &&
    typeof entity.longitude === "number" &&
    Number.isFinite(entity.longitude)
  );
}

function coordinatesAreValid(
  entity: TourismPlace,
): entity is TourismPlace & { latitude: number; longitude: number } {
  return (
    hasFiniteCoordinates(entity) &&
    entity.latitude >= -90 &&
    entity.latitude <= 90 &&
    entity.longitude >= -180 &&
    entity.longitude <= 180
  );
}

export function areTourismEntitiesRelated(
  first: TourismPlace,
  second: TourismPlace,
): boolean {
  if (
    first.physicalPlaceId &&
    second.physicalPlaceId &&
    first.physicalPlaceId === second.physicalPlaceId
  ) {
    return true;
  }

  return (
    first.parentPlaceId === second.id ||
    second.parentPlaceId === first.id ||
    first.relatedPlaceSlug === second.slug ||
    second.relatedPlaceSlug === first.slug
  );
}

function addUniqueFieldIssues(
  entities: TourismPlace[],
  field: "id" | "slug",
  issues: TourismDataQualityIssue[],
): void {
  const seen = new Map<string, string>();

  for (const entity of entities) {
    const value = entity[field];
    const previousId = seen.get(value);
    if (previousId) {
      issues.push({
        code: field === "id" ? "duplicate_id" : "duplicate_slug",
        severity: "error",
        entityIds: [previousId, entity.id],
        message: `${field} “${value}” đang được dùng bởi nhiều bản ghi.`,
      });
    } else {
      seen.set(value, entity.id);
    }
  }
}

function auditSingleEntity(entity: TourismPlace, issues: TourismDataQualityIssue[]): void {
  const hasLatitude = typeof entity.latitude === "number" && Number.isFinite(entity.latitude);
  const hasLongitude = typeof entity.longitude === "number" && Number.isFinite(entity.longitude);

  if (hasLatitude !== hasLongitude || (hasLatitude && !coordinatesAreValid(entity))) {
    issues.push({
      code: "invalid_coordinates",
      severity: "error",
      entityIds: [entity.id],
      message: "Cặp tọa độ thiếu một thành phần hoặc nằm ngoài phạm vi hợp lệ.",
    });
  } else if (entity.geometryType === "point" && !hasFiniteCoordinates(entity)) {
    issues.push({
      code: "missing_coordinates",
      severity: "warning",
      entityIds: [entity.id],
      message: "Địa điểm dạng điểm chưa có tọa độ để đặt ghim.",
    });
  } else if (entity.geometryType !== "point" && hasFiniteCoordinates(entity)) {
    issues.push({
      code: "area_has_center_pin",
      severity: "warning",
      entityIds: [entity.id],
      message: "Vùng hoặc tuyến đang có tọa độ điểm; cần dữ liệu hình học thay vì ghim trung tâm giả.",
    });
  }

  if (entity.imageStatus !== "ready") {
    issues.push({
      code: "missing_media",
      severity: "warning",
      entityIds: [entity.id],
      message: "Chưa có ảnh nội bộ sẵn sàng để công khai.",
    });
  }

  if (!entity.sourceUrls?.length) {
    issues.push({
      code: "missing_source",
      severity: "warning",
      entityIds: [entity.id],
      message: "Bản ghi chưa có nguồn công khai để AI đối chiếu.",
    });
  }

  if (!entity.lastReviewedAt) {
    issues.push({
      code: "not_recently_reviewed",
      severity: "info",
      entityIds: [entity.id],
      message: "Bản ghi chưa có ngày rà soát dữ liệu gần nhất.",
    });
  }
}

function auditEntityPair(
  first: TourismPlace,
  second: TourismPlace,
  issues: TourismDataQualityIssue[],
  nearbyThresholdMeters: number,
): void {
  const related = areTourismEntitiesRelated(first, second);
  const entityIds = [first.id, second.id];
  const sameName =
    normalizeTourismIdentity(first.name) === normalizeTourismIdentity(second.name);

  if (sameName) {
    issues.push({
      code: related ? "declared_duplicate_name" : "duplicate_name",
      severity: related ? "info" : "error",
      entityIds,
      message: related
        ? "Hai bản ghi cùng tên đã khai báo quan hệ địa điểm/sự kiện."
        : "Hai bản ghi có cùng tên chuẩn hóa nhưng chưa khai báo quan hệ.",
    });
  }

  const firstAddress = normalizeTourismIdentity(first.currentAddress);
  const secondAddress = normalizeTourismIdentity(second.currentAddress);
  if (!related && firstAddress && firstAddress === secondAddress) {
    issues.push({
      code: "shared_address",
      severity: "warning",
      entityIds,
      message: "Hai bản ghi dùng cùng địa chỉ nhưng chưa khai báo quan hệ.",
    });
  }

  if (coordinatesAreValid(first) && coordinatesAreValid(second)) {
    const distanceMeters = haversineDistanceMeters(
      first.latitude,
      first.longitude,
      second.latitude,
      second.longitude,
    );
    if (distanceMeters <= nearbyThresholdMeters) {
      issues.push({
        code: related ? "declared_shared_location" : "nearby_coordinates",
        severity: related ? "info" : "warning",
        entityIds,
        distanceMeters: Math.round(distanceMeters * 10) / 10,
        message: related
          ? "Hai bản ghi dùng chung vị trí và đã khai báo quan hệ."
          : `Hai bản ghi cách nhau không quá ${nearbyThresholdMeters} m; cần kiểm tra khả năng trùng địa điểm.`,
      });
    }
  }
}

export function auditTourismEntities(
  entities: TourismPlace[],
  options: { nearbyThresholdMeters?: number } = {},
): TourismDataQualityReport {
  const issues: TourismDataQualityIssue[] = [];
  const nearbyThresholdMeters = options.nearbyThresholdMeters ?? 25;

  addUniqueFieldIssues(entities, "id", issues);
  addUniqueFieldIssues(entities, "slug", issues);

  for (const entity of entities) auditSingleEntity(entity, issues);
  for (let firstIndex = 0; firstIndex < entities.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < entities.length; secondIndex += 1) {
      auditEntityPair(
        entities[firstIndex],
        entities[secondIndex],
        issues,
        nearbyThresholdMeters,
      );
    }
  }

  return { entities, issues };
}

export function summarizeTourismDataQuality(
  report: TourismDataQualityReport,
): TourismDataQualitySummary {
  const summary: TourismDataQualitySummary = {
    total: report.entities.length,
    coordinates: { verified: 0, approximate: 0, missing: 0, conflicting: 0 },
    media: { ready: 0, missing: 0, permission_required: 0 },
    sources: { withSources: 0, missing: 0 },
    verification: { verified: 0, needs_review: 0, unverified: 0 },
    issues: { error: 0, warning: 0, info: 0 },
  };

  for (const entity of report.entities) {
    summary.coordinates[entity.coordinateStatus] += 1;
    summary.media[entity.imageStatus] += 1;
    summary.verification[entity.verificationStatus] += 1;
    summary.sources[entity.sourceUrls?.length ? "withSources" : "missing"] += 1;
  }
  for (const issue of report.issues) summary.issues[issue.severity] += 1;

  return summary;
}

export function formatTourismDataQualityReport(report: TourismDataQualityReport): string {
  const summary = summarizeTourismDataQuality(report);
  const lines = [
    "Tourism map data quality",
    `Entities: ${summary.total}`,
    `Issues: ${summary.issues.error} error, ${summary.issues.warning} warning, ${summary.issues.info} info`,
    `Coordinates: ${summary.coordinates.verified} verified, ${summary.coordinates.approximate} approximate, ${summary.coordinates.missing} missing, ${summary.coordinates.conflicting} conflicting`,
    `Media: ${summary.media.ready} ready, ${summary.media.missing} missing, ${summary.media.permission_required} permission required`,
    `Sources: ${summary.sources.withSources} with sources, ${summary.sources.missing} missing`,
  ];

  for (const issue of report.issues) {
    const distance =
      typeof issue.distanceMeters === "number" ? ` (${issue.distanceMeters} m)` : "";
    lines.push(
      `[${issue.severity.toUpperCase()}] ${issue.code}: ${issue.entityIds.join(", ")} — ${issue.message}${distance}`,
    );
  }

  return lines.join("\n");
}
