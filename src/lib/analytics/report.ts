import { readDb } from "../db";
import { buildReport, liveNow, resolveRange, type Filters, type Report } from "./aggregate";
import { loadHits } from "./store";
import type { Hit } from "./types";

/** Loads what the board needs and builds the report. Recent loads are reused for a minute. */

const CACHE_MS = 60_000;
const g = globalThis as unknown as { __hadamleyAnalyticsCache?: Map<string, { at: number; hits: Hit[] }> };
const cache = (g.__hadamleyAnalyticsCache ??= new Map());

async function hitsFor(key: string, from: Date, to: Date) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.hits;
  const hits = await loadHits(from, to);
  cache.set(key, { at: Date.now(), hits });
  if (cache.size > 12) cache.delete(cache.keys().next().value!);
  return hits;
}

/** Page titles instead of addresses, where we know them. */
export function pageLabeller() {
  const db = readDb();
  const titles = new Map<string, string>();
  for (const p of db.pages) titles.set(p.slug ? `/${p.slug}` : "/", p.title === "Home" ? "Homepage" : p.title);
  for (const l of db.listings) titles.set(`/find-support/${l.id}`, l.name);
  for (const p of db.posts) titles.set(`/noticeboard/news/${p.slug}`, p.title);
  for (const e of db.events) titles.set(`/noticeboard/events/${e.slug}`, e.title);
  titles.set("/noticeboard", titles.get("/noticeboard") ?? "Noticeboard");
  titles.set("/search", titles.get("/search") ?? "Search");
  return (path: string) => titles.get(path) ?? path;
}

export async function analyticsReport(rangeKey: string | undefined, filters: Filters): Promise<{ report: Report; live: ReturnType<typeof liveNow> }> {
  const range = resolveRange(rangeKey);
  // A year against the year before would mean loading two years of records; compare shorter ranges only.
  const compare = range.key !== "12m";
  const minute = Math.floor(Date.now() / CACHE_MS);
  const hits = await hitsFor(`${range.key}:${minute}`, compare ? range.prevFrom : range.from, range.to);
  const report = buildReport(hits, range, filters, pageLabeller(), compare);
  report.downloads = report.downloads.map((r) => ({ ...r, label: downloadTitle(r.key) }));
  return { report, live: liveNow(hits) };
}

/** "Hadamley_My_Appointment_Notes.pdf" -> the resource's title, or a tidied file name. */
function downloadTitle(file: string) {
  const res = readDb().resources.find((r) => r.fileName === file || r.storedName === file);
  if (res) return res.title;
  return file.replace(/\.[a-z0-9]+$/i, "").replace(/^Hadamley[_ -]/i, "").replace(/[_-]+/g, " ");
}
