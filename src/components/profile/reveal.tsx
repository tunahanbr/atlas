"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({ children, delay = 0, as = "div", className }: { children: ReactNode; delay?: number; as?: "div" | "li"; className?: string }) {
  const reduceMotion = useReducedMotion();
  const animation = {
    // Keep the server and first client render identical. Reduced-motion users
    // still get an immediate (zero-duration) reveal without hydration drift.
    initial: { opacity: 0, y: 14, filter: "blur(3px)" },
    whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true, margin: "-56px" },
    transition: { duration: reduceMotion ? 0 : 0.62, delay: reduceMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  };

  if (as === "li") return <motion.li className={className} {...animation}>{children}</motion.li>;

  return (
    <motion.div className={className} {...animation}>
      {children}
    </motion.div>
  );
}
