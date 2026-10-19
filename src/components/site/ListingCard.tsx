import Link from "next/link";
import { ArrowRight, MapPin, PoundSterling } from "lucide-react";
import type { Listing } from "@/lib/types";
import { readDb } from "@/lib/db";
import { CheckedDate, DeliveryList, ProviderBadge } from "./bits";

export function areaNames(l: Listing) {
  const db = readDb();
  return l.areaIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean) as string[];
}

export function ListingCard({ listing, headingLevel = 3 }: { listing: Listing; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const areas = areaNames(listing);
  return (
    <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-lift sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <ProviderBadge type={listing.providerType} />
        {listing.selfReferral === "yes" && (
          <span className="rounded-full border border-line px-2.5 py-0.5 text-[0.8rem] font-bold text-ink-2">Self-referral accepted</span>
        )}
      </div>
      <H className="mt-3 text-[1.3rem] font-semibold leading-snug">
        <Link href={`/find-support/${listing.id}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] group-hover:text-brand">
          {listing.name}
        </Link>
      </H>
      <p className="mt-2 text-ink-2">{listing.summary}</p>
      <dl className="mt-4 space-y-1.5 text-[0.92rem]">
        {areas.length > 0 && (
          <div className="flex gap-2">
            <dt className="shrink-0">
              <MapPin className="mt-0.5 size-4 text-ink-2" aria-hidden />
              <span className="sr-only">Area</span>
            </dt>
            <dd>{areas.join(", ")}</dd>
          </div>
        )}
        {listing.feeConfirmed && listing.fees && (
          <div className="flex gap-2">
            <dt className="shrink-0">
              <PoundSterling className="mt-0.5 size-4 text-ink-2" aria-hidden />
              <span className="sr-only">Fees</span>
            </dt>
            <dd className="line-clamp-2">{listing.fees}</dd>
          </div>
        )}
      </dl>
      <div className="mt-auto pt-4">
        <DeliveryList delivery={listing.delivery} />
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
          <CheckedDate date={listing.dateChecked} />
          <ArrowRight className="size-5 text-brand transition group-hover:translate-x-1" aria-hidden />
        </div>
      </div>
    </article>
  );
}
