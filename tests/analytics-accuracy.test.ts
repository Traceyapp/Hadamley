/**
 * Ground-truth accuracy test for visitor analytics.
 *
 * Generates hundreds of visitors with known journeys (where they came from,
 * on what device, how many visits, which pages, how long on each, what they
 * did), sends every beacon through the real /api/hv endpoint with the clock
 * set to the moment it would happen, mixes in traffic that must be ignored
 * (robots, admin pages, bad beacons), then checks every figure in the report
 * against the truth. Nothing is approximate: each number must match exactly.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/hv/route";
import { buildReport, resolveRange, type Report } from "@/lib/analytics/aggregate";
import { loadHits } from "@/lib/analytics/store";
import type { Beacon } from "@/lib/analytics/collect";

// --- A seeded random generator, so every run tests the same journeys --------
let seed = 20261107;
const rnd = () => ((seed = (seed * 48271) % 2147483647) / 2147483647);
const int = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(rnd() * xs.length)]!;

const DEVICES = [
  { device: "Mobile", ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1" },
  { device: "Mobile", ua: "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Mobile Safari/537.36" },
  { device: "Mobile", ua: "Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/27.0 Chrome/125.0.0.0 Mobile Safari/537.36" },
  { device: "Tablet", ua: "Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1" },
  { device: "Desktop", ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0" },
  { device: "Desktop", ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15" },
] as const;

/** Where a visit starts, and the channel it must be reported under. */
const ARRIVALS = [
  { r: "", channel: "Direct" },
  { r: "https://www.google.co.uk/", channel: "Organic search" },
  { r: "https://www.google.com/", channel: "Organic search" },
  { r: "https://www.bing.com/", channel: "Organic search" },
  { r: "https://duckduckgo.com/", channel: "Organic search" },
  { r: "https://l.facebook.com/", channel: "Social" },
  { r: "android-app://com.whatsapp/", channel: "Social" },
  { r: "https://chatgpt.com/", channel: "AI assistants" },
  { r: "https://www.nhs.uk/conditions/fibromyalgia/", channel: "NHS & council" },
  { r: "https://www.havering.gov.uk/", channel: "NHS & council" },
  { r: "https://mail.google.com/", channel: "Email" },
  { r: "https://somecharity.org.uk/links", channel: "Referral" },
  { r: "", x: "fb", channel: "Social" },
  { r: "", u: { s: "newsletter", m: "email", c: "november" }, channel: "Email" },
] as const;

const PATHS = ["/", "/chronic-illness-support", "/mental-health-support", "/find-support", "/resources", "/about", "/contact", "/find-support/havering-wellbeing-hub"];
const ACTIONS = [
  { n: "outbound", t: "nhs.uk/conditions/lupus", help: true },
  { n: "phone", t: "01708 123456", help: true },
  { n: "email", t: "hello@example.org", help: true },
  { n: "download", t: "Hadamley_My_Appointment_Notes.pdf", help: true },
  { n: "helper", t: "answer", help: true },
  { n: "helper", t: "not_found", help: false },
  { n: "search", t: "blue badge", help: false },
] as const;

// A Wednesday in November (UK time = UTC), visits between 07:00 and 21:00.
const DAY_START = Date.parse("2026-11-04T07:00:00Z");
const DAY_END = Date.parse("2026-11-04T21:00:00Z");
const REPORT_NOW = new Date("2026-11-04T23:30:00Z");

type Send = { at: number; ip: string; ua: string; host?: string; b: Partial<Beacon> };

interface Truth {
  visitors: number;
  visits: number;
  pageviews: number;
  engagedVisits: number;
  helpVisits: number;
  durations: number[];
  channels: Record<string, number>;
  devices: Record<string, number>;
  pages: Record<string, number>;
  actions: Record<string, number>;
}

