import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/Footer";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";

describe("public shell", () => {
  it("uses real informational links without a dead newsletter CTA", () => {
    render(<Footer />);

    expect(screen.queryByText(/sắp mở/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /đăng ký/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /quyền riêng tư/i })).toHaveAttribute(
      "href",
      "/chinh-sach-quyen-rieng",
    );
    expect(screen.getByText(/trang giới thiệu độc lập/i)).toBeVisible();
  });

  it("offers mobile directions and contact without inventing phone or Zalo", () => {
    render(<MobileStickyCta />);

    expect(screen.getByRole("link", { name: /chỉ đường/i })).toHaveAttribute(
      "href",
      expect.stringContaining("google.com/maps"),
    );
    expect(screen.getByRole("link", { name: /liên hệ/i })).toHaveAttribute(
      "href",
      "/#lien-he",
    );
    expect(screen.queryByRole("link", { name: /zalo/i })).not.toBeInTheDocument();
  });
});
