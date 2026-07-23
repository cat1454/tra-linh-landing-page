import Link from "next/link";

import type { HomePageContent } from "@/lib/content/types";

import { ArrowGlyph, MediaFrame, PlaceholderPill, SectionIntro } from "./_shared";

type GinsengProductsSectionProps = {
  products: HomePageContent["products"];
};

const productTypeLabels: Record<HomePageContent["products"][number]["productType"], string> = {
  "fresh-ginseng": "Sâm tươi",
  "dried-ginseng": "Sâm chế biến",
  "herbal-tea": "Trà dược liệu",
};

export function GinsengProductsSection({ products }: GinsengProductsSectionProps) {
  if (!products.length) return null;

  return (
    <section id="san-pham-sam" aria-labelledby="products-heading" className="bg-[#07100C] px-5 py-12 text-[#EEF1E9] sm:px-8 sm:py-16 lg:px-16 lg:py-20 xl:px-20">
      <div className="mx-auto max-w-[1380px]">
        <div id="products-heading">
          <SectionIntro
            eyebrow="Từ vùng sâm Ngọc Linh"
            title="Sản phẩm mang câu chuyện nguồn gốc"
            description="Danh mục đang được hoàn thiện cùng đơn vị địa phương. Thông tin chỉ giới thiệu dòng sản phẩm, không thay thế tư vấn chuyên môn."
            tone="dark"
            align="center"
          />
        </div>

        <div className="-mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-6 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:mt-10 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="product-card group flex min-w-[84vw] snap-start flex-col overflow-hidden rounded-[1.5rem] border border-[#EEF1E9]/12 bg-[#10251A] sm:min-w-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#29452C]">
                <MediaFrame media={product.featuredMedia} className="absolute inset-0" sizes="(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 84vw" imageClassName="transition duration-700 group-hover:scale-[1.04]" showCaption />
                {product.isPlaceholder ? (
                  <div className="absolute left-4 top-4"><PlaceholderPill label={product.placeholderLabel} /></div>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#D5A84E]">{productTypeLabels[product.productType]}</p>
                <h3 className="mt-3 font-serif text-3xl">{product.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#EEF1E9]/66">{product.shortDescription}</p>
                {product.originNote ? <p className="mt-4 text-xs leading-6 text-[#9BBE62]">Nguồn gốc: {product.originNote}</p> : null}
                <Link
                  href={`/san-vat/${product.slug}`}
                  className="group mt-auto inline-flex min-h-12 items-end gap-3 pt-6 text-sm font-semibold text-[#EEF1E9] transition-colors hover:text-[#D5A84E] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D5A84E]"
                >
                  Xem chi tiết <ArrowGlyph />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 max-w-4xl text-xs leading-6 text-[#EEF1E9]/72">
          Sản phẩm minh họa không hiển thị giá hoặc công dụng sức khỏe khi chưa được đơn vị sở hữu xác minh. Người dùng cần kiểm tra nguồn gốc và thông tin pháp lý trước khi lựa chọn.
        </p>
      </div>
    </section>
  );
}

export default GinsengProductsSection;
