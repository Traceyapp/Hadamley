"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/site/bits";
import { SKYLINE_PLACES, Skyline, sceneFor } from "@/components/art/Landmarks";
import { SentenceFinder, type FinderListing } from "./SentenceFinder";

type Opt = { value: string; label: string };

/**
 * The homepage hero: the sentence finder above a skyline of real Havering
 * landmarks. The skyline draws itself on load, then follows the sentence:
 * pick a town and its landmark lights up (and on narrow screens the scene
 * pans to it); pick a need and the matching part of the scene comes alive.
 */
export function LivingHero({ listings, topics, areas, summary }: { listings: FinderListing[]; topics: Opt[]; areas: Opt[]; summary?: string }) {
  const reduce = useReducedMotion();
  const [focus, setFocus] = useState({ need: "", place: "" });
  const onFocusChange = useCallback((f: { need: string; place: string }) => setFocus(f), []);
  const lit = sceneFor(focus.place, focus.need);
  const place = SKYLINE_PLACES[focus.place];

  // Pan the scene so the chosen landmark is in view when the screen is narrower than the drawing.
  const frame = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [shift, setShift] = useState(0);
  useEffect(() => {
    const compute = () => {
      const fw = frame.current?.clientWidth ?? 0;
      const sw = stage.current?.scrollWidth ?? 0;
      if (!fw || sw <= fw) return setShift(0);
      const target = place ? (place.x / 1200) * sw : sw / 2;
      setShift(Math.max(fw - sw, Math.min(0, fw / 2 - target)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (frame.current) ro.observe(frame.current);
    return () => ro.disconnect();
  }, [place]);

  const scene = (
          <div ref={frame} className="relative mx-[calc(50%-50vw)] mt-6 overflow-x-clip sm:mt-12 border-b-[1.5px] border-ink">
            <div
              ref={stage}
              className="relative w-full min-w-[640px] sm:min-w-[760px] transition-transform duration-450 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{ transform: `translateX(${shift}px)` }}
            >
              <Skyline draw lit={lit} className="block h-auto w-full translate-y-[2px]" />
              <AnimatePresence>
                {place && (
                  <motion.span
                    key={focus.place}
                    aria-hidden="true"
                    className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap font-hand text-[1.5rem] leading-none text-accent sm:text-[1.8rem]"
                    style={{ left: `${(place.x / 1200) * 100}%`, bottom: `${((place.top + 18) / 226) * 100}%` }}
                    initial={reduce ? false : { opacity: 0, y: 10, rotate: -8 }}
                    animate={{ opacity: 1, y: 0, rotate: -3 }}
                    exit={reduce ? undefined : { opacity: 0, y: -6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                  >
                    {place.label}
                    <svg viewBox="0 0 40 30" className="mx-auto mt-1 block h-6 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M6 2 C 14 10, 22 14, 26 26 M26 26 L20 22 M26 26 L29 19" />
                    </svg>
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
  );

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b-[1.5px] border-ink pb-14">
      <Container className="relative pt-6 sm:pt-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="kicker text-ink-2">A local guide · Havering, Romford, Brentwood and nearby</p>
          <motion.p
            aria-hidden="true"
            initial={reduce ? false : { opacity: 0, rotate: -12, scale: 0.8 }}
            animate={{ opacity: 1, rotate: -3, scale: 1 }}
            transition={{ delay: reduce ? 0 : 1.2, type: "spring", stiffness: 200, damping: 14 }}
            className="hidden font-hand text-[1.6rem] leading-none text-accent md:block"
          >
            every listing checked &amp; dated ✓
          </motion.p>
        </div>
        <h1 id="hero-title" className="sr-only">
          Find local support in Havering, Romford and Brentwood
        </h1>
        <motion.div
          className="mt-5 sm:mt-8"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.21, 0.7, 0.2, 1] }}
        >
          <SentenceFinder listings={listings} topics={topics} areas={areas} onFocusChange={onFocusChange} scene={scene} />
        </motion.div>
        {summary && <p className="mt-6 max-w-2xl sm:mt-10 text-[1.08rem] text-ink-2">{summary}</p>}
      </Container>

    </section>
  );
}
