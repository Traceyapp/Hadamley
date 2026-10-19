import Link from "next/link";
import { ArrowUpRight, MapPin, PoundSterling } from "lucide-react";
import type { Listing } from "@/lib/types";
import { readDb } from "@/lib/db";
import { Spotlight } from "@/components/fx/motion";
import { CheckedDate, DeliveryList, ProviderBadge } from "./bits";

export function areaNames(l: Listing) {
  const db = readDb();
  return l.areaIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean) as string[];
}

export function ListingCard({ listing, headingLevel = 3 }: { listing: Listing; headingLevel?: 2 | 3 }) {
  const H = `h${headingLevel}` as "h2" | "h3";
  const areas = areaNames(listing);
  return (
    <Spotlight className="ring-grad group h-full rounded-[var(--radius-card)] border border-line bg-surface shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
      <article className="relative flex h-full flex-col p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <ProviderBadge type={listing.providerType} />
            {listing.selfReferral === "yes" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-0.5 text-[0.78rem] font-bold text-ink-2">
                <span className="size-1.5 rounded-full bg-ok" aria-hidden />
                Self-referral accepted
              </span>
            )}
          </div>
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-grad-brand group-hover:text-white"
          >
            <ArrowUpRight className="size-[1.1rem]" />
          </span>
        </div>
        <H className="mt-4 text-[1.35rem] font-semibold leading-snug">
          <Link href={`/find-support/${listing.id}`} className="after:absolute after:inset-0 after:z-10 after:rounded-[var(--radius-card)] group-hover:text-brand">
            {listing.name}
          </Link>
        </H>
        <p className="mt-2 text-ink-2">{listing.summary}</p>
        <dl className="mt-5 space-y-2 text-[0.92rem]">
          {areas.length > 0 && (
            <div className="flex gap-2.5">
              <dt className="shrink-0">
                <span className="grid size-6 place-items-center rounded-lg bg-brand-tint text-brand">
                  <MapPin className="size-3.5" aria-hidden />
                </span>
                <span className="sr-only">Area</span>
              </dt>
              <dd className="pt-0.5">{areas.join(", ")}</dd>
            </div>
          )}
          {listing.feeConfirmed && listing.fees && (
            <div className="flex gap-2.5">
              <dt className="shrink-0">
                <span className="grid size-6 place-items-center rounded-lg bg-accent-soft text-accent">
                  <PoundSterling className="size-3.5" aria-hidden />
                </span>
                <span className="sr-only">Fees</span>
              </dt>
              <dd className="line-clamp-2 pt-0.5">{listing.fees}</dd>
            </div>
          )}
        </dl>
        <div className="mt-auto pt-5">
          <DeliveryList delivery={listing.delivery} />
          <div className="mt-4 border-t border-dashed border-line pt-4">
            <CheckedDate date={listing.dateChecked} />
          </div>
        </div>
      </article>
    </Spotlight>
  );
}
