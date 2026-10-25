import path from "node:path";
import { readDb } from "@/lib/db";
import { getFile } from "@/lib/files";
import { currentAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/** Serves uploaded files. Unpublished downloads are visible to admins only. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const safe = path.basename(name);
  const db = readDb();
  const resource = db.resources.find((r) => r.storedName === safe);
  const upload = db.uploads.find((u) => u.storedName === safe);
  if (!resource && !upload) return new Response("Not found", { status: 404 });
  if (resource && resource.status !== "published" && !(await currentAdmin())) return new Response("Not found", { status: 404 });

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
