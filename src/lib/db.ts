import fs from "node:fs";
import path from "node:path";
import type { Database } from "./types";
import { buildSeed } from "./seed";
import { migrate } from "./migrate";
import { buildAllChunks } from "./ai/chunks";

/**
 * Local file-backed store used for development and demos.
 *
 * Public pages read through ./repo.ts; the admin actions and the AI helper
 * also read and write here directly. Moving to a hosted database means
 * replacing this module and updating those callers to await it.
 */

// HADAMLEY_DATA_DIR lets tests run against a throwaway copy of the seed.
export const DATA_DIR = process.env.HADAMLEY_DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

type Cache = { db: Database; mtime: number } | null;
const g = globalThis as unknown as { __hadamleyDb?: Cache };

function ensureDirs() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export function readDb(): Database {
  ensureDirs();
  if (!fs.existsSync(DB_FILE)) {
    const db = buildSeed();
    writeDb(db);
    return db;
  }
  const mtime = fs.statSync(DB_FILE).mtimeMs;
  if (g.__hadamleyDb && g.__hadamleyDb.mtime === mtime) return g.__hadamleyDb.db;
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database;
  if (migrate(db)) {
    db.chunks = buildAllChunks(db);
    writeDb(db);
    return db;
  }
  g.__hadamleyDb = { db, mtime };
  return db;
}

export function writeDb(db: Database) {
  ensureDirs();
  const tmp = `${DB_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_FILE);
  g.__hadamleyDb = { db, mtime: fs.statSync(DB_FILE).mtimeMs };
}

/** Read, change and save in one step. Returns whatever the callback returns. */
export function mutate<T>(fn: (db: Database) => T): T {
  const db = structuredClone(readDb());
  const out = fn(db);
  writeDb(db);
  return out;
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
