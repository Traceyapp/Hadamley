"use client";

import { ArrowDown, ArrowUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { PageSection } from "@/lib/types";
import { RichTextEditor } from "./RichTextEditor";
import { btn, input } from "./ui";

const newId = () => `s-${Math.random().toString(36).slice(2, 8)}`;

/** One source per line: "Label | https://..." or just the address. */
const sourcesToText = (s?: PageSection["sources"]) => (s ?? []).map((x) => (x.label && x.label !== x.url ? `${x.label} | ${x.url}` : x.url)).join("\n");
const textToSources = (t: string) =>
  t
    .split("\n")
    .map((line) => {
      const i = line.lastIndexOf("|");
      const label = i >= 0 ? line.slice(0, i).trim() : "";
      const url = (i >= 0 ? line.slice(i + 1) : line).trim();
      return { label: label || url, url };
    })
    .filter((x) => x.url);

/**
 * Add, edit, reorder and delete a page's fold-out sections. Everything is
 * saved with the page, as JSON in a hidden field.
 */
export function SectionsEditor({ initial, resources }: { initial: PageSection[]; resources: { id: string; title: string }[] }) {
  const [sections, setSections] = useState<PageSection[]>(initial);
  const [open, setOpen] = useState<string | null>(initial[0]?.id ?? null);
  const update = (id: string, patch: Partial<PageSection>) => setSections((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) =>
    setSections((all) => {
      const next = [...all];
      const j = i + d;
      if (j < 0 || j >= next.length) return all;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      {sections.length === 0 && <p className="mb-4 text-[0.95rem] text-ink-2">No sections yet. Sections fold open on the page, which keeps long pages easy to scan.</p>}
      <ol className="space-y-3">
        {sections.map((s, i) => {
          const isOpen = open === s.id;
          return (
            <li key={s.id} className="rounded-xl border border-line-strong bg-surface">
              <div className="flex items-center gap-2 p-2 pl-4">
                <span className="font-display font-semibold text-brand">{String(i + 1).padStart(2, "0")}</span>
                <button type="button" onClick={() => setOpen(isOpen ? null : s.id)} className="flex min-h-10 flex-1 items-center gap-2 text-left font-bold" aria-expanded={isOpen}>
                  <span className="flex-1 truncate">{s.heading || "Untitled section"}</span>
                  <ChevronDown className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden />
                </button>
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={btn.ghost} aria-label={`Move "${s.heading}" up`}>
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1} className={btn.ghost} aria-label={`Move "${s.heading}" down`}>
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove the section "${s.heading || "Untitled"}"? It's removed when you save the page.`)) setSections((all) => all.filter((x) => x.id !== s.id));
                  }}
                  className={btn.ghost}
                  aria-label={`Remove "${s.heading}"`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
              {isOpen && (
                <div className="space-y-4 border-t border-line p-4">
                  <div>
                    <label htmlFor={`h-${s.id}`} className="mb-1.5 block text-[0.95rem] font-bold">
                      Heading
                    </label>
                    <input id={`h-${s.id}`} value={s.heading} onChange={(e) => update(s.id, { heading: e.target.value })} className={input} placeholder="For example, How long will I wait?" />
                  </div>
                  <div>
                    <p id={`b-${s.id}`} className="mb-1.5 text-[0.95rem] font-bold">
                      Content
                    </p>
                    <RichTextEditor initial={s.body} labelId={`b-${s.id}`} onChange={(html) => update(s.id, { body: html })} minHeight="!min-h-[160px]" />
                  </div>
                  <label className="flex items-start gap-2.5 rounded-lg border border-line p-3">
                    <input type="checkbox" checked={!!s.health} onChange={(e) => update(s.id, { health: e.target.checked })} className="mt-1 size-[1.1rem] accent-[var(--brand)]" />
                    <span>
                      <span className="font-bold">Health information</span>
                      <span className="block text-sm text-ink-2">Adds the full medical disclaimer at the end of this section.</span>
                    </span>
                  </label>
                  <div>
                    <label htmlFor={`u-${s.id}`} className="mb-1.5 block text-[0.95rem] font-bold">
                      Urgent warning <span className="font-normal text-ink-2">(optional)</span>
                    </label>
                    <textarea
                      id={`u-${s.id}`}
                      value={s.urgent ?? ""}
                      onChange={(e) => update(s.id, { urgent: e.target.value })}
                      rows={3}
                      className={input}
                      placeholder="Shown in a red box above the content. For example, when to call 999 or NHS 111."
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                    <div>
                      <label htmlFor={`src-${s.id}`} className="mb-1.5 block text-[0.95rem] font-bold">
                        Sources
                      </label>
                      <textarea
                        id={`src-${s.id}`}
                        defaultValue={sourcesToText(s.sources)}
                        onChange={(e) => update(s.id, { sources: textToSources(e.target.value) })}
                        rows={3}
                        className={input}
                        placeholder={"One per line, for example:\nNHS: Fibromyalgia | https://www.nhs.uk/conditions/fibromyalgia/"}
                      />
                    </div>
                    <div>
                      <label htmlFor={`r-${s.id}`} className="mb-1.5 block text-[0.95rem] font-bold">
                        Last reviewed
                      </label>
                      <input id={`r-${s.id}`} type="date" value={s.reviewedAt ?? ""} onChange={(e) => update(s.id, { reviewedAt: e.target.value })} className={input} />
                    </div>
                  </div>
                  {resources.length > 0 && (
                    <fieldset>
                      <legend className="mb-1.5 text-[0.95rem] font-bold">Downloads in this section</legend>
                      <div className="grid gap-1 sm:grid-cols-2">
                        {resources.map((r) => (
                          <label key={r.id} className="flex min-h-10 items-center gap-2.5 rounded-lg px-2 hover:bg-sand">
                            <input
                              type="checkbox"
                              checked={s.resourceIds.includes(r.id)}
                              onChange={(e) => update(s.id, { resourceIds: e.target.checked ? [...s.resourceIds, r.id] : s.resourceIds.filter((x) => x !== r.id) })}
                              className="size-[1.1rem] accent-[var(--brand)]"
                            />
                            <span className="text-[0.95rem]">{r.title}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
      <button
        type="button"
        onClick={() => {
          const s: PageSection = { id: newId(), heading: "", body: "", resourceIds: [], health: true };
          setSections((all) => [...all, s]);
          setOpen(s.id);
        }}
        className={`${btn.secondary} mt-4`}
      >
        <Plus className="size-4" aria-hidden /> Add a section
      </button>
    </div>
  );
}
