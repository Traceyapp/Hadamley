"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/repo";

function isActive(path: string, href: string) {
  return path === href || path.startsWith(href + "/");
}

export function DesktopNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  const [open, setOpen] = useState<string | null>(null);
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

  return (
    <nav ref={navRef} aria-label="Main" className="hidden xl:block">
      <ul className="flex items-center gap-0.5">
        {items.map((item) => {
          const active = isActive(path, item.href);
          const hasKids = item.children.length > 0;
          return (
            <li key={item.href} className="relative">
              <div
                className={`flex items-center rounded-full ${active ? "bg-brand-soft" : "hover:bg-sand"}`}
              >
                <Link
                  href={item.href}
                  aria-current={path === item.href ? "page" : undefined}
                  className={`flex min-h-11 items-center whitespace-nowrap rounded-full py-2 font-bold text-[0.95rem] ${hasKids ? "pl-4 pr-1" : "px-4"} ${
                    active ? "text-brand-strong" : "text-ink"
                  }`}
                >
                  {item.label}
                </Link>
                {hasKids && (
                  <button
                    type="button"
                    aria-expanded={open === item.href}
                    aria-controls={`menu-${item.href}`}
                    aria-label={`Show pages in ${item.label}`}
                    onClick={() => setOpen(open === item.href ? null : item.href)}
                    className="mr-1 grid size-9 place-items-center rounded-full hover:bg-sand-2"
                  >
                    <ChevronDown className={`size-4 transition-transform ${open === item.href ? "rotate-180" : ""}`} aria-hidden />
                  </button>
                )}
              </div>
              {hasKids && open === item.href && (
                <div
                  id={`menu-${item.href}`}
                  className="animate-rise absolute left-0 top-full z-40 mt-2 w-[26rem] rounded-2xl border border-line bg-surface p-2 shadow-lift"
                >
                  <Link href={item.href} className="block rounded-xl px-4 py-3 hover:bg-brand-tint">
                    <span className="font-bold text-brand">Overview: {item.label}</span>
                  </Link>
                  {item.children.map((c) => (
                    <Link key={c.href} href={c.href} className="block rounded-xl px-4 py-3 hover:bg-brand-tint">
                      <span className="block font-bold text-ink">{c.label}</span>
                      <span className="mt-0.5 block text-sm leading-snug text-ink-2 line-clamp-2">{c.summary}</span>
                    </Link>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileNav({ items, funeralUrl }: { items: NavItem[]; funeralUrl: string }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface font-bold sm:px-4"
      >
        <Menu className="size-5" aria-hidden />
        <span className="sr-only sm:not-sr-only">Menu</span>
      </button>
      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="fixed inset-0 z-50 flex flex-col bg-paper">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-display text-xl font-semibold">Menu</span>
            <button
              type="button"
              autoFocus
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-4 font-bold"
            >
              <X className="size-5" aria-hidden /> Close
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="space-y-2">
              <li>
                <Link href="/" className="block rounded-xl px-4 py-3 text-lg font-bold hover:bg-sand">
                  Home
                </Link>
              </li>
              {items.map((item) => (
                <li key={item.href} className="rounded-2xl border border-line bg-surface">
                  <Link
                    href={item.href}
                    aria-current={path === item.href ? "page" : undefined}
                    className="block rounded-2xl px-4 py-3 text-lg font-bold text-ink"
                  >
                    {item.label}
                  </Link>
                  {item.children.length > 0 && (
                    <ul className="border-t border-line px-2 py-2">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded-xl px-3 py-2.5 text-ink-2 hover:bg-sand hover:text-ink">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
              <li>
                <Link href="/about" className="block rounded-xl px-4 py-3 font-bold hover:bg-sand">
                  About Hadamley
                </Link>
              </li>
              <li>
                <Link href="/contact" className="block rounded-xl px-4 py-3 font-bold hover:bg-sand">
                  Contact
                </Link>
              </li>
              <li>
                <a href={funeralUrl} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-xl px-4 py-3 font-bold text-brand hover:bg-sand">
                  The Funeral Companion <ExternalLink className="size-4" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
