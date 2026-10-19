"use client";

import Link from "next/link";
import { ArrowUp, ExternalLink, LifeBuoy, MessageCircleQuestion, Phone, RotateCcw, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

type Source = { title: string; url: string; type: "page" | "listing" };
type Reply =
  | { kind: "crisis"; title: string; lines: string[] }
  | { kind: "funeral"; text: string; url: string }
  | { kind: "answer"; text: string; sources: Source[]; mode: "model" | "extract"; notice?: string }
  | { kind: "not_found"; text: string; suggestions: Source[] }
  | { kind: "error"; text: string };

type Msg = { role: "user"; text: string } | { role: "assistant"; reply: Reply };

const STARTERS = [
  "Can I refer myself for physiotherapy?",
  "Where can I hire a wheelchair?",
  "Is there transport where I can stay in my wheelchair?",
  "Who can help with anxiety?",
];

/** Renders **bold** and [n] citations without injecting HTML. */
function RichText({ text, sources }: { text: string; sources?: Source[] }) {
  return (
    <>
      {text.split("\n").map((line, li) => {
        if (!line.trim()) return <div key={li} className="h-2" />;
        const bullet = /^\s*[-*]\s+/.test(line);
        const content = line.replace(/^\s*[-*]\s+/, "");
        const parts = content.split(/(\*\*[^*]+\*\*|\[\d+\])/g).map((p, i) => {
          if (/^\*\*[^*]+\*\*$/.test(p)) return <strong key={i}>{p.slice(2, -2)}</strong>;
          const m = /^\[(\d+)\]$/.exec(p);
          if (m) {
            const s = sources?.[Number(m[1]) - 1];
            return s ? (
              <Link key={i} href={s.url} className="mx-0.5 inline-grid min-w-5 place-items-center rounded bg-brand-soft px-1 text-[0.75rem] font-bold text-brand-strong no-underline" aria-label={`Source ${m[1]}: ${s.title}`}>
                {m[1]}
              </Link>
            ) : null;
          }
          return <Fragment key={i}>{p}</Fragment>;
        });
        return bullet ? (
          <p key={li} className="relative pl-4 before:absolute before:left-0 before:top-[0.65em] before:size-1.5 before:rounded-full before:bg-accent">
            {parts}
          </p>
        ) : (
          <p key={li}>{parts}</p>
        );
      })}
    </>
  );
}

function AssistantBubble({ reply }: { reply: Reply }) {
  if (reply.kind === "crisis") {
    return (
      <div className="rounded-2xl border-2 border-urgent bg-urgent-soft p-4" role="alert">
        <p className="flex items-center gap-2 font-bold text-urgent">
          <LifeBuoy className="size-5" aria-hidden /> {reply.title}
        </p>
        <div className="mt-2 space-y-2 text-ink">
          {reply.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a href="tel:111" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border-2 border-brand bg-surface font-bold text-brand">
            <Phone className="size-4" aria-hidden /> NHS 111
          </a>
          <a href="tel:999" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-urgent font-bold text-white dark:text-[#1b0b0a]">
            <Phone className="size-4" aria-hidden /> 999
          </a>
        </div>
      </div>
    );
  }
  if (reply.kind === "funeral") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-4">
        <p>{reply.text}</p>
        <a href={reply.url} target="_blank" rel="noopener" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 font-bold text-paper">
          Go to The Funeral Companion <ExternalLink className="size-4" aria-hidden />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    );
  }
  if (reply.kind === "error") {
    return <div className="rounded-2xl border border-warn/40 bg-warn-soft p-4 text-ink">{reply.text}</div>;
  }
  const links = reply.kind === "answer" ? reply.sources : reply.suggestions;
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      {reply.kind === "answer" && reply.notice && <p className="mb-2 rounded-lg bg-warn-soft px-3 py-2 text-sm text-ink">{reply.notice}</p>}
      <div className="space-y-1.5 leading-relaxed">
        <RichText text={reply.text} sources={reply.kind === "answer" ? reply.sources : undefined} />
      </div>
      {links.length > 0 && (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.12em] text-ink-2">{reply.kind === "answer" ? "Sources on Hadamley" : "Try these pages"}</p>
          <ol className="mt-2 space-y-1.5">
            {links.map((s, i) => (
              <li key={s.url} className="flex gap-2 text-[0.92rem]">
                {reply.kind === "answer" && <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded bg-brand-soft text-[0.72rem] font-bold text-brand-strong">{i + 1}</span>}
                <Link href={s.url} className="link">
                  {s.title}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function HelperWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string | undefined>).detail;
      if (q) setTimeout(() => send(q), 50);
    };
    window.addEventListener("hadamley:ask", onOpen);
    return () => window.removeEventListener("hadamley:ask", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      setInput("");
      const history = msgs
        .map((m) => (m.role === "user" ? { role: "user" as const, content: m.text } : m.reply.kind === "answer" ? { role: "assistant" as const, content: m.reply.text } : null))
        .filter(Boolean);
      setMsgs((m) => [...m, { role: "user", text: q }]);
      setBusy(true);
      try {
        const res = await fetch("/api/helper", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q, history }) });
        const data = (await res.json()) as Reply | { error: string };
        const reply: Reply = "error" in data ? { kind: "error", text: data.error } : data;
        setMsgs((m) => [...m, { role: "assistant", reply }]);
      } catch {
        setMsgs((m) => [
          ...m,
          { role: "assistant", reply: { kind: "error", text: "Sorry, the helper is not available right now. Every section is still available from the menu, or try Find Support." } },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [busy, msgs],
  );

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            ref={launcherRef}
            type="button"
            onClick={() => setOpen(true)}
            initial={reduce ? false : { opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
            whileHover={reduce ? undefined : { y: -3 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="fixed bottom-4 right-4 z-40 inline-flex min-h-14 items-center gap-2.5 rounded-full border-[1.5px] border-ink bg-ink py-3 pl-3 pr-5 font-bold text-paper shadow-[4px_4px_0_0_var(--accent)] sm:bottom-6 sm:right-6"
            aria-haspopup="dialog"
          >
            <span className="grid size-9 place-items-center rounded-full bg-paper text-ink">
              <MessageCircleQuestion className="size-5" aria-hidden />
            </span>
            Ask Hadamley
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="helper-title"
          onKeyDown={(e) => e.key === "Escape" && close()}
          initial={reduce ? false : { opacity: 0, scale: 0.85, y: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, scale: 0.9, y: 30, filter: "blur(6px)" }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          style={{ transformOrigin: "bottom right" }}
          className="card-print fixed inset-x-2 bottom-2 top-16 z-50 flex flex-col overflow-hidden !bg-paper sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[min(44rem,calc(100dvh-7rem))] sm:w-[27rem]"
        >
          <div className="flex items-start justify-between gap-3 border-b-[1.5px] border-ink bg-sand px-5 py-4 text-ink">
            <div>
              <h2 id="helper-title" className="font-display text-xl font-semibold">
                Ask Hadamley
              </h2>
              <p className="text-sm text-ink-2">Answers come only from information on this website.</p>
            </div>
            <div className="flex gap-1">
              {msgs.length > 0 && (
                <button type="button" onClick={() => setMsgs([])} className="grid size-10 place-items-center rounded-full hover:bg-sand-2" aria-label="Start a new conversation">
                  <RotateCcw className="size-5" aria-hidden />
                </button>
              )}
              <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-sand-2" aria-label="Close helper">
                <X className="size-6" aria-hidden />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite" aria-busy={busy}>
            {msgs.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-line bg-surface p-4 text-[0.95rem]">
                  <p>Hello. I can help you find information and local services on Hadamley.</p>
                  <p className="mt-2 text-ink-2">I can&apos;t give medical advice. Please don&apos;t share personal details such as your name, address or medical history.</p>
                </div>
                <div>
                  <p className="mb-2 text-[0.78rem] font-bold uppercase tracking-[0.12em] text-ink-2">You could ask</p>
                  <div className="flex flex-col gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-xl border-[1.5px] border-line-strong bg-surface px-4 py-2.5 text-left font-display text-[1.02rem] hover:border-ink hover:bg-accent-soft"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {msgs.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-paper">{m.text}</p>
                </div>
              ) : (
                <div key={i} className="animate-rise max-w-[95%]">
                  <AssistantBubble reply={m.reply} />
                </div>
              ),
            )}
            {busy && (
              <div className="flex items-center gap-1.5 px-2 text-ink-2" aria-label="Finding an answer">
                <span className="dot size-2 rounded-full bg-brand" />
                <span className="dot size-2 rounded-full bg-brand" />
                <span className="dot size-2 rounded-full bg-brand" />
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-line bg-surface p-3"
          >
            <label htmlFor="helper-input" className="sr-only">
              Your question
            </label>
            <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-paper p-1.5 focus-within:border-brand">
              <textarea
                id="helper-input"
                ref={inputRef}
                rows={1}
                maxLength={500}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Type your question"
                className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-ink outline-none placeholder:text-ink-2 focus-visible:shadow-none focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || busy}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-paper transition disabled:opacity-40"
                aria-label="Send question"
              >
                <ArrowUp className="size-5" aria-hidden />
              </button>
            </div>
            <p className="mt-2 px-1 text-[0.78rem] text-ink-2">Information and signposting only. Always check details with the provider.</p>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}

/** Opens the helper from anywhere, optionally with a question. */
export function AskButton({ question, children, className }: { question?: string; children: React.ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent("hadamley:ask", { detail: question }))}>
      {children}
    </button>
  );
}
