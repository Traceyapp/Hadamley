"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CalendarDays, FileText, LifeBuoy, Newspaper, Search, Signpost, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SearchKind, SearchResult } from "@/lib/site-search";

export const KIND: Record<SearchKind, { label: string; icon: typeof Search }> = {
  service: { label: "Services", icon: Signpost },
  page: { label: "Guide pages", icon: FileText },
  download: { label: "Downloads", icon: FileText },
  news: { label: "News", icon: Newspaper },
  event: { label: "Events", icon: CalendarDays },
};
const ORDER: SearchKind[] = ["service", "page", "event", "news", "download"];

/** Search button in the header, plus the "/" shortcut, opening an instant search panel. */
export function SearchPanel({ variant = "button" }: { variant?: "button" | "bar" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName);
      if (variant === "button" && e.key === "/" && !typing && !open) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 20);
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Search as you type, lightly debounced.
  useEffect(() => {
    if (!open) return;
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setActive(0);
      } catch {
        /* aborted or offline: keep previous results */
      } finally {
        setLoading(false);
      }
    }, 140);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  const grouped = ORDER.map((k) => ({ k, items: results.filter((r) => r.kind === k) })).filter((g) => g.items.length);
  const flat = grouped.flatMap((g) => g.items);

  function go(r: SearchResult | undefined) {
    if (!r) return router.push(`/search?q=${encodeURIComponent(q)}`), close();
    close();
    if (r.kind === "download") window.location.href = r.url;
    else router.push(r.url);
  }

  return (
    <>
      {variant === "bar" ? (
        <button ref={triggerRef} type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="flex min-h-11 flex-1 items-center justify-center gap-2 text-sm font-bold">
          <Search className="size-4" aria-hidden /> Search
        </button>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          className="hidden min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink bg-surface font-bold sm:inline-flex lg:px-4"
        >
          <Search className="size-5" aria-hidden />
          <span className="sr-only lg:not-sr-only">Search</span>
          <kbd className="hidden rounded border border-line-strong px-1.5 text-xs font-bold text-ink-2 xl:inline">/</kbd>
        </button>
      )}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[#1d1b16]/55 px-3 pt-[8vh] backdrop-blur-[2px]" onMouseDown={(e) => e.target === e.currentTarget && close()}>
            <div role="dialog" aria-modal="true" aria-label="Search Hadamley" className="card-print animate-rise flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden !bg-paper">
              <form
                role="search"
                onSubmit={(e) => {
                  e.preventDefault();
                  go(flat[active]);
                }}
                className="flex items-center gap-3 border-b-[1.5px] border-ink px-4"
              >
                <Search className="size-5 shrink-0" aria-hidden />
                <label htmlFor="site-search" className="sr-only">
                  Search services, pages, downloads and events
                </label>
                <input
                  ref={inputRef}
                  id="site-search"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") close();
                    if (e.key === "ArrowDown") (e.preventDefault(), setActive((a) => Math.min(a + 1, flat.length - 1)));
                    if (e.key === "ArrowUp") (e.preventDefault(), setActive((a) => Math.max(a - 1, 0)));
                  }}
                  placeholder="Search services, pages, downloads and events"
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={flat.length > 0}
                  aria-controls="search-results"
                  aria-activedescendant={flat[active] ? `sr-${active}` : undefined}
                  className="min-h-16 flex-1 bg-transparent font-display text-[1.3rem] outline-none placeholder:text-ink-2/70 focus-visible:shadow-none focus-visible:outline-none"
                />
                <button type="button" onClick={close} className="grid size-9 place-items-center rounded-full hover:bg-sand" aria-label="Close search">
                  <X className="size-5" aria-hidden />
                </button>
              </form>
              <div id="search-results" role="listbox" aria-label="Results" className="overflow-y-auto" aria-busy={loading}>
                {q.trim().length < 2 ? (
                  <p className="px-5 py-6 text-ink-2">
                    Type at least two letters. Try <em>physio</em>, <em>wheelchair</em> or <em>carers</em>.
                  </p>
                ) : flat.length === 0 && !loading ? (
                  <div className="px-5 py-6">
                    <p className="font-bold">Nothing found for &ldquo;{q.trim()}&rdquo;.</p>
                    <p className="mt-1 text-ink-2">Try fewer or different words, or ask the Hadamley helper in your own words.</p>
                  </div>
                ) : (
                  grouped.map(({ k, items }) => {
                    const Icon = KIND[k].icon;
                    return (
                      <div key={k} className="border-b border-line last:border-0">
                        <p className="kicker px-5 pb-1 pt-4 text-ink-2">{KIND[k].label}</p>
                        <ul>
                          {items.map((r) => {
                            const i = flat.indexOf(r);
                            return (
                              <li key={r.url} id={`sr-${i}`} role="option" aria-selected={i === active}>
                                <button
                                  type="button"
                                  onMouseEnter={() => setActive(i)}
                                  onClick={() => go(r)}
                                  className={`flex w-full items-start gap-3 px-5 py-3 text-left ${i === active ? "bg-accent-soft" : ""}`}
                                >
                                  <Icon className="mt-1 size-4 shrink-0 text-ink-2" aria-hidden />
                                  <span className="min-w-0 flex-1">
                                    <span className="block font-bold">{r.title}</span>
                                    {r.meta && <span className="block text-sm text-ink-2">{r.meta}</span>}
                                    {r.snippet && <span className="mt-0.5 line-clamp-1 block text-sm text-ink-2">{r.snippet}</span>}
                                  </span>
                                  {i === active && <ArrowRight className="mt-1 size-4 shrink-0" aria-hidden />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t-[1.5px] border-ink bg-sand px-5 py-2.5 text-sm text-ink-2">
                <span className="hidden sm:inline">↑ ↓ to move · Enter to open · Esc to close</span>
                <span className="inline-flex items-center gap-1.5">
                  <LifeBuoy className="size-4 text-urgent" aria-hidden /> Need help now? Call NHS 111, or 999 in an emergency.
                </span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
