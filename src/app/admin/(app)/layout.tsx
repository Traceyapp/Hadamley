import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { relativeDays } from "@/lib/format";
import { logout } from "../actions";
import { LogoMark } from "@/components/site/Logo";
import { AdminNav } from "./AdminNav";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const db = readDb();
  const counts = {
    inbox: db.reports.filter((r) => !r.handled).length + db.messages.filter((m) => !m.handled).length,
    due: db.listings.filter((l) => l.nextReviewDate && relativeDays(l.nextReviewDate) <= 30).length,
  };

  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[16.5rem_1fr]">
      <aside className="border-b border-line bg-sand lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2.5">
            <LogoMark className="size-9" />
            <span className="leading-none">
              <span className="block font-display text-xl font-semibold">Hadamley</span>
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-2">Admin</span>
            </span>
          </Link>
          <Link href="/" target="_blank" className="inline-flex items-center gap-1 text-sm font-bold text-brand lg:hidden">
            View site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </div>
        <AdminNav counts={counts} />
        <div className="mt-auto hidden border-t border-line px-5 py-4 lg:block">
          <Link href="/" target="_blank" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
            View live site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <p className="text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-ink-2">{user.email}</p>
          <form action={logout} className="mt-3">
            <button type="submit" className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-2 hover:text-urgent">
              <LogOut className="size-4" aria-hidden /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
