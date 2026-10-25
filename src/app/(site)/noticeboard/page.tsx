import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import { CalendarDays, Newspaper } from "lucide-react";
import { pastEvents, publishedPosts, upcomingEvents } from "@/lib/notice";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";
import { EventTicket, PostNote } from "@/components/notice/Cards";
import { eventParts } from "@/lib/notice";
import Link from "next/link";

export const metadata: Metadata = { title: "Noticeboard", description: "Local events and news from Hadamley." };

export default async function NoticeboardPage() {
  await ensureDb();
  const events = upcomingEvents();
  const posts = publishedPosts();
  const past = pastEvents(4);
  return (
    <>
      <PageHero crumbs={[{ label: "Noticeboard" }]} title="The noticeboard" summary="What's coming up locally, and news from Hadamley. Pinned here as soon as it's published." />
      <div className="border-b-[1.5px] border-ink bg-paper-2 bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:18px_18px] py-14 sm:py-16">
        <Container>
          <section aria-labelledby="events-title">
            <h2 id="events-title" className="flex items-center gap-3 text-[2rem] font-semibold">
              <CalendarDays className="size-7 text-accent" aria-hidden /> Coming up
            </h2>
            {events.length ? (
              <ul className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2">
                {events.map((e, i) => (
                  <li key={e.id}>
                    <EventTicket e={e} i={i} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-ink-2">No events are pinned up at the moment. Check back soon.</p>
            )}
          </section>

          <section aria-labelledby="news-title" className="mt-20">
            <h2 id="news-title" className="flex items-center gap-3 text-[2rem] font-semibold">
              <Newspaper className="size-7 text-accent" aria-hidden /> News
            </h2>
            {posts.length ? (
              <ul className="mt-10 grid gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((p, i) => (
                  <li key={p.id}>
                    <PostNote p={p} i={i} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 text-ink-2">No news yet.</p>
            )}
          </section>

          {past.length > 0 && (
            <section aria-labelledby="past-title" className="mt-16">
              <h2 id="past-title" className="kicker text-ink-2">
                Recently
              </h2>
              <ul className="mt-3 divide-y divide-line">
                {past.map((e) => (
                  <li key={e.id} className="flex flex-wrap gap-x-4 py-2 text-ink-2">
                    <span className="w-28 shrink-0">{eventParts(e.startsAt).long.replace(/^\w+ /, "")}</span>
                    <Link href={`/noticeboard/events/${e.slug}`} className="link">
                      {e.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </Container>
      </div>
      <Container className="pt-10">
        <Disclaimer />
      </Container>
    </>
  );
}
