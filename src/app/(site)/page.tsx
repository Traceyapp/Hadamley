import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, ExternalLink, Flag, MessageCircleQuestion, Search } from "lucide-react";
import { getPublishedPage, getSettings, publishedResources, approvedListings, childPages } from "@/lib/repo";
import { Container, Disclaimer, SectionIcon } from "@/components/site/bits";
import { AskButton } from "@/components/site/HelperWidget";
import { ResourceCard } from "@/components/site/ResourceCard";

const PANELS = [
  { slug: "chronic-illness-support", blurb: "Therapy, rehabilitation, hospitals and living well with a long term condition or disability." },
  { slug: "mobility-daily-living-transport", blurb: "Equipment, accessible transport, assessments and help with costs." },
  { slug: "mental-health-support", blurb: "Talking therapies, community groups and support you can contact yourself." },
  { slug: "find-support", blurb: "Search local services by need, area and how you want to be seen." },
  { slug: "resources", blurb: "Free checklists, guides and worksheets to download or print." },
];

const QUICK = [
  { label: "Physiotherapy", href: "/find-support?topic=physiotherapy" },
  { label: "Talking therapies", href: "/find-support?topic=mental-health" },
  { label: "Wheelchair hire", href: "/find-support?topic=equipment" },
  { label: "Accessible transport", href: "/find-support?topic=transport" },
  { label: "Home adaptations", href: "/find-support?topic=assessments-costs" },
];

