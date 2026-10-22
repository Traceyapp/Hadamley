import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { approvedListings, areas, childPages, getPublishedPage, getSettings, publishedResources, topics } from "@/lib/repo";
import { formatDate } from "@/lib/format";
import { PROVIDER_LABEL } from "@/lib/types";
import { Container, Disclaimer } from "@/components/site/bits";
import { AskButton } from "@/components/site/HelperWidget";
import { ResourceCard } from "@/components/site/ResourceCard";
import { AreaMap } from "@/components/site/AreaMap";
import { Reveal } from "@/components/fx/motion";
import { SectionArt, sectionClass } from "@/components/art/Landmarks";
import { type FinderListing } from "@/components/home/SentenceFinder";
import { LivingHero } from "@/components/home/LivingHero";
import { Morph } from "@/components/fx/Morph";
import { Stamp } from "@/components/fx/Stamp";
import { publishedPosts, upcomingEvents } from "@/lib/notice";
import { EventTicket, PostNote } from "@/components/notice/Cards";

const CHAPTERS = [
  { slug: "chronic-illness-support", blurb: "Therapy, rehabilitation, hospitals, and living well with a long term condition or disability." },
  { slug: "mobility-daily-living-transport", blurb: "Equipment, accessible transport, assessments and help with costs." },
  { slug: "mental-health-support", blurb: "Talking therapies, community groups and support you can contact yourself." },
  { slug: "find-support", blurb: "Every checked service in one place, searchable by need, area and how you want to be seen." },
  { slug: "resources", blurb: "Free checklists, guides and worksheets to print or fill in on screen." },
];

const QUESTIONS = ["Can I refer myself for physiotherapy?", "Where can I hire a wheelchair for a week?", "Who can help with anxiety?", "Is there help paying for a stairlift?"];

