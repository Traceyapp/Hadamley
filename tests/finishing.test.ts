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
