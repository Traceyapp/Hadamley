import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { siteSearch } from "@/lib/site-search";
import { crc32, makeZip } from "@/lib/zip";
import { readDb } from "@/lib/db";

describe("site-wide search", () => {
  it("finds services, guide pages and sections by partial words", () => {
    const kinds = new Set(siteSearch("physio").map((r) => r.kind));
    expect(kinds.has("service")).toBe(true);
    expect(kinds.has("page")).toBe(true);
    expect(siteSearch("HCPC").some((r) => r.url === "/physiotherapy#s-physio-private")).toBe(true);
  });

  it("finds downloads, news and upcoming events", async () => {
    const { mutate } = await import("@/lib/db");
    const now = new Date().toISOString();
    await mutate((db) => {
      db.posts.push({ id: "post-test", slug: "test-hydrotherapy", title: "New hydrotherapy sessions", summary: "Warm water exercise.", body: "<p>Warm water exercise.</p>", status: "published", publishedAt: now.slice(0, 10), updatedAt: now });
      db.events.push({ id: "event-test", slug: "test-coffee-morning", title: "Carers coffee morning", summary: "A relaxed coffee morning.", body: "<p>Come along.</p>", startsAt: "2099-01-10T10:00", endsAt: "2099-01-10T12:00", location: "Romford", online: false, cost: "Free", bookingUrl: "", status: "published", updatedAt: now });
    });
    expect(siteSearch("appointment notes").some((r) => r.kind === "download")).toBe(true);
    expect(siteSearch("hydrotherapy").some((r) => r.kind === "news")).toBe(true);
    expect(siteSearch("coffee morning").some((r) => r.kind === "event")).toBe(true);
  });

  it("never returns hidden content", () => {
    const urls = [...siteSearch("OT at Home"), ...siteSearch("Havering Talking Therapies")].map((r) => r.url);
    expect(urls).not.toContain("/find-support/ot-at-home-practice");
    expect(urls).not.toContain("/find-support/havering-talking-therapies");
  });

  it("needs every word to match and returns nothing for nonsense", () => {
    expect(siteSearch("zzzz")).toHaveLength(0);
    expect(siteSearch("physio zzzz")).toHaveLength(0);
  });
});

describe("export zip", () => {
  it("writes a valid zip that standard tools can read", () => {
    const zip = makeZip([
      { name: "content.json", data: Buffer.from('{"ok":true}') },
      { name: "files/a.txt", data: Buffer.from("hello") },
    ]);
    const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "zip-")), "t.zip");
    fs.writeFileSync(file, zip);
    const out = execFileSync("unzip", ["-t", file]).toString();
    expect(out).toMatch(/No errors detected/);
    expect(crc32(Buffer.from("hello"))).toBe(0x3610a686);
  });
});

describe("cookie notice", () => {
  it("is added by the data migration and published", () => {
    const p = readDb().pages.find((x) => x.slug === "cookies");
    expect(p?.status).toBe("published");
    expect(readDb().version).toBeGreaterThanOrEqual(3);
  });
});

describe("Tracey's wording (migration v4)", () => {
  it("brings in her About text, founder story and contact email", () => {
    const db = readDb();
    const about = db.pages.find((p) => p.id === "p-about")!;
    expect(about.body).toContain("Tracey Finch");
    expect(about.body).toContain("About the founder");
    expect(db.pages.find((p) => p.id === "p-contact")!.title).toBe("Contact us");
    expect(db.settings.contactEmail).toBe("support@hadamley.com");
    expect(db.version).toBeGreaterThanOrEqual(4);
  });

  it("indexes her About page for the helper and search", () => {
    expect(siteSearch("founder").some((r) => r.url.startsWith("/about"))).toBe(true);
  });
});

describe("Tracey's printable library", () => {
  it("loads every library file as a published download with its file in uploads", async () => {
    const { readDb, UPLOAD_DIR } = await import("@/lib/db");
    const { LIBRARY } = await import("@/lib/library");
    const fs = await import("node:fs");
    const path = await import("node:path");
    const db = readDb();
    for (const e of LIBRARY) {
      const r = db.resources.find((x) => x.id === e.id);
      expect(r?.status, e.id).toBe("published");
      expect(fs.existsSync(path.join(UPLOAD_DIR, r!.storedName)), e.id).toBe(true);
    }
    expect(db.resources.find((r) => r.id === "r-appointment")).toBeUndefined();
  });
});

