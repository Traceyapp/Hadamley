import { ensureDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { siteSearch } from "@/lib/site-search";

export const runtime = "nodejs";

export async function GET(req: Request) {
  await ensureDb();
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 120);
  return NextResponse.json({ q, results: siteSearch(q, 24) });
}
