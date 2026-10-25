import { describe, expect, it } from "vitest";
import { answer } from "@/lib/ai/answer";
import { readDb } from "@/lib/db";

const urls = (r: Awaited<ReturnType<typeof answer>>) => ("sources" in r ? r.sources.map((s) => s.url) : []);

describe("AI helper answers", () => {
  it("answers a physiotherapy question from the physiotherapy page, with sources", async () => {
    const r = await answer("Can I refer myself for physiotherapy?");
    expect(r.kind).toBe("answer");
    expect(urls(r).some((u) => u.startsWith("/physiotherapy"))).toBe(true);
  });

  it("finds a listing for wheelchair hire", async () => {
    const r = await answer("Where can I hire a wheelchair?");
    expect(r.kind).toBe("answer");
    expect(urls(r)).toContain("/find-support/romford-mobility-hire");
  });

  it("shows the fixed crisis message for urgent wording", async () => {
    const r = await answer("I can't keep myself safe");
    expect(r.kind).toBe("crisis");
    if (r.kind === "crisis") {
      expect(r.lines.join(" ")).toMatch(/999/);
      expect(r.lines.join(" ")).toMatch(/NHS 111/);
      expect(r.calls).toContain("116123");
    }
  });

  it("redirects funeral questions to The Funeral Companion URL from settings", async () => {
    const r = await answer("How do I arrange a funeral?");
    expect(r.kind).toBe("funeral");
    if (r.kind === "funeral") expect(r.url).toBe(readDb().settings.funeralCompanionUrl);
  });

  it.each(["What is the best pizza in Romford?", "football scores today", "train times to London Bridge"])("says it can't find off-topic questions: %j", async (q) => {
    expect((await answer(q)).kind).toBe("not_found");
  });
});

describe("what the AI is allowed to see", () => {
  const db = readDb();

  it("indexes approved listings only", () => {
    const listingIds = new Set(db.chunks.filter((c) => c.sourceType === "listing").map((c) => c.sourceId));
    for (const l of db.listings) expect(listingIds.has(l.id)).toBe(l.status === "approved");
  });

  it("indexes published pages only", () => {
    const pageIds = new Set(db.chunks.filter((c) => c.sourceType === "page").map((c) => c.sourceId));
    for (const p of db.pages.filter((p) => p.status === "draft")) expect(pageIds.has(p.id)).toBe(false);
  });

  it("never contains unconfirmed fees or the clarification-needed listings", () => {
    const all = db.chunks.map((c) => c.text).join("\n");
    expect(all).not.toContain("£325");
    expect(all).not.toContain("OT at Home Practice");
    expect(all).not.toContain("Havering Talking Therapies");
  });

  it("never contains internal notes", () => {
    const all = db.chunks.map((c) => c.text).join("\n");
    for (const l of db.listings) if (l.internalNotes) expect(all).not.toContain(l.internalNotes);
  });
});
