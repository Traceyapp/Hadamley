import fs from "node:fs";
import path from "node:path";
import type { Database } from "./types";
import { buildSeed } from "./seed";
import { DB_VERSION, migrate } from "./migrate";
import { buildAllChunks } from "./ai/chunks";
import { DATA_DIR, UPLOAD_DIR, useSupabase } from "./store/config";
import { loadFromSupabase, saveToSupabase } from "./store/supabase-db";

/**
 * The site's data, held in memory as one Database object.
 *
 * Supabase (production): loadDb() fills the in-memory copy when the server
 * starts (see src/instrumentation.ts) and readDb() refreshes it in the
 * background every few seconds, so edits made on another server instance
 * appear shortly. mutate() reloads, applies the change and saves only the
 * rows that changed.
 *
 * Local file (tests and offline development): data/db.json, as before.
 */

export { DATA_DIR, UPLOAD_DIR };
const DB_FILE = path.join(DATA_DIR, "db.json");
const REFRESH_MS = 10_000;

type Cache = { db: Database; mtime: number; loadedAt: number } | null;
const g = globalThis as unknown as { __hadamleyDb?: Cache; __hadamleyLoading?: Promise<Database>; __hadamleyQueue?: Promise<unknown> };

export function readDb(): Database {
  if (useSupabase()) {
    const snap = g.__hadamleyDb;
    if (!snap) throw new Error("Site data has not loaded from Supabase yet. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY.");
    if (Date.now() - snap.loadedAt > REFRESH_MS && !g.__hadamleyLoading) loadDb().catch((e) => console.error("[hadamley] background refresh failed:", e));
    return snap.db;
  }
  return readFileDb();
}

/** Loads (or reloads) the data from Supabase. With the local file, just reads it. */
export async function loadDb(): Promise<Database> {
  if (!useSupabase()) return readFileDb();
  g.__hadamleyLoading ??= (async () => {
    try {
      const loaded = await loadFromSupabase();
      if (!loaded) throw new Error("The Supabase database is empty. Copy the content across with: npm run db:push");
      const before = structuredClone(loaded);
      if (migrate(loaded)) {
        loaded.chunks = buildAllChunks(loaded);
        await saveToSupabase(before, loaded);
      }
      g.__hadamleyDb = { db: loaded, mtime: 0, loadedAt: Date.now() };
      return loaded;
    } finally {
      g.__hadamleyLoading = undefined;
    }
  })();
  return g.__hadamleyLoading;
}

/**
 * Makes sure the data is in memory before a request reads it. On Vercel each
 * route can run as its own small server that may get a request before start-up
 * loading has finished, so every entry point that reads data awaits this first.
 */
export async function ensureDb(): Promise<void> {
  if (!useSupabase() || g.__hadamleyDb) return;
  await loadDb();
}

/** Read, change and save in one step. Returns whatever the callback returns. Changes run one at a time. */
export function mutate<T>(fn: (db: Database) => T): Promise<T> {
  const run = async () => {
    if (!useSupabase()) {
      const db = structuredClone(readFileDb());
      const out = fn(db);
      writeFileDb(db);
      return out;
    }
    const prev = await loadDb();
    const next = structuredClone(prev);
    const out = fn(next);
    await saveToSupabase(prev, next);
    g.__hadamleyDb = { db: next, mtime: 0, loadedAt: Date.now() };
    return out;
  };
  const result = (g.__hadamleyQueue ?? Promise.resolve()).then(run, run);
  g.__hadamleyQueue = result.catch(() => undefined);
  return result;
}

function readFileDb(): Database {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const db = buildSeed();
    writeFileDb(db);
    return db;
  }
  const mtime = fs.statSync(DB_FILE).mtimeMs;
  // Trust the in-memory copy only if it is already on the latest data version,
  // so a code update that adds a migration applies it without a restart.
  if (g.__hadamleyDb && g.__hadamleyDb.mtime === mtime && (g.__hadamleyDb.db.version ?? 1) >= DB_VERSION) return g.__hadamleyDb.db;
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database;
  if (migrate(db)) {
    db.chunks = buildAllChunks(db);
    writeFileDb(db);
    return db;
  }
  g.__hadamleyDb = { db, mtime, loadedAt: Date.now() };
  return db;
}

function writeFileDb(db: Database) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
  g.__hadamleyDb = { db, mtime: fs.statSync(DB_FILE).mtimeMs, loadedAt: Date.now() };
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function nowIso() {
  return new Date().toISOString();
}
