/**
 * Read-only check that Supabase is ready for visitor analytics:
 * the analytics_events table exists with every column the site writes.
 *
 *   npm run analytics:check
 */
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    console.log("✗ Missing keys: add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local");
    process.exit(1);
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const cols = "id,at,kind,path,name,target,ms,visitor,ref_host,channel,utm_source,utm_medium,utm_campaign,device,browser,os,country,region,city";
  const { error, count } = await sb.from("analytics_events").select(cols, { count: "exact" }).limit(1);
  if (error) {
    console.log(`✗ analytics_events: ${error.message}`);
    console.log("  Run supabase/migrations/0002_analytics.sql in the Supabase SQL Editor.");
    process.exit(1);
  }
  console.log(`✓ analytics_events exists with all ${cols.split(",").length} columns (${count ?? 0} rows so far)`);

  const { error: pagesError, count: pages } = await sb.from("pages").select("id", { head: true, count: "exact" });
  console.log(pagesError ? `✗ main site tables: ${pagesError.message}` : `✓ main site tables reachable with the same keys (${pages} pages)`);
}

main().catch((err) => {
  console.error("✗", err instanceof Error ? err.message : err);
  process.exit(1);
});
