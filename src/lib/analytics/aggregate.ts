import { isLocalPlace, sourceLabel } from "./classify";
import { addDays, londonDate, londonHour, londonMidnight } from "./time";
import type { EventName, Hit } from "./types";

/**
 * Turns raw records into the numbers on the analytics board, using the usual
 * industry definitions:
 *
 * - Visitor: one person (browser) on one day. The anonymous id changes daily,
 *   so over a longer range this counts "visitor-days".
 * - Visit (session): page views from one visitor with no gap over 30 minutes.
 * - Engaged visit: lasted 10 seconds or more, viewed 2+ pages, or included a
 *   key action. Bounce rate is the share of visits that were not engaged (GA4).
 * - Key actions: leaving for a service's website, tapping a phone number or
 *   email address, downloading a resource, searching, asking the helper.
 */

export const SESSION_GAP_MS = 30 * 60_000;
const ENGAGED_MS = 10_000;

export type RangeKey = "today" | "7d" | "30d" | "90d" | "12m";
export const RANGES: { key: RangeKey; label: string; short: string }[] = [
  { key: "today", label: "Today", short: "Today" },
  { key: "7d", label: "Last 7 days", short: "7 days" },
  { key: "30d", label: "Last 30 days", short: "30 days" },
  { key: "90d", label: "Last 90 days", short: "90 days" },
  { key: "12m", label: "Last 12 months", short: "12 months" },
];

export interface Range {
  key: RangeKey;
  label: string;
  from: Date;
  to: Date;
  prevFrom: Date;
  bucket: "hour" | "day" | "month";
}

export function resolveRange(key: string | undefined, now = new Date()): Range {
  const k = (RANGES.find((r) => r.key === key)?.key ?? "30d") as RangeKey;
  const today = londonDate(now);
  const to = now;
  const days = k === "today" ? 1 : k === "7d" ? 7 : k === "30d" ? 30 : k === "90d" ? 90 : 0;
  let fromDay: string;
  if (k === "12m") {
    const [y, m] = today.split("-").map(Number);
    fromDay = new Date(Date.UTC(y! - 1, m!, 1)).toISOString().slice(0, 10); // first of the month, 11 months back
  } else fromDay = addDays(today, -(days - 1));
  const from = londonMidnight(fromDay);
  const prevFrom = new Date(from.getTime() - (to.getTime() - from.getTime()));
  return { key: k, label: RANGES.find((r) => r.key === k)!.label, from, to, prevFrom, bucket: k === "today" ? "hour" : k === "12m" ? "month" : "day" };
}

export interface Filters {
  page?: string;
  channel?: string;
  source?: string;
  city?: string;
  country?: string;
  device?: string;
}
export const FILTER_KEYS: (keyof Filters)[] = ["page", "channel", "source", "city", "country", "device"];

export interface Session {
  visitor: string;
  start: number;
  end: number;
  pages: { path: string; at: number }[];
  events: Hit[];
  engagedMs: number;
  /** The first page view: where the visit came from and on what. */
  first: Hit;
}

/** Groups records into visits. Expects records oldest first. */
export function buildSessions(hits: Hit[]): Session[] {
  const byVisitor = new Map<string, Hit[]>();
  for (const h of hits) {
    const list = byVisitor.get(h.visitor);
    if (list) list.push(h);
    else byVisitor.set(h.visitor, [h]);
  }
  const out: Session[] = [];
  for (const [visitor, list] of byVisitor) {
    let cur: Session | null = null;
    for (const h of list) {
      const at = Date.parse(h.at);
      const stale = !cur || at - cur.end > SESSION_GAP_MS;
      if (h.kind === "pageview") {
        if (stale) {
          cur = { visitor, start: at, end: at, pages: [], events: [], engagedMs: 0, first: h };
          out.push(cur);
        }
        cur!.pages.push({ path: h.path, at });
        cur!.end = at;
      } else if (cur && !stale) {
        if (h.kind === "event") cur.events.push(h);
        else cur.engagedMs += h.ms ?? 0;
        cur.end = Math.max(cur.end, at);
      }
    }
  }
  return out.sort((a, b) => a.start - b.start);
}

export const sessionDuration = (s: Session) => Math.max(s.engagedMs, s.end - s.start);
export const isEngaged = (s: Session) => s.pages.length >= 2 || sessionDuration(s) >= ENGAGED_MS || s.events.some((e) => e.name !== "search");

/**
 * "Help found": went on to a service's website, tapped a phone number or email,
 * downloaded a resource, or got a useful helper reply (an answer, urgent-help
 * details or the Funeral Companion link). Searching, and helper replies that
 * found nothing, show interest but not help found.
 */
export const isHelpFound = (e: Hit) => e.name !== "search" && !(e.name === "helper" && (e.target === "not_found" || e.target === "error"));

