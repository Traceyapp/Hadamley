import fs from "node:fs";
import path from "node:path";
import { BUCKET, UPLOAD_DIR, useSupabase } from "./store/config";
import { supabase } from "./store/client";

/**
 * Uploaded files (downloads and images), stored by their storedName either in
 * the Supabase "uploads" bucket or the local uploads folder.
 */

const safe = (name: string) => path.basename(name);

export async function putFile(name: string, data: Buffer, mime: string): Promise<void> {
  if (useSupabase()) {
    const { error } = await supabase().storage.from(BUCKET).upload(safe(name), data, { contentType: mime, upsert: true });
    if (error) throw new Error(`Could not store ${name}: ${error.message}`);
    return;
  }
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.writeFileSync(path.join(UPLOAD_DIR, safe(name)), data);
}

/** The file's bytes, or null if it isn't there. */
export async function getFile(name: string): Promise<Buffer | null> {
  if (useSupabase()) {
    const { data, error } = await supabase().storage.from(BUCKET).download(safe(name));
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }
  const p = path.join(UPLOAD_DIR, safe(name));
  return fs.existsSync(p) ? fs.readFileSync(p) : null;
}

/**
 * A short-lived private link straight to the file in Supabase storage, so big
 * files come from Supabase's CDN instead of through the site's own server
 * (which on Vercel is slow and capped at 4.5 MB). Null with local files.
 */
export async function fileLink(name: string, opts: { downloadAs?: string; seconds: number }): Promise<string | null> {
  if (!useSupabase()) return null;
  const { data, error } = await supabase()
    .storage.from(BUCKET)
    .createSignedUrl(safe(name), opts.seconds, opts.downloadAs ? { download: opts.downloadAs } : undefined);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function removeFile(name: string): Promise<void> {
  if (useSupabase()) {
    await supabase().storage.from(BUCKET).remove([safe(name)]);
    return;
  }
  fs.rmSync(path.join(UPLOAD_DIR, safe(name)), { force: true });
}
