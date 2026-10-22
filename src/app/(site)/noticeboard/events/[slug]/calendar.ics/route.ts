import { getEvent } from "@/lib/notice";

export const runtime = "nodejs";

const stamp = (local: string) => local.replace(/[-:]/g, "") + "00";
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** A calendar file (.ics) for one event, in UK time. */
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const e = getEvent((await params).slug);
  if (!e) return new Response("Not found", { status: 404 });
  const url = new URL(`/noticeboard/events/${e.slug}`, req.url).toString();
  const end = e.endsAt || e.startsAt;
  const body = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Hadamley//Noticeboard//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VTIMEZONE",
    "TZID:Europe/London",
    "BEGIN:DAYLIGHT",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0100",
    "TZNAME:BST",
    "DTSTART:19700329T010000",
    "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
    "END:DAYLIGHT",
    "BEGIN:STANDARD",
    "TZOFFSETFROM:+0100",
    "TZOFFSETTO:+0000",
    "TZNAME:GMT",
    "DTSTART:19701025T020000",
    "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${e.id}@hadamley`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;TZID=Europe/London:${stamp(e.startsAt)}`,
    `DTEND;TZID=Europe/London:${stamp(end)}`,
    `SUMMARY:${esc(e.title)}`,
    `DESCRIPTION:${esc(`${e.summary}\n\n${url}`)}`,
    `LOCATION:${esc(e.location)}`,
    `URL:${url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return new Response(body, {
    headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${e.slug}.ics"` },
  });
}
