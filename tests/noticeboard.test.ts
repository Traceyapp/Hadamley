import { describe, expect, it } from "vitest";
import { mutate, readDb } from "@/lib/db";
import { eventChunks, postChunks, reindexRecord } from "@/lib/ai/chunks";
import { eventParts, londonNow, publishedPosts, upcomingEvents } from "@/lib/notice";
import { answer } from "@/lib/ai/answer";
import type { NoticeEvent } from "@/lib/types";

const event = (over: Partial<NoticeEvent>): NoticeEvent => ({
  id: "e-test",
  slug: "e-test",
  title: "Test coffee morning",
  summary: "A coffee morning",
  body: "<p>Hello</p>",
  startsAt: "2099-01-01T10:00",
  endsAt: "2099-01-01T12:00",
  location: "Hornchurch",
  online: false,
  cost: "",
  bookingUrl: "",
  status: "published",
  updatedAt: "2026-10-20T00:00:00.000Z",
  ...over,
});

describe("accordion sections", () => {
  it("indexes each section with a link straight to it", () => {
    const chunk = readDb().chunks.find((c) => c.url === "/physiotherapy#s-physio-prepare");
    expect(chunk?.text).toContain("first appointment");
  });

  it("lets the helper answer from a section", async () => {
    const r = await answer("How do I check a private physiotherapist is registered?");
    expect("sources" in r && r.sources.some((s) => s.url === "/physiotherapy#s-physio-private")).toBe(true);
  });
});

describe("noticeboard", () => {
  it("shows published posts newest first and keeps drafts off", () => {
    mutate((db) => {
      db.posts.push({ ...db.posts[0], id: "post-draft", slug: "draft", title: "Secret draft", status: "draft", publishedAt: "2099-01-01" });
    });
    const titles = publishedPosts().map((p) => p.title);
    expect(titles).not.toContain("Secret draft");
    expect(publishedPosts().map((p) => p.publishedAt)).toEqual([...publishedPosts().map((p) => p.publishedAt)].sort().reverse());
    expect(postChunks(readDb().posts.find((p) => p.id === "post-draft")!)).toHaveLength(0);
  });

  it("only lists and indexes events that haven't finished", () => {
    const past = event({ id: "e-past", startsAt: "2000-01-01T10:00", endsAt: "2000-01-01T11:00" });
    expect(eventChunks(past)).toHaveLength(0);
    expect(eventChunks(event({}))).toHaveLength(1);
    expect(upcomingEvents().every((e) => (e.endsAt || e.startsAt) >= londonNow())).toBe(true);
  });

  it("puts a new published event into the helper", async () => {
    mutate((db) => {
      db.events.push(event({}));
      reindexRecord(db, "event", "e-test");
    });
    const r = await answer("Is there a coffee morning in Hornchurch?");
    expect("sources" in r && r.sources.some((s) => s.url === "/noticeboard/events/e-test")).toBe(true);
  });

  it("formats event times without timezone drift", () => {
    expect(eventParts("2026-11-05T10:00")).toMatchObject({ day: 5, month: "Nov", weekday: "Thursday", time: "10am" });
    expect(eventParts("2026-11-18T18:30").time).toBe("6:30pm");
  });
});
