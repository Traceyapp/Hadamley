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

export async function removeFile(name: string): Promise<void> {
  if (useSupabase()) {
    await supabase().storage.from(BUCKET).remove([safe(name)]);
    return;
  }
  fs.rmSync(path.join(UPLOAD_DIR, safe(name)), { force: true });
}
