"use client";

import { Leaf, Mountain, Users } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { WeatherTimeCard } from "./WeatherTimeCard";

const chapters = [
  { number: "01", label: "Đại ngàn", href: "#cau-chuyen", icon: Mountain },
  { number: "02", label: "Vùng sâm", href: "#vung-sam", icon: Leaf },
  { number: "03", label: "Con người", href: "#van-hoa", icon: Users },
] as const;

export function HeroRightRail() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <aside
      aria-label="Thông tin nhanh"
      className="flex w-full flex-col gap-5 sm:max-w-md min-[1180px]:w-[320px] min-[1180px]:max-w-none min-[1180px]:justify-end xl:w-[360px]"
    >
      <div id="hero-sound-control" className="flex min-h-12 justify-start min-[1180px]:justify-end" />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.75, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        <WeatherTimeCard />
      </motion.div>

      <motion.ol
        className="border-t border-white/15"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: prefersReducedMotion ? 0 : 0.09,
              delayChildren: prefersReducedMotion ? 0 : 0.62,
            },
          },
        }}
      >
        {chapters.map(({ number, label, href, icon: Icon }, index) => (
          <motion.li
            key={number}
            className="border-b border-white/15"
            variants={{
              hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 18 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <a
              href={href}
              className="group grid min-h-16 grid-cols-[44px_42px_1fr] items-center gap-3 py-4 text-[#F1F1E8]/82 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#DDB149] min-[1180px]:min-h-20 min-[1180px]:py-5"
            >
              <span
                className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors ${
                  index === 0
                    ? "border-[#9AC45C] text-[#9AC45C]"
                    : "border-white/25 text-[#F1F1E8]/65 group-hover:border-[#DDB149] group-hover:text-[#DDB149]"
                }`}
              >
                <Icon aria-hidden="true" size={20} strokeWidth={1.35} />
              </span>
              <span className="font-serif text-xl tabular-nums text-[#DDB149]">{number}</span>
              <span className="text-sm font-medium lg:text-base">{label}</span>
            </a>
          </motion.li>
        ))}
      </motion.ol>
    </aside>
  );
}

export default HeroRightRail;
