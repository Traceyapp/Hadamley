import { describe, expect, it } from "vitest";
import { browserOf, channelOf, deviceOf, isBot, osOf, referrerHost, sourceLabel } from "@/lib/analytics/classify";
import { cleanPath, hitFromBeacon, isLiveCopy, visitorId, type RequestInfo } from "@/lib/analytics/collect";
import { buildReport, buildSessions, isEngaged, resolveRange } from "@/lib/analytics/aggregate";
import { loadHits, recordHits } from "@/lib/analytics/store";
import { londonDate, londonMidnight } from "@/lib/analytics/time";
import type { Hit } from "@/lib/analytics/types";

const IPHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const WIN_CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const info = (over: Partial<RequestInfo> = {}): RequestInfo => ({ ip: "203.0.113.7", ua: IPHONE, country: "United Kingdom", region: "ENG", city: "Romford", host: "hadamley.com", ...over });

describe("classifying visits", () => {
  it("spots bots and real browsers", () => {
    expect(isBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)")).toBe(true);
    expect(isBot("Mozilla/5.0 (Windows NT 10.0) HeadlessChrome/120.0")).toBe(true);
    expect(isBot("")).toBe(true);
    expect(isBot(IPHONE)).toBe(false);
  });

  it("reads device, browser and system", () => {
    expect([deviceOf(IPHONE), browserOf(IPHONE), osOf(IPHONE)]).toEqual(["Mobile", "Safari", "iOS"]);
    expect([deviceOf(WIN_CHROME), browserOf(WIN_CHROME), osOf(WIN_CHROME)]).toEqual(["Desktop", "Chrome", "Windows"]);
    expect(deviceOf("Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 Chrome/141 Safari/537.36")).toBe("Tablet");
  });

  it("groups referrers into channels", () => {
    expect(channelOf(referrerHost("https://www.google.co.uk/"))).toBe("Organic search");
    expect(channelOf(referrerHost("https://l.facebook.com/l.php?u=x"))).toBe("Social");
    expect(channelOf(referrerHost("https://chatgpt.com/"))).toBe("AI assistants");
    expect(channelOf(referrerHost("https://gemini.google.com/app"))).toBe("AI assistants");
    expect(channelOf(referrerHost("https://www.nhs.uk/conditions/fibromyalgia/"))).toBe("NHS & council");
    expect(channelOf(referrerHost("https://www.havering.gov.uk/"))).toBe("NHS & council");
    expect(channelOf(referrerHost("https://mail.google.com/"))).toBe("Email");
    expect(channelOf(referrerHost("https://somecharity.org.uk/links"))).toBe("Referral");
    expect(channelOf("")).toBe("Direct");
    expect(channelOf("", { source: "newsletter", medium: "email" })).toBe("Email");
    expect(channelOf("facebook.com", { medium: "cpc" })).toBe("Paid");
    expect(referrerHost("https://hadamley.com/about", "hadamley.com")).toBe("");
    expect(sourceLabel("google.co.uk")).toBe("Google");
  });
});

describe("collecting", () => {
  it("strips query strings and trailing slashes", () => {
    expect(cleanPath("/find-support/?q=physio#top")).toBe("/find-support");
    expect(cleanPath("/")).toBe("/");
    expect(cleanPath("https://evil.example/")).toBe("");
  });

  it("never stores the IP address, and the visitor code changes daily", () => {
    const h = hitFromBeacon({ k: "pv", p: "/about", r: "https://www.google.com/", w: 390 }, info(), new Date("2026-11-06T10:00:00Z"))!;
    expect(JSON.stringify(h)).not.toContain("203.0.113.7");
    expect(h).toMatchObject({ kind: "pageview", path: "/about", channel: "Organic search", device: "Mobile", city: "Romford" });
    const sameDay = visitorId("203.0.113.7", IPHONE, new Date("2026-11-06T22:00:00Z"));
    const nextDay = visitorId("203.0.113.7", IPHONE, new Date("2026-11-07T10:00:00Z"));
    expect(h.visitor).toBe(sameDay);
    expect(h.visitor).not.toBe(nextDay);
  });

  it("ignores bots, admin pages, unknown events and very short time records", () => {
    expect(hitFromBeacon({ k: "pv", p: "/" }, info({ ua: "Googlebot/2.1 (+http://www.google.com/bot.html)" }))).toBeNull();
    expect(hitFromBeacon({ k: "pv", p: "/admin/pages" }, info())).toBeNull();
    expect(hitFromBeacon({ k: "ev", p: "/", n: "purchase" }, info())).toBeNull();
    expect(hitFromBeacon({ k: "en", p: "/", ms: 300 }, info())).toBeNull();
    expect(hitFromBeacon({ k: "en", p: "/", ms: 99 * 60_000 }, info())!.ms).toBe(30 * 60_000);
  });

  it("saves and loads records from the local store", async () => {
    const h = hitFromBeacon({ k: "pv", p: "/resources" }, info(), new Date("2026-03-01T12:00:00Z"))!;
    await recordHits([h]);
    const back = await loadHits(new Date("2026-03-01T00:00:00Z"), new Date("2026-03-02T00:00:00Z"));
    expect(back).toEqual([h]);
  });
});

