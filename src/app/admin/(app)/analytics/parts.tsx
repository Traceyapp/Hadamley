import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Filters, Row } from "@/lib/analytics/aggregate";

/* Small building blocks for the analytics board. */

export type Params = { range?: string; metric?: string } & Filters;

export function boardHref(current: Params, change: Partial<Record<keyof Params, string | undefined>>) {
  const q = new URLSearchParams();
  const next = { ...current, ...change };
  for (const [k, v] of Object.entries(next)) if (v) q.set(k, v);
  const s = q.toString();
  return `/admin/analytics${s ? `?${s}` : ""}`;
}

export const fmt = {
  n: (v: number) => (v >= 100_000 ? `${(v / 1000).toFixed(0)}K` : v >= 10_000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toLocaleString("en-GB")),
  pct: (v: number) => `${Math.round(v * 100)}%`,
  dec: (v: number) => v.toFixed(1),
  ms: (v: number) => {
    const s = Math.round(v / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  },
};

/** Change against the previous period. `upIsGood` sets the colour; an arrow and words carry it too. */
export function Delta({ now, before, upIsGood = true, percentPoints = false }: { now: number; before: number | undefined; upIsGood?: boolean; percentPoints?: boolean }) {
  if (before === undefined) return null;
  if (!before && !now) return <span className="text-[0.8rem] text-ink-2">No change</span>;
  if (!before && !percentPoints) return <span className="text-[0.8rem] font-bold text-ink-2">New this period</span>;
  const diff = percentPoints ? Math.round((now - before) * 100) : Math.round(((now - before) / before) * 100);
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.8rem] text-ink-2">
        <Minus className="size-3.5" aria-hidden /> No change
      </span>
    );
  }
  const good = diff > 0 === upIsGood;
  const Icon = diff > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[0.8rem] font-bold ${good ? "text-ok" : "text-urgent"}`}>
      <Icon className="size-3.5" aria-hidden />
      {Math.abs(diff)}
      {percentPoints ? " pts" : "%"}
      <span className="sr-only">{diff > 0 ? " up" : " down"} on the previous period</span>
    </span>
  );
}

/**
 * A ranked list with a data bar behind each row, the way analytics tools show
 * top pages and sources. Clicking a row filters the whole board by it.
 */
export function BarList({
  rows,
  head,
  cols,
  filterKey,
  params,
  empty = "Nothing yet for this period.",
  limit = 8,
  mono = false,
}: {
  rows: Row[];
  head: string;
  cols: { label: string; get: (r: Row) => string; wide?: boolean }[];
  filterKey?: keyof Filters;
  params?: Params;
  empty?: string;
  limit?: number;
  mono?: boolean;
}) {
  if (!rows.length) return <p className="rounded-lg bg-paper-2 px-3 py-4 text-center text-[0.9rem] text-ink-2">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  const renderRow = (r: Row) => {
    const label = (
      <span className={`relative block truncate ${mono ? "font-mono text-[0.84rem]" : ""}`} title={r.label !== r.key ? `${r.label} (${r.key})` : r.label}>
        {r.label || "(empty)"}
        {r.local && <span className="ml-1.5 rounded-full bg-ok-soft px-1.5 py-px align-[1px] text-[0.68rem] font-bold text-ok">Local</span>}
      </span>
    );
    return (
      <li key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="relative min-w-0 py-1.5 pl-2.5 pr-2">
          <span className="absolute inset-y-0.5 left-0 rounded-[4px] bg-[var(--brand-soft)]" style={{ width: `${Math.max((r.value / max) * 100, 1.5)}%` }} aria-hidden />
          {filterKey && params ? (
            <Link href={boardHref(params, { [filterKey]: r.key })} className="relative block min-w-0 hover:underline" title={`Show only visits for ${r.label}`}>
              {label}
            </Link>
          ) : (
            label
          )}
        </div>
        <div className="flex gap-2 text-right text-[0.88rem] tabular-nums sm:gap-3">
          {cols.map((c) => (
            <span key={c.label} className={`${c.wide ? "w-[4.5rem] sm:w-[5.5rem]" : "w-[3.75rem] sm:w-[4.5rem]"} ${c === cols[0] ? "font-bold" : "text-ink-2"}`}>
              {c.get(r)}
            </span>
          ))}
        </div>
      </li>
    );
  };
  return (
    <div>
      <div className="mb-1.5 grid grid-cols-[minmax(0,1fr)_auto] gap-3 text-[0.68rem] font-bold uppercase tracking-[0.06em] text-ink-2">
        <span className="pl-2.5">{head}</span>
        <span className="flex gap-2 text-right sm:gap-3">
          {cols.map((c) => (
            <span key={c.label} className={c.wide ? "w-[4.5rem] sm:w-[5.5rem]" : "w-[3.75rem] sm:w-[4.5rem]"}>
              {c.label}
            </span>
          ))}
        </span>
      </div>
      <ul className="space-y-0.5">{rows.slice(0, limit).map(renderRow)}</ul>
      {rows.length > limit && (
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-[0.86rem] font-bold text-brand hover:underline">
            <span className="group-open:hidden">Show {Math.min(rows.length, 50) - limit} more</span>
            <span className="hidden group-open:inline">Show fewer</span>
          </summary>
          <ul className="mt-1 space-y-0.5">{rows.slice(limit, 50).map(renderRow)}</ul>
        </details>
      )}
    </div>
  );
}

export function SubHead({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-6 text-[0.8rem] font-bold uppercase tracking-[0.12em] text-accent first:mt-0">{children}</h3>;
}
