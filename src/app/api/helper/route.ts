import { NextResponse } from "next/server";
import { answer, type ChatTurn } from "@/lib/ai/answer";
import { rateLimit, clientKey } from "@/lib/ratelimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const key = clientKey(req, "helper");
  if (!rateLimit(key, 20, 10 * 60_000)) {
    return NextResponse.json(
      { error: "You've asked a lot of questions in a short time. Please wait a few minutes, or browse Find Support from the menu." },
      { status: 429 },
    );
  }
  let body: { message?: unknown; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Sorry, something went wrong. Please try again." }, { status: 400 });
  }
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";
  if (!message) return NextResponse.json({ error: "Please type a question." }, { status: 400 });
  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history
        .filter((t): t is ChatTurn => !!t && typeof t === "object" && (t.role === "user" || t.role === "assistant") && typeof t.content === "string")
        .slice(-6)
        .map((t) => ({ role: t.role, content: t.content.slice(0, 1500) }))
    : [];

  try {
    return NextResponse.json(await answer(message, history));
  } catch (err) {
    console.error("[helper]", err);
    return NextResponse.json(
      { error: "Sorry, the helper is not available right now. Every section is still available from the menu, or try Find Support." },
      { status: 500 },
    );
  }
}
