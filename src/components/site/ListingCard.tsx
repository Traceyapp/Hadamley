import Link from "next/link";
import { ArrowRight, MapPin, PoundSterling } from "lucide-react";
import type { Listing } from "@/lib/types";
import { readDb } from "@/lib/db";
import { CheckedDate, DeliveryList, ProviderBadge } from "./bits";

export function areaNames(l: Listing) {
  const db = readDb();
  return l.areaIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean) as string[];
}

/** A directory entry, set like a card in a printed guide. */
export function ListingCard({ listing, headingLevel = 3 }: { listing: Listing; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const areas = areaNames(listing);
  return (
    <article className="card-print card-print-hover group relative flex h-full flex-col p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ProviderBadge type={listing.providerType} />
        {listing.selfReferral === "yes" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-ink/30 px-2.5 py-0.5 text-[0.78rem] font-bold">
            <span className="size-1.5 rounded-full bg-ok" aria-hidden />
            Self-referral accepted
          </span>
        )}
      </div>
      <H className="mt-4 text-[1.4rem] font-semibold leading-snug">
        <Link href={`/find-support/${listing.id}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
          {listing.name}
        </Link>
      </H>
      <p className="mt-2 text-ink-2">{listing.summary}</p>
      <dl className="mt-5 space-y-2 border-t border-dashed border-line-strong pt-4 text-[0.93rem]">
        {areas.length > 0 && (
          <div className="flex gap-2.5">
            <dt className="shrink-0 pt-0.5">
              <MapPin className="size-4 text-ink-2" aria-hidden />
              <span className="sr-only">Area</span>
            </dt>
            <dd>{areas.join(", ")}</dd>
          </div>
        )}
        {listing.feeConfirmed && listing.fees && (
          <div className="flex gap-2.5">
            <dt className="shrink-0 pt-0.5">
              <PoundSterling className="size-4 text-ink-2" aria-hidden />
              <span className="sr-only">Fees</span>
            </dt>
            <dd className="line-clamp-2">{listing.fees}</dd>
          </div>
        )}
      </dl>
      <div className="mt-auto pt-5">
        <DeliveryList delivery={listing.delivery} />
        <div className="mt-4 flex items-center justify-between gap-3">
          <CheckedDate date={listing.dateChecked} />
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </div>
      </div>
    </article>
  );
}
