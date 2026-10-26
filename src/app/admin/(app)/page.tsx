import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, CalendarClock, CheckCircle2, FilePen, FilePlus2, FileText, Flag, FolderOpen, ListChecks, ListPlus, Mail, Megaphone, Upload, type LucideIcon } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { formatDate, formatDateTime, relativeDays } from "@/lib/format";
import { CONTACT_TOPIC_LABEL, STATUS_LABEL, type ListingStatus } from "@/lib/types";
import { Card, ListingStatusBadge } from "@/components/admin/ui";
import { RefreshAiButton } from "./ai/RefreshAiButton";

export const metadata = { title: "Dashboard" };

type Task = { key: string; icon: LucideIcon; tone: string; title: string; meta: string; href: string; when: string };

const WORKFLOW: { status: ListingStatus; bar: string }[] = [
  { status: "to_research", bar: "bg-ink-2/40" },
  { status: "online_checked", bar: "bg-brand/60" },
  { status: "clarification_needed", bar: "bg-warn" },
  { status: "approved", bar: "bg-ok" },
];

export default async function Dashboard() {
  await ensureDb();
  const user = await requireAdmin();
  const db = readDb();
  const byStatus = (s: ListingStatus) => db.listings.filter((l) => l.status === s).length;
  const due = db.listings.filter((l) => l.nextReviewDate && relativeDays(l.nextReviewDate) <= 30);
  const openReports = db.reports.filter((r) => !r.handled);
  const openMessages = db.messages.filter((m) => !m.handled);
  const drafts = db.pages.filter((p) => p.status === "draft");
  const now = new Date();
  const hour = Number(now.toLocaleString("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/London" }));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/London" });
  const firstName = user.name.split(" ")[0];

  // One list of everything that needs attention, most urgent first.
  const tasks: Task[] = [
    ...openMessages.map((m) => ({
      key: m.id,
      icon: Mail,
      tone: "bg-brand-tint text-brand",
      title: `Message from ${m.name || "a visitor"}`,
      meta: m.topic ? CONTACT_TOPIC_LABEL[m.topic] : "Contact form",
      href: "/admin/inbox",
      when: m.createdAt,
    })),
    ...openReports.map((r) => ({
      key: r.id,
      icon: Flag,
      tone: "bg-accent-soft text-accent",
      title: `Outdated details: ${db.listings.find((l) => l.id === r.listingId)?.name ?? "a listing"}`,
      meta: r.message,
      href: "/admin/inbox",
      when: r.createdAt,
    })),
    ...due.map((l) => {
      const d = relativeDays(l.nextReviewDate);
      return {
        key: l.id,
        icon: CalendarClock,
        tone: d < 0 ? "bg-urgent-soft text-urgent" : "bg-warn-soft text-warn",
        title: `Recheck ${l.name}`,
        meta: d < 0 ? `Overdue by ${-d} days` : d === 0 ? "Due today" : `Due in ${d} days, ${formatDate(l.nextReviewDate)}`,
        href: `/admin/listings/${l.id}`,
        when: l.nextReviewDate,
      };
    }),
  ];

  const stats: { label: string; value: number; sub: string; href: string; icon: LucideIcon }[] = [
    { label: "Published pages", value: db.pages.length - drafts.length, sub: `${drafts.length} drafts waiting`, href: "/admin/pages", icon: FileText },
    { label: "Live listings", value: byStatus("approved"), sub: `${db.listings.length - byStatus("approved")} in progress`, href: "/admin/listings", icon: ListChecks },
    { label: "Downloads", value: db.resources.filter((r) => r.status === "published").length, sub: "in the library", href: "/admin/resources", icon: FolderOpen },
    { label: "Inbox", value: openReports.length + openMessages.length, sub: openReports.length + openMessages.length ? "need a reply" : "all caught up", href: "/admin/inbox", icon: Mail },
  ];

  const recent = [...db.pages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const cap = Number(process.env.AI_MONTHLY_BUDGET_USD || 25);
  const spend = db.settings.aiSpend.month === now.toISOString().slice(0, 7) ? db.settings.aiSpend.usd : 0;
  const total = Math.max(db.listings.length, 1);

  return (
    <>
      <div className="mb-8">
        <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-accent">{today}</p>
        <h1 className="mt-1.5 text-[2rem] font-semibold leading-tight tracking-tight sm:text-[2.3rem]">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1.5 text-ink-2">{tasks.length ? `${tasks.length} ${tasks.length === 1 ? "thing needs" : "things need"} your attention today.` : "Everything is up to date. Nice work."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, href, icon: Icon }) => (
          <Link key={label} href={href} className="admin-card admin-card-hover group p-5">
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-tint text-brand">
                <Icon className="size-5" aria-hidden />
              </span>
              <ArrowUpRight className="size-4 text-ink-2 opacity-0 transition group-hover:opacity-100" aria-hidden />
            </div>
            <p className="mt-4 font-display text-[2.4rem] font-semibold leading-none">{value}</p>
            <p className="mt-2 text-[0.92rem] font-bold">{label}</p>
            <p className="text-[0.84rem] text-ink-2">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card title="Needs your attention" description="Messages, outdated-details reports and listings due for a recheck.">
            {tasks.length ? (
              <ul className="-mx-2 divide-y divide-line">
                {tasks.slice(0, 8).map(({ key, icon: Icon, tone, title, meta, href }) => (
                  <li key={key}>
                    <Link href={href} className="group flex items-center gap-3 rounded-lg px-2 py-3 transition hover:bg-paper-2">
                      <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${tone}`}>
                        <Icon className="size-[1.1rem]" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold">{title}</span>
                        <span className="block truncate text-[0.86rem] text-ink-2">{meta}</span>
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-ink-2 transition group-hover:translate-x-0.5 group-hover:text-brand" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 rounded-xl bg-ok-soft px-4 py-4 text-ok">
                <CheckCircle2 className="size-5 shrink-0" aria-hidden />
                <p className="font-bold">All caught up. Nothing needs your attention.</p>
              </div>
            )}
            {tasks.length > 8 && <p className="mt-3 text-[0.88rem] text-ink-2">And {tasks.length - 8} more.</p>}
          </Card>

          <Card title="Recently edited" description="The latest changes to pages.">
            <ul className="-mx-2 divide-y divide-line">
              {recent.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/pages/${p.id}`} className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-paper-2">
                    <FilePen className="size-4 shrink-0 text-ink-2" aria-hidden />
                    <span className="min-w-0 flex-1 truncate font-bold group-hover:text-brand">{p.title}</span>
                    <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[0.74rem] font-bold sm:inline ${p.status === "published" ? "bg-ok-soft text-ok" : "bg-paper-2 text-ink-2"}`}>
                      {p.status === "published" ? "Published" : "Draft"}
                    </span>
                    <span className="hidden shrink-0 text-[0.8rem] text-ink-2 md:inline">{formatDate(p.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick actions">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 xl:grid-cols-2">
              {[
                { href: "/admin/pages/new", icon: FilePlus2, label: "New page" },
                { href: "/admin/listings/new", icon: ListPlus, label: "Add listing" },
                { href: "/admin/resources#upload", icon: Upload, label: "Upload download" },
                { href: "/admin/noticeboard", icon: Megaphone, label: "Post news" },
              ].map(({ href, icon: Icon, label }) => (
                <Link key={href} href={href} className="flex flex-col items-start gap-2 rounded-xl border border-line p-3.5 text-[0.92rem] font-bold transition hover:border-brand hover:bg-brand-tint hover:text-brand">
                  <Icon className="size-5 text-brand" aria-hidden /> {label}
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Listing workflow" description="Only approved listings appear on the site and in Ask Hadamley.">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-paper-2" aria-hidden>
              {WORKFLOW.map(({ status, bar }) => (
                <span key={status} className={bar} style={{ width: `${(byStatus(status) / total) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-4 space-y-1">
              {WORKFLOW.map(({ status, bar }) => (
                <li key={status}>
                  <Link href={`/admin/listings?status=${status}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[0.93rem] transition hover:bg-paper-2">
                    <span className="flex items-center gap-2.5">
                      <span className={`size-2.5 rounded-full ${bar}`} aria-hidden />
                      {STATUS_LABEL[status]}
                    </span>
                    <span className="font-bold">{byStatus(status)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Ask Hadamley" description="The AI helper on the website." aside={<Bot className="size-5 text-brand" aria-hidden />}>
            <div className="flex items-baseline justify-between text-[0.9rem]">
              <span className="text-ink-2">Spent this month</span>
              <span className="font-bold">
                ${spend.toFixed(2)} <span className="font-normal text-ink-2">of ${cap}</span>
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-paper-2" aria-hidden>
              <span className="block h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (spend / cap) * 100)}%` }} />
            </div>
            <p className="mt-3 text-[0.86rem] text-ink-2">
              {db.chunks.length} sections indexed. Last refreshed {formatDateTime(db.settings.aiLastIndexedAt)}.
            </p>
            <div className="mt-4 flex items-center justify-between gap-2">
              <RefreshAiButton />
              <Link href="/admin/ai" className="text-[0.88rem] font-bold text-brand hover:underline">
                Test it
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
