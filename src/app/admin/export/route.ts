import fs from "node:fs";
import path from "node:path";
import { currentAdmin } from "@/lib/auth";
import { readDb, UPLOAD_DIR } from "@/lib/db";
import { makeZip } from "@/lib/zip";

export const runtime = "nodejs";

/** Content export. ?format=zip adds every uploaded file. Never includes password hashes or the AI index. */
export async function GET(req: Request) {
  if (!(await currentAdmin())) return new Response("Not found", { status: 404 });
  const { pages, listings, taxa, resources, reports, messages, posts, events, uploads, settings, admins } = readDb();
  const day = new Date().toISOString().slice(0, 10);
  const content = {
    exportedAt: new Date().toISOString(),
    pages,
    listings,
    taxa,
    resources,
    posts,
    events,
    uploads,
    reports,
    messages,
    settings,
    admins: admins.map(({ passwordHash: _hidden, ...a }) => a),
  };
  const json = JSON.stringify(content, null, 2);

  if (new URL(req.url).searchParams.get("format") !== "zip") {
    return new Response(json, {
      headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename="hadamley-export-${day}.json"` },
    });
  }

  const files = [
    { name: "content.json", data: Buffer.from(json) },
    {
      name: "README.txt",
      data: Buffer.from(
        "Hadamley content export\n\ncontent.json holds every page, listing, topic, download record, post, event, inbox message and setting.\nThe files folder holds every uploaded file, named as the site stores them (see storedName in content.json).\nPasswords are not included.\n",
      ),
    },
  ];
  const stored = new Set([...resources.map((r) => r.storedName), ...uploads.map((u) => u.storedName)]);
  for (const name of stored) {
    const p = path.join(UPLOAD_DIR, path.basename(name));
    if (fs.existsSync(p)) files.push({ name: `files/${path.basename(name)}`, data: fs.readFileSync(p) });
  }
  const zip = makeZip(files);
  return new Response(new Uint8Array(zip), {
    headers: { "Content-Type": "application/zip", "Content-Length": String(zip.length), "Content-Disposition": `attachment; filename="hadamley-export-${day}.zip"` },
  });
}
