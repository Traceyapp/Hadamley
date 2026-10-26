import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { relativeDays } from "@/lib/format";
import { logout } from "../actions";
import { LogoMark } from "@/components/site/Logo";
import { AdminNav } from "./AdminNav";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "A";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const db = readDb();
  const counts = {
    inbox: db.reports.filter((r) => !r.handled).length + db.messages.filter((m) => !m.handled).length,
    due: db.listings.filter((l) => l.nextReviewDate && relativeDays(l.nextReviewDate) <= 30).length,
  };

  return (
    <div className="min-h-dvh bg-paper-2 lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Sidebar: always navy, in both themes */}
      <aside className="night-scope relative z-20 bg-paper text-ink lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:px-6 lg:py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <LogoMark className="size-10" />
            <span className="leading-tight">
              <span className="block font-display text-[1.25rem] font-semibold">Hadamley</span>
              <span className="block text-[0.66rem] font-bold uppercase tracking-[0.18em] text-accent">Admin</span>
            </span>
          </Link>
          <Link href="/" target="_blank" className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-[0.82rem] font-bold text-ink-2 hover:text-ink lg:hidden">
            View site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>
        <AdminNav counts={counts} />
        <div className="hidden border-t border-line p-4 lg:block">
          <Link href="/" target="_blank" className="mb-3 flex min-h-10 items-center justify-between rounded-lg px-3 text-[0.9rem] font-bold text-ink-2 transition hover:bg-white/5 hover:text-ink">
            View live site <ExternalLink className="size-4" aria-hidden />
          </Link>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-champagne text-[0.82rem] font-bold text-[#13254a]" aria-hidden>
              {initials(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.9rem] font-bold">{user.name}</p>
              <p className="truncate text-[0.75rem] text-ink-2">{user.email}</p>
            </div>
            <form action={logout}>
              <button type="submit" title="Sign out" aria-label="Sign out" className="grid size-9 place-items-center rounded-lg text-ink-2 transition hover:bg-white/10 hover:text-ink">
                <LogOut className="size-4" aria-hidden />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <div className="min-w-0">
        <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          {children}
        </main>
        <form action={logout} className="px-4 pb-8 text-center lg:hidden">
          <button type="submit" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-2 hover:text-urgent">
            <LogOut className="size-4" aria-hidden /> Sign out ({user.name})
          </button>
        </form>
      </div>
    </div>
  );
}
