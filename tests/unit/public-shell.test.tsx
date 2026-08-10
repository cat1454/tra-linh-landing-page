import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/Footer";
import { MobileStickyCta } from "@/components/layout/MobileStickyCta";
import { FACEBOOK_PAGE_URL } from "@/lib/site-links";

describe("public shell", () => {
  it("uses real informational links without a dead newsletter CTA", () => {
    render(<Footer />);

    expect(screen.queryByText(/sắp mở/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /đăng ký/i })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /quyền riêng tư/i })).toHaveAttribute(
      "href",
      "/chinh-sach-quyen-rieng",
    );
    expect(screen.getAllByText(/Ủy ban nhân dân xã Trà Linh/i)).not.toHaveLength(0);
    expect(screen.getByText("Liên hệ", { selector: "p" })).toBeVisible();
    expect(screen.queryByText(/Đầu mối liên hệ/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Ông Nguyễn Hữu Quang/i)).toBeVisible();
    expect(screen.getByRole("link", { name: "037.667.1456" })).toHaveAttribute(
      "href",
      "tel:0376671456",
    );
    expect(
      screen.getByRole("link", { name: "tralinh.namtramy@danang.gov.vn" }),
    ).toHaveAttribute("href", "mailto:tralinh.namtramy@danang.gov.vn");
    expect(
      screen.getByRole("link", { name: "quangnh3@danang.gov.vn" }),
    ).toHaveAttribute("href", "mailto:quangnh3@danang.gov.vn");
    expect(screen.getByTestId("footer-project-credit")).toHaveTextContent(
      "Công trình Chuyển đổi số du lịch do Trường Đại học Bách khoa - Đại học Đà Nẵng hỗ trợ triển khai trong Chiến dịch Mùa hè Xanh 2026",
    );
    expect(screen.getByTestId("footer-project-credit").querySelectorAll("span"))
      .toHaveLength(0);
    expect(
      screen.queryByText(/Thông tin hành trình cần được xác nhận/i),
    ).not.toBeInTheDocument();
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

  it("links the footer to the configured Facebook fanpage", () => {
    render(<Footer facebookUrl={FACEBOOK_PAGE_URL} />);

    expect(screen.getByRole("contentinfo")).toHaveAttribute("id", "lien-he");
    expect(
      screen.getByRole("heading", { name: /Liên hệ & hỗ trợ chuyến đi/i }),
    ).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Nhắn Fanpage Xứ sở Sâm Ngọc Linh/i }),
    ).toHaveAttribute("href", FACEBOOK_PAGE_URL);
    expect(screen.getByText(/Phản hồi trong giờ hành chính/i)).toBeVisible();
  });

  it("links the destination index to the working tourism map route", () => {
    render(<Footer />);

    expect(screen.getByRole("link", { name: "Địa điểm & bản đồ" })).toHaveAttribute(
      "href",
      "/ban-do-du-lich",
    );
    expect(document.querySelector('a[href="/dia-diem"]')).not.toBeInTheDocument();
  });

  it("uses the editable address and privacy link in the public footer", () => {
    render(
      <Footer
        legalAddress="Xã Trà Linh, thành phố Đà Nẵng"
        privacyUrl="/quyen-rieng"
      />,
    );

    expect(
      screen.getAllByText(/Xã Trà Linh, thành phố Đà Nẵng/),
    ).not.toHaveLength(0);
    expect(screen.getByRole("link", { name: /quyền riêng tư/i })).toHaveAttribute(
      "href",
      "/quyen-rieng",
    );
  });
});
