/**
 * One analytics record. Hadamley's analytics are first-party and cookieless:
 * no cookies or browser storage, no IP addresses kept. A visitor is a hash of
 * IP address and browser with a secret salt that changes every day (UK time),
 * so the same person cannot be followed from one day to the next.
 */
export type HitKind = "pageview" | "event" | "engage";

/** Key actions: the moments a visit turns into help found. */
export type EventName = "outbound" | "phone" | "email" | "download" | "search" | "helper";

export interface Hit {
  at: string;
  kind: HitKind;
  /** Path only, never the query string. */
  path: string;
  /** For events: what happened. */
  name?: EventName;
  /** For events: the site, file, number or search term involved. */
  target?: string;
  /** For engage records: milliseconds the page was on screen. */
  ms?: number;
  visitor: string;
  refHost: string;
  channel: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  device: string;
  browser: string;
  os: string;
  country: string;
  region: string;
  city: string;
}
