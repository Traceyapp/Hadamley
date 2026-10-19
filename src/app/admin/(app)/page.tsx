import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, FilePlus2, Flag, ListPlus, Upload } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDate, formatDateTime, relativeDays } from "@/lib/format";
import { STATUS_LABEL, type ListingStatus } from "@/lib/types";
import { AdminHeader, Card, ListingStatusBadge } from "@/components/admin/ui";
import { RefreshAiButton } from "./ai/RefreshAiButton";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  const user = await requireAdmin();
  const db = readDb();
  const byStatus = (s: ListingStatus) => db.listings.filter((l) => l.status === s).length;
  const due = db.listings
    .filter((l) => l.nextReviewDate && relativeDays(l.nextReviewDate) <= 30)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  const openReports = db.reports.filter((r) => !r.handled);
  const openMessages = db.messages.filter((m) => !m.handled);
  const hour = new Date().toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" });
  const greeting = Number(hour) < 12 ? "Good morning" : Number(hour) < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    { label: "Published pages", value: db.pages.filter((p) => p.status === "published").length, sub: `${db.pages.filter((p) => p.status === "draft").length} drafts`, href: "/admin/pages" },
    { label: "Live listings", value: byStatus("approved"), sub: `${db.listings.length - byStatus("approved")} in progress`, href: "/admin/listings" },
    { label: "Downloads", value: db.resources.filter((r) => r.status === "published").length, sub: "published", href: "/admin/resources" },
    { label: "Inbox", value: openReports.length + openMessages.length, sub: "need attention", href: "/admin/inbox" },
  ];

  return (
    <>
      <AdminHeader title={`${greeting}, ${user.name}`} description="Here is what needs your attention on Hadamley today." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card-print card-print-hover p-5">
            <p className="text-[0.9rem] font-bold text-ink-2">{s.label}</p>
            <p className="mt-2 font-display text-[2.7rem] font-semibold leading-none text-brand">{s.value}</p>
            <p className="mt-2 text-[0.85rem] text-ink-2">{s.sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Card title="Due for review" description="Listings with a review date in the next 30 days, or overdue." aside={<CalendarClock className="size-5 text-warn" aria-hidden />}>
            {due.length ? (
              <ul className="divide-y divide-line">
                {due.slice(0, 6).map((l) => {
                  const d = relativeDays(l.nextReviewDate);
                  return (
                    <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <Link href={`/admin/listings/${l.id}`} className="font-bold hover:text-brand">
                          {l.name}
                        </Link>
                        <p className={`text-sm ${d < 0 ? "font-bold text-urgent" : "text-ink-2"}`}>
                          {d < 0 ? `Overdue by ${-d} days` : d === 0 ? "Due today" : `Due in ${d} days`} · {formatDate(l.nextReviewDate)}
                        </p>
                      </div>
                      <ListingStatusBadge status={l.status} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-ink-2">Nothing due. Every listing is within its review window.</p>
            )}
          </Card>

          <Card title="Outdated-details reports" description="Sent by visitors from listing pages." aside={<Flag className="size-5 text-accent" aria-hidden />}>
            {openReports.length ? (
              <ul className="divide-y divide-line">
                {openReports.slice(0, 4).map((r) => {
                  const l = db.listings.find((x) => x.id === r.listingId);
                  return (
                    <li key={r.id} className="py-3">
                      <p className="font-bold">{l?.name ?? "Deleted listing"}</p>
                      <p className="mt-0.5 line-clamp-2 text-[0.95rem] text-ink-2">&ldquo;{r.message}&rdquo;</p>
                      <p className="mt-1 text-xs text-ink-2">{formatDateTime(r.createdAt)}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-ink-2">No open reports.</p>
            )}
            <Link href="/admin/inbox" className="mt-4 inline-flex items-center gap-1.5 font-bold text-brand hover:underline">
              Open inbox <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick actions">
            <div className="grid gap-2">
              {[
                { href: "/admin/listings/new", icon: ListPlus, label: "Add a listing" },
                { href: "/admin/pages/new", icon: FilePlus2, label: "Create a page" },
                { href: "/admin/resources#upload", icon: Upload, label: "Upload a download" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="flex min-h-12 items-center gap-3 rounded-xl border border-line px-4 font-bold hover:border-brand hover:bg-brand-tint hover:text-brand">
                  <Icon className="size-5" aria-hidden /> {label}
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Listing workflow" description="Only approved listings appear on the site and in the AI helper.">
            <ol className="space-y-2">
              {(["to_research", "online_checked", "clarification_needed", "approved"] as ListingStatus[]).map((s, i) => (
                <li key={s}>
                  <Link href={`/admin/listings?status=${s}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-sand">
                    <span className="flex items-center gap-2.5">
                      <span className="grid size-6 place-items-center rounded-full bg-sand-2 text-xs font-bold">{i + 1}</span>
                      {STATUS_LABEL[s]}
                    </span>
                    <span className="font-display text-xl font-semibold">{byStatus(s)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          </Card>

          <Card title="AI helper" aside={<Bot className="size-5 text-brand" aria-hidden />}>
            <p className="text-[0.95rem] text-ink-2">
              Last updated <strong className="text-ink">{formatDateTime(db.settings.aiLastIndexedAt)}</strong>. {db.chunks.length} sections of approved content indexed.
            </p>
            <div className="mt-4">
              <RefreshAiButton />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
