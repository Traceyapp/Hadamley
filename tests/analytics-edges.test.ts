/**
 * Edge cases for visitor analytics: the 30-minute visit rule at its exact
 * boundary, UK midnight, the clock changes, and Supabase misbehaving
 * (fewer rows per request than expected, a failed insert).
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildReport, buildSessions, resolveRange } from "@/lib/analytics/aggregate";
import { hitFromBeacon, type RequestInfo } from "@/lib/analytics/collect";
import { addDays, londonDate, londonHour, londonMidnight } from "@/lib/analytics/time";
import type { Hit } from "@/lib/analytics/types";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1";
const info: RequestInfo = { ip: "203.0.113.9", ua: UA, country: "United Kingdom", region: "ENG", city: "Romford", host: "www.hadamley.com" };
const pv = (iso: string, p = "/") => hitFromBeacon({ k: "pv", p }, info, new Date(iso))!;

describe("the 30-minute visit rule, at the boundary", () => {
  it("29 minutes 59 seconds apart is the same visit", () => {
    expect(buildSessions([pv("2026-11-04T10:00:00Z"), pv("2026-11-04T10:29:59Z", "/about")])).toHaveLength(1);
  });
  it("exactly 30 minutes apart is still the same visit", () => {
    expect(buildSessions([pv("2026-11-04T10:00:00Z"), pv("2026-11-04T10:30:00Z", "/about")])).toHaveLength(1);
  });
  it("30 minutes and 1 second apart is a new visit", () => {
    expect(buildSessions([pv("2026-11-04T10:00:00Z"), pv("2026-11-04T10:30:01Z", "/about")])).toHaveLength(2);
  });
  it("time on the page counts as activity: reading for 25 minutes then moving on is one visit", () => {
    const hits = [pv("2026-11-04T10:00:00Z"), hitFromBeacon({ k: "en", p: "/", ms: 25 * 60_000 }, info, new Date("2026-11-04T10:25:00Z"))!, pv("2026-11-04T10:50:00Z", "/about")];
    expect(buildSessions(hits)).toHaveLength(1);
  });
  it("an action more than 5 seconds before any page view is not invented into a visit", () => {
    const early = hitFromBeacon({ k: "ev", p: "/", n: "search", t: "pip" }, info, new Date("2026-11-04T09:59:50Z"))!;
    const s = buildSessions([early, pv("2026-11-04T10:00:00Z")]);
    expect(s).toHaveLength(1);
    expect(s[0]!.events).toHaveLength(0);
  });
});

describe("UK midnight", () => {
  // 23:50 and 00:10 UK time on a winter night (UK time = UTC).
  const late = pv("2026-11-04T23:50:00Z");
  const early = pv("2026-11-05T00:10:00Z", "/about");

  it("gives the same person a new anonymous code after midnight (by design: nobody can be followed across days)", () => {
    expect(late.visitor).not.toBe(early.visitor);
  });
  it("so a visit running across midnight counts as one visit on each day", () => {
    const r = buildReport([late, early], resolveRange("7d", new Date("2026-11-05T12:00:00Z")), {}, (p) => p, false);
    expect(r.totals.visits).toBe(2);
    expect(r.series.find((p) => p.key === "2026-11-04")?.visits).toBe(1);
    expect(r.series.find((p) => p.key === "2026-11-05")?.visits).toBe(1);
  });
  it("on the same day, the same person keeps one code all day", () => {
    expect(pv("2026-11-04T00:01:00Z").visitor).toBe(pv("2026-11-04T23:59:00Z").visitor);
  });
});

describe("the clock changes", () => {
  it("autumn (clocks go back on 25 October 2026): days still split at UK midnight", () => {
    expect(londonMidnight("2026-10-25").toISOString()).toBe("2026-10-24T23:00:00.000Z"); // still BST at midnight
    expect(londonMidnight("2026-10-26").toISOString()).toBe("2026-10-26T00:00:00.000Z"); // GMT from then on
    expect(londonDate("2026-10-24T22:59:00Z")).toBe("2026-10-24");
    expect(londonDate("2026-10-24T23:30:00Z")).toBe("2026-10-25");
    // The repeated hour: 01:30 BST and 01:30 GMT are both hour 1.
    expect(londonHour("2026-10-25T00:30:00Z")).toBe(1);
    expect(londonHour("2026-10-25T01:30:00Z")).toBe(1);
  });
  it("spring (clocks go forward on 29 March 2026)", () => {
    expect(londonMidnight("2026-03-29").toISOString()).toBe("2026-03-29T00:00:00.000Z");
    expect(londonMidnight("2026-03-30").toISOString()).toBe("2026-03-29T23:00:00.000Z");
    expect(londonHour("2026-03-29T01:30:00Z")).toBe(2); // 01:00 to 02:00 doesn't exist
  });
  it("a week across the autumn change has seven days, each counted once", () => {
    const range = resolveRange("7d", new Date("2026-10-28T12:00:00Z"));
    // 00:30 BST on the 25th, 23:30 GMT on the 25th (the 25-hour day), and 00:30 GMT on the 26th.
    const hits = [pv("2026-10-24T23:30:00Z"), pv("2026-10-25T23:30:00Z", "/about"), pv("2026-10-26T00:30:00Z", "/contact")];
    const r = buildReport(hits, range, {}, (p) => p, false);
    expect(r.series.map((p) => p.key)).toEqual(["2026-10-22", "2026-10-23", "2026-10-24", "2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28"]);
    expect(r.series.find((p) => p.key === "2026-10-24")?.pageviews).toBe(0);
    expect(r.series.find((p) => p.key === "2026-10-25")?.pageviews).toBe(2);
    expect(r.series.find((p) => p.key === "2026-10-26")?.pageviews).toBe(1);
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
  });
});

// ---------------------------------------------------------------------------
// Supabase misbehaving. The Supabase client is replaced with a fake that
// keeps rows in memory and can be told to misbehave.
// ---------------------------------------------------------------------------
const fake = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
  maxRows: 1000,
  dropEvery: 0,
  insertFailures: 0,
  inserts: 0,
}));

vi.mock("@/lib/store/client", () => {
  function query() {
    const f: { gte?: [string, string]; lt?: [string, string]; gt?: number; limit?: number; head?: boolean } = {};
    const q = {
      select(_c: string, opts?: { head?: boolean }) {
        f.head = !!opts?.head;
        return q;
      },
      gte(_k: string, v: string) {
        f.gte = [_k, v];
        return q;
      },
      lt(_k: string, v: string) {
        f.lt = [_k, v];
        return q;
      },
      gt(_k: string, v: number) {
        f.gt = v;
        return q;
      },
      order() {
        return q;
      },
      limit(n: number) {
        f.limit = n;
        return q;
      },
      delete() {
        return { lt: async () => ({ error: null }) };
      },
      async insert(rows: Record<string, unknown>[]) {
        fake.inserts++;
        if (fake.insertFailures > 0) {
          fake.insertFailures--;
          return { error: { message: "connection reset" } };
        }
        for (const r of rows) fake.rows.push({ id: fake.rows.length + 1, ...r });
        return { error: null };
      },
      then(resolve: (v: unknown) => void) {
        let rows = fake.rows.filter((r) => (!f.gte || String(r.at) >= f.gte[1]) && (!f.lt || String(r.at) < f.lt[1]));
        if (f.head) return resolve({ count: rows.length, error: null });
        rows = rows.filter((r) => Number(r.id) > (f.gt ?? 0));
        // The project's own row cap can be lower than what we ask for.
        rows = rows.slice(0, Math.min(f.limit ?? 1000, fake.maxRows));
        if (fake.dropEvery) rows = rows.filter((r) => Number(r.id) % fake.dropEvery !== 0);
        resolve({ data: rows, error: null });
      },
    };
    return q;
  }
  return { supabase: () => ({ from: () => query() }) };
});

describe("Supabase misbehaving", () => {
  const withSupabase = async <T,>(fn: () => Promise<T>) => {
    const before = process.env.HADAMLEY_STORE;
    delete process.env.HADAMLEY_STORE;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://fake.supabase.co";
    process.env.SUPABASE_SECRET_KEY = "fake";
    try {
      return await fn();
    } finally {
      process.env.HADAMLEY_STORE = before;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      delete process.env.SUPABASE_SECRET_KEY;
    }
  };
  const many = (n: number): Hit[] => Array.from({ length: n }, (_, i) => pv(new Date(Date.parse("2026-11-04T08:00:00Z") + i * 1000).toISOString()));

  afterEach(() => {
    Object.assign(fake, { rows: [], maxRows: 1000, dropEvery: 0, insertFailures: 0, inserts: 0 });
  });

  it("loads every record even when the project only returns 250 rows per request", async () => {
    const { recordHits, loadHits } = await import("@/lib/analytics/store");
    fake.maxRows = 250;
    await withSupabase(() => recordHits(many(2345)));
    const got = await withSupabase(() => loadHits(new Date("2026-11-04T00:00:00Z"), new Date("2026-11-05T00:00:00Z")));
    expect(got).toHaveLength(2345);
  });

  it("refuses to show a board built on an incomplete load", async () => {
    const { recordHits, loadHits } = await import("@/lib/analytics/store");
    await withSupabase(() => recordHits(many(300)));
    fake.dropEvery = 7; // the database quietly loses some rows in transit
    await expect(withSupabase(() => loadHits(new Date("2026-11-04T00:00:00Z"), new Date("2026-11-05T00:00:00Z")))).rejects.toThrow(/incomplete/);
  });

  it("saves a beacon after one failed attempt", async () => {
    const { recordHits } = await import("@/lib/analytics/store");
    fake.insertFailures = 1;
    await withSupabase(() => recordHits(many(1)));
    expect(fake.rows).toHaveLength(1);
    expect(fake.inserts).toBe(2);
  });

  it("reports a failure (rather than pretending) when Supabase keeps failing", async () => {
    const { recordHits } = await import("@/lib/analytics/store");
    fake.insertFailures = 2;
    await expect(withSupabase(() => recordHits(many(1)))).rejects.toThrow(/Could not save analytics/);
  });
});