function matches(s: Session, f: Filters) {
  if (f.page && !s.pages.some((p) => p.path === f.page)) return false;
  if (f.channel && s.first.channel !== f.channel) return false;
  if (f.source !== undefined && f.source !== "" && sourceLabel(s.first.refHost) !== f.source) return false;
  if (f.city && (s.first.city || "Unknown") !== f.city) return false;
  if (f.country && (s.first.country || "Unknown") !== f.country) return false;
  if (f.device && s.first.device !== f.device) return false;
  return true;
}

export interface Totals {
  visitors: number;
  visits: number;
  pageviews: number;
  pagesPerVisit: number;
  avgVisitMs: number;
  bounceRate: number;
  /** Share of visits where help was found (see isHelpFound). */
  actionRate: number;
  actions: number;
  /** Share of visits located in the local area, of those with a known town. */
  localShare: number | null;
}

export function totalsOf(sessions: Session[]): Totals {
  const visits = sessions.length;
  const pageviews = sessions.reduce((n, s) => n + s.pages.length, 0);
  const engaged = sessions.filter(isEngaged).length;
  const acting = sessions.filter((s) => s.events.some(isHelpFound)).length;
  const located = sessions.filter((s) => s.first.city);
  return {
    visitors: new Set(sessions.map((s) => s.visitor)).size,
    visits,
    pageviews,
    pagesPerVisit: visits ? pageviews / visits : 0,
    avgVisitMs: visits ? sessions.reduce((n, s) => n + sessionDuration(s), 0) / visits : 0,
    bounceRate: visits ? 1 - engaged / visits : 0,
    actionRate: visits ? acting / visits : 0,
    actions: sessions.reduce((n, s) => n + s.events.filter(isHelpFound).length, 0),
    localShare: located.length ? located.filter((s) => isLocalPlace(s.first.city)).length / located.length : null,
  };
}

export interface Row {
  key: string;
  label: string;
  /** The main number: visitors for most lists. */
  value: number;
  /** A second number: page views, visits or count. */
  second?: number;
  /** A third: average time (ms) or bounce rate (0-1). */
  third?: number;
  local?: boolean;
}

function rank<T>(items: Iterable<T>, keyOf: (t: T) => string, labelOf: (k: string) => string = (k) => k) {
  const m = new Map<string, { visitors: Set<string>; n: number }>();
  for (const it of items) {
    const k = keyOf(it);
    const e = m.get(k) ?? { visitors: new Set(), n: 0 };
    m.set(k, e);
    e.n++;
    const v = (it as unknown as { visitor?: string }).visitor;
    if (v) e.visitors.add(v);
  }
  return [...m.entries()]
    .map(([key, e]): Row => ({ key, label: labelOf(key), value: e.visitors.size || e.n, second: e.n }))
    .sort((a, b) => b.value - a.value || (b.second ?? 0) - (a.second ?? 0) || a.label.localeCompare(b.label));
}

export interface Point {
  key: string;
  label: string;
  visitors: number;
  visits: number;
  pageviews: number;
}

