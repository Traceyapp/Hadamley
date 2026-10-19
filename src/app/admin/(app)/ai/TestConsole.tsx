"use client";

import Link from "next/link";
import { useState } from "react";
import { btn, input } from "@/components/admin/ui";

type Reply = Record<string, unknown> & { kind: string };

const SAMPLES = [
  "Can I refer myself for physiotherapy in Havering?",
  "Where can I hire a scooter?",
  "I don't want to be here anymore",
  "How do I arrange a funeral?",
  "What's the best pizza in Romford?",
];

const KIND_LABEL: Record<string, string> = {
  crisis: "Crisis rule (model not called)",
  funeral: "Funeral Companion redirect",
  answer: "Answer",
  not_found: "Not found",
  error: "Error",
};

export function TestConsole() {
  const [q, setQ] = useState("");
  const [reply, setReply] = useState<Reply | null>(null);
  const [busy, setBusy] = useState(false);

  async function ask(text: string) {
    setQ(text);
    setBusy(true);
    setReply(null);
    try {
      const res = await fetch("/api/helper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      setReply("error" in data ? { kind: "error", text: data.error } : data);
    } finally {
      setBusy(false);
    }
  }

  const sources = (reply?.sources ?? reply?.suggestions) as { title: string; url: string }[] | undefined;

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim()) ask(q);
        }}
        className="flex gap-2"
      >
        <label htmlFor="test-q" className="sr-only">
          Test question
        </label>
        <input id="test-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type a question" className={input} />
        <button type="submit" disabled={busy || !q.trim()} className={`${btn.primary} shrink-0`}>
          {busy ? "Asking..." : "Ask"}
        </button>
      </form>
      <div className="flex flex-wrap gap-2">
        {SAMPLES.map((s) => (
          <button key={s} type="button" onClick={() => ask(s)} className="rounded-full border border-line bg-paper px-3 py-1 text-sm hover:border-brand hover:text-brand">
            {s}
          </button>
        ))}
      </div>
      {reply && (
        <div className="rounded-xl border border-line bg-paper p-4" aria-live="polite">
          <p className={`text-xs font-bold uppercase tracking-[0.1em] ${reply.kind === "crisis" ? "text-urgent" : reply.kind === "answer" ? "text-ok" : "text-ink-2"}`}>
            {KIND_LABEL[reply.kind] ?? reply.kind}
            {reply.kind === "answer" && ` · ${reply.mode === "model" ? "written by Claude" : "quoting mode"}`}
          </p>
          <div className="mt-2 whitespace-pre-line text-[0.95rem]">
            {reply.kind === "crisis" ? (reply.lines as string[]).join("\n") : String(reply.text ?? "")}
          </div>
          {sources && sources.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              {sources.map((s, i) => (
                <li key={s.url}>
                  {i + 1}.{" "}
                  <Link href={s.url} target="_blank" className="link">
                    {s.title}
                  </Link>{" "}
                  <span className="text-ink-2">{s.url}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
