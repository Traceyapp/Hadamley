"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { NavItem } from "@/lib/repo";

function isActive(path: string, href: string) {
  return path === href || path.startsWith(href + "/");
}

/** Sticky bar that turns to frosted glass once the page scrolls. */
export function HeaderShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header
      className={`sticky top-0 z-30 transition-[background-color,box-shadow,border-color] duration-500 ${
        scrolled ? "glass border-x-0 border-t-0 shadow-[0_10px_30px_-18px_rgba(15,30,34,0.35)]" : "border-b border-transparent bg-paper/40 backdrop-blur-sm"
      }`}
    >
      {children}
    </header>
  );
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => setOpen(null), [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const activeHref = items.find((i) => isActive(path, i.href))?.href ?? null;
  const pillAt = hover ?? open ?? activeHref;

  return (
    <nav ref={navRef} aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-0.5 rounded-full border border-line/70 bg-surface/60 p-1 shadow-soft backdrop-blur" onMouseLeave={() => setHover(null)}>
        {items.map((item) => {
          const active = isActive(path, item.href);
          const hasKids = item.children.length > 0;
          const isOpen = open === item.href;
          return (
            <li key={item.href} className="relative" onMouseEnter={() => setHover(item.href)}>
              {pillAt === item.href && (
                <motion.span
                  layoutId="nav-pill"
                  aria-hidden="true"
                  className={`absolute inset-0 rounded-full ${active ? "bg-grad-brand shadow-glow" : "bg-sand-2"}`}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <div className="relative flex items-center">
                <Link
                  href={item.href}
                  aria-current={path === item.href ? "page" : undefined}
                  className={`flex min-h-10 items-center whitespace-nowrap rounded-full py-2 text-[0.93rem] font-bold transition-colors ${hasKids ? "pl-4 pr-0.5" : "px-4"} ${
                    active && pillAt === item.href ? "text-white" : active ? "text-brand" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
                {hasKids && (
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`menu-${item.href}`}
                    aria-label={`Show pages in ${item.label}`}
                    onClick={() => setOpen(isOpen ? null : item.href)}
                    className={`mr-1 grid size-8 place-items-center rounded-full transition-colors ${active && pillAt === item.href ? "text-white hover:bg-white/15" : "hover:bg-sand"}`}
                  >
                    <ChevronDown className={`size-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                )}
              </div>
              <AnimatePresence>
                {hasKids && isOpen && (
                  <motion.div
                    id={`menu-${item.href}`}
                    initial={reduce ? false : { opacity: 0, y: 10, scale: 0.97, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={reduce ? undefined : { opacity: 0, y: 6, scale: 0.98, filter: "blur(4px)" }}
                    transition={{ duration: 0.25, ease: [0.21, 0.7, 0.2, 1] }}
                    className="absolute left-0 top-full z-40 mt-3 w-[30rem] origin-top-left overflow-hidden rounded-3xl border border-line bg-surface shadow-lift"
                  >
                    <div className="relative overflow-hidden bg-grad-brand px-5 py-4 text-white">
                      <div aria-hidden="true" className="absolute -right-10 -top-10 size-40 rounded-full bg-white/15 blur-2xl" />
                      <Link href={item.href} className="group relative flex items-center justify-between font-bold">
                        <span>
                          <span className="block text-[0.75rem] uppercase tracking-[0.14em] text-white/75">Section overview</span>
                          <span className="font-display text-xl">{item.label}</span>
                        </span>
                        <span className="grid size-9 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-1 group-hover:bg-white/25">
                          <ArrowRight className="size-4" aria-hidden />
                        </span>
                      </Link>
                    </div>
                    <ul className="p-2">
                      {item.children.map((c, i) => (
                        <motion.li
                          key={c.href}
                          initial={reduce ? false : { opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 + i * 0.04 }}
                        >
                          <Link href={c.href} className="group flex gap-3 rounded-2xl px-4 py-3 transition hover:bg-brand-tint">
                            <span className="mt-2 size-2 shrink-0 rounded-full bg-grad-brand transition group-hover:scale-150" aria-hidden />
                            <span>
                              <span className="block font-bold text-ink group-hover:text-brand">{c.label}</span>
                              <span className="mt-0.5 block text-sm leading-snug text-ink-2 line-clamp-2">{c.summary}</span>
                            </span>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav({ items, funeralUrl }: { items: NavItem[]; funeralUrl: string }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const extra = [
    { label: "About Hadamley", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface font-bold shadow-soft sm:px-4"
      >
        <Menu className="size-5" aria-hidden />
        <span className="sr-only sm:not-sr-only">Menu</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-paper"
            initial={reduce ? false : { opacity: 0, clipPath: "circle(0% at 92% 4%)" }}
            animate={{ opacity: 1, clipPath: "circle(150% at 92% 4%)" }}
            exit={reduce ? undefined : { opacity: 0, clipPath: "circle(0% at 92% 4%)" }}
            transition={{ duration: 0.55, ease: [0.21, 0.7, 0.2, 1] }}
          >
            <div aria-hidden="true" className="aurora aurora-soft">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="relative z-10 flex items-center justify-between border-b border-line px-4 py-3">
              <span className="font-display text-2xl font-semibold">Menu</span>
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 font-bold"
              >
                <X className="size-5" aria-hidden /> Close
              </button>
            </div>
            <nav aria-label="Main" className="relative z-10 flex-1 overflow-y-auto px-4 py-5">
              <motion.ul
                className="space-y-3"
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.05, delayChildren: reduce ? 0 : 0.15 } } }}
              >
                {items.map((item) => (
                  <motion.li
                    key={item.href}
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                    className="glass overflow-hidden rounded-3xl shadow-soft"
                  >
                    <Link
                      href={item.href}
                      aria-current={path === item.href ? "page" : undefined}
                      className="flex items-center justify-between px-5 py-4 font-display text-[1.35rem] font-semibold text-ink"
                    >
                      {item.label}
                      <ArrowRight className="size-5 text-brand" aria-hidden />
                    </Link>
                    {item.children.length > 0 && (
                      <ul className="border-t border-line/70 px-2 py-2">
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link href={c.href} className="block rounded-xl px-3 py-2.5 text-ink-2 hover:bg-sand hover:text-ink">
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.li>
                ))}
                {extra.map((e) => (
                  <motion.li key={e.href} variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
                    <Link href={e.href} className="block rounded-xl px-5 py-3 font-bold hover:bg-sand">
                      {e.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}>
                  <a href={funeralUrl} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-xl px-5 py-3 font-bold text-brand hover:bg-sand">
                    The Funeral Companion <ExternalLink className="size-4" aria-hidden />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </motion.li>
              </motion.ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
