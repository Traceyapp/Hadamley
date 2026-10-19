"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";

export type MapTown = {
  slug: string;
  name: string;
  x: number;
  y: number;
  r: number;
  labelX: number;
  labelY: number;
  anchor: "start" | "middle";
  services: { id: string; name: string; provider: string }[];
};

const BOROUGH =
  "M78 132 C 120 96, 190 104, 236 118 C 300 136, 352 150, 404 176 C 436 196, 430 248, 414 292 C 400 334, 360 376, 304 410 C 262 432, 210 438, 176 420 C 140 402, 120 360, 104 318 C 88 276, 54 238, 52 196 C 50 166, 60 146, 78 132 Z";
const THAMES = "M0 452 C 90 436, 160 462, 250 446 S 420 430, 600 448";
const EASE = [0.45, 0.05, 0.25, 1] as const;

/**
 * The explorable map. Towns are real links (so it works without JavaScript);
 * with JavaScript, choosing one opens its services right here instead.
 */
export function AreaMapView({ towns, a12, online, boroughWide, className = "" }: { towns: MapTown[]; a12: string; online: number; boroughWide: number; className?: string }) {
  const reduce = useReducedMotion();
  const [sel, setSel] = useState<string | null>(null);
  // Towns start at scale 0, which has no area to observe, so they follow the whole map's visibility.
  const mapRef = useRef<SVGSVGElement>(null);
  const mapInView = useInView(mapRef, { once: true, margin: "-60px" });
  const town = towns.find((t) => t.slug === sel);
  const view = { once: true, margin: "-60px" } as const;
  const draw = (delay: number, duration = 1.6) =>
    reduce ? {} : { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: view, transition: { duration, ease: EASE, delay } };
  const fade = (delay: number) => (reduce ? {} : { initial: { opacity: 0 }, whileInView: { opacity: 1 }, viewport: view, transition: { duration: 0.6, delay } });

  return (
    <figure className={className}>
      <svg ref={mapRef} viewBox="0 0 600 470" className="art w-full" role="group" aria-label="Map of areas covered. Choose a town to see its services.">
        <motion.path d={BOROUGH} fill="var(--art-lake)" transform="translate(6 6)" {...fade(1.2)} />
        <motion.path d={BOROUGH} className="ln" {...draw(0.1, 1.8)} />
        <a href="/find-support?area=havering" aria-label={`Havering, borough-wide: ${boroughWide} services`} className="group">
          <motion.text x="286" y="356" className="font-display text-[17px] italic group-hover:underline" style={{ fill: "var(--sec-ltc)" }} {...fade(1.4)}>
            London Borough
          </motion.text>
          <motion.text x="286" y="376" className="font-display text-[17px] italic group-hover:underline" style={{ fill: "var(--sec-ltc)" }} {...fade(1.4)}>
            of Havering
          </motion.text>
        </a>

        <motion.path d={THAMES} fill="none" stroke="var(--art-navy)" strokeWidth="16" strokeLinecap="round" {...draw(0.4, 1.4)} />
        <motion.path d={THAMES} className="ln-thin" {...draw(0.4, 1.4)} />
        <motion.text x="430" y="432" className="font-display text-[13px] italic" style={{ fill: "var(--ink-2)" }} {...fade(1.6)}>
          River Thames
        </motion.text>

        <motion.path d="M470 40 C 450 140, 452 240, 470 330 S 500 420, 520 470" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="7 6" opacity="0.6" {...fade(0.8)} />
        <motion.text x="478" y="300" className="text-[12px] font-bold" style={{ fill: "var(--ink-2)" }} {...fade(1.6)}>
          M25
        </motion.text>
        <motion.path d={a12} className="ln-thin" {...draw(0.9, 1.2)} />
        <motion.text x="300" y="132" className="text-[12px] font-bold" style={{ fill: "var(--ink-2)" }} transform="rotate(-14 300 132)" {...fade(1.6)}>
          A12
        </motion.text>

        <motion.g {...fade(1.5)} aria-hidden="true">
          <g transform="translate(410 262) scale(0.3)">
            <polygon className="ln fill-paper" points="-24,-30 24,-30 14,-115 -14,-115" />
            <g transform="translate(0 -118)">
              <g className="sails">
                <path className="ln" d="M-60 -60 L60 60 M60 -60 L-60 60" />
              </g>
            </g>
          </g>
          <path transform="translate(286 232)" className="ln" d="M0 0 a10 10 0 0 1 6 -16 a12 12 0 0 1 20 2 a10 10 0 0 1 0 16 z M13 0 v12" fill="var(--art-meadow)" />
          <path transform="translate(540 120)" className="ln" d="M0 0 a10 10 0 0 1 6 -16 a12 12 0 0 1 20 2 a10 10 0 0 1 0 16 z M13 0 v12" fill="var(--art-meadow)" />
          <text x="530" y="40" className="font-display text-[13px] italic" style={{ fill: "var(--ink-2)" }}>
            Essex
          </text>
          <path className="ln-thin" d="M560 70 l0 -14 m-5 5 l5 -5 l5 5" />
          <text x="566" y="66" className="text-[11px] font-bold" style={{ fill: "var(--ink-2)" }}>
            N
          </text>
        </motion.g>

        {towns.map((t, i) => {
          const active = sel === t.slug;
          return (
            <motion.a
              key={t.slug}
              href={`/find-support?area=${t.slug}`}
              aria-label={`${t.name}: ${t.services.length} ${t.services.length === 1 ? "service" : "services"}. ${active ? "Showing below." : "Show them."}`}
              aria-controls="map-panel"
              onClick={(e) => {
                e.preventDefault();
                setSel(active ? null : t.slug);
              }}
              className="group cursor-pointer outline-none"
              style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }}
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={reduce || mapInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 16, delay: reduce ? 0 : 1.1 + i * 0.12 }}
            >
              {active && !reduce && (
                <motion.circle
                  cx={t.x}
                  cy={t.y}
                  r={t.r}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  initial={{ r: t.r, opacity: 0.9 }}
                  animate={{ r: t.r + 18, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              {/* Generous hit area covering the bubble and its label, for touch */}
              <circle cx={t.x} cy={t.y + 8} r={t.r + 18} fill="transparent" />
              <circle cx={t.x + 4} cy={t.y + 4} r={t.r} fill="var(--ink)" />
              <circle cx={t.x} cy={t.y} r={t.r} fill={active ? "var(--ink)" : "var(--surface)"} stroke="var(--ink)" strokeWidth="1.6" className="transition-[fill] duration-300" />
              <circle cx={t.x} cy={t.y} r={t.r - 5} fill="var(--sec-find-soft)" className={`transition-opacity duration-300 ${active ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />
              <text x={t.x} y={t.y + 7} textAnchor="middle" className="font-display text-[20px] font-semibold transition-[fill] duration-300" style={{ fill: active ? "var(--paper)" : "var(--ink)" }}>
                {t.services.length}
              </text>
              <text x={t.labelX} y={t.labelY} textAnchor={t.anchor} className={`text-[14px] font-bold ${active ? "underline" : "group-hover:underline"}`} style={{ fill: "var(--ink)" }}>
                {t.name}
              </text>
              <circle cx={t.x} cy={t.y} r={t.r + 6} fill="none" stroke="var(--focus)" strokeWidth="4" className="opacity-0 group-focus-visible:opacity-100" />
            </motion.a>
          );
        })}
      </svg>

      <div id="map-panel" aria-live="polite" className="mt-4 min-h-[5.5rem] border-t-[1.5px] border-ink pt-4">
        {town ? (
            <motion.div key={town.slug} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-[1.35rem] font-semibold">
                  {town.name} <span className="font-normal italic text-sec">· {town.services.length} services</span>
                </p>
                <button type="button" onClick={() => setSel(null)} className="grid size-9 place-items-center rounded-full border-[1.5px] border-ink hover:bg-ink hover:text-paper" aria-label="Close town list">
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <ul className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                {town.services.slice(0, 6).map((s, i) => (
                  <motion.li key={s.id} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 + i * 0.04 }}>
                    <Link href={`/find-support/${s.id}`} className="group/s flex items-baseline gap-2 py-1.5">
                      <span className="kicker shrink-0 text-[0.65rem] text-ink-2">{s.provider}</span>
                      <span className="font-bold group-hover/s:underline">{s.name}</span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link href={`/find-support?area=${town.slug}`} className="mt-3 inline-flex items-center gap-1.5 font-bold text-sec hover:underline">
                See all {town.services.length} in Find Support <ArrowRight className="size-4" aria-hidden />
              </Link>
            </motion.div>
          ) : (
            <motion.p key="hint" initial={false} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.95rem] text-ink-2">
              <span className="font-hand text-[1.4rem] text-accent">tap a town ↑</span>
              Numbers include borough-wide services.
              {online > 0 && (
                <a href="/find-support?area=online-national" className="link font-bold">
                  Plus {online} online or UK-wide
                </a>
              )}
            </motion.p>
          )}
      </div>
    </figure>
  );
}
