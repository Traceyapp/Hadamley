"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, FileText, FolderOpen, Inbox, LayoutDashboard, ListChecks, Settings, Tags } from "lucide-react";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/pages", label: "Pages", icon: FileText },
  { href: "/admin/listings", label: "Directory listings", icon: ListChecks, count: "due" as const },
  { href: "/admin/resources", label: "Downloads", icon: FolderOpen },
  { href: "/admin/taxonomy", label: "Topics, areas, menu", icon: Tags },
  { href: "/admin/inbox", label: "Inbox", icon: Inbox, count: "inbox" as const },
  { href: "/admin/ai", label: "AI helper", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminNav({ counts }: { counts: { inbox: number; due: number } }) {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="overflow-x-auto px-3 pb-3 lg:overflow-visible lg:pb-0">
      <ul className="flex gap-1 lg:flex-col">
        {ITEMS.map(({ href, label, icon: Icon, exact, count }) => {
          const active = exact ? path === href : path.startsWith(href);
          const n = count ? counts[count] : 0;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xl px-3 font-bold ${active ? "bg-surface text-brand shadow-soft" : "text-ink hover:bg-sand-2"}`}
              >
                <Icon className="size-5 shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                {n > 0 && (
                  <span className={`rounded-full px-2 text-xs leading-5 ${count === "inbox" ? "bg-urgent text-white dark:text-[#1b0b0a]" : "bg-warn-soft text-warn"}`}>
                    {n}
                    <span className="sr-only">{count === "inbox" ? " unread" : " due for review"}</span>
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
