import crypto from "node:crypto";

/**
 * In-memory sliding window limiter. Fine for a single server; on Vercel
 * use Upstash or a Supabase table so limits hold across instances.
 */
const g = globalThis as unknown as { __rl?: Map<string, number[]> };
const buckets = (g.__rl ??= new Map());

export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t: number) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

/** Hashes the IP so nothing identifying is kept in memory. */
export function clientKey(req: Request | { headers: Headers }, scope: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
  return `${scope}:${crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16)}`;
}
