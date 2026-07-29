import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TourismMapLegend } from "@/components/tourism-map/TourismMapLegend";

describe("desktop tourism map legend", () => {
  it("can be closed with an explicit close button after it is opened", () => {
    render(<TourismMapLegend open={false} onOpenChange={vi.fn()} />);

    fireEvent.click(
      screen.getByRole("button", { name: "Mở chú giải bản đồ trên máy tính" }),
    );

    const dialog = screen.getByRole("dialog", {
      name: "Chú giải bản đồ trên máy tính",
    });
    const heading = screen.getByRole("heading", { name: "Chú giải bản đồ" });
    const closeButton = screen.getByRole("button", {
      name: "Đóng chú giải bản đồ trên máy tính",
    });
    expect(dialog).toContainElement(heading);
    expect(heading.parentElement).toContainElement(closeButton);

    fireEvent.click(closeButton);

    expect(dialog).not.toBeInTheDocument();
  });
});