export default function HomePage() {
  const home = getPublishedPage("");
  const { funeralCompanionUrl } = getSettings();
  const count = approvedListings().length;
  const resources = publishedResources().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-line">
        <Container className="grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:py-24">
          <div className="animate-rise">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-[0.85rem] font-bold text-ink-2">
              <span className="size-2 rounded-full bg-accent" aria-hidden />
              Havering · Romford · Brentwood
            </p>
            <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] sm:text-[3.4rem] lg:text-[4rem]">
              Find the right support, <em className="font-normal italic text-brand">close to home</em>
            </h1>
            <p className="mt-6 max-w-xl text-[1.15rem] leading-relaxed text-ink-2">
              {home?.summary ??
                "Clear, local information for people living with long term conditions, disability and mental health needs."}
            </p>

            <form action="/find-support" role="search" className="mt-8 max-w-xl">
              <label htmlFor="hero-q" className="mb-2 block font-bold">
                What are you looking for?
              </label>
              <div className="flex gap-2 rounded-2xl border-2 border-ink/80 bg-surface p-1.5 shadow-soft focus-within:border-brand">
                <Search className="ml-2 mt-3 size-5 shrink-0 text-ink-2" aria-hidden />
                <input
                  id="hero-q"
                  name="q"
                  type="search"
                  placeholder="For example, physiotherapy or community transport"
                  className="min-h-12 w-full min-w-0 bg-transparent px-2 text-[1.05rem] outline-none placeholder:text-ink-2/80 focus-visible:shadow-none focus-visible:outline-none"
                />
                <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-brand px-5 font-bold text-paper hover:bg-brand-strong">
                  Search
                </button>
              </div>
            </form>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-[0.9rem] text-ink-2">Popular:</span>
              {QUICK.map((q) => (
                <Link key={q.href} href={q.href} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[0.92rem] font-bold text-ink hover:border-brand hover:text-brand">
                  {q.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Helper teaser */}
          <div className="animate-rise relative [animation-delay:120ms]">
            <div className="absolute -inset-4 -z-10 rotate-2 rounded-[2rem] bg-brand-soft" aria-hidden />
            <div className="rounded-[1.75rem] border border-line bg-surface p-6 shadow-lift sm:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-paper">
                  <MessageCircleQuestion className="size-6" aria-hidden />
                </span>
                <div>
                  <h2 className="text-xl font-semibold">Not sure where to start?</h2>
                  <p className="text-[0.95rem] text-ink-2">Ask a question in your own words.</p>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-paper">Can I refer myself for physiotherapy?</div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-3 text-[0.95rem]">
                  It depends on the service. Some accept self-referral and others need a referral from your GP. Each listing shows exactly what the provider says.
                  <span className="mt-2 block text-[0.8rem] font-bold text-brand">Source: Physiotherapy and movement</span>
                </div>
              </div>
              <AskButton className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 font-bold text-paper hover:bg-brand-strong">
                Ask Hadamley <ArrowRight className="size-5" aria-hidden />
              </AskButton>
              <p className="mt-3 text-center text-[0.82rem] text-ink-2">Answers only from information checked by Hadamley.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Five panels */}
      <section aria-labelledby="explore-title" className="py-16 sm:py-20">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.85rem] font-bold uppercase tracking-[0.14em] text-accent">Explore</p>
              <h2 id="explore-title" className="mt-2 text-[2rem] font-semibold sm:text-[2.4rem]">
                What do you need help with?
              </h2>
            </div>
            <p className="max-w-md text-ink-2">Every section can be browsed from the menu. Pick the one closest to what you need.</p>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
            {PANELS.map((p, i) => {
              const page = getPublishedPage(p.slug);
              if (!page) return null;
              const kids = childPages(page.id).slice(0, 3);
              return (
                <li key={p.slug} className={i < 2 ? "lg:col-span-3" : "lg:col-span-2"}>
                  <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift sm:p-7">
                    <SectionIcon section={p.slug} className={i < 2 ? "size-14" : "size-12"} />
                    <h3 className={`mt-5 font-semibold leading-tight ${i < 2 ? "text-[1.6rem]" : "text-[1.35rem]"}`}>
                      <Link href={`/${page.slug}`} className="after:absolute after:inset-0 after:rounded-[var(--radius-card)] group-hover:text-brand">
                        {page.title}
                      </Link>
                    </h3>
                    <p className="mt-2 text-ink-2">{p.blurb}</p>
                    {kids.length > 0 && (
                      <ul className="relative z-10 mt-4 flex flex-wrap gap-2">
                        {kids.map((k) => (
                          <li key={k.id}>
                            <Link href={`/${k.slug}`} className="inline-block rounded-full bg-sand px-3 py-1 text-[0.88rem] font-bold text-ink hover:bg-brand-soft hover:text-brand-strong">
                              {k.navLabel || k.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-bold text-brand">
                      {p.slug === "find-support" ? `Search ${count} services` : "Explore"}
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </article>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      {/* Trust */}
      <section aria-labelledby="trust-title" className="border-y border-line bg-brand-tint py-16">
        <Container className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:items-start">
          <div>
            <h2 id="trust-title" className="text-[1.9rem] font-semibold leading-tight">
              Information you can rely on
            </h2>
            <p className="mt-3 text-ink-2">{home ? <span dangerouslySetInnerHTML={{ __html: home.body.replace(/<\/?p>/g, "") }} /> : null}</p>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3">
            {[
              { icon: BadgeCheck, title: "Checked at the source", text: "Every listing is checked against the provider's own published information before it goes live." },
              { icon: CalendarCheck, title: "Dated and reviewed", text: "Each listing shows when it was last checked, and is reviewed on a regular schedule." },
              { icon: Flag, title: "Tell us what changed", text: "Spotted something out of date? Report it from any listing and we will look into it." },
            ].map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl border border-line bg-surface p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-display text-2xl text-line-strong" aria-hidden>
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-[0.95rem] text-ink-2">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Resources */}
      {resources.length > 0 && (
        <section aria-labelledby="res-title" className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="res-title" className="text-[1.9rem] font-semibold">
                Free guides and checklists
              </h2>
              <Link href="/resources" className="inline-flex items-center gap-1.5 font-bold text-brand hover:underline">
                All resources <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
            <ul className="mt-8 grid gap-5 md:grid-cols-3">
              {resources.map((r) => (
                <li key={r.id}>
                  <ResourceCard r={r} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Funeral Companion */}
      <section aria-labelledby="tfc-title">
        <Container>
          <div className="flex flex-col gap-6 rounded-[1.75rem] border border-line bg-sand p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div className="max-w-2xl">
              <h2 id="tfc-title" className="text-[1.6rem] font-semibold">
                Looking for bereavement or funeral support?
              </h2>
              <p className="mt-2 text-ink-2">Information about grief, bereavement and arranging a funeral is on our sister site, The Funeral Companion.</p>
            </div>
            <a
              href={funeralCompanionUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-12 shrink-0 items-center gap-2 self-start rounded-full border-2 border-ink px-5 font-bold text-ink hover:bg-ink hover:text-paper sm:self-auto"
            >
              Visit The Funeral Companion <ExternalLink className="size-4" aria-hidden />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
          <Disclaimer className="mt-8" />
        </Container>
      </section>
    </>
  );
}
