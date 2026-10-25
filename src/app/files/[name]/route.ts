import { ensureDb } from "@/lib/db";
import path from "node:path";
import { readDb } from "@/lib/db";
import { fileLink, getFile } from "@/lib/files";
import { currentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Serves uploaded files. Unpublished downloads are visible to admins only. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  await ensureDb();
  const { name } = await params;
  const safe = path.basename(name);
  const db = readDb();
  const resource = db.resources.find((r) => r.storedName === safe);
  const upload = db.uploads.find((u) => u.storedName === safe);
  if (!resource && !upload) return new Response("Not found", { status: 404 });
  if (resource && resource.status !== "published" && !(await currentAdmin())) return new Response("Not found", { status: 404 });

  // With Supabase, send the browser straight to the file on Supabase's CDN.
  const published = !resource || resource.status === "published";
  const link = await fileLink(safe, { downloadAs: resource?.fileName, seconds: resource ? 3600 : 86_400 });
  if (link) {
    return new Response(null, {
      status: 302,
      headers: { Location: link, "Cache-Control": published ? "public, max-age=300, s-maxage=300" : "private, no-store" },
    });
  }

  const body = await getFile(safe);
  if (!body) return new Response("Not found", { status: 404 });
  const meta = resource ?? upload!;
  return new Response(new Uint8Array(body), {
    headers: {
      "Content-Type": meta.mime || "application/octet-stream",
      "Content-Length": String(body.length),
      "Cache-Control": resource ? "public, max-age=300" : "public, max-age=31536000, immutable",
      ...(resource ? { "Content-Disposition": `inline; filename="${resource.fileName.replace(/"/g, "")}"` } : {}),
    },
  });
}
