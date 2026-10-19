"use client";

import { useEffect, useRef, useState } from "react";
import { LifeBuoy, MessageCircleQuestion, Phone } from "lucide-react";
import { AnimatePresence, motion, useInView, useReducedMotion, useTypewriter } from "@/components/fx/motion";

export type DemoTurn = { q: string; a: string; src: string[] };

/** Looping, self-typing demo of the helper. Decorative: the real helper is one click away. */
export function ChatDemo({ script }: { script: DemoTurn[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, margin: "-80px" });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<"q" | "think" | "a">("q");
  const s = script[step % script.length];
  const typedQ = useTypewriter(s.q, inView && phase === "q", 28);
  const typedA = useTypewriter(s.a, inView && phase === "a", 14);

  useEffect(() => {
    if (!inView || reduce) return;
    if (phase === "q" && typedQ === s.q) {
      const t = setTimeout(() => setPhase("think"), 500);
      return () => clearTimeout(t);
    }
    if (phase === "think") {
      const t = setTimeout(() => setPhase("a"), 1100);
      return () => clearTimeout(t);
    }
    if (phase === "a" && typedA === s.a) {
      const t = setTimeout(() => {
        setStep((n) => n + 1);
        setPhase("q");
      }, 4200);
      return () => clearTimeout(t);
    }
  }, [inView, reduce, phase, typedQ, typedA, s]);

  const showA = reduce || phase === "a";
  return (
    <div ref={ref} aria-hidden="true" className="relative rounded-[2rem] border border-white/15 bg-white/[0.07] p-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-white text-[#0b5458]">
            <MessageCircleQuestion className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-white">Ask Hadamley</p>
            <p className="text-[0.8rem] text-white/70">Answers only from checked information</p>
          </div>
        </div>
        <span className="hidden items-center gap-1.5 rounded-full bg-[#5fd3bf]/15 px-3 py-1 text-[0.75rem] font-bold text-[#a8f0e2] sm:inline-flex">
          <span className="size-1.5 rounded-full bg-[#5fd3bf]" /> Live
        </span>
      </div>
      <div className="min-h-[17rem] space-y-4 pt-5">
        <div className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[0.95rem] text-[#0f1e22]">
            {reduce ? s.q : typedQ}
            {!reduce && phase === "q" && <span className="caret ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 bg-[#0b5458]" />}
          </p>
        </div>
        <AnimatePresence mode="wait">
          {phase === "think" && !reduce && (
            <motion.div key="think" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-1.5 px-2">
              <span className="dot size-2 rounded-full bg-[#5fd3bf]" />
              <span className="dot size-2 rounded-full bg-[#5fd3bf]" />
              <span className="dot size-2 rounded-full bg-[#5fd3bf]" />
            </motion.div>
          )}
          {showA && (
            <motion.div key={`a-${step}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[94%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.08] px-4 py-3 text-[0.95rem] leading-relaxed text-white/95">
              {reduce ? s.a : typedA}
              {(reduce || typedA === s.a) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
                  {s.src.map((x, i) => (
                    <span key={x} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[0.78rem] font-bold text-white">
                      <span className="grid size-4 place-items-center rounded bg-[#5fd3bf] text-[0.65rem] text-[#06302f]">{i + 1}</span>
                      {x}
                    </span>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#ff8e84]/30 bg-[#ff8e84]/10 px-4 py-3 text-[0.85rem] text-white/90">
        <LifeBuoy className="size-5 shrink-0 text-[#ffb3ac]" />
        <span>
          Urgent wording always shows NHS 111 and 999 straight away. <Phone className="ml-1 inline size-3.5" />
        </span>
      </div>
    </div>
  );
}