describe("the accuracy promises in the Stage 2 plan", () => {
  it("names Facebook and WhatsApp when the app hides where a visitor came from", () => {
    // Android apps: android-app://<package>
    expect(hitFromBeacon({ k: "pv", p: "/", r: "android-app://com.whatsapp/" }, info())).toMatchObject({ refHost: "whatsapp.com", channel: "Social" });
    expect(hitFromBeacon({ k: "pv", p: "/", r: "android-app://com.facebook.katana/" }, info())).toMatchObject({ refHost: "facebook.com", channel: "Social" });
    // Facebook's and Instagram's built-in browsers send no referrer but say who they are
    const fbApp = `${IPHONE} [FBAN/FBIOS;FBAV/480.0.0]`;
    expect(hitFromBeacon({ k: "pv", p: "/" }, info({ ua: fbApp }))).toMatchObject({ refHost: "facebook.com", channel: "Social" });
    expect(hitFromBeacon({ k: "pv", p: "/" }, info({ ua: `${IPHONE} Instagram 350.0` }))).toMatchObject({ refHost: "instagram.com" });
    // A Facebook click id on the address, with no referrer at all
    expect(hitFromBeacon({ k: "pv", p: "/", x: "fb" }, info({ ua: WIN_CHROME }))).toMatchObject({ refHost: "facebook.com", channel: "Social" });
    // A Google Ads click is paid, not organic
    expect(hitFromBeacon({ k: "pv", p: "/", x: "g" }, info({ ua: WIN_CHROME }))).toMatchObject({ refHost: "google.com", channel: "Paid" });
    // A real referrer still wins
    expect(hitFromBeacon({ k: "pv", p: "/", r: "https://www.google.com/" }, info({ ua: fbApp }))).toMatchObject({ refHost: "google.com" });
    expect(sourceLabel("whatsapp.com")).toBe("WhatsApp");
  });

  it("only counts the live site, never test copies", () => {
    expect(isLiveCopy("www.hadamley.com", { VERCEL_ENV: "production", supabase: true })).toBe(true);
    expect(isLiveCopy("hadamley-git-new-feature.vercel.app", { VERCEL_ENV: "preview", supabase: true })).toBe(false);
    expect(isLiveCopy("hadamley.vercel.app", { VERCEL_ENV: "development", supabase: true })).toBe(false);
    // A copy on a computer pointed at the real database
    expect(isLiveCopy("localhost", { supabase: true })).toBe(false);
    expect(isLiveCopy("127.0.0.1", { supabase: true })).toBe(false);
    // A copy on a computer with its own local data is fine: it can't reach the real numbers
    expect(isLiveCopy("localhost", { supabase: false })).toBe(true);
  });

  it("filters out automated tools as well as search engine robots", () => {
    for (const ua of [
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Mobile Safari/537.36 (compatible; Googlebot/2.1)",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36 Chrome-Lighthouse",
      "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
      "WhatsApp/2.23.20.0",
      "python-requests/2.32.3",
    ])
      expect(hitFromBeacon({ k: "pv", p: "/" }, info({ ua }))).toBeNull();
  });

  it("counts only useful helper replies as help found", () => {
    const now = new Date("2026-11-06T15:00:00Z");
    const at = (m: number) => new Date(now.getTime() - m * 60_000);
    const hits = [
      hitFromBeacon({ k: "pv", p: "/" }, info({ ip: "5.5.5.5" }), at(10))!,
      hitFromBeacon({ k: "ev", p: "/", n: "helper", t: "not_found" }, info({ ip: "5.5.5.5" }), at(9))!,
      hitFromBeacon({ k: "pv", p: "/" }, info({ ip: "6.6.6.6" }), at(10))!,
      hitFromBeacon({ k: "ev", p: "/", n: "helper", t: "answer" }, info({ ip: "6.6.6.6" }), at(9))!,
      hitFromBeacon({ k: "pv", p: "/" }, info({ ip: "7.7.7.7" }), at(10))!,
      hitFromBeacon({ k: "ev", p: "/", n: "search", t: "pip" }, info({ ip: "7.7.7.7" }), at(9))!,
    ];
    const r = buildReport(hits, resolveRange("today", now));
    expect(r.totals.visits).toBe(3);
    expect(r.totals.actionRate).toBeCloseTo(1 / 3);
    expect(r.actions.helper).toBe(2);
  });
});

