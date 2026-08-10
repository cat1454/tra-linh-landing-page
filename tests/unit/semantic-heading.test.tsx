import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  SemanticHeadingText,
  splitHeadingIntoPhrases,
} from "@/components/home/SemanticHeadingText";

describe("SemanticHeadingText", () => {
  it("groups the ginseng heading into complete Vietnamese phrases", () => {
    expect(
      splitHeadingIntoPhrases(
        "Nhịp sinh trưởng kiên nhẫn sâu trong rừng thẳm",
      ),
    ).toEqual(["Nhịp sinh trưởng", "kiên nhẫn", "sâu trong rừng thẳm"]);
  });

  it("keeps meaningful place names together", () => {
    expect(
      splitHeadingIntoPhrases("Hành trình trải nghiệm xanh Trà Linh"),
    ).toEqual(["Hành trình trải nghiệm xanh", "Trà Linh"]);
  });

  it("preserves the original accessible heading text", () => {
    const title = "Nhịp sinh trưởng kiên nhẫn sâu trong rừng thẳm";

    render(
      <h2>
        <SemanticHeadingText text={title} />
      </h2>,
    );

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
  });

  it("keeps phrases atomic on larger screens while retaining native mobile wrapping", () => {
    const { container } = render(
      <h2>
        <SemanticHeadingText text="Nhịp sinh trưởng kiên nhẫn sâu trong rừng thẳm" />
      </h2>,
    );

    const phrases = container.querySelectorAll<HTMLElement>(
      "[data-heading-phrase]",
    );

    expect(phrases).toHaveLength(3);
    for (const phrase of phrases) {
      expect(phrase).toHaveClass("max-w-full");
      expect(phrase).toHaveClass("md:inline-block");
      expect(phrase).toHaveClass("md:whitespace-nowrap");
      expect(phrase).toHaveClass("md:[overflow-wrap:normal]");
      expect(phrase).not.toHaveClass("whitespace-nowrap");
    }
  });

  it("formats unfamiliar CMS titles without changing their words", () => {
    const title = "Mùa gió mới gọi bước chân về bản";
    const phrases = splitHeadingIntoPhrases(title);

    expect(phrases.join(" ")).toBe(title);
    expect(phrases.every((phrase) => phrase.split(/\s+/u).length >= 2)).toBe(
      true,
    );
  });

  it("only keeps proper names atomic inside compact card headings", () => {
    const title = "Bản làng Xơ Đăng trong sương";
    const { container } = render(
      <h3>
        <SemanticHeadingText text={title} compact />
      </h3>,
    );

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-heading-phrase]")).toHaveLength(0);
    expect(screen.getByText("Xơ Đăng")).toHaveAttribute(
      "data-heading-name",
      "true",
    );
    expect(screen.getByText("Xơ Đăng")).toHaveClass("whitespace-nowrap");
  });

  it("keeps local names atomic inside display headings on mobile", () => {
    const { container } = render(
      <h2>
        <SemanticHeadingText text="Nhịp sống Xơ Đăng bình dị bên đỉnh Ngọc Linh" />
      </h2>,
    );

    expect(container.querySelector('[data-heading-name="true"]')).toBeTruthy();
    expect(screen.getByText("Xơ Đăng")).toHaveClass("whitespace-nowrap");
    expect(screen.getByText("Ngọc Linh")).toHaveClass("whitespace-nowrap");
  });

  it("uses soft balanced wrapping for unknown CMS display titles", () => {
    const title = "Mùa gió mới gọi bước chân về Trà Linh";
    const { container } = render(
      <h2>
        <SemanticHeadingText text={title} />
      </h2>,
    );

    expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    expect(container.querySelectorAll("[data-heading-phrase]")).toHaveLength(0);
    expect(screen.getByText("Trà Linh")).toHaveAttribute(
      "data-heading-name",
      "true",
    );
  });

  it("keeps short hero concepts together without forcing a whole line", () => {
    const { container } = render(
      <h1>
        <SemanticHeadingText
          text="Giữa đại ngàn, một báu vật lớn lên"
          compact
        />
      </h1>,
    );

    expect(
      Array.from(
        container.querySelectorAll<HTMLElement>("[data-heading-term]"),
        (term) => term.textContent,
      ),
    ).toEqual(["đại ngàn", "báu vật"]);
  });
});
