import { currentAdmin } from "@/lib/auth";
import { hitFromBeacon, isLiveCopy, requestInfo, type Beacon } from "@/lib/analytics/collect";
import { recordHits } from "@/lib/analytics/store";
import { useSupabase } from "@/lib/store/config";
import { rateLimit, clientKey } from "@/lib/ratelimit";
import type { Hit } from "@/lib/analytics/types";

export const runtime = "nodejs";

const none = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

/**
 * Receives page views, time-on-page and key actions from the site's tracker
 * (src/components/site/Analytics.tsx). Always answers 204 so a problem here
 * never shows up for a visitor. Not counted: bots, signed-in admins, and test
 * copies of the site (Vercel previews, or a local copy using the real database).
 */
export async function POST(req: Request) {
  const info = requestInfo(req.headers);
  if (!isLiveCopy(info.host, { VERCEL_ENV: process.env.VERCEL_ENV, supabase: useSupabase() })) return none();
  // Per address *and* browser, generously: mobile networks put many people behind one address.
  if (!rateLimit(clientKey(req, `hv:${info.ua}`), 600, 10 * 60_000)) return none();
  if (req.headers.get("sec-purpose")?.includes("prefetch")) return none();
  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 8000) return none();
    body = JSON.parse(text);
  } catch {
    return none();
  }
  try {
    // Only look the account up when an admin cookie is there: most requests have none.
    if (/(?:^|;\s*)hadamley_admin=/.test(req.headers.get("cookie") ?? "") && (await currentAdmin())) return none();
    const beacons = (Array.isArray(body) ? body : [body]).slice(0, 10) as Partial<Beacon>[];
    const hits = beacons.map((b) => hitFromBeacon(b, info)).filter((h): h is Hit => !!h);
    await recordHits(hits);
  } catch (err) {
    console.error("[analytics]", err instanceof Error ? err.message : err);
  }
  return none();
}