describe("health content drafts", () => {
  it("loads every drafted page as a draft, with health sections ending in the disclaimer setting", async () => {
    const { readDb } = await import("@/lib/db");
    const { HEALTH_DRAFTS } = await import("@/lib/content");
    const db = readDb();
    for (const d of HEALTH_DRAFTS) {
      const p = db.pages.find((x) => x.id === d.id);
      expect(p?.status, d.id).toBe("draft");
      expect(p!.sections!.length, d.id).toBeGreaterThan(0);
      for (const s of p!.sections!) expect(s.reviewedAt, `${d.id}/${s.id}`).toBe("2026-10-24");
    }
    const az = db.pages.find((p) => p.id === "p-conditions")!.sections!.map((s) => s.heading);
    expect(az).toEqual([...az].sort((a, b) => a.localeCompare(b)));
    expect(db.pages.find((p) => p.id === "p-fibro")!.sections!.every((s) => s.health)).toBe(true);
  });

  it("keeps drafts out of the AI helper and site search", async () => {
    const { readDb } = await import("@/lib/db");
    const { siteSearch } = await import("@/lib/site-search");
    expect(readDb().chunks.some((c) => c.url.includes("understanding-fibromyalgia"))).toBe(false);
    expect(siteSearch("tender points").some((r) => r.url.includes("fibromyalgia"))).toBe(false);
  });

  it("never tells visitors that information is still being prepared, and has no diagram until Tracey supplies one", async () => {
    const { readDb } = await import("@/lib/db");
    const { HEALTH_DRAFTS } = await import("@/lib/content");
    const db = readDb();
    for (const d of HEALTH_DRAFTS) {
      const p = db.pages.find((x) => x.id === d.id)!;
      const all = [p.body, ...p.sections!.map((s) => s.body)].join(" ");
      expect(all, d.id).not.toMatch(/being prepared|will be added|being developed/i);
      expect(all, d.id).not.toMatch(/tender-points\.svg/);
    }
    expect(db.pages.find((p) => p.id === "p-conditions")!.sections!.every((s) => s.body.includes("nhs.uk/medicines/"))).toBe(true);
  });

  it("links only to downloads that exist in the library", async () => {
    const { readDb } = await import("@/lib/db");
    const { HEALTH_DRAFTS } = await import("@/lib/content");
    const ids = new Set(readDb().resources.map((r) => r.id));
    for (const d of HEALTH_DRAFTS) for (const s of d.sections ?? []) for (const r of s.resourceIds) expect(ids.has(r), `${d.id}/${s.id} -> ${r}`).toBe(true);
  });
});

describe("sample content removed before launch", () => {
  it("has no sample report, sample posts or events, or placeholder downloads", () => {
    const db = readDb();
    expect(db.reports.some((r) => r.id === "rep-sample")).toBe(false);
    expect(db.posts.some((p) => ["post-welcome", "post-winter"].includes(p.id))).toBe(false);
    expect(db.events.some((e) => ["event-dropin", "event-carers"].includes(e.id))).toBe(false);
    expect(db.resources.some((r) => r.id.startsWith("r-"))).toBe(false);
  });
});

describe("Chronic Illness Support page (brief of 25 October)", () => {
  it("has Tracey's introduction and the 22 condition headings in her order", async () => {
    const { readDb } = await import("@/lib/db");
    const { CONDITION_TITLES } = await import("@/lib/content/chronic-illness");
    const p = readDb().pages.find((x) => x.id === "p-ltc")!;
    expect(p.title).toBe("Chronic Illness Support");
    expect(p.body).toMatch(/Select a condition below to read about its symptoms, treatment and available support\./);
    expect(p.body).toMatch(/You do not need a confirmed diagnosis/);
    expect(p.sections!.map((s) => s.heading)).toEqual(CONDITION_TITLES.map(([, h]) => h));
    expect(p.sections!.every((s) => s.health)).toBe(true);
    expect(CONDITION_TITLES).toHaveLength(22);
  });
});
