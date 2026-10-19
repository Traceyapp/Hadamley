"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";

/** One set of filter inputs: a toggle panel on small screens, a sidebar on large. */
export function FiltersPanel({ activeCount, children }: { activeCount: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-surface lg:sticky lg:top-36">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filters-panel"
        className="flex min-h-12 w-full items-center justify-between gap-2 px-4 font-bold lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-5" aria-hidden /> Filters
          {activeCount > 0 && <span className="rounded-full bg-brand px-2 text-sm text-paper">{activeCount}</span>}
        </span>
        <span className="text-sm text-ink-2">{open ? "Hide" : "Show"}</span>
      </button>
      <div id="filters-panel" className={`filters-panel border-t border-line p-4 lg:block lg:border-0 lg:p-5 ${open ? "block" : "hidden"}`}>
        <h2 className="mb-4 hidden items-center gap-2 font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ink-2 lg:flex">
          <SlidersHorizontal className="size-4" aria-hidden /> Filter results
        </h2>
        {children}
      </div>
      <noscript>
        <style>{`.filters-panel{display:block!important}`}</style>
      </noscript>
    </div>
  );
}
