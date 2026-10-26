"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck, ChevronDown, MapPin, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Morph } from "@/components/fx/Morph";

export type FinderListing = {
  id: string;
  name: string;
  summary: string;
  provider: string;
  topics: string[];
  areas: string[];
  areaLabel: string;
  delivery: string[];
  self: boolean;
  free: boolean;
  checked: string;
};

type Opt = { value: string; label: string };

const NEEDS: Record<string, string> = {
  physiotherapy: "physiotherapy",
  "occupational-therapy": "occupational therapy",
  "mental-health": "mental health support",
  equipment: "mobility equipment",
  transport: "accessible transport",
  "assessments-costs": "help with costs",
  "hospitals-clinics": "a specialist clinic",
  "long-term-conditions": "chronic illness support",
  "disability-rehab": "rehabilitation",
};

/** Towns inside the London Borough of Havering: borough-wide services cover them too. */
const HAVERING_TOWNS = new Set(["romford", "hornchurch", "upminster", "rainham"]);

const WAYS: Opt[] = [
  { value: "", label: "works for me" },
  { value: "self", label: "I can refer myself to" },
  { value: "home", label: "can visit me at home" },
  { value: "remote", label: "I can use by phone or online" },
  { value: "free", label: "is free to use" },
];

/**
 * A real <select>, invisible, laid over the chosen words. The words carry the
 * styling; the select carries the behaviour and accessibility.
 */
function Blank({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: Opt[]; onChange: (v: string) => void }) {
  const current = options.find((o) => o.value === value)?.label ?? options[0].label;
  return (
    <span className="relative inline-flex items-baseline gap-[0.12em] max-w-full rounded-lg focus-within:outline focus-within:outline-[3px] focus-within:outline-[var(--focus)] focus-within:outline-offset-2">
      <span aria-hidden="true" className="min-w-0 font-display italic text-sec underline decoration-[0.07em] decoration-dotted underline-offset-[0.16em]">
        {current}
      </span>
      <ChevronDown aria-hidden="true" className="size-[0.55em] shrink-0 self-center text-sec" strokeWidth={2.75} />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="peer absolute inset-0 size-full cursor-pointer appearance-none font-sans text-base not-italic font-normal tracking-normal opacity-0 focus-visible:shadow-none focus-visible:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </span>
  );
}

export function SentenceFinder({
  listings,
  topics,
  areas,
  onFocusChange,
  scene,
}: {
  listings: FinderListing[];
  topics: Opt[];
  areas: Opt[];
  /** Lets the hero illustration follow what the visitor picks. */
  onFocusChange?: (focus: { need: string; place: string }) => void;
  /** Rendered between the sentence and the results, so cause and effect sit together. */
  scene?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const [need, setNeed] = useState("");
  const [place, setPlace] = useState("");
  const [way, setWay] = useState("");
  useEffect(() => onFocusChange?.({ need, place }), [need, place, onFocusChange]);

  const needOpts: Opt[] = [{ value: "", label: "anything" }, ...topics.map((t) => ({ value: t.value, label: NEEDS[t.value] ?? t.label.toLowerCase() }))];
  const placeOpts: Opt[] = [{ value: "", label: "any area" }, ...areas];

  const matches = useMemo(
    () =>
      listings.filter(
        (l) =>
          (!need || l.topics.includes(need)) &&
          (!place || l.areas.includes(place) || (HAVERING_TOWNS.has(place) && l.areas.includes("havering"))) &&
          (way === "" ||
            (way === "self" && l.self) ||
            (way === "home" && l.delivery.includes("home")) ||
            (way === "remote" && (l.delivery.includes("phone") || l.delivery.includes("online"))) ||
            (way === "free" && l.free)),
      ),
    [listings, need, place, way],
  );

  const params = new URLSearchParams();
  if (need) params.set("topic", need);
  if (place) params.set("area", place);
  if (way === "self") params.set("self", "1");
  if (way === "free") params.set("free", "1");
  if (way === "home") params.set("delivery", "home");
  if (way === "remote") {
    params.append("delivery", "phone");
    params.append("delivery", "online");
  }
  const allHref = `/find-support${params.size ? `?${params}` : ""}`;
  const touched = need || place || way;

  return (
    <form action="/find-support" className="sec-find">
      <p className="mb-3 text-sm text-ink-2">Choose what you need, where, and what works for you.</p>
      <p className="max-w-5xl font-display text-[1.55rem] font-medium leading-[1.4] tracking-[-0.02em] text-ink sm:text-[2.6rem] lg:text-[3.1rem]">
        I&apos;d like help with <Blank id="topic" label="What kind of support" value={need} options={needOpts} onChange={setNeed} />
        {" in "}
        <Blank id="area" label="Where" value={place} options={placeOpts} onChange={setPlace} />
        {" that "}
        <Blank id="way" label="What matters to you" value={way} options={WAYS} onChange={setWay} />
      </p>

      {scene}
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3" aria-live="polite">
        <p className="text-lg">
          <span className="font-display text-[2.2rem] font-semibold leading-none text-sec">{matches.length}</span>{" "}
          <span className="font-bold">{matches.length === 1 ? "service matches" : "services match"}</span>
        </p>
        <Link href={matches.length ? allHref : "/find-support"} className="card-print card-print-hover inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-bold text-paper">
          {matches.length ? "See them all" : "Browse every service"} <ArrowRight className="size-4" aria-hidden />
        </Link>
        {touched && (
          <button
            type="button"
            onClick={() => {
              setNeed("");
              setPlace("");
              setWay("");
            }}
            className="inline-flex min-h-11 items-center gap-1.5 font-bold text-ink-2 hover:text-ink"
          >
            <RotateCcw className="size-4" aria-hidden /> Start again
          </button>
        )}
        <noscript>
          <button type="submit" className="min-h-12 rounded-full bg-ink px-5 font-bold text-paper">
            Show matching services
          </button>
        </noscript>
      </div>

      <ul className="mt-7 grid gap-4 md:grid-cols-3" aria-label="Top matches">
        <AnimatePresence mode="popLayout" initial={false}>
          {matches.slice(0, 3).map((l) => (
            <motion.li
              key={l.id}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, y: 14, rotate: -1 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <Link href={`/find-support/${l.id}`} className="card-print card-print-hover group flex h-full flex-col p-5">
                <span className="kicker text-ink-2">{l.provider}</span>
                <Morph name={`listing-${l.id}`}>
                  <span className="soft-hover mt-1.5 inline-block font-display text-[1.2rem] font-semibold leading-snug group-hover:underline">{l.name}</span>
                </Morph>
                <span className="mt-1.5 line-clamp-2 text-[0.93rem] text-ink-2">{l.summary}</span>
                <span className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-4 text-[0.85rem] text-ink-2">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5" aria-hidden /> {l.areaLabel}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarCheck className="size-3.5 text-ok" aria-hidden /> Checked {l.checked}
                  </span>
                </span>
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
        {matches.length === 0 && (
          <li className="rounded-[var(--radius-card)] border-[1.5px] border-dashed border-line-strong p-6 md:col-span-3">
            <p className="font-display text-xl font-semibold">Nothing matches all three yet.</p>
            <p className="mt-1 text-ink-2">
              Try <button type="button" className="link font-bold" onClick={() => setPlace("")}>any area</button> or{" "}
              <button type="button" className="link font-bold" onClick={() => setWay("")}>any way</button>, or ask the Hadamley helper in your own words.
            </p>
          </li>
        )}
      </ul>
    </form>
  );
}
