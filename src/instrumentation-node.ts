import { loadDb } from "./lib/db";
import { useSupabase } from "./lib/store/config";

export async function loadSiteData() {
  if (!useSupabase()) return;
  const started = Date.now();
  await loadDb();
  console.log(`[hadamley] data loaded from Supabase in ${Date.now() - started} ms`);
}
