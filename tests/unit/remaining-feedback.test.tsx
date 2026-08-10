import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GuideOfflineActions } from "@/components/detail/GuideOfflineActions";
import { HomeBackToTop } from "@/components/home/HomeBackToTop";
import { LocalProduceSection } from "@/components/home/LocalProduceSection";
import { SaveShareActions } from "@/components/ui/SaveShareActions";
import { SavedItemsList } from "@/components/ui/SavedItemsList";
import { TourismVerificationPanel } from "@/components/tourism-map/TourismVerificationPanel";
import { tourismEvents } from "@/data/tourism-map/events";
import { tourismPlaces } from "@/data/tourism-map/places";
import { fallbackContent, fallbackGuides } from "@/lib/content/fallback-content";
import FrequentlyAskedQuestionsPage from "@/app/cau-hoi-thuong-gap/page";
import {
  getAllTourismEntities,
  getTourismPreviewEntities,
} from "@/lib/tourism-map";

describe("remaining 10,000-user feedback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("shows six representative specialties first and reveals the rest on demand", () => {
    render(<LocalProduceSection items={fallbackContent.localSpecialties} />);
    const remaining = fallbackContent.localSpecialties.length - 6;

    expect(screen.getAllByRole("article")).toHaveLength(6);
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(`xem thêm ${remaining} sản vật`, "i") }),
    );
    expect(screen.getAllByRole("article")).toHaveLength(fallbackContent.localSpecialties.length);
    expect(screen.queryByRole("button", { name: /xem thêm .* sản vật/i })).not.toBeInTheDocument();
  });

  it("keeps the homepage map preview bounded and category-diverse", () => {
    const entities = getAllTourismEntities(tourismPlaces, tourismEvents);
    const preview = getTourismPreviewEntities(entities, 6);

    expect(preview).toHaveLength(6);
    expect(preview.every((entity) => entity.scope === "inside_tra_linh")).toBe(true);
    expect(new Set(preview.map((entity) => entity.category)).size).toBeGreaterThanOrEqual(4);
  });

  it("provides custom save wording and a route to review saved items", () => {
    render(
      <SaveShareActions
        item={{ id: "place:test", title: "Địa điểm thử", url: "/dia-diem/test" }}
        saveLabel="Lưu địa điểm"
        savedLabel="Đã lưu địa điểm"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Lưu địa điểm" }));
    expect(screen.getByRole("button", { name: "Đã lưu địa điểm" })).toBeVisible();
    expect(screen.getByRole("link", { name: /xem mục đã lưu/i })).toHaveAttribute(
      "href",
      "/da-luu",
    );
  });

  it("lists locally saved items and lets the user remove them", async () => {
    window.localStorage.setItem(
      "tra-linh:saved-items",
      JSON.stringify([{ id: "guide:test", title: "Cẩm nang thử", url: "/cam-nang/test" }]),
    );
    render(<SavedItemsList />);

    expect(await screen.findByRole("link", { name: "Cẩm nang thử" })).toHaveAttribute(
      "href",
      "/cam-nang/test",
    );
    fireEvent.click(screen.getByRole("button", { name: /xóa cẩm nang thử khỏi mục đã lưu/i }));
    expect(await screen.findByText(/chưa có nội dung nào được lưu/i)).toBeVisible();
  });

  it("lets a guide be printed or saved for offline reference", () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    const guide = fallbackGuides[0];
    render(<GuideOfflineActions guide={guide} />);

    fireEvent.click(screen.getByRole("button", { name: /in hoặc lưu pdf/i }));
    expect(print).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /lưu cẩm nang/i })).toBeVisible();
  });

  it("shows source, review date and verification state without overstating unverified facts", () => {
    const verified = tourismPlaces.find((place) => place.verificationStatus === "verified");
    const unverified = tourismPlaces.find((place) => place.verificationStatus !== "verified");
    expect(verified).toBeDefined();
    expect(unverified).toBeDefined();

    const { rerender } = render(<TourismVerificationPanel place={verified!} />);
    expect(screen.getByText("Đã xác minh")).toBeVisible();
    expect(screen.getByRole("link", { name: /nguồn tham khảo 1/i })).toBeVisible();

    rerender(<TourismVerificationPanel place={unverified!} />);
    expect(screen.getByText("Đang xác minh")).toBeVisible();
    expect(screen.getByText(/giờ mở cửa và chi phí.*xác nhận trực tiếp/i)).toBeVisible();
  });

  it("provides a back-to-top action without the removed shortcut bar", () => {
    render(<HomeBackToTop />);
    expect(screen.getByRole("link", { name: /quay lại đầu trang/i })).toHaveAttribute(
      "href",
      "#dau-trang",
    );
  });

  it("explains that ginseng authenticity must be confirmed through official channels", () => {
    render(<FrequentlyAskedQuestionsPage />);
    fireEvent.click(screen.getByText(/làm sao kiểm tra nguồn gốc sâm ngọc linh/i));
    expect(screen.getByText(/website không cấp tem hoặc chứng nhận sản phẩm/i)).toBeVisible();
    expect(screen.getByRole("link", { name: /liên hệ đầu mối địa phương/i })).toBeVisible();
  });
});
