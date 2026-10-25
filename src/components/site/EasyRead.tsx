"use client";

import { BookOpenText, Loader2, X } from "lucide-react";
import { useState } from "react";

/** "Easy read" button: asks for an AI-simplified version of this page and shows it in a panel. */
export function EasyRead({ pageId }: { pageId: string }) {
  const [state, setState] = useState<{ status: "idle" | "loading" | "done" | "error"; html?: string; error?: string }>({ status: "idle" });

  async function open() {
    if (state.status === "done") return;
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/easy-read", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ pageId }) });
      const data = (await res.json()) as { html?: string; error?: string };
      setState(data.html ? { status: "done", html: data.html } : { status: "error", error: data.error ?? "Sorry, something went wrong." });
    } catch {
      setState({ status: "error", error: "Sorry, something went wrong. Please try again." });
    }
  }

  return (
    <div className="no-print mb-8">
      {state.status !== "done" && (
        <button
          type="button"
          onClick={open}
          disabled={state.status === "loading"}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-ink bg-surface px-4 font-bold transition hover:bg-sand disabled:opacity-70"
        >
          {state.status === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <BookOpenText className="size-4" aria-hidden />}
          {state.status === "loading" ? "Making an easy read version..." : "Easy read version"}
        </button>
      )}
      <p aria-live="polite" className="sr-only">
        {state.status === "loading" ? "Making an easy read version of this page." : state.status === "done" ? "Easy read version ready." : ""}
      </p>
      {state.status === "error" && <p className="mt-3 text-[0.95rem] text-ink-2">{state.error}</p>}
      {state.status === "done" && (
        <section aria-labelledby="easy-read-title" className="card-print p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 id="easy-read-title" className="flex items-center gap-2 font-display text-[1.35rem] font-semibold">
              <BookOpenText className="size-5 text-brand" aria-hidden /> Easy read version
            </h2>
            <button type="button" onClick={() => setState({ status: "idle" })} className="grid size-10 shrink-0 place-items-center rounded-full border-[1.5px] border-ink hover:bg-sand" aria-label="Close the easy read version">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="prose-h mt-3 text-[1.08rem]" dangerouslySetInnerHTML={{ __html: state.html! }} />
          <p className="mt-5 border-t border-dashed border-line-strong pt-3 text-[0.9rem] text-ink-2">
            This easy read version was written automatically by AI from the page below. If anything is different, the full page is correct.
          </p>
        </section>
      )}
    </div>
  );
}