function simulate(nVisitors: number) {
  const sends: Send[] = [];
  const truth: Truth = { visitors: 0, visits: 0, pageviews: 0, engagedVisits: 0, helpVisits: 0, durations: [], channels: {}, devices: {}, pages: {}, actions: {} };
  const bump = (o: Record<string, number>, k: string, n = 1) => (o[k] = (o[k] ?? 0) + n);

  for (let v = 0; v < nVisitors; v++) {
    // Ten people share each mobile-network address, on different phones: they must still count separately.
    const ip = `100.64.${Math.floor(v / 10)}.1`;
    const dev = DEVICES[v % DEVICES.length]!;
    const ua = `${dev.ua} Build/${v}`; // unique per person
    truth.visitors++;
    let t = DAY_START + int(0, 9 * 3600_000);
    const visits = int(1, 3);
    for (let s = 0; s < visits; s++) {
      if (t > DAY_END) break;
      const arrival = pick(ARRIVALS);
      const nPages = int(1, 5);
      const start = t;
      let engaged = 0;
      let help = false;
      let anyAction = false;
      truth.visits++;
      bump(truth.channels, arrival.channel);
      bump(truth.devices, dev.device);
      for (let p = 0; p < nPages; p++) {
        const path = pick(PATHS);
        const first = p === 0;
        const pv: Partial<Beacon> = { k: "pv", p: path, w: 390, ...(first && arrival.r ? { r: arrival.r } : {}), ...(first && "u" in arrival ? { u: arrival.u } : {}), ...(first && "x" in arrival ? { x: arrival.x } : {}) };
        // Sometimes a search fired on arrival reaches the server 3ms before its page view.
        if (rnd() < 0.08) {
          sends.push({ at: t - 3, ip, ua, b: { k: "ev", p: path, n: "search", t: "pip" } });
          bump(truth.actions, "search");
          anyAction = true;
        }
        sends.push({ at: t, ip, ua, b: pv });
        truth.pageviews++;
        bump(truth.pages, path);
        // Single-page visits are either clear bounces (3s) or clearly engaged (25s).
        const dwell = nPages === 1 ? pick([3_000, 25_000]) : int(2, 120) * 1000;
        if (rnd() < 0.25) {
          const a = pick(ACTIONS);
          sends.push({ at: t + Math.floor(dwell / 2), ip, ua, b: { k: "ev", p: path, n: a.n, t: a.t } });
          bump(truth.actions, a.n);
          anyAction = true;
          if (a.n !== "search") help ||= a.help;
          if (a.n !== "search") engaged = Math.max(engaged, 1); // any non-search action makes the visit engaged
        }
        sends.push({ at: t + dwell, ip, ua, b: { k: "en", p: path, ms: dwell } });
        // Usually a quick click to the next page; sometimes a long pause (tea break, phone call)
        // of 21 to 29 minutes, which is still the same visit under the 30-minute rule.
        t += dwell + (p < nPages - 1 && rnd() < 0.12 ? int(21, 29) * 60_000 : int(200, 4000));
      }
      const end = t - 0; // last activity is the final engage, slightly before t
      const lastEngage = sends.filter((x) => x.ip === ip && x.ua === ua).reduce((m, x) => Math.max(m, x.at), 0);
      const engagedMs = sends
        .filter((x) => x.ip === ip && x.ua === ua && x.b.k === "en" && x.at >= start && x.at <= lastEngage)
        .reduce((n, x) => n + (x.b.ms ?? 0), 0);
      const duration = Math.max(engagedMs, lastEngage - start);
      truth.durations.push(duration);
      const isEngaged = nPages >= 2 || duration >= 10_000 || engaged > 0;
      if (isEngaged) truth.engagedVisits++;
      if (help) truth.helpVisits++;
      void end;
      void anyAction;
      t = lastEngage + int(31, 90) * 60_000; // next visit after more than 30 minutes of nothing
    }
  }

  // Traffic that must NOT be counted.
  for (let i = 0; i < 60; i++) {
    const at = DAY_START + int(0, 13 * 3600_000);
    sends.push({ at, ip: "66.249.66.1", ua: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", b: { k: "pv", p: "/" } });
    sends.push({ at, ip: "40.77.167.1", ua: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", b: { k: "pv", p: "/about" } });
    sends.push({ at, ip: "1.2.3.4", ua: DEVICES[0].ua, b: { k: "pv", p: "/admin/listings" } }); // admin pages
    sends.push({ at, ip: "1.2.3.5", ua: DEVICES[0].ua, b: { k: "ev", p: "/", n: "purchase" } }); // unknown action
    sends.push({ at, ip: "1.2.3.6", ua: DEVICES[0].ua, b: { k: "pv", p: "https://evil.example/" } }); // not a path
    sends.push({ at, ip: "1.2.3.7", ua: DEVICES[0].ua, b: { k: "en", p: "/", ms: 200 } }); // too short to be real
  }
  return { sends: sends.sort((a, b) => a.at - b.at), truth };
}

async function deliver(sends: Send[]) {
  for (const s of sends) {
    vi.setSystemTime(s.at);
    const res = await POST(
      new Request("https://www.hadamley.com/api/hv", {
        method: "POST",
        body: JSON.stringify(s.b),
        headers: { "content-type": "text/plain", "user-agent": s.ua, "x-forwarded-for": s.ip, host: s.host ?? "www.hadamley.com", "x-vercel-ip-country": "GB", "x-vercel-ip-city": "Romford" },
      }),
    );
    expect(res.status).toBe(204);
  }
}

describe("analytics accuracy against a known truth (400 visitors through the real endpoint)", () => {
  let report: Report;
  let truth: Truth;
  let sent = 0;

  beforeAll(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const sim = simulate(400);
    truth = sim.truth;
    sent = sim.sends.length;
    await deliver(sim.sends);
    vi.setSystemTime(REPORT_NOW);
    const range = resolveRange("today", REPORT_NOW);
    report = buildReport(await loadHits(range.prevFrom, range.to), range, {}, (p) => p, false);
  }, 120_000);

  afterAll(() => {
    vi.useRealTimers();
  });

  it("sent a realistic volume of beacons", () => {
    expect(sent).toBeGreaterThan(3000);
  });

  it("counts visitors, visits and page views exactly", () => {
    expect(report.totals.visitors).toBe(truth.visitors);
    expect(report.totals.visits).toBe(truth.visits);
    expect(report.totals.pageviews).toBe(truth.pageviews);
  });

  it("gets bounce rate, help found and average visit exactly", () => {
    expect(report.totals.bounceRate).toBeCloseTo(1 - truth.engagedVisits / truth.visits, 10);
    expect(report.totals.actionRate).toBeCloseTo(truth.helpVisits / truth.visits, 10);
    const avg = truth.durations.reduce((a, b) => a + b, 0) / truth.durations.length;
    expect(report.totals.avgVisitMs).toBeCloseTo(avg, 6);
  });

  it("puts every visit under the right channel", () => {
    const got = Object.fromEntries(report.channels.map((c) => [c.key, c.second]));
    expect(got).toEqual(truth.channels);
  });

  it("puts every visit under the right device", () => {
    const got = Object.fromEntries(report.devices.map((d) => [d.key, d.second]));
    expect(got).toEqual(truth.devices);
  });

  it("counts every page view under the right page", () => {
    const got = Object.fromEntries(report.pages.map((p) => [p.key, p.second]));
    expect(got).toEqual(truth.pages);
  });

  it("counts every action, including searches that arrive just before their page view", () => {
    const got = Object.fromEntries(Object.entries(report.actions).filter(([, n]) => n > 0));
    expect(got).toEqual(truth.actions);
  });

  it("ignores robots, admin pages and malformed beacons entirely", () => {
    expect(report.pages.find((p) => p.key.startsWith("/admin"))).toBeUndefined();
    expect(report.browsers.find((b) => /bot/i.test(b.key))).toBeUndefined();
    // Every counted visitor is one of the simulated people (none from the robots' or junk addresses).
    expect(report.totals.visitors).toBe(400);
  });

  it("adds up: the hourly series and the totals agree", () => {
    expect(report.series.reduce((n, p) => n + p.pageviews, 0)).toBe(truth.pageviews);
    expect(report.series.reduce((n, p) => n + p.visits, 0)).toBe(truth.visits);
    expect(report.hours.reduce((a, b) => a + b, 0)).toBe(truth.visits);
  });
});
