import fs from "node:fs";
import path from "node:path";
import { readDb, UPLOAD_DIR } from "@/lib/db";
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

  const file = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const meta = resource ?? upload!;
  const body = fs.readFileSync(file);
  return new Response(body, {
    headers: {
      "Content-Type": meta.mime || "application/octet-stream",
      "Content-Length": String(body.length),
      "Cache-Control": resource ? "public, max-age=300" : "public, max-age=31536000, immutable",
      ...(resource ? { "Content-Disposition": `inline; filename="${resource.fileName.replace(/"/g, "")}"` } : {}),
    },
  });
}
