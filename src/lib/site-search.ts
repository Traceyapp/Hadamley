import { readDb } from "./db";
import { htmlToText } from "./html";
import { tokenize } from "./ai/search";
import { londonNow } from "./notice";
import { PROVIDER_LABEL, KIND_LABEL } from "./types";

export type SearchKind = "service" | "page" | "download" | "news" | "event";

export interface SearchResult {
  kind: SearchKind;
  title: string;
  url: string;
  snippet: string;
  meta?: string;
  score: number;
}

type Doc = Omit<SearchResult, "score"> & { body: string };

/** Everything public, flattened for searching. Built per request from the live data. */
function docs(): Doc[] {
  const db = readDb();
  const out: Doc[] = [];
  for (const p of db.pages) {
    if (p.status !== "published" || p.template === "home") continue;
    out.push({ kind: "page", title: p.title, url: `/${p.slug}`, snippet: p.summary, body: `${p.summary} ${htmlToText(p.body)}` });
    for (const s of p.sections ?? []) {
      const text = htmlToText(s.body);
      out.push({ kind: "page", title: s.heading, url: `/${p.slug}#${s.id}`, snippet: text.slice(0, 160), meta: p.title, body: text });
    }
  }
  for (const l of db.listings) {
    if (l.status !== "approved") continue;
    const areas = l.areaIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
    const topics = l.topicIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean).join(" ");
    out.push({ kind: "service", title: l.name, url: `/find-support/${l.id}`, snippet: l.summary, meta: `${PROVIDER_LABEL[l.providerType]} · ${areas}`, body: `${l.summary} ${l.description} ${l.eligibility} ${topics} ${areas}` });
  }
  for (const r of db.resources) {
    if (r.status !== "published") continue;
    out.push({ kind: "download", title: r.title, url: `/files/${r.storedName}`, snippet: r.description, meta: `${KIND_LABEL[r.kind]} · ${r.fileName.split(".").pop()?.toUpperCase()}`, body: r.description });
  }
  for (const p of db.posts) {
    if (p.status !== "published") continue;
    out.push({ kind: "news", title: p.title, url: `/noticeboard/news/${p.slug}`, snippet: p.summary, body: `${p.summary} ${htmlToText(p.body)}` });
  }
  const now = londonNow();
  for (const e of db.events) {
    if (e.status !== "published" || (e.endsAt || e.startsAt) < now) continue;
    out.push({ kind: "event", title: e.title, url: `/noticeboard/events/${e.slug}`, snippet: e.summary, meta: e.location, body: `${e.summary} ${e.location} ${htmlToText(e.body)}` });
  }
  return out;
}

/**
 * Simple ranked search: every word typed must appear (by prefix, so "physio"
 * finds "physiotherapy"); title matches count most.
 */
export function siteSearch(q: string, limit = 30): SearchResult[] {
  const words = tokenize(q);
  if (!words.length) return [];
  const results: SearchResult[] = [];
  for (const d of docs()) {
    const title = tokenize(d.title);
    const body = tokenize(`${d.meta ?? ""} ${d.body}`);
    let score = 0;
    let all = true;
    for (const w of words) {
      const inTitle = title.filter((t) => t.startsWith(w)).length;
      const inBody = body.filter((t) => t.startsWith(w)).length;
      if (!inTitle && !inBody) {
        all = false;
        break;
      }
      score += inTitle * 6 + Math.min(inBody, 5);
    }
    if (!all) continue;
    if (d.title.toLowerCase().includes(q.trim().toLowerCase())) score += 10;
    const { body: _b, ...rest } = d;
    results.push({ ...rest, score });
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