function bucketKeys(range: Range): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  if (range.bucket === "hour") {
    const last = londonHour(range.to);
    for (let h = 0; h <= last; h++) out.push({ key: String(h), label: `${String(h).padStart(2, "0")}:00` });
    return out;
  }
  if (range.bucket === "month") {
    const start = londonDate(range.from);
    const [y, m] = start.split("-").map(Number);
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(y!, m! - 1 + i, 1));
      out.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" }) });
    }
    return out;
  }
  const end = londonDate(range.to);
  for (let d = londonDate(range.from); d <= end; d = addDays(d, 1)) {
    out.push({ key: d, label: new Date(`${d}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }) });
  }
  return out;
}

function bucketOf(range: Range, at: number) {
  if (range.bucket === "hour") return String(londonHour(at));
  const d = londonDate(at);
  return range.bucket === "month" ? d.slice(0, 7) : d;
}

export interface Report {
  range: Range;
  filters: Filters;
  totals: Totals;
  previous: Totals | null;
  series: Point[];
  pages: Row[];
  landing: Row[];
  channels: Row[];
  sources: Row[];
  campaigns: Row[];
  cities: Row[];
  countries: Row[];
  devices: Row[];
  browsers: Row[];
  os: Row[];
  actions: Record<EventName, number>;
  downloads: Row[];
  outbound: Row[];
  calls: Row[];
  searches: Row[];
  services: Row[];
  helper: Row[];
  hours: number[];
}

export type Labeller = (path: string) => string;

/**
 * Builds the whole board. `hits` must cover range.prevFrom to range.to so the
 * previous period can be compared; pass compare=false to skip it.
 */
export function buildReport(hits: Hit[], range: Range, filters: Filters = {}, labelOf: Labeller = (p) => p, compare = true): Report {
  const fromMs = range.from.getTime();
  const all = buildSessions(hits).filter((s) => matches(s, filters));
  const sessions = all.filter((s) => s.start >= fromMs);
  const prev = compare ? all.filter((s) => s.start >= range.prevFrom.getTime() && s.start < fromMs) : [];

  // Over time
  const buckets = bucketKeys(range);
  const idx = new Map(buckets.map((b, i) => [b.key, i]));
  const series: Point[] = buckets.map((b) => ({ ...b, visitors: 0, visits: 0, pageviews: 0 }));
  const seen = buckets.map(() => new Set<string>());
  for (const s of sessions) {
    const i = idx.get(bucketOf(range, s.start));
    if (i !== undefined) {
      series[i]!.visits++;
      seen[i]!.add(s.visitor);
    }
    for (const p of s.pages) {
      const j = idx.get(bucketOf(range, p.at));
      if (j !== undefined) series[j]!.pageviews++;
    }
  }
  seen.forEach((v, i) => (series[i]!.visitors = v.size));

  // Pages: visitors, views and average time on page
  const pageViews = sessions.flatMap((s) => s.pages.map((p) => ({ ...p, visitor: s.visitor })));
  const time = new Map<string, { ms: number; n: number }>();
  for (const h of hits) {
    if (h.kind !== "engage" || Date.parse(h.at) < fromMs) continue;
    const t = time.get(h.path) ?? { ms: 0, n: 0 };
    t.ms += h.ms ?? 0;
    t.n++;
    time.set(h.path, t);
  }
  const pages = rank(pageViews, (p) => p.path, labelOf).map((r) => {
    const t = time.get(r.key);
    return { ...r, third: t?.n ? t.ms / t.n : undefined };
  });

  // Landing pages with bounce rate
  const landing = rank(sessions, (s) => s.first.path, labelOf).map((r) => {
    const group = sessions.filter((s) => s.first.path === r.key);
    return { ...r, third: group.length ? group.filter((s) => !isEngaged(s)).length / group.length : 0 };
  });

  const firsts = sessions.map((s) => ({ ...s.first, visitor: s.visitor }));
  const events = sessions.flatMap((s) => s.events.map((e) => ({ ...e, visitor: s.visitor })));
  const ofKind = (n: EventName) => events.filter((e) => e.name === n);
  const actions = Object.fromEntries((["outbound", "phone", "email", "download", "search", "helper"] as EventName[]).map((n) => [n, ofKind(n).length])) as Record<EventName, number>;

  const hours = Array.from({ length: 24 }, () => 0);
  for (const s of sessions) hours[londonHour(s.start)]!++;

  return {
    range,
    filters,
    totals: totalsOf(sessions),
    previous: compare ? totalsOf(prev) : null,
    series,
    pages,
    landing,
    channels: rank(firsts, (h) => h.channel || "Direct"),
    sources: rank(firsts, (h) => sourceLabel(h.refHost)).filter((r) => r.key !== "Direct / none"),
    campaigns: rank(
      firsts.filter((h) => h.utmCampaign || h.utmSource),
      (h) => [h.utmCampaign || "(no campaign)", h.utmSource, h.utmMedium].filter(Boolean).join(" · "),
    ),
    cities: rank(firsts, (h) => h.city || "Unknown").map((r) => ({ ...r, local: isLocalPlace(r.key) })),
    countries: rank(firsts, (h) => h.country || "Unknown"),
    devices: rank(firsts, (h) => h.device || "Desktop"),
    browsers: rank(firsts, (h) => h.browser || "Other"),
    os: rank(firsts, (h) => h.os || "Other"),
    actions,
    downloads: rank(ofKind("download"), (e) => e.target || "Unknown file"),
    outbound: rank(ofKind("outbound"), (e) => (e.target || "").split("/")[0] || "Unknown site"),
    calls: rank([...ofKind("phone"), ...ofKind("email")], (e) => `${e.name === "phone" ? "Phone" : "Email"}: ${e.target || "unknown"}`),
    searches: rank(ofKind("search"), (e) => e.target || ""),
    services: rank(
      pageViews.filter((p) => /^\/find-support\/[^/]+$/.test(p.path)),
      (p) => p.path,
      labelOf,
    ),
    helper: rank(ofKind("helper"), (e) => e.target || "answer", (k) => HELPER_LABEL[k] ?? k),
    hours,
  };
}

const HELPER_LABEL: Record<string, string> = {
  answer: "Answered with sources",
  not_found: "Couldn't find an answer",
  crisis: "Shown urgent help",
  funeral: "Sent to The Funeral Companion",
  error: "Helper error",
};

/** Visitors active in the last few minutes, and the pages they are on. */
export function liveNow(hits: Hit[], now = Date.now(), windowMs = 5 * 60_000) {
  const recent = hits.filter((h) => now - Date.parse(h.at) <= windowMs);
  const last = new Map<string, string>();
  for (const h of recent) if (h.kind === "pageview") last.set(h.visitor, h.path);
  const pages = new Map<string, number>();
  for (const p of last.values()) pages.set(p, (pages.get(p) ?? 0) + 1);
  return { visitors: new Set(recent.map((h) => h.visitor)).size, pages: [...pages.entries()].sort((a, b) => b[1] - a[1]) };
}
