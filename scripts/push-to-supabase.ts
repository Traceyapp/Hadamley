/**
 * One-off copy of the local site (data/db.json and data/uploads) into Supabase.
 *
 *   npm run db:push            refuses if Supabase already has content
 *   npm run db:push -- --force overwrites matching rows (never deletes)
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, and the
 * tables from supabase/migrations/0001_init.sql.
 */
import fs from "node:fs";
import path from "node:path";

process.env.HADAMLEY_STORE = "file"; // read the local copy

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) throw new Error("Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY to .env.local first.");
  const { readDb, UPLOAD_DIR } = await import("../src/lib/db");
  const { loadFromSupabase, saveToSupabase } = await import("../src/lib/store/supabase-db");
  const { supabase } = await import("../src/lib/store/client");
  const { BUCKET } = await import("../src/lib/store/config");

  const db = readDb();
  const existing = await loadFromSupabase();
  if (existing && !process.argv.includes("--force")) {
    throw new Error(`Supabase already has ${existing.pages.length} pages. Run with --force to overwrite matching rows.`);
  }

  // Files first, so no record ever points at a missing file.
  const names = [...new Set([...db.resources.map((r) => r.storedName), ...db.uploads.map((u) => u.storedName)])];
  const mimeOf = (n: string) => db.resources.find((r) => r.storedName === n)?.mime ?? db.uploads.find((u) => u.storedName === n)?.mime ?? "application/octet-stream";
  let sent = 0;
  let missing = 0;
  for (const name of names) {
    const p = path.join(UPLOAD_DIR, path.basename(name));
    if (!fs.existsSync(p)) {
      missing++;
      console.warn(`  missing locally, skipped: ${name}`);
      continue;
    }
    const { error } = await supabase().storage.from(BUCKET).upload(path.basename(name), fs.readFileSync(p), { contentType: mimeOf(name), upsert: true });
    if (error) throw new Error(`Upload failed for ${name}: ${error.message}`);
    sent++;
    process.stdout.write(`\r  files: ${sent}/${names.length}`);
  }
  console.log(`\n  files uploaded: ${sent}${missing ? `, missing locally: ${missing}` : ""}`);

  await saveToSupabase(null, db);
  const check = await loadFromSupabase();
  console.log(
    `  rows now in Supabase: pages ${check?.pages.length}, listings ${check?.listings.length}, downloads ${check?.resources.length}, posts ${check?.posts.length}, events ${check?.events.length}, topics/areas ${check?.taxa.length}, helper chunks ${check?.chunks.length}, admins ${check?.admins.length}`,
  );
  console.log(`  data version ${check?.version}. Done.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
