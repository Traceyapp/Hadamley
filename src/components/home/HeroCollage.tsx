"use client";

import { BadgeCheck, CalendarCheck, MapPin, MessageCircleQuestion, Phone, Sparkles } from "lucide-react";
import { motion, Tilt, useReducedMotion } from "@/components/fx/motion";

type Preview = { name: string; summary: string; provider: string; area: string; checked: string; referral: string };

const pop = (delay: number) => ({
  initial: { opacity: 0, y: 30, scale: 0.94 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.9, ease: [0.21, 0.7, 0.2, 1] as const, delay },
});

/** Decorative stack of glass cards that previews what Hadamley does. Hidden from screen readers. */
export function HeroCollage({ preview }: { preview: Preview }) {
  const reduce = useReducedMotion();
  const m = (d: number) => (reduce ? {} : pop(d));
  return (
    <div aria-hidden="true" className="relative mx-auto h-[30rem] w-full max-w-[34rem] select-none sm:h-[34rem]">
      {/* Glow plate */}
      <div className="absolute inset-8 rounded-[3rem] bg-grad-brand opacity-25 blur-3xl" />

      <Tilt className="absolute inset-0" max={7}>
        {/* Main listing card */}
        <motion.div {...m(0.15)} className="absolute left-[6%] right-[8%] top-[16%] rounded-[1.75rem] border border-line bg-surface p-6 shadow-lift">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#e6eef8] px-2.5 py-0.5 text-[0.75rem] font-bold text-[#0b3d77] dark:bg-[#15263b] dark:text-[#a9c8f0]">{preview.provider}</span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-[0.75rem] font-bold text-ink-2">Self-referral accepted</span>
          </div>
          <p className="mt-4 font-display text-[1.45rem] font-semibold leading-tight text-ink">{preview.name}</p>
          <p className="mt-2 line-clamp-2 text-[0.95rem] text-ink-2">{preview.summary}</p>
          <div className="mt-4 rounded-xl bg-brand-tint p-3 text-[0.85rem]">
            <p className="font-bold uppercase tracking-[0.1em] text-brand text-[0.68rem]">How to get referred</p>
            <p className="mt-1 line-clamp-2 font-bold text-ink">{preview.referral}</p>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-[0.85rem] text-ink-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" /> {preview.area}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-4 text-ok" /> {preview.checked}
            </span>
          </div>
        </motion.div>

        {/* Checked chip */}
        <motion.div {...m(0.45)} className="absolute -left-2 top-[6%] sm:-left-6">
          <div className="float glass flex items-center gap-2.5 rounded-2xl px-4 py-3 shadow-lift" style={{ ["--r" as string]: "-4deg" }}>
            <span className="grid size-9 place-items-center rounded-xl bg-ok-soft text-ok">
              <BadgeCheck className="size-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.8rem] text-ink-2">Every listing</span>
              <span className="block font-bold text-ink">Checked at the source</span>
            </span>
          </div>
        </motion.div>

        {/* Helper bubble */}
        <motion.div {...m(0.7)} className="absolute bottom-[3%] right-0 w-[78%] sm:-right-4">
          <div className="float-slow glass rounded-[1.5rem] p-4 shadow-lift" style={{ animationDelay: "-3s", ["--r" as string]: "2deg" }}>
            <div className="flex items-center gap-2 text-[0.8rem] font-bold text-brand">
              <span className="grid size-7 place-items-center rounded-lg bg-grad-brand text-white">
                <MessageCircleQuestion className="size-4" />
              </span>
              Ask Hadamley
              <Sparkles className="ml-auto size-4 text-accent" />
            </div>
            <p className="mt-2.5 text-[0.92rem] leading-snug text-ink">
              Yes, some services accept self-referral. Each listing shows exactly what the provider says.
              <span className="ml-1 inline-grid size-5 place-items-center rounded bg-brand-soft align-middle text-[0.7rem] font-bold text-brand-strong">1</span>
            </p>
          </div>
        </motion.div>

        {/* Call chip */}
        <motion.div {...m(0.95)} className="absolute right-[2%] top-[2%]">
          <div className="float flex items-center gap-2 rounded-full bg-grad-brand px-4 py-2.5 font-bold text-white shadow-glow" style={{ animationDelay: "-1.5s" }}>
            <Phone className="size-4" /> Tap to call
          </div>
        </motion.div>
      </Tilt>
    </div>
  );
}
