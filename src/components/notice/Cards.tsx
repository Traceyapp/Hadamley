import Link from "next/link";
import { ArrowRight, CalendarPlus, MapPin, Monitor } from "lucide-react";
import type { NoticeEvent, Post } from "@/lib/types";
import { eventParts } from "@/lib/notice";
import { formatDate } from "@/lib/format";

/** A drawing pin at the top of a pinned card. */
function Pin({ color = "var(--accent)" }: { color?: string }) {
  return (
    <span aria-hidden="true" className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
      <span className="block size-6 rounded-full border-[1.5px] border-ink shadow-[2px_3px_0_rgba(0,0,0,0.25)]" style={{ background: color }} />
      <span className="absolute left-1/2 top-1.5 block size-2 -translate-x-1/2 rounded-full bg-white/60" />
    </span>
  );
}

const TILT = ["-rotate-[1.4deg]", "rotate-[1deg]", "-rotate-[0.6deg]", "rotate-[1.6deg]"];

/** An event as a ticket: date block on the left, details on the right. */
export function EventTicket({ e, i = 0 }: { e: NoticeEvent; i?: number }) {
  const s = eventParts(e.startsAt);
  const end = e.endsAt ? eventParts(e.endsAt) : null;
  return (
    <article className={`group relative transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 ${TILT[i % TILT.length]}`}>
      <Pin color={i % 2 ? "var(--art-lake)" : "var(--art-brick)"} />
      <div className="card-print flex h-full overflow-hidden">
        <div className="sec-mob flex w-24 shrink-0 flex-col items-center justify-center border-r-[1.5px] border-dashed border-ink bg-sec-soft px-2 py-5 text-center sm:w-28">
          <span className="kicker text-sec">{s.month}</span>
          <span className="font-display text-[2.8rem] font-semibold leading-none">{s.day}</span>
          <span className="mt-1 text-[0.8rem] font-bold text-ink-2">{s.weekday.slice(0, 3)}</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <h3 className="text-[1.3rem] font-semibold leading-snug">
            <Link href={`/noticeboard/events/${e.slug}`} className="after:absolute after:inset-0 group-hover:underline">
              <span className="soft-hover">{e.title}</span>
            </Link>
          </h3>
          <p className="mt-1 text-[0.95rem] font-bold text-ink-2">
            {s.time}
            {end && ` to ${end.time}`} · {e.cost || "Free"}
          </p>
          <p className="mt-2 line-clamp-2 text-ink-2">{e.summary}</p>
          <p className="mt-auto flex items-center gap-1.5 pt-4 text-[0.9rem] text-ink-2">
            {e.online ? <Monitor className="size-4" aria-hidden /> : <MapPin className="size-4" aria-hidden />}
            {e.location}
          </p>
          <a href={`/noticeboard/events/${e.slug}/calendar.ics`} className="relative z-10 mt-3 inline-flex items-center gap-1.5 self-start text-[0.9rem] font-bold text-sec hover:underline">
            <CalendarPlus className="size-4" aria-hidden /> Add to my calendar
            <span className="sr-only">: {e.title}</span>
          </a>
        </div>
      </div>
    </article>
  );
}

/** A news post as a pinned note. */
export function PostNote({ p, i = 0 }: { p: Post; i?: number }) {
  return (
    <article className={`group relative h-full transition-transform duration-300 hover:rotate-0 hover:-translate-y-1 ${TILT[(i + 1) % TILT.length]}`}>
      <Pin color={i % 2 ? "var(--art-meadow)" : "var(--art-rose)"} />
      <div className="card-print flex h-full flex-col p-6 pt-7">
        <p className="kicker text-ink-2">{formatDate(p.publishedAt)}</p>
        <h3 className="mt-2 text-[1.35rem] font-semibold leading-snug">
          <Link href={`/noticeboard/news/${p.slug}`} className="after:absolute after:inset-0 group-hover:underline">
            <span className="soft-hover">{p.title}</span>
          </Link>
        </h3>
        <p className="mt-2 text-ink-2">{p.summary}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-bold">
          Read <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
        </span>
      </div>
    </article>
  );
}
