"use client";

import { motion, useReducedMotion } from "framer-motion";

type HeroTitleProps = {
  title: string;
};

function splitHeroTitle(title: string) {
  const commaIndex = title.indexOf(",");
  if (commaIndex === -1) return [title];

  return [
    title.slice(0, commaIndex + 1).trim(),
    title.slice(commaIndex + 1).trim(),
  ].filter(Boolean);
}

export function HeroTitle({ title }: HeroTitleProps) {
  const prefersReducedMotion = useReducedMotion();
  const lines = splitHeroTitle(title);

  return (
    <motion.h1
      id="hero-title"
      aria-label={title}
      className="mt-5 max-w-[850px] text-balance font-serif text-[clamp(2.875rem,12vw,4.5rem)] leading-[0.94] tracking-[-0.045em] text-[#F1F1E8] sm:text-[72px] min-[1180px]:text-[clamp(4.75rem,6.3vw,5.375rem)] xl:text-[clamp(5.375rem,5.9vw,6.25rem)]"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : 0.12,
            delayChildren: prefersReducedMotion ? 0 : 0.28,
          },
        },
      }}
    >
      {lines.map((line) => (
        <motion.span
          key={line}
          aria-hidden="true"
          className="block"
          variants={{
            hidden: prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 28 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          {line}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export default HeroTitle;
