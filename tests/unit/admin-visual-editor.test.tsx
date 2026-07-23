import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AdminVisualEditor } from "@/components/admin/AdminVisualEditor";
import {
  ADMIN_NAV_GROUPS,
  resolveEditorialIntent,
} from "@/lib/cms/admin-preview";

describe("admin visual editor", () => {
  it("uses friendly navigation labels instead of database names", () => {
    const labels = ADMIN_NAV_GROUPS.flatMap((group) =>
      group.items.map((item) => item.label),
    );

    expect(labels).toContain("Các vùng trên trang chủ");
    expect(labels).toContain("Thông tin chung & liên hệ");
    expect(labels).toContain("Kho ảnh & video");
    expect(labels).not.toContain("page_sections");
  });

  it("updates the section preview while a nontechnical editor types", () => {
    render(
      <AdminVisualEditor
        table="page_sections"
        row={{
          id: "section-1",
          section_key: "hero",
          title: "Tiêu đề ban đầu",
          description: "Mô tả ban đầu",
          status: "published",
          display_order: 0,
          is_placeholder: false,
        }}
        mediaOptions={[]}
      >
        <form>
          <label htmlFor="title">Tiêu đề</label>
          <input id="title" name="title" defaultValue="Tiêu đề ban đầu" />
        </form>
      </AdminVisualEditor>,
    );

    expect(screen.getByText("Tiêu đề ban đầu", { selector: "[data-preview-title]" })).toBeVisible();

    fireEvent.input(screen.getByLabelText("Tiêu đề"), {
      target: { value: "Tiêu đề đang sửa" },
    });

    expect(screen.getByText("Tiêu đề đang sửa", { selector: "[data-preview-title]" })).toBeVisible();
    expect(screen.getByText("Thay đổi chưa lưu")).toBeVisible();
  });

  it("resolves the two explicit editorial actions", () => {
    expect(resolveEditorialIntent("save-draft")).toBe("draft");
    expect(resolveEditorialIntent("publish")).toBe("published");
    expect(() => resolveEditorialIntent("anything-else")).toThrow();
  });
});
