import { ensureDb } from "@/lib/db";
import { NextResponse } from "next/server";
import { getPageAnyStatus } from "@/lib/repo";
import { currentAdmin } from "@/lib/auth";
import { easyRead } from "@/lib/ai/easy-read";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

const UNAVAILABLE = "The easy read version isn't available right now. Please try again later, or use the text size buttons at the top of the page.";

export async function POST(req: Request) {
  await ensureDb();
  if (!rateLimit(clientKey(req, "easy-read"), 10, 10 * 60_000)) {
    return NextResponse.json({ error: "Please wait a few minutes before asking for another easy read version." }, { status: 429 });
  }
  let pageId = "";
  try {
    const body = (await req.json()) as { pageId?: unknown };
    pageId = typeof body.pageId === "string" ? body.pageId.slice(0, 80) : "";
  } catch {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 400 });
  }
  const page = getPageAnyStatus(pageId);
  // Drafts only for admins, so unpublished wording never leaks.
  if (!page || (page.status !== "published" && !(await currentAdmin()))) return NextResponse.json({ error: "Page not found." }, { status: 404 });
  try {
    const html = await easyRead(page);
    if (!html) return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
    return NextResponse.json({ html });
  } catch (err) {
    console.error("[ai] easy read failed", err);
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 });
  }
}
