import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Globe, Mail, MapPin, Phone, Quote } from "lucide-react";
import { getApprovedListing, searchListings, taxonById } from "@/lib/repo";
import { formatDate, telHref } from "@/lib/format";
import { Breadcrumbs, CheckedDate, Container, DeliveryList, Disclaimer, ProviderBadge, TriStateText } from "@/components/site/bits";
import { ReportForm } from "@/components/site/ReportForm";
import { ListingCard } from "@/components/site/ListingCard";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = getApprovedListing((await params).id);
  return l ? { title: l.name, description: l.summary } : {};
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-line py-4 last:border-0 sm:grid-cols-[13rem_1fr] sm:gap-6">
      <dt className="font-bold text-ink">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

export default async function ListingPage({ params }: Props) {
  const l = getApprovedListing((await params).id);
  if (!l) notFound();

  const topics = l.topicIds.map(taxonById).filter(Boolean);
  const areas = l.areaIds.map(taxonById).filter(Boolean);
  const isMobility = l.topicIds.some((t) => ["t-equipment", "t-transport"].includes(t));
  const isTransport = l.topicIds.includes("t-transport");
  const related = searchListings({ topic: topics.slice(0, 1).map((t) => t!.slug) })
    .filter((x) => x.id !== l.id)
    .slice(0, 2);
  const hasContact = l.contactConfirmed && (l.phone || l.email || l.website || l.contactUrl);

  return (
    <>
      <header className="grain border-b border-line">
        <Container className="pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Find Support", href: "/find-support" }, { label: l.name }]} />
          <div className="mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <ProviderBadge type={l.providerType} />
              {topics.map((t) => (
                <Link key={t!.id} href={`/find-support?topic=${t!.slug}`} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-[0.8rem] font-bold text-ink-2 hover:border-brand hover:text-brand">
                  {t!.name}
                </Link>
              ))}
            </div>
            <h1 className="mt-4 text-[2.2rem] font-semibold leading-[1.1] sm:text-[2.8rem]">{l.name}</h1>
            <p className="mt-4 text-[1.15rem] text-ink-2">{l.summary}</p>
            <div className="mt-5">
              <CheckedDate date={l.dateChecked} />
            </div>
          </div>
        </Container>
      </header>

      <Container className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
        <div className="min-w-0 space-y-10">
          {l.referralRoute && (
            <section aria-labelledby="ref-title" className="rounded-[var(--radius-card)] border-2 border-brand/30 bg-brand-tint p-6">
              <h2 id="ref-title" className="font-sans text-[0.85rem] font-bold uppercase tracking-[0.12em] text-brand">
                How to get referred
              </h2>
              <blockquote className="mt-3 flex gap-3">
                <Quote className="mt-1 size-5 shrink-0 text-brand" aria-hidden />
                <p className="text-[1.15rem] font-bold leading-snug text-ink">{l.referralRoute}</p>
              </blockquote>
              <p className="mt-3 text-[0.9rem] text-ink-2">Shown exactly as the provider describes it.</p>
            </section>
          )}

          {l.description && (
            <section aria-labelledby="about-title">
              <h2 id="about-title" className="text-[1.6rem] font-semibold">
                About this service
              </h2>
              <p className="mt-3 max-w-[68ch] text-[1.05rem] leading-relaxed">{l.description}</p>
            </section>
          )}

          <section aria-labelledby="details-title">
            <h2 id="details-title" className="text-[1.6rem] font-semibold">
              Details
            </h2>
            <dl className="mt-3 rounded-[var(--radius-card)] border border-line bg-surface px-5 sm:px-6">
              {l.agesServed && <Row label="Ages served">{l.agesServed}</Row>}
              {l.eligibility && <Row label="Who can use it">{l.eligibility}</Row>}
              {areas.length > 0 && <Row label="Areas covered">{areas.map((a) => a!.name).join(", ")}</Row>}
              {l.delivery.length > 0 && (
                <Row label="How you are seen">
                  <DeliveryList delivery={l.delivery} />
                </Row>
              )}
              {l.feeConfirmed && l.fees && <Row label="Cost">{l.fees}</Row>}
              {!l.feeConfirmed && <Row label="Cost">Please check the cost with the provider.</Row>}
              {l.accessibility && <Row label="Accessibility">{l.accessibility}</Row>}
              {isMobility && l.extras.deliveryCollection && <Row label="Delivery or collection">{l.extras.deliveryCollection}</Row>}
              {isMobility && l.extras.bookingRequirements && <Row label="Booking">{l.extras.bookingRequirements}</Row>}
              {isMobility && l.extras.hireLoanTerms && <Row label="Hire or loan terms">{l.extras.hireLoanTerms}</Row>}
              {isTransport && (
                <Row label="Wheelchair accessible">
                  <TriStateText value={l.extras.wheelchairAccessible} />
                </Row>
              )}
              {isTransport && (
                <Row label="Stay in your wheelchair">
                  <TriStateText value={l.extras.passengerStaysInWheelchair} />
                </Row>
              )}
              <Row label="Last checked">{formatDate(l.dateChecked)}</Row>
            </dl>
          </section>

          {l.sourceUrls.length > 0 && (
            <section aria-labelledby="src-title">
              <h2 id="src-title" className="font-sans text-lg font-bold">
                Where this information comes from
              </h2>
              <ul className="mt-2 space-y-1">
                {l.sourceUrls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5 break-all">
                      {u.replace(/^https?:\/\//, "")} <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ReportForm listingId={l.id} listingName={l.name} />
          <Disclaimer />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-36 lg:self-start" aria-label="Contact details">
          <div className="rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-soft">
            <h2 className="text-xl font-semibold">Contact</h2>
            {hasContact ? (
              <ul className="mt-4 space-y-3">
                {l.phone && (
                  <li>
                    <a href={telHref(l.phone)} className="flex min-h-12 items-center gap-3 rounded-xl bg-brand px-4 font-bold text-paper hover:bg-brand-strong">
                      <Phone className="size-5" aria-hidden /> {l.phone}
                    </a>
                  </li>
                )}
                {l.email && (
                  <li>
                    <a href={`mailto:${l.email}`} className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-line-strong px-4 font-bold hover:border-brand hover:text-brand">
                      <Mail className="size-5 shrink-0" aria-hidden /> <span className="truncate">{l.email}</span>
                    </a>
                  </li>
                )}
                {(l.website || l.contactUrl) && (
                  <li>
                    <a href={l.website || l.contactUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center gap-3 rounded-xl border-2 border-line-strong px-4 font-bold hover:border-brand hover:text-brand">
                      <Globe className="size-5" aria-hidden /> Visit website <ExternalLink className="ml-auto size-4" aria-hidden />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-3 text-ink-2">Contact details are being confirmed. Please check back soon.</p>
            )}
            {l.address && (
              <p className="mt-5 flex gap-3 border-t border-line pt-5 text-ink">
                <MapPin className="mt-0.5 size-5 shrink-0 text-ink-2" aria-hidden />
                {l.address}
              </p>
            )}
          </div>
          <Link href="/find-support" className="inline-flex items-center gap-2 font-bold text-brand hover:underline">
            <ArrowLeft className="size-4" aria-hidden /> Back to all services
          </Link>
        </aside>
      </Container>

      {related.length > 0 && (
        <section aria-labelledby="rel-title" className="mt-16 border-t border-line pt-12">
          <Container>
            <h2 id="rel-title" className="text-[1.6rem] font-semibold">
              Similar services
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-2">
              {related.map((r) => (
                <li key={r.id}>
                  <ListingCard listing={r} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
    </>
  );
}
