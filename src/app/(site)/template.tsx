"use client";

import { motion, useReducedMotion } from "motion/react";

/** Soft fade-and-lift between page navigations. */
export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.21, 0.7, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}
