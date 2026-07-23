"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import type { ReactNode } from "react";
import { useReducedMotionPreference } from "./useReducedMotionPreference";

export type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "zoom";

export interface ScrollRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly direction?: RevealDirection;
  readonly delay?: number;
  readonly duration?: number;
  readonly once?: boolean;
  readonly threshold?: number;
}

const variants = {
  hidden: (direction: RevealDirection) => ({
    opacity: 0,
    y: direction === "up" ? 30 : direction === "down" ? -30 : 0,
    x: direction === "left" ? 30 : direction === "right" ? -30 : 0,
    scale: direction === "zoom" ? 0.96 : 1,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
  },
};

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.7,
  once = false,
  threshold = 0.2,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      custom={direction}
      variants={variants}
      transition={{
        delay,
        duration,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={clsx("scroll-reveal-active", className)}
    >
      {children}
    </motion.div>
  );
}

export default ScrollReveal;
