import Link from "next/link";
import { Activity, CircleHelp, Clock, Download, ExternalLink, Eye, Footprints, Mail, MapPin, MousePointerClick, Phone, Search, ShieldCheck, Sparkles, Users, X, type LucideIcon } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/db";
import { FILTER_KEYS, RANGES, type Filters, type Report, type Totals } from "@/lib/analytics/aggregate";
import { analyticsReport } from "@/lib/analytics/report";
import { AnalyticsNotSetUp } from "@/lib/analytics/store";
import { AdminHeader, Card } from "@/components/admin/ui";
import { BarList, boardHref, Delta, fmt, SubHead, type Params } from "./parts";
import { TrendChart } from "./TrendChart";
import { HoursChart } from "./HoursChart";
import { InfoTip } from "./InfoTip";

export const metadata = { title: "Visitor analytics" };
export const dynamic = "force-dynamic";

const METRICS = {
  visitors: { label: "Visitors", get: (p: Report["series"][number]) => p.visitors },
  visits: { label: "Visits", get: (p: Report["series"][number]) => p.visits },
  pageviews: { label: "Page views", get: (p: Report["series"][number]) => p.pageviews },
} as const;
type MetricKey = keyof typeof METRICS;

const FILTER_LABEL: Record<keyof Filters, string> = { page: "Page", channel: "Channel", source: "Source", city: "Town", country: "Country", device: "Device" };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await ensureDb();
  await requireAdmin();
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).slice(0, 300) : undefined);
  const filters: Filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, one(k)]).filter(([, v]) => v)) as Filters;
  const metric: MetricKey = (one("metric") as MetricKey) in METRICS ? (one("metric") as MetricKey) : "visitors";
  const params: Params = { range: one("range"), metric: one("metric"), ...filters };

  let data: Awaited<ReturnType<typeof analyticsReport>>;
  try {
    data = await analyticsReport(one("range"), filters);
  } catch (err) {
    if (err instanceof AnalyticsNotSetUp) return <SetupNeeded />;
    throw err;
  }
  const { report: r, live } = data;
  const t = r.totals;
  const p = r.previous ?? undefined;
  const vs = r.previous ? `vs previous ${r.range.key === "today" ? "day so far" : "period"}` : "";

  const perVisitor = t.visitors ? t.visits / t.visitors : 0;
  const tiles: { key: string; label: string; value: string; sub?: string; icon: LucideIcon; delta?: React.ReactNode; metric?: MetricKey; hint: string }[] = [
    {
      key: "visitors",
      label: "Visitors",
      value: fmt.n(t.visitors),
      icon: Users,
      delta: <Delta now={t.visitors} before={p?.visitors} count />,
      metric: "visitors",
      hint: "Different people on each day. No cookies are used, so someone who comes back on another day is counted again that day.",
    },
    {
      key: "visits",
      label: "Visits",
      value: fmt.n(t.visits),
      sub: t.visitors ? `${fmt.dec(perVisitor)} per visitor` : undefined,
      icon: Footprints,
      delta: <Delta now={t.visits} before={p?.visits} count />,
      metric: "visits",
      hint: "Each time someone comes to the site. A visit ends after 30 minutes without activity, so one person can make several visits in a day.",
    },
    {
      key: "pageviews",
      label: "Page views",
      value: fmt.n(t.pageviews),
      sub: t.visits ? `${fmt.dec(t.pagesPerVisit)} per visit` : undefined,
      icon: Eye,
      delta: <Delta now={t.pageviews} before={p?.pageviews} count />,
      metric: "pageviews",
      hint: "Every page opened. \"Page not found\" screens are left out.",
    },
    {
      key: "time",
      label: "Average visit",
      value: fmt.ms(t.avgVisitMs),
      icon: Clock,
      delta: <Delta now={t.avgVisitMs} before={p?.avgVisitMs} />,
      hint: "How long the site was on screen during a visit, on average. Time with the tab in the background isn't counted.",
    },
    {
      key: "bounce",
      label: "Bounce rate",
      value: fmt.pct(t.bounceRate),
      icon: Activity,
      delta: <Delta now={t.bounceRate} before={p?.bounceRate} upIsGood={false} percentPoints />,
      hint: "Visits that left within 10 seconds after one page, without doing anything. Lower is better. Around 40 to 60% is usual for an information site.",
    },
    {
      key: "action",
      label: "Help found",
      value: fmt.pct(t.actionRate),
      icon: MousePointerClick,
      delta: <Delta now={t.actionRate} before={p?.actionRate} percentPoints />,
      hint: "Visits where someone went on to a service's website, tapped a phone number or email, downloaded a resource, or got a useful answer from the helper. The clearest sign Hadamley helped.",
    },
  ];

  const active = FILTER_KEYS.filter((k) => filters[k]);
  const empty = t.visits === 0 && !active.length;
  // Early days: too few visits for percentages and comparisons to mean much yet.
  const early = !empty && !active.length && t.visits < 30;
  const series = r.series.map((pt) => ({ key: pt.key, label: pt.label, value: METRICS[metric].get(pt) }));
  const SECTIONS = [
    ["trend", "Over time"],
    ["pages", "Pages"],
    ["sources", "Sources"],
    ["help", "Help found"],
    ["where", "Where & devices"],
    ["landing", "Landing & hours"],
  ] as const;

  return (
    <>
      <AdminHeader
        title="Visitor analytics"
        description="How many people find Hadamley, what they read, where they come from and whether they find help. Anonymous and cookieless."
        actions={
          <nav aria-label="Date range" className="flex flex-wrap gap-1 rounded-xl border border-line bg-surface p-1">
            {RANGES.map((x) => (
              <Link
                key={x.key}
                href={boardHref(params, { range: x.key === "30d" ? undefined : x.key })}
                aria-current={r.range.key === x.key ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-[0.88rem] font-bold transition ${r.range.key === x.key ? "bg-[var(--brand)] text-[var(--paper)]" : "text-ink-2 hover:bg-paper-2 hover:text-ink"}`}
              >
                {x.short}
              </Link>
            ))}
          </nav>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.88rem] font-bold">
          <span className="relative flex size-2.5">
            {live.visitors > 0 && <span className="absolute inline-flex size-full animate-ping rounded-full bg-ok opacity-60 motion-reduce:hidden" />}
            <span className={`relative inline-flex size-2.5 rounded-full ${live.visitors > 0 ? "bg-ok" : "bg-ink-2/40"}`} />
          </span>
          {live.visitors} {live.visitors === 1 ? "person" : "people"} on the site now
        </span>
        <span className="text-[0.86rem] text-ink-2">{r.range.label}{vs ? `, compared with the previous ${r.range.key === "today" ? "day" : "period"}` : ""}</span>
        {active.map((k) => (
          <Link
            key={k}
            href={boardHref(params, { [k]: undefined })}
            className="inline-flex items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-[0.86rem] font-bold text-brand ring-1 ring-inset ring-brand/20 hover:bg-brand-soft"
            title="Remove this filter"
          >
            {FILTER_LABEL[k]}: {k === "page" ? r.pages.find((x) => x.key === filters[k])?.label ?? filters[k] : filters[k]}
            <X className="size-3.5" aria-hidden />
            <span className="sr-only">(remove filter)</span>
          </Link>
        ))}
        {active.length > 1 && (
          <Link href={boardHref({ range: params.range, metric: params.metric }, {})} className="text-[0.86rem] font-bold text-ink-2 underline hover:text-ink">
            Clear all
          </Link>
        )}
      </div>

      {(empty || early) && (
        <div className="mb-6 flex gap-3 rounded-xl border border-brand/20 bg-brand-tint px-4 py-4">
          <Sparkles className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
          <div>
            {empty ? (
              <>
                <p className="font-bold">No visits recorded for {r.range.label.toLowerCase()} yet.</p>
                <p className="text-[0.92rem] text-ink-2">Visits appear here as soon as people use the site. Your own visits from this device are never counted, even after you sign out.</p>
              </>
            ) : (
              <>
                <p className="font-bold">Early days: {t.visits} {t.visits === 1 ? "visit" : "visits"} so far.</p>
                <p className="text-[0.92rem] text-ink-2">With only a few visits, percentages swing a lot. The trends become meaningful after a couple of weeks. Your own visits are never counted.</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {tiles.map((tile) => {
          const selected = tile.metric === metric;
          return (
            <div
              key={tile.key}
              className={`admin-card relative p-4 text-left has-[[aria-expanded=true]]:z-30 ${tile.metric ? "admin-card-hover" : ""} ${selected ? "ring-2 ring-[var(--brand)]" : ""}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="flex min-h-7 items-center gap-2 text-[0.86rem] font-bold text-ink-2">
                  <tile.icon className={`hidden size-4 shrink-0 sm:block ${selected ? "text-brand" : ""}`} aria-hidden />
                  {tile.metric ? (
                    // The whole card is the link (the after: layer); the ⓘ sits above it.
                    <Link
                      href={boardHref(params, { metric: tile.metric === "visitors" ? undefined : tile.metric })}
                      aria-current={selected ? "true" : undefined}
                      className="after:absolute after:inset-0 after:rounded-[1rem] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-[var(--focus)]"
                    >
                      {tile.label}
                      <span className="sr-only">: show on the chart</span>
                    </Link>
                  ) : (
                    tile.label
                  )}
                </span>
                <InfoTip label={tile.label}>{tile.hint}</InfoTip>
              </div>
              <span className="mt-1.5 block text-[1.85rem] font-bold leading-none tracking-tight">{tile.value}</span>
              <span className="mt-1.5 block min-h-[1.1rem] text-[0.8rem] text-ink-2">{tile.sub ?? ""}</span>
              <span className="mt-1 block min-h-5">{tile.delta}</span>
            </div>
          );
        })}
      </div>

      <nav
        aria-label="Jump to a section"
        className="no-scrollbar sticky top-0 z-20 -mx-4 mt-4 flex gap-1 overflow-x-auto bg-paper-2/90 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10"
      >
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className="shrink-0 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.84rem] font-bold text-ink-2 transition hover:border-brand hover:text-brand">
            {label}
          </a>
        ))}
      </nav>

      <Card className="mt-2 scroll-mt-16" id="trend" title={`${METRICS[metric].label} ${r.range.bucket === "hour" ? "by hour" : r.range.bucket === "month" ? "by month" : "by day"}`} description="Choose Visitors, Visits or Page views above to change the chart.">
        <TrendChart points={series} metric={METRICS[metric].label} />
        <details className="mt-3">
          <summary className="cursor-pointer text-[0.86rem] font-bold text-brand hover:underline">Show as a table</summary>
          <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-line">
            <table className="w-full text-[0.88rem]">
              <thead className="admin-thead sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Period</th>
                  <th className="px-3 py-2 text-right">Visitors</th>
                  <th className="px-3 py-2 text-right">Visits</th>
                  <th className="px-3 py-2 text-right">Page views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {r.series.map((pt) => (
                  <tr key={pt.key}>
                    <td className="px-3 py-1.5">{pt.label}</td>
                    <td className="px-3 py-1.5 text-right">{pt.visitors}</td>
                    <td className="px-3 py-1.5 text-right">{pt.visits}</td>
                    <td className="px-3 py-1.5 text-right">{pt.pageviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Card>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <Card id="pages" className="scroll-mt-16" title="Top pages" description="What people read. Select a page to see only visits that included it.">
          <BarList
            rows={r.pages}
            head="Page"
            params={params}
            filterKey="page"
            cols={[
              { label: "Visitors", get: (x) => fmt.n(x.value) },
              { label: "Views", get: (x) => fmt.n(x.second ?? 0) },
              { label: "Time", get: (x) => (x.third ? fmt.ms(x.third) : "–"), wide: true },
            ]}
          />
        </Card>

        <Card id="sources" className="scroll-mt-16" title="Where visitors come from" description="The channel and website that brought each visit.">
          <SubHead>Channels</SubHead>
          <BarList rows={r.channels} head="Channel" params={params} filterKey="channel" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Visits", get: (x) => fmt.n(x.second ?? 0) }]} />
          <SubHead>Websites and apps</SubHead>
          <BarList rows={r.sources} head="Source" params={params} filterKey="source" empty="No referring websites yet. Visits from bookmarks, typed addresses and some apps show as Direct." cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Visits", get: (x) => fmt.n(x.second ?? 0) }]} />
          {r.campaigns.length > 0 && (
            <>
              <SubHead>Campaigns</SubHead>
              <BarList rows={r.campaigns} head="Campaign · source · medium" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Visits", get: (x) => fmt.n(x.second ?? 0) }]} />
            </>
          )}
        </Card>
      </div>

      <Card id="help" className="mt-4 scroll-mt-16" title="Signposting: did people find help?" description="The actions that show a visit turned into support found. Counted without recording who did them.">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {(
            [
              ["Went to a service's website", r.actions.outbound, ExternalLink],
              ["Tapped a phone number", r.actions.phone, Phone],
              ["Tapped an email address", r.actions.email, Mail],
              ["Downloaded a resource", r.actions.download, Download],
              ["Asked the helper", r.actions.helper, CircleHelp],
              ["Searched the site", r.actions.search, Search],
            ] as [string, number, LucideIcon][]
          ).map(([label, n, Icon]) => (
            <div key={label} className="rounded-xl bg-paper-2 px-3 py-3">
              <Icon className="size-4 text-ink-2" aria-hidden />
              <p className="mt-1.5 text-[1.4rem] font-bold leading-none">{fmt.n(n)}</p>
              <p className="mt-1 text-[0.82rem] leading-snug text-ink-2">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-6 xl:grid-cols-2">
          <div>
            <SubHead>Most viewed services in Find Support</SubHead>
            <BarList rows={r.services} head="Service" params={params} filterKey="page" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Views", get: (x) => fmt.n(x.second ?? 0) }]} empty="No service pages viewed yet." />
          </div>
          <div>
            <SubHead>Websites people went on to</SubHead>
            <BarList rows={r.outbound} head="Website" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Clicks", get: (x) => fmt.n(x.second ?? 0) }]} empty="No one has followed a link to another website yet." />
          </div>
          <div>
            <SubHead>Downloads</SubHead>
            <BarList rows={r.downloads} head="File" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Downloads", get: (x) => fmt.n(x.second ?? 0), wide: true }]} empty="No downloads yet." />
          </div>
          <div>
            <SubHead>What people searched for</SubHead>
            <BarList rows={r.searches} head="Search" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Times", get: (x) => fmt.n(x.second ?? 0) }]} empty="No searches yet." />
          </div>
          <div>
            <SubHead>Phone numbers and emails tapped</SubHead>
            <BarList rows={r.calls} head="Contact" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Taps", get: (x) => fmt.n(x.second ?? 0) }]} empty="No phone or email taps yet." />
          </div>
          <div>
            <SubHead>Ask Hadamley replies</SubHead>
            <BarList rows={r.helper} head="Reply" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Replies", get: (x) => fmt.n(x.second ?? 0) }]} empty="No helper questions yet." />
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <Card id="where" className="scroll-mt-16" title="Locations" description="Approximate, from the visitor's internet connection. Mobile networks often show as London." aside={<LocalShare t={t} />}>
          <SubHead>Towns and cities</SubHead>
          <BarList rows={r.cities} head="Town" params={params} filterKey="city" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Visits", get: (x) => fmt.n(x.second ?? 0) }]} />
          <SubHead>Countries</SubHead>
          <BarList rows={r.countries} head="Country" params={params} filterKey="country" limit={5} cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Visits", get: (x) => fmt.n(x.second ?? 0) }]} />
        </Card>

        <Card title="Devices" description="What people use to read Hadamley.">
          <BarList rows={r.devices} head="Device" params={params} filterKey="device" cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }, { label: "Share", get: (x) => fmt.pct(x.second! / Math.max(t.visits, 1)) }]} />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <SubHead>Browsers</SubHead>
              <BarList rows={r.browsers} head="Browser" limit={5} cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }]} />
            </div>
            <div>
              <SubHead>Systems</SubHead>
              <BarList rows={r.os} head="System" limit={5} cols={[{ label: "Visitors", get: (x) => fmt.n(x.value) }]} />
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card id="landing" className="scroll-mt-16" title="Landing pages" description="The first page of each visit, usually from Google or a shared link. A high bounce rate can mean the page didn't match what people were looking for.">
          <BarList
            rows={r.landing}
            head="Page"
            params={params}
            filterKey="page"
            cols={[
              { label: "Visits", get: (x) => fmt.n(x.second ?? 0) },
              { label: "Bounce", get: (x) => fmt.pct(x.third ?? 0) },
            ]}
          />
        </Card>
        <Card title="When people visit" description="Visits by hour of the day, UK time. Hover or tap a bar for the figure.">
          <HoursChart hours={r.hours} />
          {live.pages.length > 0 && (
            <>
              <SubHead>Being read right now</SubHead>
              <ul className="space-y-1 text-[0.9rem]">
                {live.pages.slice(0, 5).map(([path, n]) => (
                  <li key={path} className="flex justify-between gap-3">
                    <span className="truncate">{r.pages.find((x) => x.key === path)?.label ?? path}</span>
                    <span className="font-bold tabular-nums">{n}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Card>
      </div>

      <div className="mt-4 flex gap-3 rounded-xl border border-line bg-surface px-4 py-4 text-[0.9rem] text-ink-2">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
        <p>
          <strong className="text-ink">Privacy by design.</strong> No cookies or tracking scripts from other companies, so no cookie banner is needed. IP addresses are never stored: each visitor gets an anonymous code that changes every day. Helper questions and search terms are never linked to a person. Records are deleted after 13 months. Admin visits are not counted.
        </p>
      </div>
    </>
  );
}

function LocalShare({ t }: { t: Totals }) {
  if (t.localShare === null) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl bg-ok-soft px-3 py-2 text-ok" title="Share of visits with a known town that came from Havering, Brentwood and neighbouring towns.">
      <MapPin className="size-4" aria-hidden />
      <span className="text-[0.86rem] font-bold">{fmt.pct(t.localShare)} local</span>
    </div>
  );
}

function SetupNeeded() {
  return (
    <>
      <AdminHeader title="Visitor analytics" description="One step left before visits can be counted." />
      <Card title="Create the analytics table in Supabase">
        <ol className="list-decimal space-y-2 pl-5 text-[0.95rem]">
          <li>Open your Supabase project and go to the SQL Editor.</li>
          <li>
            Paste in the contents of <code className="rounded bg-paper-2 px-1.5 py-0.5">supabase/migrations/0002_analytics.sql</code> and run it.
          </li>
          <li>Reload this page. Visits are counted from that moment on.</li>
        </ol>
      </Card>
    </>
  );
}
