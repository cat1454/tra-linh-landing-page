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
          contactEmail="phuh15521@gmail.com"
          contactPhone="0334059776"
        />
        <MobileStickyCta contactPhone="0334059776" />
      </>,
    );

    expect(
      screen.getByRole("link", { name: "phuh15521@gmail.com" }),
    ).toHaveAttribute("href", "mailto:phuh15521@gmail.com");
    expect(screen.getAllByRole("link", { name: "0334059776" })[0]).toHaveAttribute(
      "href",
      "tel:0334059776",
    );
    expect(screen.getByRole("link", { name: /gá»i Ä‘iá»‡n/i })).toHaveAttribute(
      "href",
      "tel:0334059776",
    );
  });
});
