import type { Database, Settings } from "../types";
import { supabase } from "./client";

/**
 * Maps the site's in-memory Database to the Supabase tables in
 * supabase/migrations/0001_init.sql, and back.
 *
 * Saving compares the new data with what was last loaded or saved, table by
 * table, and only sends rows that were added, changed or removed.
 */

type Keyed = "pages" | "posts" | "events" | "taxa" | "listings" | "reports" | "resources" | "uploads" | "messages" | "chunks" | "admins";

/** Table name and primary key for each keyed collection. Parents come before children. */
const TABLES: { key: Keyed; table: string; pk: string }[] = [
  { key: "taxa", table: "taxa", pk: "id" },
  { key: "pages", table: "pages", pk: "id" },
  { key: "posts", table: "posts", pk: "id" },
  { key: "events", table: "events", pk: "id" },
  { key: "listings", table: "listings", pk: "id" },
  { key: "reports", table: "reports", pk: "id" },
  { key: "resources", table: "resources", pk: "id" },
  { key: "uploads", table: "uploads", pk: "id" },
  { key: "messages", table: "messages", pk: "id" },
  { key: "chunks", table: "ai_chunks", pk: "id" },
  { key: "admins", table: "admins", pk: "email" },
];

/** Fields the app types as "| null"; every other database null becomes a missing field. */
const NULLABLE = new Set(["parentId", "handledAt"]);
/** Date columns the app keeps as "" when empty. */
const EMPTY_DATES = new Set(["dateChecked", "nextReviewDate"]);

const toSnake = (k: string) => k.replace(/[A-Z]/g, (c) => "_" + c.toLowerCase());
const toCamel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function toRow(obj: object): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    row[toSnake(k)] = EMPTY_DATES.has(k) && v === "" ? null : v;
  }
  return row;
}

function fromRow<T>(row: Record<string, unknown>): T {
  const obj: Record<string, unknown> = {};
  for (const [col, v] of Object.entries(row)) {
    const k = toCamel(col);
    if (v === null) {
      if (EMPTY_DATES.has(k)) obj[k] = "";
      else if (NULLABLE.has(k)) obj[k] = null;
      continue;
    }
    // Posts keep a plain "YYYY-MM-DD" publish date in the app.
    obj[k] = k === "publishedAt" && typeof v === "string" ? v.slice(0, 10) : v;
  }
  return obj as T;
}

/** Timestamps come back from Postgres as "...+00:00"; keep the app's ISO "Z" form so diffs stay quiet. */
function normaliseTimes(row: Record<string, unknown>) {
  for (const [k, v] of Object.entries(row)) {
    if (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?\+00:00$/.test(v)) row[k] = new Date(v).toISOString();
  }
  return row;
}

async function selectAll(table: string, order: string): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await supabase().from(table).select("*").order(order).range(from, from + page - 1);
    if (error) throw new Error(`Could not load ${table}: ${error.message}`);
    out.push(...(data ?? []).map(normaliseTimes));
    if (!data || data.length < page) return out;
  }
}

function settingsFromRow(row: Record<string, unknown> | undefined): { settings: Settings; version: number } {
  const r = row ?? {};
  return {
    version: Number(r.data_version ?? 1),
    settings: {
      funeralCompanionUrl: String(r.funeral_companion_url ?? ""),
      contactEmail: (r.contact_email as string | null) ?? undefined,
      keepAnonymisedQuestions: Boolean(r.keep_anonymised_questions),
      aiLastIndexedAt: (r.ai_last_indexed_at as string | null) ?? null,
      aiLastIndexMs: (r.ai_last_index_ms as number | null) ?? null,
      aiSpend: (r.ai_spend as Settings["aiSpend"]) ?? { month: "", usd: 0, requests: 0 },
    },
  };
}

function settingsToRow(db: Database) {
  const s = db.settings;
  return {
    id: 1,
    funeral_companion_url: s.funeralCompanionUrl,
    contact_email: s.contactEmail ?? null,
    keep_anonymised_questions: s.keepAnonymisedQuestions,
    ai_last_indexed_at: s.aiLastIndexedAt,
    ai_last_index_ms: s.aiLastIndexMs,
    ai_spend: s.aiSpend,
    data_version: db.version,
  };
}

/** Loads everything. Returns null when the database has never been filled. */
export async function loadFromSupabase(): Promise<Database | null> {
  const [settingsRows, questionRows, ...lists] = await Promise.all([
    selectAll("settings", "id"),
    selectAll("questions", "id"),
    ...TABLES.map((t) => selectAll(t.table, t.pk)),
  ]);
  const db = {} as Database;
  TABLES.forEach((t, i) => {
    (db as unknown as Record<string, unknown[]>)[t.key] = lists[i].map((r) => fromRow(r));
  });
  if (!db.pages.length) return null;
  const { settings, version } = settingsFromRow(settingsRows[0]);
  db.settings = settings;
  db.version = version;
  db.questions = questionRows.map((r) => ({ q: String(r.q), at: String(r.at), kind: String(r.kind) }));
  return db;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Sends the difference between `prev` (last known state, or null for "empty") and `next`. */
export async function saveToSupabase(prev: Database | null, next: Database): Promise<void> {
  const sb = supabase();
  // Upserts parents first, deletes children first.
  for (const t of TABLES) {
    const before = new Map(((prev?.[t.key] ?? []) as unknown as Record<string, unknown>[]).map((r) => [String(r[toCamel(t.pk)]), r]));
    const rows = (next[t.key] as unknown as Record<string, unknown>[]).filter((r) => {
      const old = before.get(String(r[toCamel(t.pk)]));
      return !old || !same(old, r);
    });
    if (t.key === "pages" || t.key === "taxa") rows.sort((a, b) => (a.parentId ? 1 : 0) - (b.parentId ? 1 : 0));
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await sb.from(t.table).upsert(rows.slice(i, i + 500).map(toRow), { onConflict: t.pk });
      if (error) throw new Error(`Could not save ${t.table}: ${error.message}`);
    }
  }
  for (const t of [...TABLES].reverse()) {
    if (!prev) continue;
    const keep = new Set((next[t.key] as unknown as Record<string, unknown>[]).map((r) => String(r[toCamel(t.pk)])));
    const gone = [...(prev[t.key] as unknown as Record<string, unknown>[])].map((r) => String(r[toCamel(t.pk)])).filter((id) => !keep.has(id));
    for (let i = 0; i < gone.length; i += 200) {
      const { error } = await sb.from(t.table).delete().in(t.pk, gone.slice(i, i + 200));
      if (error) throw new Error(`Could not delete from ${t.table}: ${error.message}`);
    }
  }
  // The question log (newest first, at most 500) is only kept when the owner
  // turns it on, so it is simply replaced whenever it changes.
  if (!same(prev?.questions ?? [], next.questions)) {
    await sb.from("questions").delete().gte("id", 0);
    if (next.questions.length) {
      const { error } = await sb.from("questions").insert(next.questions);
      if (error) throw new Error(`Could not save questions: ${error.message}`);
    }
  }
  if (!prev || !same(settingsToRow(prev), settingsToRow(next))) {
    const { error } = await sb.from("settings").upsert(settingsToRow(next), { onConflict: "id" });
    if (error) throw new Error(`Could not save settings: ${error.message}`);
  }
}
