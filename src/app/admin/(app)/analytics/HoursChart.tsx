"use client";

import { useState } from "react";

const hh = (h: number) => `${String(h % 24).padStart(2, "0")}:00`;

/**
 * Visits by hour of day (UK time): 24 columns on one baseline. Hover, tap or
 * the arrow keys show the exact figure; the busiest hour is named above.
 */
export function HoursChart({ hours }: { hours: number[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(...hours, 0);
  const total = hours.reduce((a, b) => a + b, 0);
  const peak = hours.indexOf(max);
  const shown = active ?? (max ? peak : null);

  return (
    <div>
      <p className="min-h-6 text-[0.92rem]" aria-live="polite">
        {total === 0 ? (
          <span className="text-ink-2">No visits in this period yet.</span>
        ) : shown !== null ? (
          <>
            <span className="text-ink-2">{active === null ? "Busiest: " : ""}</span>
            <strong>
              {hh(shown)} to {hh(shown + 1)}
            </strong>
            <span className="text-ink-2">
              {" "}
              · {hours[shown]} {hours[shown] === 1 ? "visit" : "visits"} ({Math.round(((hours[shown] ?? 0) / total) * 100)}%)
            </span>
          </>
        ) : null}
      </p>

      <div
        role="group"
        aria-label="Visits by hour of the day. Use the left and right arrow keys to read each hour."
        tabIndex={0}
        className="mt-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)]"
        onKeyDown={(e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          setActive((cur) => {
            const base = cur ?? (e.key === "ArrowRight" ? -1 : 24);
            return Math.min(23, Math.max(0, base + (e.key === "ArrowRight" ? 1 : -1)));
          });
        }}
        onBlur={() => setActive(null)}
        onPointerLeave={() => setActive(null)}
      >
        <div className="grid h-32 grid-cols-24 items-end gap-[2px] border-b border-line">
          {hours.map((n, h) => (
            <button
              key={h}
              type="button"
              tabIndex={-1}
              aria-label={`${hh(h)} to ${hh(h + 1)}: ${n} ${n === 1 ? "visit" : "visits"}`}
              onPointerEnter={() => setActive(h)}
              onClick={() => setActive(h)}
              className="flex h-full items-end"
            >
              <span
                className={`w-full rounded-t-[4px] bg-[var(--brand)] transition-opacity ${shown === h ? "opacity-100" : active !== null ? "opacity-35" : "opacity-75"}`}
                style={{ height: n && max ? `${Math.max((n / max) * 100, 4)}%` : "0%" }}
              />
            </button>
          ))}
        </div>
        {/* Time labels sit under their own columns, on the same 24-column grid. */}
        <div className="mt-1.5 grid grid-cols-24 text-[0.72rem] tabular-nums text-ink-2" aria-hidden>
          {[0, 6, 12, 18].map((h) => (
            <span key={h} className="whitespace-nowrap" style={{ gridColumn: `${h + 1} / span 3`, gridRow: 1 }}>
              {hh(h)}
            </span>
          ))}
          <span className="whitespace-nowrap text-right" style={{ gridColumn: "22 / span 3", gridRow: 1 }}>
            23:00
          </span>
        </div>
      </div>
    </div>
  );
}
