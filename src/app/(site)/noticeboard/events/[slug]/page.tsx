import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Clock, ExternalLink, MapPin, Monitor, PoundSterling } from "lucide-react";
import { eventParts, getEvent, londonNow } from "@/lib/notice";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const e = getEvent((await params).slug);
  return e ? { title: e.title, description: e.summary } : {};
}

export default async function EventPage({ params }: Props) {
  const e = getEvent((await params).slug);
  if (!e) notFound();
  const s = eventParts(e.startsAt);
  const end = e.endsAt ? eventParts(e.endsAt) : null;
  const past = (e.endsAt || e.startsAt) < londonNow();
  const mapHref = !e.online && e.location ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(e.location)}` : null;

  return (
    <>
      <PageHero crumbs={[{ label: "Noticeboard", href: "/noticeboard" }, { label: e.title }]} eyebrow={<span className="kicker text-accent">{past ? "This event has finished" : "Event"}</span>} title={e.title} summary={e.summary} />
      <Container className="grid gap-10 pt-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <article className="prose-h" dangerouslySetInnerHTML={{ __html: e.body }} />
        <aside className="card-print h-fit p-6" aria-label="Event details">
          <dl className="space-y-4">
            <div className="flex gap-3">
              <dt>
                <Clock className="mt-0.5 size-5" aria-hidden />
                <span className="sr-only">When</span>
              </dt>
              <dd>
                <span className="block font-bold">{s.long}</span>
                {s.time}
                {end && ` to ${end.time}`}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt>
                {e.online ? <Monitor className="mt-0.5 size-5" aria-hidden /> : <MapPin className="mt-0.5 size-5" aria-hidden />}
                <span className="sr-only">Where</span>
              </dt>
              <dd>
                {e.location}
                {mapHref && (
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" className="link mt-1 block text-[0.92rem] font-bold">
                    Get directions <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </dd>
            </div>
            <div className="flex gap-3">
              <dt>
                <PoundSterling className="mt-0.5 size-5" aria-hidden />
                <span className="sr-only">Cost</span>
              </dt>
              <dd>{e.cost || "Free"}</dd>
            </div>
          </dl>
          {!past && (
            <div className="mt-6 grid gap-2">
              {e.bookingUrl && (
                <a href={e.bookingUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-ink px-5 font-bold text-paper">
                  Book or register <ExternalLink className="size-4" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              )}
              <a href={`/noticeboard/events/${e.slug}/calendar.ics`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-[1.5px] border-ink px-5 font-bold hover:bg-sand">
                <CalendarPlus className="size-4" aria-hidden /> Add to my calendar
              </a>
            </div>
          )}
        </aside>
      </Container>
      <Container className="pt-10">
        <Link href="/noticeboard" className="inline-flex items-center gap-2 font-bold hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Back to the noticeboard
        </Link>
        <Disclaimer className="mt-8" />
      </Container>
    </>
  );
}
