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

  it("shows configured public contact channels in the footer and mobile CTA", () => {
    render(
      <>
        <Footer
          contactEmail="admin@example.com"
          contactPhone="0900000000"
        />
        <MobileStickyCta contactPhone="0900000000" />
      </>,
    );

    expect(
      screen.getByRole("link", { name: "admin@example.com" }),
    ).toHaveAttribute("href", "mailto:admin@example.com");
    expect(screen.getAllByRole("link", { name: "0900000000" })[0]).toHaveAttribute(
      "href",
      "tel:0900000000",
    );
    expect(screen.getByRole("link", { name: /gọi điện/i })).toHaveAttribute(
      "href",
      "tel:0900000000",
    );
  });

  it("uses the editable address and privacy link in the public footer", () => {
    render(
      <Footer
        legalAddress="Xã Trà Linh, thành phố Đà Nẵng"
        privacyUrl="/quyen-rieng"
      />,
    );

    expect(screen.getByText(/Xã Trà Linh, thành phố Đà Nẵng/)).toBeVisible();
    expect(screen.getByRole("link", { name: /quyền riêng tư/i })).toHaveAttribute(
      "href",
      "/quyen-rieng",
    );
  });
});
