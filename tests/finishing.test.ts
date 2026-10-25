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

  it("finds downloads, news and upcoming events", () => {
    expect(siteSearch("appointment notes").some((r) => r.kind === "download")).toBe(true);
    expect(siteSearch("winter").some((r) => r.kind === "news")).toBe(true);
    expect(siteSearch("drop-in").some((r) => r.kind === "event")).toBe(true);
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
    expect(db.resources.find((r) => r.id === "r-appointment")?.status).toBe("draft");
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
