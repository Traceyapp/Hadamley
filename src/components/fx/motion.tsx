"use client";

import { AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { Children, useEffect, useRef, useState } from "react";

const EASE = [0.21, 0.7, 0.2, 1] as const;

/** Fades and lifts content into view once. Static for reduced-motion visitors. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "header" | "span";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  if (reduce) return <Tag className={className}>{children}</Tag>;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      {children}
    </Tag>
  );
}

const container: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } },
};

/** A list whose children rise in one after another. */
export function Stagger({
  children,
  className,
  as = "ul",
  itemClassNames,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "ul" | "div" | "ol";
  /** Class for each item wrapper, by index. Falls back to "h-full". */
  itemClassNames?: string[];
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const Child = as === "div" ? motion.div : motion.li;
  return (
    <Tag className={className} variants={container} initial={reduce ? "show" : "hidden"} whileInView="show" viewport={{ once: true, margin: "0px 0px -60px 0px" }}>
      {Children.map(children, (c, i) =>
        c ? (
          <Child variants={reduce ? undefined : item} className={itemClassNames?.[i] ?? "h-full"}>
            {c}
          </Child>
        ) : null,
      )}
    </Tag>
  );
}

/** Cycles through words with a soft vertical slide. Screen readers get one static phrase. */
export function RotatingWord({ words, className, srText }: { words: string[]; className?: string; srText: string }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => clearInterval(t);
  }, [reduce, words.length]);
  return (
    <>
      <span className="sr-only">{srText}</span>
      <span aria-hidden="true" className={`relative inline-grid overflow-hidden align-bottom ${className ?? ""}`}>
        {/* Reserve the width of the longest word so the line never jumps */}
        <span className="invisible col-start-1 row-start-1">{words.reduce((a, b) => (b.length > a.length ? b : a))}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={words[i]}
            className="col-start-1 row-start-1"
            initial={{ y: "60%", opacity: 0, filter: "blur(8px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-60%", opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.38, ease: EASE }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}

/** Counts up to a number when it scrolls into view. */
export function CountUp({ to, suffix = "", className }: { to: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to]);
  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">
        {n}
        {suffix}
      </span>
      <span className="sr-only">
        {to}
        {suffix}
      </span>
    </span>
  );
}

/** Tracks the pointer so .spotlight cards glow where the cursor is. */
export function Spotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`spotlight ${className ?? ""}`}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}

/** Subtle 3D tilt that follows the pointer. */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion();
  const [rot, setRot] = useState({ x: 0, y: 0 });
  return (
    <motion.div
      className={className}
      style={{ transformPerspective: 1100 }}
      animate={{ rotateX: rot.x, rotateY: rot.y }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        setRot({ x: -py * max, y: px * max });
      }}
      onPointerLeave={() => setRot({ x: 0, y: 0 })}
    >
      {children}
    </motion.div>
  );
}

/** Types a string out character by character once in view. */
export function useTypewriter(text: string, start: boolean, speed = 22) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(reduce ? text : "");
  useEffect(() => {
    if (!start) return;
    if (reduce) return setOut(text);
    setOut("");
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [start, text, speed, reduce]);
  return out;
}

export { motion, AnimatePresence, useReducedMotion, useInView };
