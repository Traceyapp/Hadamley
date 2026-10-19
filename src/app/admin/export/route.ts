import { currentAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  if (!(await currentAdmin())) return new Response("Not found", { status: 404 });
  const { pages, listings, taxa, resources, reports, messages, settings } = readDb();
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), pages, listings, taxa, resources, reports, messages, settings }, null, 2);
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="hadamley-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
