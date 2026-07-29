import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TourismPlaceIntakeForm } from "@/components/tourism-map/TourismPlaceIntakeForm";
import { tourismPlaces } from "@/data/tourism-map/places";
import {
  TOURISM_INTAKE_STORAGE_KEY,
  buildTourismIntakeExport,
  createTourismIntakeDraft,
} from "@/lib/tourism-map-intake";

describe("tourism place intake form", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows the required fields and starts from the reviewed place data", () => {
    render(<TourismPlaceIntakeForm entities={tourismPlaces.slice(0, 2)} />);

    expect(screen.getByRole("heading", { name: "Thông tin cần nhập" })).toBeVisible();
    expect(screen.getByLabelText("Địa điểm")).toHaveValue(tourismPlaces[0].slug);
    expect(screen.getByLabelText("Địa chỉ hiện tại")).toHaveValue(
      tourismPlaces[0].currentAddress,
    );
    expect(screen.getByLabelText("Vĩ độ (latitude)")).toBeVisible();
    expect(screen.getByLabelText("Kinh độ (longitude)")).toBeVisible();
    expect(screen.getByLabelText("Link Google Maps")).toBeVisible();
    expect(screen.getByLabelText("Thư mục hoặc tên file ảnh")).toBeVisible();
    expect(screen.getByLabelText("Nguồn và quyền sử dụng ảnh")).toBeVisible();
  });

  it("keeps a separate browser draft for each place", () => {
    render(<TourismPlaceIntakeForm entities={tourismPlaces.slice(0, 2)} />);

    fireEvent.change(screen.getByLabelText("Vĩ độ (latitude)"), {
      target: { value: "15.123456" },
    });
    fireEvent.change(screen.getByLabelText("Kinh độ (longitude)"), {
      target: { value: "108.123456" },
    });
    fireEvent.change(screen.getByLabelText("Link Google Maps"), {
      target: { value: "https://maps.google.com/?q=15.123456,108.123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lưu bản nháp" }));

    const saved = JSON.parse(window.localStorage.getItem(TOURISM_INTAKE_STORAGE_KEY) ?? "{}");
    expect(saved[tourismPlaces[0].slug]).toMatchObject({
      latitude: "15.123456",
      longitude: "108.123456",
    });
    expect(screen.getByRole("status")).toHaveTextContent("Đã lưu bản nháp");

    fireEvent.change(screen.getByLabelText("Địa điểm"), {
      target: { value: tourismPlaces[1].slug },
    });
    expect(screen.getByLabelText("Địa chỉ hiện tại")).toHaveValue(
      tourismPlaces[1].currentAddress,
    );
    expect(screen.getByLabelText("Vĩ độ (latitude)")).toHaveValue(
      tourismPlaces[1].latitude,
    );

    fireEvent.change(screen.getByLabelText("Địa điểm"), {
      target: { value: tourismPlaces[0].slug },
    });
    expect(screen.getByLabelText("Vĩ độ (latitude)")).toHaveValue(15.123456);
  });

  it("stores all editorial fields and downloads the complete JSON", () => {
    const createObjectUrl = vi.fn(() => "blob:tourism-intake");
    const revokeObjectUrl = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
    render(<TourismPlaceIntakeForm entities={tourismPlaces.slice(0, 1)} />);

    const values: Record<string, string> = {
      "Địa chỉ hiện tại": "Địa chỉ mới",
      "Địa chỉ cũ": "Địa chỉ cũ",
      "Vĩ độ (latitude)": "15.1",
      "Kinh độ (longitude)": "108.1",
      "Link Google Maps": "https://maps.google.com/?q=15.1,108.1",
      "Mô tả ngắn": "Mô tả đã kiểm tra",
      "Hướng dẫn tiếp cận / lưu ý tham quan": "Liên hệ trước khi đến",
      "Thư mục hoặc tên file ảnh": "D:\\Anh\\anh-01.jpg",
      "Nguồn và quyền sử dụng ảnh": "Ảnh do người dùng sở hữu",
      "URL nguồn thông tin": "https://example.gov.vn/bai-viet",
      "Ghi chú cho tôi": "Ưu tiên ảnh số một",
    };
    for (const [label, value] of Object.entries(values)) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.click(screen.getByLabelText(/Tôi đã kiểm tra đúng vị trí này/));
    fireEvent.click(screen.getByRole("button", { name: "Xuất JSON" }));

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:tourism-intake");
    expect(screen.getByRole("status")).toHaveTextContent("Đã xuất file");
    click.mockRestore();
  });

  it("recovers safely when an old browser draft is invalid", () => {
    window.localStorage.setItem(TOURISM_INTAKE_STORAGE_KEY, "{broken-json");
    render(<TourismPlaceIntakeForm entities={tourismPlaces.slice(0, 1)} />);

    expect(screen.getByRole("status")).toHaveTextContent("Không đọc được bản nháp cũ");
    expect(screen.getByLabelText("Địa chỉ hiện tại")).toHaveValue(
      tourismPlaces[0].currentAddress,
    );
  });
});

describe("tourism intake export", () => {
  it("exports verified coordinates only after explicit confirmation", () => {
    const place = {
      ...tourismPlaces[0],
      latitude: null,
      longitude: null,
      coordinateStatus: "missing" as const,
    };
    const unconfirmed = {
      ...createTourismIntakeDraft(place),
      latitude: "15.123456",
      longitude: "108.123456",
    };
    const confirmed = { ...unconfirmed, coordinateConfirmed: true };

    expect(buildTourismIntakeExport({ [place.slug]: unconfirmed }).records[0]).toMatchObject({
      slug: place.slug,
      latitude: 15.123456,
      longitude: 108.123456,
      coordinateStatus: "pending_review",
    });
    expect(buildTourismIntakeExport({ [place.slug]: confirmed }).records[0]).toMatchObject({
      coordinateStatus: "verified",
    });
  });

  it("keeps blank coordinates null instead of inventing values", () => {
    const place = {
      ...tourismPlaces[1],
      latitude: null,
      longitude: null,
      coordinateStatus: "missing" as const,
    };
    const record = buildTourismIntakeExport({
      [place.slug]: createTourismIntakeDraft(place),
    }).records[0];

    expect(record.latitude).toBeNull();
    expect(record.longitude).toBeNull();
    expect(record.coordinateStatus).toBe("missing");
  });
});
