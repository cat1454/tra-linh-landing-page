import clsx from "clsx";
import type { CSSProperties, ReactNode } from "react";

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

const transforms: Record<RevealDirection, string> = {
  up: "translate3d(0, 2rem, 0)",
  down: "translate3d(0, -2rem, 0)",
  left: "translate3d(-2rem, 0, 0)",
  right: "translate3d(2rem, 0, 0)",
  fade: "none",
  zoom: "scale(0.97)",
};

export function ScrollReveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.7,
}: ScrollRevealProps) {
  const style = {
    "--reveal-delay": `${delay}s`,
    "--reveal-duration": `${duration}s`,
    "--reveal-transform": transforms[direction],
  } as CSSProperties;

  return (
    <div className={clsx("scroll-reveal", className)} style={style}>
      {children}
    </div>
  );
}

export default ScrollReveal;
