"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * "Find a condition" box for a Conditions A–Z accordion. Hides the condition
 * entries whose heading doesn't match, and opens the A–Z list when the
 * address points at one of its conditions (#id).
 */
export function ConditionFilter({ label = "Find a condition" }: { label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [none, setNone] = useState(false);

  const entries = () => [...(ref.current?.closest("details")?.querySelectorAll<HTMLDetailsElement>("[data-accordions] details") ?? [])];

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const outer = ref.current?.closest("details");
      if (id && outer && outer.querySelector(`[id="${CSS.escape(id)}"]`)) outer.open = true;
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  useEffect(() => {
    const term = q.trim().toLowerCase();
    let shown = 0;
    for (const d of entries()) {
      const match = !term || (d.querySelector("summary")?.textContent ?? "").toLowerCase().includes(term);
      d.hidden = !match;
      if (match) shown++;
    }
    setNone(shown === 0);
  }, [q]);

  return (
    <div ref={ref} className="no-print">
      <label htmlFor="condition-q" className="sr-only">{label}</label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-2" aria-hidden />
        <input
          id="condition-q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={label}
          className="min-h-12 w-full rounded-xl border-[1.5px] border-line-strong bg-surface pl-12 pr-4"
        />
      </div>
      <p role="status" className={none ? "mt-3 text-ink-2" : "sr-only"}>{none ? "No conditions match. Try another word." : ""}</p>
    </div>
  );
}