describe("UK time", () => {
  it("finds midnight in winter and summer", () => {
    expect(londonMidnight("2026-01-15").toISOString()).toBe("2026-01-15T00:00:00.000Z");
    expect(londonMidnight("2026-07-15").toISOString()).toBe("2026-07-14T23:00:00.000Z");
    expect(londonDate("2026-07-14T23:30:00Z")).toBe("2026-07-15");
  });
});

describe("the report", () => {
  const now = new Date("2026-11-06T15:00:00Z");
  const at = (min: number) => new Date(now.getTime() - min * 60_000);
  const mk = (ip: string, minAgo: number, beacon: Parameters<typeof hitFromBeacon>[0], over: Partial<RequestInfo> = {}) => hitFromBeacon(beacon, info({ ip, ...over }), at(minAgo))!;

  const hits: Hit[] = [
    // A: Google, three pages, phones a service. One visit, engaged.
    mk("1.1.1.1", 120, { k: "pv", p: "/", r: "https://www.google.co.uk/" }),
    mk("1.1.1.1", 119, { k: "pv", p: "/find-support" }),
    mk("1.1.1.1", 118, { k: "pv", p: "/find-support/l-physio" }),
    mk("1.1.1.1", 117, { k: "ev", p: "/find-support/l-physio", n: "phone", t: "01632 960 101" }),
    // A again 45 minutes later: a second visit, one page, 3 seconds. A bounce.
    mk("1.1.1.1", 72, { k: "pv", p: "/resources" }),
    mk("1.1.1.1", 72, { k: "en", p: "/resources", ms: 3000 }),
    // B: Facebook on a desktop in Leeds, one page, read for 40 seconds. Engaged.
    mk("2.2.2.2", 30, { k: "pv", p: "/mental-health-support", r: "https://m.facebook.com/" }, { ua: WIN_CHROME, city: "Leeds" }),
    mk("2.2.2.2", 29, { k: "en", p: "/mental-health-support", ms: 40_000 }, { ua: WIN_CHROME, city: "Leeds" }),
    // C: direct, downloads a guide.
    mk("3.3.3.3", 2, { k: "pv", p: "/resources" }, { city: "Hornchurch" }),
    mk("3.3.3.3", 1, { k: "ev", p: "/resources", n: "download", t: "Understanding_Fibromyalgia.pdf" }, { city: "Hornchurch" }),
    // D: last week, for the comparison.
    mk("4.4.4.4", 60 * 24 * 8, { k: "pv", p: "/" }),
  ];

  it("splits visits after 30 minutes without activity", () => {
    const sessions = buildSessions(hits.filter((h) => h.visitor === hits[0]!.visitor));
    expect(sessions).toHaveLength(2);
    expect(sessions[0]!.pages).toHaveLength(3);
    expect(isEngaged(sessions[0]!)).toBe(true);
    expect(isEngaged(sessions[1]!)).toBe(false);
  });

  it("adds up the headline numbers and compares with the period before", () => {
    const range = resolveRange("7d", now);
    const r = buildReport(hits, range, {}, (p) => (p === "/find-support/l-physio" ? "Havering Community Physiotherapy" : p));
    expect(r.totals).toMatchObject({ visitors: 3, visits: 4, pageviews: 6 });
    expect(r.totals.bounceRate).toBe(0.25);
    expect(r.totals.actionRate).toBe(0.5);
    expect(r.totals.localShare).toBeCloseTo(3 / 4);
    expect(r.previous).toMatchObject({ visitors: 1, visits: 1 });
    expect(r.series).toHaveLength(7);
    expect(r.series.at(-1)).toMatchObject({ visitors: 3, visits: 4, pageviews: 6 });
    expect(r.channels.map((c) => c.key)).toEqual(expect.arrayContaining(["Organic search", "Social", "Direct"]));
    expect(r.sources.map((s) => s.label)).toEqual(expect.arrayContaining(["Google", "Facebook"]));
    expect(r.services[0]).toMatchObject({ label: "Havering Community Physiotherapy", value: 1 });
    expect(r.actions).toMatchObject({ phone: 1, download: 1, outbound: 0 });
    expect(r.cities.find((c) => c.key === "Hornchurch")?.local).toBe(true);
    expect(r.pages.find((p) => p.key === "/mental-health-support")?.third).toBe(40_000);
  });

  it("filters every figure by page, channel or town", () => {
    const range = resolveRange("7d", now);
    expect(buildReport(hits, range, { page: "/resources" }).totals.visits).toBe(2);
    expect(buildReport(hits, range, { channel: "Social" }).totals).toMatchObject({ visits: 1, pageviews: 1 });
    expect(buildReport(hits, range, { city: "Leeds" }).totals.visitors).toBe(1);
  });

  it("buckets today by hour and a year by month", () => {
    expect(buildReport(hits, resolveRange("today", now)).series).toHaveLength(16);
    expect(buildReport(hits, resolveRange("12m", now), {}, undefined, false).series.map((p) => p.key).at(-1)).toBe("2026-11");
  });
});
