"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { Bot, FileText, FolderOpen, Inbox, LayoutDashboard, ListChecks, Pin, Settings, Tags, type LucideIcon } from "lucide-react";

type Item = { href: string; label: string; icon: LucideIcon; exact?: boolean; count?: "inbox" | "due" };

const GROUPS: { label: string; items: Item[] }[] = [
  { label: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true }] },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: FileText },
      { href: "/admin/listings", label: "Directory listings", icon: ListChecks, count: "due" },
      { href: "/admin/resources", label: "Downloads", icon: FolderOpen },
      { href: "/admin/noticeboard", label: "Noticeboard", icon: Pin },
    ],
  },
  { label: "Organise", items: [{ href: "/admin/taxonomy", label: "Topics, areas, menu", icon: Tags }] },
  {
    label: "Visitors",
    items: [
      { href: "/admin/inbox", label: "Inbox", icon: Inbox, count: "inbox" },
      { href: "/admin/ai", label: "Ask Hadamley", icon: Bot },
    ],
  },
  { label: "Account", items: [{ href: "/admin/settings", label: "Settings", icon: Settings }] },
];

/** Sidebar navigation. A column on desktop; a scrolling row of pills on phones. */
export function AdminNav({ counts }: { counts: { inbox: number; due: number } }) {
  const path = usePathname();
  const navRef = useRef<HTMLElement>(null);
  // On phones the menu is a scrolling row: keep the current section in view.
  useEffect(() => {
    const el = navRef.current?.querySelector<HTMLElement>('[aria-current="page"]');
    if (el && navRef.current && navRef.current.scrollWidth > navRef.current.clientWidth) el.scrollIntoView({ block: "nearest", inline: "center" });
  }, [path]);
  return (
    <nav ref={navRef} aria-label="Admin" className="no-scrollbar overflow-x-auto px-3 pb-3 lg:flex-1 lg:overflow-y-auto lg:px-4 lg:pb-4">
      <ul className="flex gap-1 lg:flex-col lg:gap-5">
        {GROUPS.map((g) => (
          <li key={g.label} className="contents lg:block">
            <p className="mb-1.5 hidden px-3 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-ink-2/80 lg:block">{g.label}</p>
            <ul className="contents lg:flex lg:flex-col lg:gap-0.5">
              {g.items.map(({ href, label, icon: Icon, exact, count }) => {
                const active = exact ? path === href : path.startsWith(href);
                const n = count ? counts[count] : 0;
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-10 items-center gap-3 whitespace-nowrap rounded-lg px-3 text-[0.94rem] font-bold transition ${
                        active ? "bg-white/10 text-ink lg:before:absolute lg:before:inset-y-2 lg:before:-left-1 lg:before:w-[3px] lg:before:rounded-full lg:before:bg-champagne" : "text-ink-2 hover:bg-white/5 hover:text-ink"
                      }`}
                    >
                      <Icon className={`size-[1.15rem] shrink-0 ${active ? "text-accent" : ""}`} aria-hidden />
                      <span className="flex-1">{label}</span>
                      {n > 0 && (
                        <span className={`rounded-full px-2 text-[0.72rem] leading-5 ${count === "inbox" ? "bg-[#e5484d] text-white" : "bg-accent/20 text-accent"}`}>
                          {n}
                          <span className="sr-only">{count === "inbox" ? " unread" : " due for review"}</span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
