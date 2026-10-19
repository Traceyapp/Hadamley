"use client";

import { motion, useReducedMotion } from "motion/react";

/** A rubber stamp that presses onto the page as it scrolls into view. */
export function Stamp({ children, rotate = 0, className = "" }: { children: React.ReactNode; rotate?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className={className}
      initial={reduce ? false : { scale: 2.1, opacity: 0, rotate: rotate - 18 }}
      whileInView={{ scale: 1, opacity: 1, rotate }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ type: "spring", stiffness: 420, damping: 17, mass: 0.9 }}
      style={reduce ? { rotate } : undefined}
    >
      {children}
    </motion.span>
  );
}
