import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TourismFilterBar } from "@/components/tourism-map/TourismFilterBar";
import { TourismCategoryArtwork } from "@/components/tourism-map/TourismCategoryArtwork";
import { TourismMapErrorFallback } from "@/components/tourism-map/TourismMapErrorFallback";
import { TourismMapFullscreen } from "@/components/tourism-map/TourismMapFullscreen";
import { TourismMapLegend } from "@/components/tourism-map/TourismMapLegend";
import { TourismMapPointMarker } from "@/components/tourism-map/TourismMapPointMarker";
import { TourismMobileSheet } from "@/components/tourism-map/TourismMobileSheet";
import { TourismPlaceList } from "@/components/tourism-map/TourismPlaceList";
import { TourismPlaceCard } from "@/components/tourism-map/TourismPlaceCard";
import { TourismPlacePopup } from "@/components/tourism-map/TourismPlacePopup";
import {
  tourismCategories,
  tourismExplorerCategories,
} from "@/data/tourism-map/categories";
import { tourismPlaces } from "@/data/tourism-map/places";

describe("tourism map interface", () => {
  it("keeps the mobile map clear until a place is selected", () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <TourismMobileSheet
        place={null}
        places={tourismPlaces.slice(0, 3)}
        onClose={onClose}
      />,
    );

    expect(screen.queryByTestId("tourism-mobile-sheet")).not.toBeInTheDocument();

    rerender(
      <TourismMobileSheet
        place={tourismPlaces[1]}
        places={tourismPlaces.slice(0, 3)}
        onClose={onClose}
      />,
    );

    expect(screen.getByText("2 / 3 địa điểm")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Địa điểm trước" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Địa điểm tiếp theo" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Đóng thông tin địa điểm" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("opens the compact legend with accessible controlled state", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <TourismMapLegend open={false} onOpenChange={onOpenChange} />,
    );

    const trigger = screen.getByRole("button", { name: "Mở chú giải bản đồ" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    rerender(<TourismMapLegend open onOpenChange={onOpenChange} />);

    expect(screen.getByRole("dialog", { name: "Chú giải bản đồ" })).toBeVisible();
    expect(screen.queryByText("Lân cận")).not.toBeInTheDocument();
    expect(screen.getAllByText("Văn hóa").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cơ sở lưu trú").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Đóng chú giải bản đồ" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles fullscreen with matching icon and accessible label", async () => {
    const target = document.createElement("div");
    const targetRef = { current: target };
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(target, "requestFullscreen", { value: requestFullscreen });
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(document, "exitFullscreen", {
      configurable: true,
      value: exitFullscreen,
    });

    render(<TourismMapFullscreen targetRef={targetRef} />);
    fireEvent.click(screen.getByRole("button", { name: "Mở bản đồ toàn màn hình" }));
    expect(requestFullscreen).toHaveBeenCalledOnce();

    Object.defineProperty(document, "fullscreenElement", {
      configurable: true,
      value: target,
    });
    fireEvent(document, new Event("fullscreenchange"));
    fireEvent.click(screen.getByRole("button", { name: "Thoát toàn màn hình" }));
    expect(exitFullscreen).toHaveBeenCalledOnce();
  });

  it("lets wheel input stay inside the desktop place list", () => {
    render(
      <TourismPlaceList
        places={tourismPlaces.slice(0, 3)}
        activeSlug={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("list")).toHaveAttribute("data-lenis-prevent-wheel");
  });

  it.each([
    ["ginseng", "lucide-leaf"],
    ["culture", "lucide-landmark"],
    ["community", "lucide-house"],
    ["nature", "lucide-mountain"],
    ["shopping", "lucide-shopping-basket"],
    ["administrative", "lucide-building-2"],
  ] as const)("uses the %s category icon in a non-interactive marker visual", (category, iconClass) => {
    const place = { ...tourismPlaces[0], category };

    render(
      <TourismMapPointMarker place={place} active={false} />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const marker = screen.getByTestId(`tourism-map-marker-${place.slug}`);
    expect(marker).toHaveAttribute("data-category", category);
    expect(marker.querySelector(`svg.${iconClass}`)).toBeInTheDocument();
  });

  it("highlights the selected marker with the warm gold accent", () => {
    render(
      <TourismMapPointMarker
        place={tourismPlaces[0]}
        active
      />,
    );

    expect(screen.getByTestId("tourism-map-marker-visual")).toHaveStyle({
      backgroundColor: "#D5A84E",
    });
  });

  it("exposes the active filter and reports filter changes", () => {
    const onChange = vi.fn();
    render(
      <TourismFilterBar
        categories={tourismCategories}
        activeFilter="all"
        onChange={onChange}
      />,
    );

    expect(screen.getByRole("button", { name: "Tất cả" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Thiên nhiên" }));
    expect(onChange).toHaveBeenCalledWith("nature");
  });

  it("exposes search, scope, and grouped discovery categories", () => {
    const onCategoryChange = vi.fn();
    const onQueryChange = vi.fn();
    const onScopeChange = vi.fn();

    render(
      <TourismFilterBar
        categories={tourismExplorerCategories}
        activeCategory="all"
        activeScope="inside_tra_linh"
        query=""
        onCategoryChange={onCategoryChange}
        onQueryChange={onQueryChange}
        onScopeChange={onScopeChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Tìm địa điểm" }), {
      target: { value: "thác" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Lân cận" }));
    fireEvent.click(screen.getByRole("button", { name: "Văn hóa & cơ sở lưu trú" }));

    expect(onQueryChange).toHaveBeenCalledWith("thác");
    expect(onScopeChange).toHaveBeenCalledWith("nearby");
    expect(onCategoryChange).toHaveBeenCalledWith("culture_community");
  });

  it("keeps missing-coordinate places readable and disables unconfirmed directions", () => {
    const place = {
      ...tourismPlaces[1],
      latitude: null,
      longitude: null,
      coordinateStatus: "missing" as const,
      googleMapsUrl: null,
    };
    const onSelect = vi.fn();
    render(
      <TourismPlaceCard
        place={place}
        active={false}
        onSelect={onSelect}
      />,
    );

    expect(screen.getByTestId("tourism-place-card")).toHaveTextContent(
      "Trạm Dược liệu Trà Linh",
    );
    expect(
      screen.getByText("Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps"),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: /chỉ đường/i })).toBeDisabled();
    expect(screen.getByRole("link", { name: /xem chi tiết/i })).toHaveAttribute(
      "href",
      "/dia-diem/tram-duoc-lieu-tra-linh",
    );
    fireEvent.click(screen.getByRole("button", { name: /chọn trạm dược liệu/i }));
    expect(onSelect).toHaveBeenCalledWith(place);
  });

  it("uses a confirmed Google Maps listing without a reference warning", () => {
    const googleMapsUrl = "https://maps.app.goo.gl/example-listing";
    render(
      <TourismPlaceCard
        place={{
          ...tourismPlaces[1],
          latitude: 15.123,
          longitude: 108.456,
          coordinateStatus: "verified",
          googleMapsUrl,
        }}
        active
        onSelect={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /chỉ đường/i })).toHaveAttribute(
      "href",
      googleMapsUrl,
    );
  });

  it("uses destination imagery in cards and popups with a local fallback", () => {
    const place = {
      ...tourismPlaces[0],
      coverImage: "/images/tourism-map/tak-ngo-ginseng-cover.webp",
    };

    const { rerender } = render(
      <TourismPlaceCard place={place} active={false} onSelect={vi.fn()} />,
    );
    expect(screen.getByRole("img", { name: place.imageAlt })).toHaveAttribute(
      "src",
      expect.stringContaining("tak-ngo-ginseng-cover.webp"),
    );

    rerender(<TourismPlacePopup place={place} />);
    expect(screen.getByRole("img", { name: place.imageAlt })).toHaveAttribute(
      "src",
      expect.stringContaining("tak-ngo-ginseng-cover.webp"),
    );
    expect(screen.getByRole("link", { name: "Xem chi tiết" })).toHaveAttribute(
      "href",
      `/dia-diem/${place.slug}`,
    );
  });

  it("replaces contextual covers with category artwork across map surfaces", () => {
    const place = tourismPlaces[1];
    const { rerender } = render(
      <TourismPlaceCard place={place} active={false} onSelect={vi.fn()} />,
    );

    expect(screen.queryByRole("img", { name: place.imageAlt })).not.toBeInTheDocument();
    expect(screen.getByTestId("tourism-category-artwork")).toHaveAttribute(
      "data-category",
      place.category,
    );

    rerender(<TourismPlacePopup place={place} />);
    expect(screen.queryByRole("img", { name: place.imageAlt })).not.toBeInTheDocument();
    expect(screen.getByTestId("tourism-category-artwork")).toBeVisible();

    rerender(
      <TourismMobileSheet place={place} places={[place]} onClose={vi.fn()} />,
    );
    expect(screen.queryByRole("img", { name: place.imageAlt })).not.toBeInTheDocument();
    expect(screen.getByTestId("tourism-category-artwork")).toBeVisible();
  });

  it.each([
    ["ginseng", "lucide-leaf", null],
    ["nature", "lucide-mountain", "lucide-waves-horizontal"],
    ["culture", "lucide-landmark", "lucide-drum"],
    ["community", "lucide-house", "lucide-bed-double"],
    ["shopping", "lucide-shopping-basket", null],
    ["administrative", "lucide-building-2", null],
  ] as const)(
    "uses the requested %s artwork symbols",
    (category, primaryIcon, secondaryIcon) => {
      const place = { ...tourismPlaces[1], category };
      render(<TourismCategoryArtwork place={place} />);

      const artwork = screen.getByTestId("tourism-category-artwork");
      expect(artwork.querySelector(`svg.${primaryIcon}`)).toBeInTheDocument();
      if (secondaryIcon) {
        expect(artwork.querySelector(`svg.${secondaryIcon}`)).toBeInTheDocument();
      }
    },
  );

  it("keeps documentary covers as real destination imagery", () => {
    const place = tourismPlaces[0];

    render(<TourismPlaceCard place={place} active={false} onSelect={vi.fn()} />);

    expect(screen.getByRole("img", { name: place.imageAlt })).toBeVisible();
    expect(screen.queryByTestId("tourism-category-artwork")).not.toBeInTheDocument();
  });

  it("disables directions whenever an exact Google Maps listing is absent", () => {
    render(
      <TourismPlaceCard
        place={{
          ...tourismPlaces[1],
          latitude: null,
          longitude: null,
          coordinateStatus: "missing",
          googleMapsUrl: null,
        }}
        active={false}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /chỉ đường/i })).toBeDisabled();
  });

  it("uses the same disabled directions behavior in the map popup", () => {
    render(
      <TourismPlacePopup
        place={{
          ...tourismPlaces[1],
          latitude: null,
          longitude: null,
          coordinateStatus: "missing",
          googleMapsUrl: null,
        }}
      />,
    );

    expect(
      screen.getByText("Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps"),
    ).toBeVisible();
    expect(screen.queryByRole("link", { name: /chỉ đường/i })).not.toBeInTheDocument();
  });

  it("hides the popup warning for verified coordinates", () => {
    render(
      <TourismPlacePopup
        place={{
          ...tourismPlaces[1],
          latitude: 15.123,
          longitude: 108.456,
          coordinateStatus: "verified",
        }}
      />,
    );

    expect(
      screen.queryByText("Vị trí tham khảo — vui lòng kiểm tra điểm đến trên Google Maps"),
    ).not.toBeInTheDocument();
  });

  it("shows a useful fallback instead of an empty map", () => {
    render(<TourismMapErrorFallback />);

    expect(screen.getByText("Không thể tải bản đồ tương tác.")).toBeVisible();
    expect(
      screen.getByText(
        "Bạn vẫn có thể xem danh sách địa điểm và mở thông tin chi tiết.",
      ),
    ).toBeVisible();
  });
});
