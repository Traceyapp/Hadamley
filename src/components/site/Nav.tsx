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

/** Sticky bar that gains a printed rule once the page scrolls. */
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
        scrolled ? "border-b-[1.5px] border-ink bg-paper/95 backdrop-blur" : "border-b-[1.5px] border-transparent bg-paper"
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
      <ul className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
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
                  className={`absolute inset-0 rounded-full ${active ? "bg-ink" : "bg-sand-2"}`}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <div className="relative flex items-center">
                <Link
                  href={item.href}
                  aria-current={path === item.href ? "page" : undefined}
                  className={`flex min-h-10 items-center whitespace-nowrap rounded-full py-2 text-[0.93rem] font-bold transition-colors ${hasKids ? "pl-4 pr-0.5" : "px-4"} ${
                    active && pillAt === item.href ? "text-paper" : "text-ink"
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
                    className={`mr-1 grid size-8 place-items-center rounded-full transition-colors ${active && pillAt === item.href ? "text-paper hover:bg-white/15" : "hover:bg-sand"}`}
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
                    className="card-print absolute left-0 top-full z-40 mt-3 w-[30rem] origin-top-left overflow-hidden"
                  >
                    <div className="relative overflow-hidden border-b-[1.5px] border-ink bg-sand px-5 py-4 text-ink">
                      <Link href={item.href} className="group relative flex items-center justify-between font-bold">
                        <span>
                          <span className="kicker block text-ink-2">Section overview</span>
                          <span className="font-display text-xl">{item.label}</span>
                        </span>
                        <span className="grid size-9 place-items-center rounded-full border-[1.5px] border-ink transition group-hover:translate-x-1 group-hover:bg-ink group-hover:text-paper">
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
                          <Link href={c.href} className="group flex gap-3 rounded-xl px-4 py-3 transition hover:bg-sand">
                            <span className="mt-[0.7rem] h-0.5 w-3 shrink-0 bg-accent transition-all group-hover:w-5" aria-hidden />
                            <span>
                              <span className="block font-bold text-ink group-hover:underline">{c.label}</span>
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const desktop = window.matchMedia("(min-width: 1280px)");
    const onResize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", onResize);
    return () => {
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = previousOverflow;
      dialog.close();
      if (triggerRef.current?.getClientRects().length) triggerRef.current.focus();
    };
  }, [open]);

  const extra = [
    { label: "Noticeboard: news and events", href: "/noticeboard" },
    { label: "About Hadamley", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <div className="xl:hidden">
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink bg-surface font-bold sm:px-4"
      >
        <Menu className="size-5" aria-hidden />
        <span className="sr-only sm:not-sr-only">Menu</span>
      </button>
      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label="Site menu"
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'));
          const first = items[0];
          const last = items[items.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-paper p-0 text-ink backdrop:bg-paper"
      >
        {open && (
          <motion.div
            className="flex h-full flex-col"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.22, ease: [0.21, 0.7, 0.2, 1] }}
          >
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
                initial={reduce ? false : "hidden"}
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.025, delayChildren: 0 } } }}
              >
                {items.map((item) => (
                  <motion.li
                    key={item.href}
                    variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                    className="card-print overflow-hidden"
                  >
                    <Link
                      href={item.href}
                      aria-current={path === item.href ? "page" : undefined}
                      className="flex items-center justify-between px-5 py-4 font-display text-[1.35rem] font-semibold text-ink"
                    >
                      {item.label}
                      <ArrowRight className="size-5" aria-hidden />
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
      </dialog>
    </div>
  );
}
