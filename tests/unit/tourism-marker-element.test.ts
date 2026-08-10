import { describe, expect, it, vi } from "vitest";

import {
  createTourismMarkerElement,
  updateTourismMarkerElement,
} from "@/lib/tourism-marker-element";

describe("tourism marker element", () => {
  it("uses one native button as the only interactive marker element", () => {
    const onSelect = vi.fn();
    const element = createTourismMarkerElement("Thác Năm Tầng", onSelect);

    expect(element.tagName).toBe("BUTTON");
    expect(element).toHaveAttribute("type", "button");
    expect(element).toHaveAttribute("aria-label", "Chọn Thác Năm Tầng trên bản đồ");
    expect(element).toHaveAttribute("aria-pressed", "false");
    element.click();
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("updates selection semantics without replacing the focused marker", () => {
    const element = createTourismMarkerElement("Thác Năm Tầng", vi.fn());
    document.body.append(element);
    element.focus();
    element.setAttribute("role", "img");

    updateTourismMarkerElement(element, true);

    expect(element).toHaveAttribute("role", "button");
    expect(element).toHaveAttribute("aria-pressed", "true");
    expect(element).toHaveFocus();
  });
});
