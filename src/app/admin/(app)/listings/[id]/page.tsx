import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Flag, Trash2 } from "lucide-react";
import { readDb } from "@/lib/db";
import { areas, topics } from "@/lib/repo";
import { formatDateTime } from "@/lib/format";
import { deleteListing, markChecked } from "../../../actions";
import { AdminHeader, btn, ListingStatusBadge } from "@/components/admin/ui";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";
import { ListingForm } from "../ListingForm";

export const metadata = { title: "Edit listing" };

export default async function EditListing({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await ensureDb();
  const { id } = await params;
  const { saved } = await searchParams;
  const db = readDb();
  const listing = db.listings.find((l) => l.id === id);
  if (!listing) notFound();
  const reports = db.reports.filter((r) => r.listingId === id && !r.handled);

  return (
    <>
      <AdminHeader
        title={listing.name}
        back={{ href: "/admin/listings", label: "All listings" }}
        description={<ListingStatusBadge status={listing.status} />}
        actions={
          <>
            <form action={markChecked}>
              <input type="hidden" name="id" value={listing.id} />
              <SubmitButton className={btn.secondary} pendingText="Saving...">
                <CalendarCheck className="size-4" aria-hidden /> Mark checked today
              </SubmitButton>
            </form>
            <form action={deleteListing}>
              <input type="hidden" name="id" value={listing.id} />
              <ConfirmButton className={btn.ghost} message={`Delete "${listing.name}" permanently? To hide it instead, change its status.`}>
                <Trash2 className="size-4" aria-hidden /> Delete
              </ConfirmButton>
            </form>
          </>
        }
      />
      {reports.length > 0 && (
        <div className="mb-6 rounded-2xl border border-accent/40 bg-accent-soft p-5">
          <p className="flex items-center gap-2 font-bold text-accent">
            <Flag className="size-5" aria-hidden /> {reports.length} open report{reports.length > 1 ? "s" : ""} from visitors
          </p>
          <ul className="mt-2 space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="text-ink">
                &ldquo;{r.message}&rdquo; <span className="text-sm text-ink-2">· {formatDateTime(r.createdAt)}</span>
              </li>
            ))}
          </ul>
          <Link href="/admin/inbox" className="mt-2 inline-block text-sm font-bold text-accent underline">
            Mark as handled in the inbox
          </Link>
        </div>
      )}
      <ListingForm listing={listing} topics={topics()} areas={areas()} flash={saved} />
    </>
  );
}
