import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, CalendarCheck, ExternalLink, Flag, Search, ShieldCheck } from "lucide-react";
import { approvedListings, areas, childPages, getPublishedPage, getSettings, publishedResources, topics } from "@/lib/repo";
import { formatDate } from "@/lib/format";
import { PROVIDER_LABEL } from "@/lib/types";
import { Container, Disclaimer, SectionIcon } from "@/components/site/bits";
import { AskButton } from "@/components/site/HelperWidget";
import { ResourceCard } from "@/components/site/ResourceCard";
import { Backdrop, Aurora } from "@/components/fx/Aurora";
import { CountUp, Reveal, RotatingWord, Spotlight, Stagger } from "@/components/fx/motion";
import { HeroCollage } from "@/components/home/HeroCollage";
import { Marquee } from "@/components/home/Marquee";
import { ChatDemo, type DemoTurn } from "@/components/home/ChatDemo";
import { Eyebrow } from "@/components/site/PageHero";

const PANELS = [
  { slug: "chronic-illness-support", blurb: "Therapy, rehabilitation, hospitals and living well with a long term condition or disability." },
  { slug: "mobility-daily-living-transport", blurb: "Equipment, accessible transport, assessments and help with costs." },
  { slug: "mental-health-support", blurb: "Talking therapies, community groups and support you can contact yourself." },
  { slug: "find-support", blurb: "Search local services by need, area and how you want to be seen." },
  { slug: "resources", blurb: "Free checklists, guides and worksheets to download or print." },
];

function WaveArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 200" className="pointer-events-none absolute -bottom-6 -right-6 w-[70%] opacity-60 transition-transform duration-700 group-hover:scale-105">
      <defs>
        <linearGradient id="wv" x1="0" x2="1">
          <stop offset="0" stopColor="var(--glow-1)" stopOpacity="0" />
          <stop offset="0.5" stopColor="var(--glow-1)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--glow-2)" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M0 ${150 - i * 18} C 100 ${110 - i * 22}, 220 ${190 - i * 14}, 400 ${120 - i * 20}`} fill="none" stroke="url(#wv)" strokeWidth={1.5} />
      ))}
    </svg>
  );
}

export default function HomePage() {
  const home = getPublishedPage("");
  const { funeralCompanionUrl } = getSettings();
  const listings = approvedListings();
  const resources = publishedResources();
  const topicList = topics();
  const areaList = areas();

  const physio = listings.find((l) => l.selfReferral === "yes" && l.topicIds.includes("t-physiotherapy")) ?? listings[0];
  const preview = physio && {
    name: physio.name,
    summary: physio.summary,
    provider: PROVIDER_LABEL[physio.providerType],
    area: areaList.find((a) => physio.areaIds.includes(a.id))?.name.replace(/ \(.*\)/, "") ?? "Local",
    checked: formatDate(physio.dateChecked).replace(/ \d{4}$/, ""),
    referral: physio.referralRoute,
  };

  const transport = listings.find((l) => l.extras.passengerStaysInWheelchair === "yes");
  const script: DemoTurn[] = [
    transport
      ? {
          q: "Is there transport where I can stay in my wheelchair?",
          a: `${transport.name}: ${transport.summary} The provider confirms passengers can stay in their wheelchair.`,
          src: [transport.name, "Accessible transport"],
        }
      : { q: "How do I get to hospital if I can't travel?", a: "You may be eligible for free NHS patient transport. Eligibility is based on medical need.", src: ["Accessible transport"] },
    physio
      ? { q: "Can I refer myself for physiotherapy?", a: `${physio.name} says: "${physio.referralRoute}" Other services need a GP referral, so check each listing.`, src: [physio.name, "Physiotherapy and movement"] }
      : { q: "Can I refer myself for physiotherapy?", a: "Some services accept self-referral and others need a GP referral. Each listing shows exactly what the provider says.", src: ["Physiotherapy and movement"] },
  ];

  const marquee = [
    ...topicList.map((t) => ({ label: t.name, href: `/find-support?topic=${t.slug}` })),
    ...areaList.filter((a) => a.slug !== "online-national").map((a) => ({ label: a.name.replace(/ \(.*\)/, ""), href: `/find-support?area=${a.slug}` })),
  ];

  return (
    <>
      {/* ------------------------------------------------------------ Hero */}
      <section className="grain relative isolate overflow-hidden">
        <Backdrop />
        <Container className="relative z-10 grid items-center gap-10 pb-16 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:pb-28 lg:pt-20">
          <div>
            <Reveal y={10}>
              <Eyebrow>
                {listings.length} local services, each checked and dated
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.08}>
              <h1 className="mt-7 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.03em] text-[var(--hero-ink)] sm:text-[3.9rem] lg:text-[4.6rem]">
                Find support for
                <br />
                <RotatingWord
                  className="text-gradient italic font-normal pb-1"
                  words={["physiotherapy", "getting around", "your wellbeing", "daily living", "caring for others"]}
                  srText="your health, mobility and wellbeing"
                />
                <br />
                close to home.
              </h1>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mt-7 max-w-xl text-[1.18rem] leading-relaxed text-ink-2">
                {home?.summary ?? "Clear, local information for people living with long term conditions, disability and mental health needs."}
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <form action="/find-support" role="search" className="mt-9 max-w-xl">
                <label htmlFor="hero-q" className="sr-only">
                  What are you looking for?
                </label>
                <div className="conic-border rounded-[1.4rem] p-[2px] shadow-glow">
                  <div className="flex items-center gap-2 rounded-[1.3rem] bg-surface p-2">
                    <Search className="ml-3 size-5 shrink-0 text-brand" aria-hidden />
                    <input
                      id="hero-q"
                      name="q"
                      type="search"
                      placeholder="Try physiotherapy or community transport"
                      className="min-h-12 w-full min-w-0 bg-transparent px-2 text-[1.05rem] outline-none placeholder:text-ink-2/80 focus-visible:shadow-none focus-visible:outline-none"
                    />
                    <button type="submit" className="group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-2xl bg-grad-brand px-5 font-bold text-white shadow-glow transition hover:brightness-110">
                      Search
                      <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                    </button>
                  </div>
                </div>
              </form>
            </Reveal>
            <Reveal delay={0.32}>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[0.95rem] text-ink-2">
                {[
                  { icon: BadgeCheck, t: "Checked at the source" },
                  { icon: CalendarCheck, t: "Dated on every listing" },
                  { icon: ShieldCheck, t: "Free, no sign-up" },
                ].map(({ icon: Icon, t }) => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <Icon className="size-[1.1rem] text-brand" aria-hidden /> {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {preview && <HeroCollage preview={preview} />}
        </Container>

        <div className="relative z-10 pb-10">
          <Marquee items={marquee} label="Browse by topic or area" />
        </div>
      </section>

      {/* ------------------------------------------------------------ Bento */}
      <section aria-labelledby="explore-title" className="relative py-20 sm:py-28">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-[0.85rem] font-bold uppercase tracking-[0.18em] text-accent">Explore</p>
            <h2 id="explore-title" className="mt-3 text-[2.3rem] font-semibold leading-tight sm:text-[3rem]">
              What do you need <span className="text-gradient italic font-normal">help with?</span>
            </h2>
            <p className="mt-4 text-lg text-ink-2">Every section can be browsed from the menu. Pick the one closest to what you need.</p>
          </Reveal>

          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-6" itemClassNames={PANELS.map((_, i) => (i < 2 ? "h-full sm:col-span-2 lg:col-span-3" : i === PANELS.length - 1 ? "h-full sm:col-span-2 lg:col-span-2" : "h-full lg:col-span-2"))}>
            {PANELS.map((p, i) => {
              const page = getPublishedPage(p.slug);
              if (!page) return null;
              const kids = childPages(page.id).slice(0, 3);
              const big = i < 2;
              return (
                <Spotlight
                  key={p.slug}
                  className={`ring-grad group h-full rounded-[var(--radius-card)] border border-line bg-surface shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift`}
                >
                  <article className={`relative flex h-full flex-col p-7 ${big ? "sm:p-9 min-h-[19rem]" : "min-h-[16rem]"}`}>
                    {big && <WaveArt />}
                    <div className="flex items-start justify-between">
                      <SectionIcon section={p.slug} className={big ? "size-16" : "size-14"} />
                      <span className="grid size-11 place-items-center rounded-full border border-line text-ink-2 transition duration-300 group-hover:rotate-45 group-hover:border-transparent group-hover:bg-grad-brand group-hover:text-white">
                        <ArrowUpRight className="size-5" aria-hidden />
                      </span>
                    </div>
                    <h3 className={`mt-6 font-semibold leading-tight ${big ? "text-[1.85rem]" : "text-[1.4rem]"}`}>
                      <Link href={`/${page.slug}`} className="after:absolute after:inset-0 after:z-10 after:rounded-[var(--radius-card)]">
                        {page.title}
                      </Link>
                    </h3>
                    <p className="relative mt-2.5 max-w-md text-ink-2">{p.blurb}</p>
                    {kids.length > 0 && (
                      <ul className="relative z-20 mt-auto flex flex-wrap gap-2 pt-6">
                        {kids.map((k) => (
                          <li key={k.id}>
                            <Link href={`/${k.slug}`} className="inline-block rounded-full border border-line bg-paper/80 px-3.5 py-1.5 text-[0.88rem] font-bold text-ink backdrop-blur transition hover:border-brand hover:text-brand">
                              {k.navLabel || k.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                    {p.slug === "find-support" && (
                      <p className="relative mt-auto pt-6 font-display text-[2.6rem] font-semibold leading-none text-gradient">
                        <CountUp to={listings.length} />
                        <span className="ml-2 font-sans text-base font-bold text-ink-2">services</span>
                      </p>
                    )}
                    {p.slug === "resources" && (
                      <p className="relative mt-auto pt-6 font-display text-[2.6rem] font-semibold leading-none text-gradient">
                        <CountUp to={resources.length} />
                        <span className="ml-2 font-sans text-base font-bold text-ink-2">free downloads</span>
                      </p>
                    )}
                  </article>
                </Spotlight>
              );
            })}
          </Stagger>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Helper band */}
      <section aria-labelledby="helper-title" className="relative isolate overflow-hidden bg-[#06282b] py-20 text-white sm:py-28">
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,#0f6b66_0%,transparent_60%),radial-gradient(ellipse_70%_60%_at_100%_100%,#1d5f86_0%,transparent_60%),radial-gradient(ellipse_40%_40%_at_70%_20%,rgba(255,180,140,0.25)_0%,transparent_70%)]" />
        <Aurora soft className="opacity-60" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]" />
        <Container className="relative z-10 grid items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
          <Reveal>
            <p className="text-[0.85rem] font-bold uppercase tracking-[0.18em] text-[#ffc49a]">The Hadamley helper</p>
            <h2 id="helper-title" className="mt-4 text-[2.4rem] font-semibold leading-[1.05] sm:text-[3.2rem]">
              Ask in your own words.
              <br />
              <span className="bg-[linear-gradient(100deg,#a8f0e2,#8fcaf0,#ffc49a)] bg-clip-text italic font-normal text-transparent">Get a clear answer.</span>
            </h2>
            <p className="mt-6 max-w-lg text-[1.12rem] leading-relaxed text-white/80">
              The helper searches only the information Hadamley has checked, then answers with links to the source. It never guesses, and it never gives medical advice.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {["Only approved, published content", "Every answer links its sources", "Fixed NHS 111 and 999 message for urgent wording", "No accounts, no personal details stored"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[0.98rem] text-white/90">
                  <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-[#5fd3bf]/20">
                    <span className="size-2 rounded-full bg-[#5fd3bf]" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <AskButton className="group mt-10 inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 text-[1.05rem] font-bold text-[#073b3e] shadow-[0_10px_40px_-8px_rgba(95,211,191,0.6)] transition hover:-translate-y-0.5">
              Try the helper
              <span className="grid size-8 place-items-center rounded-full bg-grad-brand text-white transition group-hover:translate-x-0.5">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </AskButton>
          </Reveal>
          <Reveal delay={0.15}>
            <ChatDemo script={script} />
          </Reveal>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Trust */}
      <section aria-labelledby="trust-title" className="py-20 sm:py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <p className="text-[0.85rem] font-bold uppercase tracking-[0.18em] text-accent">How we check</p>
            <h2 id="trust-title" className="mt-3 text-[2.3rem] font-semibold leading-tight sm:text-[2.8rem]">
              Information you can <span className="text-gradient italic font-normal">rely on</span>
            </h2>
          </Reveal>
          <div className="relative mt-14">
            <div aria-hidden="true" className="absolute left-0 right-0 top-8 hidden h-px bg-[linear-gradient(90deg,transparent,var(--glow-1),var(--glow-2),var(--glow-3),transparent)] md:block" />
            <Stagger as="ol" className="relative grid gap-6 md:grid-cols-3">
              {[
                { icon: BadgeCheck, title: "Checked at the source", text: "Every listing is checked against the provider's own published information before it goes live." },
                { icon: CalendarCheck, title: "Dated and reviewed", text: "Each listing shows when it was last checked, and is reviewed on a regular schedule." },
                { icon: Flag, title: "Tell us what changed", text: "Spotted something out of date? Report it from any listing and we will look into it." },
              ].map(({ icon: Icon, title, text }, i) => (
                <div key={title} className="group">
                  <span className="relative grid size-16 place-items-center rounded-2xl bg-grad-brand text-white shadow-glow transition duration-500 group-hover:-rotate-6 group-hover:scale-105">
                    <Icon className="size-7" aria-hidden />
                    <span className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full border-2 border-paper bg-surface font-display text-sm font-semibold text-ink">{i + 1}</span>
                  </span>
                  <h3 className="mt-6 text-[1.35rem] font-semibold">{title}</h3>
                  <p className="mt-2 text-ink-2">{text}</p>
                </div>
              ))}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Resources */}
      {resources.length > 0 && (
        <section aria-labelledby="res-title" className="pb-20 sm:pb-24">
          <Container>
            <Reveal className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="res-title" className="text-[2.1rem] font-semibold">
                Free guides and checklists
              </h2>
              <Link href="/resources" className="group inline-flex items-center gap-2 font-bold text-brand">
                All resources
                <span className="grid size-8 place-items-center rounded-full border border-line transition group-hover:border-transparent group-hover:bg-grad-brand group-hover:text-white">
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </Link>
            </Reveal>
            <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
              {resources.slice(0, 3).map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      {/* ------------------------------------------------------------ Funeral Companion */}
      <section aria-labelledby="tfc-title">
        <Container>
          <Reveal>
            <div className="grain relative isolate overflow-hidden rounded-[2rem] border border-line p-8 sm:p-12">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,var(--sand)_0%,var(--accent-soft)_60%,var(--brand-soft)_100%)]" />
              <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <h2 id="tfc-title" className="text-[1.9rem] font-semibold leading-tight">
                    Looking for bereavement or funeral support?
                  </h2>
                  <p className="mt-3 text-lg text-ink-2">Information about grief, bereavement and arranging a funeral is on our sister site, The Funeral Companion.</p>
                </div>
                <a
                  href={funeralCompanionUrl}
                  target="_blank"
                  rel="noopener"
                  className="group inline-flex min-h-14 shrink-0 items-center gap-2 self-start rounded-full bg-ink px-6 font-bold text-paper transition hover:-translate-y-0.5 sm:self-auto"
                >
                  Visit The Funeral Companion <ExternalLink className="size-4 transition group-hover:translate-x-0.5" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </div>
            </div>
          </Reveal>
          <Disclaimer className="mt-8" />
        </Container>
      </section>
    </>
  );
}
