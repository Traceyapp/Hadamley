import fs from "node:fs";
import path from "node:path";
import { DATA_DIR, useSupabase } from "../store/config";
import { supabase } from "../store/client";
import type { Hit } from "./types";

/**
 * Where analytics records live. Kept apart from the main site data (which is
 * loaded into memory whole), because records only ever get added.
 *
 * Supabase: the analytics_events table (supabase/migrations/0002_analytics.sql).
 * Local file: data/analytics.jsonl, one record per line.
 *
 * Records older than RETAIN_DAYS are deleted, at most once a day.
 */

const TABLE = "analytics_events";
export const RETAIN_DAYS = 400;
const FILE = () => path.join(DATA_DIR, "analytics.jsonl");

const COLS: [keyof Hit, string][] = [
  ["at", "at"],
  ["kind", "kind"],
  ["path", "path"],
  ["name", "name"],
  ["target", "target"],
  ["ms", "ms"],
  ["visitor", "visitor"],
  ["refHost", "ref_host"],
  ["channel", "channel"],
  ["utmSource", "utm_source"],
  ["utmMedium", "utm_medium"],
  ["utmCampaign", "utm_campaign"],
  ["device", "device"],
  ["browser", "browser"],
  ["os", "os"],
  ["country", "country"],
  ["region", "region"],
  ["city", "city"],
];

function toRow(h: Hit) {
  const row: Record<string, unknown> = {};
  for (const [k, col] of COLS) row[col] = h[k] ?? null;
  return row;
}

function fromRow(row: Record<string, unknown>): Hit {
  const h: Record<string, unknown> = {};
  for (const [k, col] of COLS) {
    const v = row[col];
    if (v === null || v === undefined) {
      if (k === "name" || k === "target" || k === "ms") continue;
      h[k] = "";
    } else h[k] = k === "at" ? new Date(v as string).toISOString() : v;
  }
  return h as unknown as Hit;
}

const g = globalThis as unknown as { __hadamleyAnalyticsPurged?: string };

export async function recordHits(hits: Hit[]) {
  if (!hits.length) return;
  if (useSupabase()) {
    const { error } = await supabase().from(TABLE).insert(hits.map(toRow));
    if (error) throw new Error(`Could not save analytics: ${error.message}`);
  } else {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.appendFileSync(FILE(), hits.map((h) => JSON.stringify(h)).join("\n") + "\n");
  }
  await purgeOld();
}

async function purgeOld() {
  const today = new Date().toISOString().slice(0, 10);
  if (g.__hadamleyAnalyticsPurged === today) return;
  g.__hadamleyAnalyticsPurged = today;
  const cutoff = new Date(Date.now() - RETAIN_DAYS * 86_400_000).toISOString();
  try {
    if (useSupabase()) {
      await supabase().from(TABLE).delete().lt("at", cutoff);
    } else if (fs.existsSync(FILE())) {
      const keep = readFile().filter((h) => h.at >= cutoff);
      fs.writeFileSync(FILE(), keep.map((h) => JSON.stringify(h)).join("\n") + (keep.length ? "\n" : ""));
    }
  } catch (err) {
    console.error("[analytics] purge failed", err);
  }
}

function readFile(): Hit[] {
  if (!fs.existsSync(FILE())) return [];
  const out: Hit[] = [];
  for (const line of fs.readFileSync(FILE(), "utf8").split("\n")) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line));
    } catch {
      // A half-written line from a crash: skip it.
    }
  }
  return out;
}

export class AnalyticsNotSetUp extends Error {}

/** Every record from `since` (inclusive) to `until` (exclusive), oldest first. */
export async function loadHits(since: Date, until: Date): Promise<Hit[]> {
  const from = since.toISOString();
  const to = until.toISOString();
  if (!useSupabase()) return readFile().filter((h) => h.at >= from && h.at < to).sort((a, b) => a.at.localeCompare(b.at));

  const sb = supabase();
  const { count, error } = await sb.from(TABLE).select("id", { count: "exact", head: true }).gte("at", from).lt("at", to);
  if (error) {
    if (/does not exist|schema cache|Could not find the table/i.test(error.message)) throw new AnalyticsNotSetUp(error.message);
    throw new Error(`Could not load analytics: ${error.message}`);
  }
  // Supabase sends at most 1,000 rows per request, so fetch pages a few at a time.
  const page = 1000;
  const starts: number[] = [];
  for (let s = 0; s < (count ?? 0); s += page) starts.push(s);
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < starts.length; i += 8) {
    const batch = await Promise.all(
      starts.slice(i, i + 8).map(async (s) => {
        const { data, error: e } = await sb
          .from(TABLE)
          .select(COLS.map(([, c]) => c).join(","))
          .gte("at", from)
          .lt("at", to)
          .order("id")
          .range(s, s + page - 1);
        if (e) throw new Error(`Could not load analytics: ${e.message}`);
        return (data ?? []) as unknown as Record<string, unknown>[];
      }),
    );
    for (const b of batch) rows.push(...b);
  }
  return rows.map(fromRow).sort((a, b) => a.at.localeCompare(b.at));
}
