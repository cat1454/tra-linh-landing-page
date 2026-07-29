import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TourismMediaAttribution } from "@/components/tourism-map/TourismMediaAttribution";
import { tourismPlaces } from "@/data/tourism-map/places";

describe("TourismMediaAttribution", () => {
  it("labels contextual media without presenting it as the exact place", () => {
    const place = tourismPlaces.find(({ slug }) => slug === "lang-ty-phu")!;

    render(<TourismMediaAttribution place={place} />);

    expect(screen.getByText(/Ảnh minh họa theo bối cảnh Trà Linh/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Cổng thông tin du lịch Trà Linh/i })).toHaveAttribute(
      "href",
      expect.stringMatching(/^https?:\/\//),
    );
  });

  it("shows a compact source label for documentary media", () => {
    const place = tourismPlaces.find(({ slug }) => slug === "thac-noong-lau")!;

    render(<TourismMediaAttribution place={place} />);

    expect(screen.getByText(/Nguồn ảnh:/i)).toBeInTheDocument();
    expect(screen.queryByText(/Ảnh minh họa/i)).not.toBeInTheDocument();
  });
});
