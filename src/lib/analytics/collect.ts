import crypto from "node:crypto";
import { browserOf, channelOf, clickIdSource, deviceOf, inAppSource, isBot, osOf, referrerHost } from "./classify";
import { londonDate } from "./time";
import type { EventName, Hit, HitKind } from "./types";

/** What the browser sends to /api/hv. Short keys keep each beacon small. */
export interface Beacon {
  /** pv = page view, ev = key action, en = time on page */
  k: "pv" | "ev" | "en";
  /** Path, e.g. "/find-support" */
  p: string;
  /** document.referrer, first page view of a page load only */
  r?: string;
  /** utm_source, utm_medium, utm_campaign */
  u?: { s?: string; m?: string; c?: string };
  /** Screen width in CSS pixels */
  w?: number;
  /** Event name */
  n?: string;
  /** Event target */
  t?: string;
  /** Milliseconds on screen */
  ms?: number;
  /** Click id on the landing address: fb (fbclid), g (gclid), ms (msclkid). Only which kind, never the id itself. */
  x?: string;
}

const EVENTS: EventName[] = ["outbound", "phone", "email", "download", "search", "helper"];
const KIND: Record<Beacon["k"], HitKind> = { pv: "pageview", ev: "event", en: "engage" };

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

/** Path only: no query string or fragment, no trailing slash, nothing odd. */
export function cleanPath(p: unknown) {
  let s = clip(p, 300).split(/[?#]/)[0] ?? "";
  if (!s.startsWith("/")) return "";
  try {
    s = decodeURI(s);
  } catch {
    // leave as is
  }
  if (s.length > 1) s = s.replace(/\/+$/, "");
  return s || "/";
}

function salt(day: string) {
  const secret = process.env.SESSION_SECRET || "hadamley-analytics";
  return crypto.createHmac("sha256", secret).update(`analytics:${day}`).digest();
}

/** Anonymous visitor id for today: changes at UK midnight and can't be turned back into an IP address. */
export function visitorId(ip: string, ua: string, at = new Date()) {
  return crypto.createHmac("sha256", salt(londonDate(at))).update(`${ip}|${ua}`).digest("hex").slice(0, 20);
}

const regionNames = new Intl.DisplayNames(["en-GB"], { type: "region" });
function countryName(code: string) {
  if (!/^[A-Z]{2}$/.test(code) || code === "XX") return "";
  try {
    return regionNames.of(code) ?? code;
  } catch {
    return code;
  }
}

function decode(v: string | null) {
  if (!v) return "";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export interface RequestInfo {
  ip: string;
  ua: string;
  country: string;
  region: string;
  city: string;
  host: string;
}

/** IP, browser and approximate location from the request headers (Vercel or Cloudflare). Nothing here is stored as-is. */
export function requestInfo(headers: Headers): RequestInfo {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
  const code = (headers.get("x-vercel-ip-country") || headers.get("cf-ipcountry") || "").toUpperCase();
  return {
    ip,
    ua: headers.get("user-agent") ?? "",
    country: countryName(code),
    region: decode(headers.get("x-vercel-ip-country-region")),
    city: decode(headers.get("x-vercel-ip-city") || headers.get("cf-ipcity")),
    host: (headers.get("x-forwarded-host") || headers.get("host") || "").split(":")[0]!.toLowerCase(),
  };
}

/**
 * Only the live site counts. Vercel preview and development deployments are
 * test copies, and so is a copy running on a computer (localhost) that has
 * been pointed at the real Supabase database.
 */
export function isLiveCopy(host: string, env: { VERCEL_ENV?: string; supabase: boolean }) {
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "production") return false;
  const local = host === "localhost" || host === "::1" || host === "[::1]" || /^127\./.test(host) || host.endsWith(".localhost") || host.endsWith(".test");
  if (local && env.supabase) return false;
  return true;
}

/** Builds a record from a beacon, or null if it should not be counted. */
export function hitFromBeacon(b: Partial<Beacon>, info: RequestInfo, at = new Date()): Hit | null {
  if (!b || typeof b !== "object" || !(b.k && b.k in KIND)) return null;
  if (isBot(info.ua)) return null;
  const path = cleanPath(b.p);
  if (!path || path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/_next")) return null;

  const kind = KIND[b.k];
  let name: EventName | undefined;
  let target: string | undefined;
  let ms: number | undefined;
  if (kind === "event") {
    name = EVENTS.find((e) => e === b.n);
    if (!name) return null;
    target = clip(b.t, 200);
    if (name === "search") target = target.toLowerCase().replace(/\s+/g, " ");
  }
  if (kind === "engage") {
    const n = Math.round(Number(b.ms));
    if (!Number.isFinite(n) || n < 1000) return null;
    ms = Math.min(n, 30 * 60_000);
  }

  const width = Number(b.w) || undefined;
  const utm = { source: clip(b.u?.s, 80), medium: clip(b.u?.m, 80), campaign: clip(b.u?.c, 120) };
  let refHost = "";
  if (kind === "pageview") {
    refHost = referrerHost(clip(b.r, 500), info.host);
    // No referrer: an app may have hidden it. Name the app from its built-in browser or the link's click id.
    const click = clickIdSource(b.x);
    if (!refHost) refHost = inAppSource(info.ua) || click?.host || "";
    if (click?.paid && !utm.medium) utm.medium = "cpc";
  }
  return {
    at: at.toISOString(),
    kind,
    path,
    ...(name ? { name } : {}),
    ...(target !== undefined ? { target } : {}),
    ...(ms !== undefined ? { ms } : {}),
    visitor: visitorId(info.ip, info.ua, at),
    refHost,
    channel: kind === "pageview" ? channelOf(refHost, utm) : "",
    utmSource: utm.source,
    utmMedium: utm.medium,
    utmCampaign: utm.campaign,
    device: deviceOf(info.ua, width),
    browser: browserOf(info.ua),
    os: osOf(info.ua),
    country: info.country,
    region: info.region,
    city: info.city,
  };
}
