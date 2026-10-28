import Link from "next/link";
import { AlertTriangle, CalendarCheck, ChevronDown, Download, ExternalLink, Info, Minus, Plus } from "lucide-react";
import type { PageSection } from "@/lib/types";
import { readDb } from "@/lib/db";
import { formatBytes, formatDate } from "@/lib/format";
import { HEALTH_DISCLAIMER } from "./bits";
import { AccordionTools, SectionActions } from "./AccordionTools";

/**
 * Fold-out sections on a page. Built on <details>, so they work without
 * JavaScript; with it, they unfold like a leaflet, open from a link,
 * open all at once, and print one section on its own.
 */
export function Accordions({ sections: all, preview = false, nested = false }: { sections: PageSection[]; preview?: boolean; nested?: boolean }) {
  // A heading waiting for its wording stays hidden from visitors, so the page never looks unfinished.
  const sections = preview ? all : all.filter((s) => s.body.replace(/<[^>]*>/g, "").trim());
  if (!sections.length) return null;
  const resources = readDb().resources.filter((r) => r.status === "published");
  return (
    <section aria-label={nested ? undefined : "More detail"} className={`fold-group ${nested ? "mt-4" : "mt-14 max-w-[68ch]"}`} data-accordions>
      {!nested && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b-[1.5px] border-ink pb-3">
          <p className="kicker text-sec">In more detail</p>
          <AccordionTools />
        </div>
      )}
      <div className="space-y-3">
        {sections.map((s, i) => {
          const files = s.resourceIds.map((id) => resources.find((r) => r.id === id)).filter(Boolean);
          return (
            <details key={s.id} id={s.id} className={`fold group overflow-hidden scroll-mt-28 ${nested ? "rounded-xl border-[1.5px] border-champagne bg-surface" : "card-print"}`}>
              <summary className={`flex cursor-pointer list-none items-center gap-4 marker:hidden hover:bg-sec-soft [&::-webkit-details-marker]:hidden ${nested ? "min-h-12 px-4 py-2.5" : "min-h-16 px-5 py-4"}`}>
                {!nested && (
                  <span className="font-display text-[1.1rem] font-semibold text-sec" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <h3 className={nested ? "flex-1 font-sans text-[1rem] font-bold leading-snug" : "soft-hover flex-1 text-[1.25rem] font-semibold leading-snug"}>
                  {s.heading}
                  {preview && !s.body.replace(/<[^>]*>/g, "").trim() && <span className="ml-2 align-middle text-[0.8rem] font-bold uppercase tracking-wide text-warn">Wording to add · hidden from visitors</span>}
                </h3>
                {nested ? (
                  <span className="shrink-0" aria-hidden>
                    <Plus className="size-5 group-open:hidden" />
                    <Minus className="hidden size-5 group-open:block" />
                  </span>
                ) : (
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-ink transition-transform duration-300 group-open:rotate-180 group-open:bg-ink group-open:text-paper">
                    <ChevronDown className="size-4" aria-hidden />
                  </span>
                )}
              </summary>
              <div className="fold-body border-t border-dashed border-line-strong px-5 pb-5 pt-4">
                {s.urgent && (
                  <div role="note" className="mb-5 flex gap-3 rounded-xl border-2 border-urgent bg-urgent-soft p-4">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-urgent" aria-hidden />
                    <p className="whitespace-pre-line font-bold text-ink">{s.urgent}</p>
                  </div>
                )}
                <div className="prose-h" dangerouslySetInnerHTML={{ __html: s.body }} />
                {files.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {files.map((r) => (
                      <li key={r!.id}>
                        <a href={`/files/${r!.storedName}`} download={r!.fileName} className="inline-flex items-center gap-2 font-bold text-sec hover:underline">
                          <Download className="size-4" aria-hidden /> {r!.title}
                          <span className="font-normal text-ink-2">({r!.fileName.split(".").pop()?.toUpperCase()}, {formatBytes(r!.size)})</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {(s.sources?.length || s.reviewedAt) && (
                  <div className="mt-6 border-t border-dashed border-line-strong pt-4 text-[0.92rem]">
                    {!!s.sources?.length && (
                      <>
                        <p className="kicker text-ink-2">Sources</p>
                        <ul className="mt-2 space-y-1">
                          {s.sources.map((src) => (
                            <li key={src.url}>
                              <a href={src.url} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5 break-all">
                                {src.label || src.url} <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                                <span className="sr-only">(opens in a new tab)</span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {s.reviewedAt && (
                      <p className="mt-3 inline-flex items-center gap-1.5 text-ink-2">
                        <CalendarCheck className="size-4 text-ok" aria-hidden /> Last reviewed {formatDate(s.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}
                {s.health && (
                  <p className="mt-5 flex gap-3 rounded-xl border-[1.5px] border-dashed border-line-strong px-4 py-3 text-[0.9rem] text-ink-2">
                    <Info className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                    {HEALTH_DISCLAIMER}
                  </p>
                )}
                <SectionActions id={s.id} heading={s.heading} />
              </div>
            </details>
          );
        })}
      </div>
      {!nested && <p className="mt-3 text-sm text-ink-2 no-print">
        Something missing? <Link href="/contact" className="link">Tell us</Link>.
      </p>}
    </section>
  );
}
