"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Point = { key: string; label: string; value: number };

const H = 260;
const PAD = { top: 16, right: 16, bottom: 30, left: 44 };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(v));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s * 4 >= v) ?? 10 * pow;
  return step * 4;
}

const tick = (v: number) => (v >= 10_000 ? `${Math.round(v / 1000)}K` : v.toLocaleString("en-GB"));

/** One series over time: a 2px line over a light wash, with a crosshair readout on hover or arrow keys. */
export function TrendChart({ points, metric }: { points: Point[]; metric: string }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e!.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const innerW = w - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const { line, area } = useMemo(() => {
    const pts = points.map((p, i) => [x(i), y(p.value)] as const);
    const line = pts.map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`).join("");
    const area = pts.length ? `${line}L${pts.at(-1)![0].toFixed(1)},${PAD.top + innerH}L${pts[0]![0].toFixed(1)},${PAD.top + innerH}Z` : "";
    return { line, area };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, w, max]);

  // Show a few date labels, always including the first and last.
  // About one date label per 80px of chart, so they never run into each other on a phone.
  const fit = Math.max(2, Math.min(6, Math.floor(innerW / 80)));
  const every = Math.max(1, Math.ceil(points.length / fit));
  const last = points.length - 1;
  // Skip a regular label that would crowd the last one.
  const labelled = points.map((_, i) => i === last || (i % every === 0 && last - i >= every * 0.6));

  const onMove = (clientX: number) => {
    const r = wrap.current?.getBoundingClientRect();
    if (!r || !points.length) return;
    const rel = clientX - r.left - PAD.left;
    const i = points.length <= 1 ? 0 : Math.round((rel / innerW) * (points.length - 1));
    setActive(Math.min(points.length - 1, Math.max(0, i)));
  };

  const a = active !== null ? points[active] : null;
  const total = points.reduce((n, p) => n + p.value, 0);

  return (
    <div
      ref={wrap}
      className="relative select-none outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] rounded-lg"
      tabIndex={0}
      role="img"
      aria-label={`${metric} over time: ${total.toLocaleString("en-GB")} in total across ${points.length} periods. Use the left and right arrow keys to read each value.`}
      onPointerMove={(e) => onMove(e.clientX)}
      onPointerLeave={() => setActive(null)}
      onBlur={() => setActive(null)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          setActive((cur) => {
            const base = cur ?? (e.key === "ArrowRight" ? -1 : points.length);
            return Math.min(points.length - 1, Math.max(0, base + (e.key === "ArrowRight" ? 1 : -1)));
          });
        }
      }}
    >
      <svg width={w} height={H} className="block" aria-hidden>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line x1={PAD.left} x2={w - PAD.right} y1={y(max * f)} y2={y(max * f)} stroke="var(--line)" strokeWidth={1} shapeRendering="crispEdges" />
            <text x={PAD.left - 8} y={y(max * f)} dy="0.32em" textAnchor="end" className="fill-[var(--ink-2)] text-[11px] tabular-nums">
              {tick(max * f)}
            </text>
          </g>
        ))}
        {points.map((p, i) =>
          labelled[i] ? (
            <text key={p.key} x={x(i)} y={H - 8} textAnchor={i === 0 && points.length > 1 ? "start" : i === points.length - 1 && points.length > 1 ? "end" : "middle"} className="fill-[var(--ink-2)] text-[11px]">
              {p.label.replace(/^[A-Z][a-z]{2} (?=\d)/, "")}
            </text>
          ) : null,
        )}
        <path d={area} fill="var(--brand)" fillOpacity={0.1} />
        <path d={line} fill="none" stroke="var(--brand)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {points.length === 1 && <circle cx={x(0)} cy={y(points[0]!.value)} r={4} fill="var(--brand)" stroke="var(--surface)" strokeWidth={2} />}
        {a && active !== null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} stroke="var(--ink-2)" strokeOpacity={0.5} strokeWidth={1} />
            <circle cx={x(active)} cy={y(a.value)} r={5} fill="var(--brand)" stroke="var(--surface)" strokeWidth={2} />
          </g>
        )}
      </svg>
      {a && active !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-32 rounded-lg border border-line bg-surface px-3 py-2 shadow-[var(--admin-shadow)]"
          style={{ left: Math.min(Math.max(x(active) - 64, 0), w - 140) }}
          role="status"
        >
          <p className="text-[0.78rem] text-ink-2">{a.label}</p>
          <p className="flex items-center gap-2 text-[0.95rem]">
            <span className="h-0.5 w-3 rounded bg-[var(--brand)]" aria-hidden />
            <strong className="tabular-nums">{a.value.toLocaleString("en-GB")}</strong>
            <span className="text-ink-2">{metric.toLowerCase()}</span>
          </p>
        </div>
      )}
    </div>
  );
}