export default function HomePage() {
  const home = getPublishedPage("");
  const { funeralCompanionUrl } = getSettings();
  const listings = approvedListings();
  const areaList = areas();
  const resources = publishedResources();
  const nextEvents = upcomingEvents().slice(0, 2);
  const latestPost = publishedPosts()[0];
  const areaSlug = (id: string) => areaList.find((a) => a.id === id)?.slug ?? "";

  const finderListings: FinderListing[] = listings.map((l) => ({
    id: l.id,
    name: l.name,
    summary: l.summary,
    provider: PROVIDER_LABEL[l.providerType],
    topics: l.topicIds.map((id) => id.replace(/^t-/, "")),
    areas: l.areaIds.map(areaSlug),
    areaLabel: areaList.find((a) => a.id === l.areaIds[0])?.name.replace(/ \(.*\)/, "") ?? "Local",
    delivery: l.delivery,
    self: l.selfReferral === "yes",
    free: l.feeConfirmed && /\bfree\b/i.test(l.fees),
    checked: formatDate(l.dateChecked).replace(/ \d{4}$/, ""),
  }));
  const topicOpts = topics()
    .filter((t) => listings.some((l) => l.topicIds.includes(t.id)))
    .map((t) => ({ value: t.slug, label: t.name }));
  const areaOpts = areaList.filter((a) => !["havering", "online-national"].includes(a.slug)).map((a) => ({ value: a.slug, label: a.name }));

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <LivingHero listings={finderListings} topics={topicOpts} areas={areaOpts} summary={home?.summary} />

      {/* ------------------------------------------------------------ Contents */}
      <section aria-labelledby="contents-title" className="py-20 sm:py-24">
        <Container>
          <div className="flex items-end justify-between gap-6 border-b-[1.5px] border-ink pb-4">
            <h2 id="contents-title" className="text-[2.6rem] font-semibold leading-none sm:text-[3.4rem]">
              Contents
            </h2>
            <p className="hidden max-w-xs text-right text-ink-2 sm:block">Every section can also be reached from the menu at the top of each page.</p>
          </div>
          <ol>
            {CHAPTERS.map((c, i) => {
              const page = getPublishedPage(c.slug);
              if (!page) return null;
              const kids = childPages(page.id).slice(0, 3);
              return (
                <li key={c.slug} className={`${sectionClass(c.slug)} border-b border-line`}>
                  <Reveal delay={i * 0.04}>
                    <div className="group relative isolate grid items-center gap-x-8 gap-y-3 py-7 sm:grid-cols-[5rem_1fr_9rem] sm:py-8">
                      <span aria-hidden="true" className="absolute inset-y-0 -left-4 -right-4 -z-10 rounded-2xl bg-sec-soft opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="slide-on-scroll font-display text-[3.2rem] font-semibold leading-none text-sec">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="text-[1.65rem] font-semibold leading-tight sm:text-[2rem]">
                          <Link href={`/${page.slug}`} className="after:absolute after:inset-0 group-hover:underline group-hover:decoration-2 group-hover:underline-offset-4">
                            <Morph name={`page-${page.id}`}>
                              <span className="soft-hover inline-block">{page.title}</span>
                            </Morph>
                          </Link>
                        </h3>
                        <p className="mt-1.5 max-w-2xl text-ink-2">{c.blurb}</p>
                        {kids.length > 0 && (
                          <ul className="relative z-10 mt-3 flex flex-wrap gap-x-5 gap-y-1">
                            {kids.map((k) => (
                              <li key={k.id}>
                                <Link href={`/${k.slug}`} className="inline-flex items-center gap-1.5 text-[0.95rem] font-bold text-sec hover:underline">
                                  <span className="h-0.5 w-3 bg-current" aria-hidden /> {k.navLabel || k.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <SectionArt section={c.slug} className="sketch-on-scroll hidden h-24 w-36 transition-transform duration-500 group-hover:-rotate-2 group-hover:scale-105 sm:block" />
                    </div>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Map */}
      <section aria-labelledby="map-title" className="sec-find border-y-[1.5px] border-ink bg-paper-2 py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <p className="kicker text-sec">Support by area</p>
            <h2 id="map-title" className="mt-3 text-[2.4rem] font-semibold leading-[1.08] sm:text-[3rem]">
              What&apos;s near <span className="scribble">you?</span>
            </h2>
            <p className="mt-5 max-w-md text-[1.08rem] text-ink-2">
              Choose a town on the map to see the services that cover it. Borough-wide Havering services are counted in every Havering town.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2">
              {areaList
                .filter((a) => a.slug !== "online-national")
                .map((a) => (
                  <li key={a.id}>
                    <Link href={`/find-support?area=${a.slug}`} className="inline-flex min-h-10 items-center rounded-full border-[1.5px] border-ink bg-surface px-4 font-bold transition hover:bg-ink hover:text-paper">
                      {a.name.replace(/ \(.*\)/, "")}
                    </Link>
                  </li>
                ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="card-print p-4 sm:p-6">
              <AreaMap />
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Helper */}
      <section aria-labelledby="ask-title" className="py-20 sm:py-24">
        <Container className="grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
          <Reveal>
            <p className="kicker text-accent">Not sure what to search for?</p>
            <h2 id="ask-title" className="mt-3 text-[2.4rem] font-semibold leading-[1.08] sm:text-[3rem]">
              Ask a question in your own words.
            </h2>
            <p className="mt-5 max-w-lg text-[1.08rem] text-ink-2">
              The Hadamley helper looks only at information we have checked, and every answer links back to where it came from. It won&apos;t guess, and it can&apos;t give medical advice.
            </p>
            <AskButton className="card-print card-print-hover mt-8 inline-flex min-h-14 items-center gap-2.5 rounded-full bg-ink px-7 text-[1.05rem] font-bold text-paper">
              Open the helper <ArrowRight className="size-5" aria-hidden />
            </AskButton>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative pt-8">
              <p aria-hidden="true" className="absolute right-4 top-0 rotate-[4deg] font-hand text-[1.5rem] text-accent">
                try one of these ↓
              </p>
              <ul className="card-print divide-y divide-line overflow-hidden">
                {QUESTIONS.map((q) => (
                  <li key={q}>
                    <AskButton question={q} className="group flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-display text-[1.2rem] transition-colors hover:bg-accent-soft">
                      &ldquo;{q}&rdquo;
                      <ArrowRight className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-1" aria-hidden />
                    </AskButton>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.92rem] text-ink-2">Urgent words always bring up NHS 111 and 999 straight away, without the AI.</p>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Noticeboard */}
      {(nextEvents.length > 0 || latestPost) && (
        <section aria-labelledby="board-title" className="border-y-[1.5px] border-ink bg-paper-2 bg-[radial-gradient(var(--line-strong)_1px,transparent_1px)] [background-size:18px_18px] py-20 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kicker text-accent">On the noticeboard</p>
                <h2 id="board-title" className="mt-3 text-[2.4rem] font-semibold leading-[1.08] sm:text-[3rem]">
                  What&apos;s on <span className="scribble">locally</span>
                </h2>
              </div>
              <Link href="/noticeboard" className="inline-flex items-center gap-2 font-bold hover:underline">
                See the whole board <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-12 grid gap-x-6 gap-y-10 lg:grid-cols-3">
              {nextEvents.map((e, i) => (
                <li key={e.id}>
                  <EventTicket e={e} i={i} />
                </li>
              ))}
              {latestPost && (
                <li>
                  <PostNote p={latestPost} i={2} />
                </li>
              )}
            </ul>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------------ Trust */}
      <section aria-labelledby="trust-title" className="border-y-[1.5px] border-ink bg-[#1d1b16] py-20 text-[#f1ebdd] sm:py-24">
        <Container>
          <h2 id="trust-title" className="max-w-2xl text-[2.4rem] font-semibold leading-[1.08] sm:text-[3rem]">
            How we keep this guide honest
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {[
              { stamp: "Checked", title: "At the source", text: "Every listing is checked against the provider's own published information before it goes live." },
              { stamp: "Dated", title: "And reviewed", text: "Each listing shows when it was last checked, and comes up for review on a schedule." },
              { stamp: "Reported", title: "By you", text: "Spotted something out of date? Tell us from any listing. We read every report." },
            ].map((s, i) => (
              <li key={s.stamp}>
                <Reveal delay={i * 0.08}>
                  <Stamp
                    rotate={[-8, 5, -3][i]}
                    className="inline-grid size-28 place-items-center rounded-full border-[3px] border-double border-[#f0a07a] text-center font-display text-[1rem] font-bold uppercase tracking-[0.14em] text-[#f0a07a]"
                  >
                    {s.stamp}
                  </Stamp>
                  <h3 className="mt-6 text-[1.5rem] font-semibold">
                    <span className="sr-only">{s.stamp} </span>
                    {s.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-[#d9d1c1]">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Resources */}
      {resources.length > 0 && (
        <section aria-labelledby="res-title" className="sec-res py-20 sm:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-[1.5px] border-ink pb-4">
              <h2 id="res-title" className="text-[2.2rem] font-semibold leading-none sm:text-[2.8rem]">
                Pull-out sheets
              </h2>
              <Link href="/resources" className="inline-flex items-center gap-2 font-bold text-sec hover:underline">
                All {resources.length} downloads <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {resources.slice(0, 3).map((r, i) => (
                <li key={r.id}>
                  <Reveal delay={i * 0.06}>
                    <ResourceCard r={r} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------------ Funeral Companion */}
      <section aria-labelledby="tfc-title">
        <Container>
          <div className="flex flex-col gap-6 rounded-[var(--radius-card)] border-[1.5px] border-dashed border-ink p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="max-w-2xl">
              <h2 id="tfc-title" className="text-[1.7rem] font-semibold leading-tight">
                Looking for bereavement or funeral support?
              </h2>
              <p className="mt-2 text-ink-2">Grief, bereavement and arranging a funeral are covered by our sister site, The Funeral Companion.</p>
            </div>
            <a
              href={funeralCompanionUrl}
              target="_blank"
              rel="noopener"
              className="card-print card-print-hover inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full px-5 font-bold sm:self-auto"
            >
              The Funeral Companion <ExternalLink className="size-4" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <Disclaimer className="mt-8" />
        </Container>
      </section>
    </>
  );
}
