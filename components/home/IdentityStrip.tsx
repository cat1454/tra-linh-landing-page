import { Leaf, Mountain, Sprout, UsersRound } from "lucide-react";

import ScrollReveal from "@/components/animation/ScrollReveal";
import type { HomePageContent } from "@/lib/content/types";

type IdentityStripProps = {
  items: HomePageContent["identityValues"];
};

const icons = {
  mountain: Mountain,
  sprout: Sprout,
  community: UsersRound,
  leaf: Leaf,
};

export function IdentityStrip({ items }: IdentityStripProps) {
  return (
    <section aria-label="Những giá trị làm nên Trà Linh" className="relative z-10 bg-[#10251A] text-[#EEF1E9]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-2 border-x border-[#EEF1E9]/10 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = icons[item.icon];

          return (
            <ScrollReveal
              key={item.id}
              direction="up"
              delay={index * 0.1}
              className="h-full"
            >
              <article
                className="identity-item h-full min-h-44 border-b border-r border-[#EEF1E9]/10 px-5 py-7 last:border-r-0 sm:px-8 lg:min-h-48 lg:border-b-0 lg:px-9 lg:py-9"
              >
                <Icon aria-hidden="true" className="h-6 w-6 stroke-[1.4] text-[#D5A84E]" />
                <h2 className="mt-5 font-serif text-xl leading-tight sm:text-2xl">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#EEF1E9]/62">{item.description}</p>
              </article>
            </ScrollReveal>
          );
        })}
      </div>
    </section>
  );
}

export default IdentityStrip;
