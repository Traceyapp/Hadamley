import { readDb } from "./db";
import type { NoticeEvent, Post } from "./types";

/** "YYYY-MM-DDTHH:mm" for now, in UK time, so it compares directly with event times. */
export function londonNow(d = new Date()) {
  return d.toLocaleString("sv-SE", { timeZone: "Europe/London", hour12: false }).slice(0, 16).replace(" ", "T");
}

/** Splits a local "YYYY-MM-DDTHH:mm" into display parts, without timezone drift. */
export function eventParts(local: string) {
  const [date, time = "00:00"] = local.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const [hh, mm] = time.split(":").map(Number);
  const h12 = ((hh + 11) % 12) + 1;
  return {
    day: d,
    month: dt.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    weekday: dt.toLocaleDateString("en-GB", { weekday: "long", timeZone: "UTC" }),
    long: dt.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }),
    time: `${h12}${mm ? `:${String(mm).padStart(2, "0")}` : ""}${hh < 12 ? "am" : "pm"}`,
  };
}

export function publishedPosts(): Post[] {
  return readDb()
    .posts.filter((p) => p.status === "published")
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function upcomingEvents(): NoticeEvent[] {
  const now = londonNow();
  return readDb()
    .events.filter((e) => e.status === "published" && (e.endsAt || e.startsAt) >= now)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function pastEvents(limit = 6): NoticeEvent[] {
  const now = londonNow();
  return readDb()
    .events.filter((e) => e.status === "published" && (e.endsAt || e.startsAt) < now)
    .sort((a, b) => b.startsAt.localeCompare(a.startsAt))
    .slice(0, limit);
}

export const getPost = (slug: string) => publishedPosts().find((p) => p.slug === slug);
export const getEvent = (slug: string) => readDb().events.find((e) => e.status === "published" && e.slug === slug);
