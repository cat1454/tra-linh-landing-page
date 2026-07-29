import { describe, expect, it } from "vitest";

import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";
import type { TourismPlace } from "@/data/tourism-map/types";
import { getAllTourismEntities, hasMappableCoordinates } from "@/lib/tourism-map";
import {
  auditTourismEntities,
  formatTourismDataQualityReport,
  haversineDistanceMeters,
  summarizeTourismDataQuality,
} from "@/lib/tourism-map-quality";

function makeEntity(overrides: Partial<TourismPlace>): TourismPlace {
  return {
    ...tourismPlaces[0],
    id: "sample-place",
    slug: "sample-place",
    name: "Điểm mẫu",
    physicalPlaceId: "physical-sample-place",
    parentPlaceId: null,
    entityKind: "place",
    geometryType: "point",
    verificationStatus: "needs_review",
    verifiedAt: null,
    verifiedBy: null,
    lastReviewedAt: null,
    dataSource: "public_sources",
    precisionMeters: null,
    ...overrides,
  };
}

describe("tourism map data quality", () => {
  it("keeps the current dataset free of blocking identity errors", () => {
    const report = auditTourismEntities([...tourismPlaces, ...tourismEvents]);

    expect(report.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(
      report.issues.some(
        (issue) =>
          issue.code === "declared_duplicate_name" &&
          issue.entityIds.includes("place-tra-linh-market") &&
          issue.entityIds.includes("event-tra-linh-market"),
      ),
    ).toBe(true);
  });

  it("reports undeclared normalized duplicate names as blocking errors", () => {
    const first = makeEntity({ id: "first", slug: "first", name: "Thác Kon Pin" });
    const second = makeEntity({
      id: "second",
      slug: "second",
      name: "thac kon pin",
      physicalPlaceId: "physical-second",
    });

    const report = auditTourismEntities([first, second]);

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "duplicate_name",
        severity: "error",
        entityIds: ["first", "second"],
      }),
    );
  });

  it("deduplicates only declared representations of one physical place", () => {
    const venue = makeEntity({ id: "venue", slug: "market", name: "Chợ phiên" });
    const event = makeEntity({
      id: "event",
      slug: "market-event",
      name: "Chợ phiên",
      entityKind: "event",
      entityType: "recurring_event",
      physicalPlaceId: venue.physicalPlaceId,
      parentPlaceId: venue.id,
    });
    const unrelated = makeEntity({
      id: "unrelated",
      slug: "other-market",
      name: "Chợ phiên",
      physicalPlaceId: "physical-other-market",
    });

    expect(getAllTourismEntities([venue, unrelated], [event]).map(({ id }) => id)).toEqual([
      "venue",
      "unrelated",
    ]);
  });

  it("flags unrelated records that share a precise coordinate", () => {
    const first = makeEntity({ id: "first", slug: "first" });
    const second = makeEntity({
      id: "second",
      slug: "second",
      name: "Điểm khác",
      physicalPlaceId: "physical-second",
      latitude: first.latitude,
      longitude: first.longitude,
    });

    const report = auditTourismEntities([first, second]);

    expect(report.issues).toContainEqual(
      expect.objectContaining({
        code: "nearby_coordinates",
        severity: "warning",
        entityIds: ["first", "second"],
      }),
    );
  });

  it("allows an area without a fake center pin but warns for a point without coordinates", () => {
    const area = makeEntity({
      id: "area",
      slug: "area",
      entityKind: "area",
      entityType: "area",
      geometryType: "area",
      latitude: null,
      longitude: null,
      coordinateStatus: "missing",
    });
    const point = makeEntity({
      id: "point",
      slug: "point",
      name: "Điểm chưa có tọa độ",
      physicalPlaceId: "physical-point",
      latitude: null,
      longitude: null,
      coordinateStatus: "missing",
    });

    const report = auditTourismEntities([area, point]);

    expect(hasMappableCoordinates(area)).toBe(false);
    expect(
      report.issues.find(
        (issue) => issue.code === "missing_coordinates" && issue.entityIds.includes("area"),
      ),
    ).toBeUndefined();
    expect(
      report.issues.find(
        (issue) => issue.code === "missing_coordinates" && issue.entityIds.includes("point"),
      ),
    ).toBeDefined();
  });

  it("summarizes coordinates, media, sources, and issue severities", () => {
    const report = auditTourismEntities([...tourismPlaces, ...tourismEvents]);
    const summary = summarizeTourismDataQuality(report);

    expect(summary.total).toBe(32);
    expect(summary.coordinates).toEqual({ verified: 15, approximate: 11, missing: 6, conflicting: 0 });
    expect(summary.media.ready + summary.media.missing + summary.media.permission_required).toBe(32);
    expect(summary.sources.withSources + summary.sources.missing).toBe(32);
    expect(summary.issues.error).toBe(0);
  });

  it("calculates geographic distance in meters", () => {
    expect(haversineDistanceMeters(15, 108, 15, 108)).toBe(0);
    expect(haversineDistanceMeters(15, 108, 15.001, 108)).toBeCloseTo(111.2, 0);
  });

  it("formats a CI-readable report with issue codes and entity ids", () => {
    const report = auditTourismEntities([
      makeEntity({
        id: "missing-source",
        slug: "missing-source",
        sourceUrls: [],
      }),
    ]);

    expect(formatTourismDataQualityReport(report)).toContain(
      "[WARNING] missing_source: missing-source",
    );
  });
});
