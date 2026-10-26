import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDate, relativeDays } from "@/lib/format";
import { PROVIDER_LABEL, STATUS_LABEL, type ListingStatus } from "@/lib/types";
import { AdminHeader, btn, Empty, Flash, input, ListingStatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Directory listings" };

export default async function ListingsAdmin({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; saved?: string; due?: string }> }) {
  await ensureDb({ fresh: true });
  const { status, q = "", saved, due } = await searchParams;
  const db = readDb();
  const all = db.listings;
  const rows = all
    .filter((l) => (status ? l.status === status : true))
    .filter((l) => (due ? l.nextReviewDate && relativeDays(l.nextReviewDate) <= 30 : true))
    .filter((l) => (q ? `${l.name} ${l.summary}`.toLowerCase().includes(q.toLowerCase()) : true))
    .sort((a, b) => a.name.localeCompare(b.name));
  const reportCount = (id: string) => db.reports.filter((r) => r.listingId === id && !r.handled).length;
  const tabs: { key?: ListingStatus; label: string }[] = [{ label: "All" }, ...(Object.keys(STATUS_LABEL) as ListingStatus[]).map((k) => ({ key: k, label: STATUS_LABEL[k] }))];

  return (
    <>
      <AdminHeader
        title="Directory listings"
        description="Only listings marked Approved for publication appear on the site, in search and in the AI helper."
        actions={
          <Link href="/admin/listings/new" className={btn.primary}>
            <Plus className="size-4" aria-hidden /> Add listing
          </Link>
        }
      />
      <Flash message={saved} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter by status" className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const active = (status ?? undefined) === t.key && !due;
            const n = t.key ? all.filter((l) => l.status === t.key).length : all.length;
            return (
              <Link
                key={t.label}
                href={t.key ? `/admin/listings?status=${t.key}` : "/admin/listings"}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[0.9rem] font-bold ${active ? "border-brand bg-brand text-paper" : "border-line bg-surface hover:border-brand"}`}
              >
                {t.label} <span className="opacity-70">{n}</span>
              </Link>
            );
          })}
          <Link
            href="/admin/listings?due=1"
            aria-current={due ? "page" : undefined}
            className={`inline-flex min-h-10 items-center rounded-full border px-3.5 text-[0.9rem] font-bold ${due ? "border-warn bg-warn text-paper" : "border-warn/40 bg-warn-soft text-warn"}`}
          >
            Due for review
          </Link>
        </nav>
        <form className="relative w-full sm:w-72">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="lq" className="sr-only">
            Search listings
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-2" aria-hidden />
          <input id="lq" name="q" defaultValue={q} placeholder="Search listings" className={`${input} pl-9`} />
        </form>
      </div>

      {rows.length ? (
        <div className="overflow-x-auto admin-card">
          <table className="w-full min-w-[44rem] text-left text-[0.95rem]">
            <thead className="admin-thead">
              <tr>
                <th scope="col" className="px-5 py-3 font-bold">
                  Service
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Status
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Checked
                </th>
                <th scope="col" className="px-3 py-3 font-bold">
                  Next review
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((l) => {
                const d = l.nextReviewDate ? relativeDays(l.nextReviewDate) : null;
                const reports = reportCount(l.id);
                return (
                  <tr key={l.id} className="hover:bg-brand-tint">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/listings/${l.id}`} className="font-bold hover:text-brand">
                        {l.name}
                      </Link>
                      <p className="text-[0.82rem] text-ink-2">
                        {PROVIDER_LABEL[l.providerType]}
                        {!l.feeConfirmed && " · fee unconfirmed"}
                        {!l.contactConfirmed && " · contact unconfirmed"}
                        {reports > 0 && <span className="font-bold text-urgent"> · {reports} report{reports > 1 ? "s" : ""}</span>}
                      </p>
                    </td>
                    <td className="px-3 py-3.5">
                      <ListingStatusBadge status={l.status} />
                    </td>
                    <td className="px-3 py-3.5 text-[0.88rem] text-ink-2">{formatDate(l.dateChecked) || "Not yet"}</td>
                    <td className={`px-3 py-3.5 text-[0.88rem] ${d !== null && d < 0 ? "font-bold text-urgent" : d !== null && d <= 30 ? "font-bold text-warn" : "text-ink-2"}`}>
                      {l.nextReviewDate ? formatDate(l.nextReviewDate) : "Not set"}
                      {d !== null && d < 0 && <span className="block text-xs">Overdue</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Empty>No listings match. Try another filter or add a new listing.</Empty>
      )}
    </>
  );
}
