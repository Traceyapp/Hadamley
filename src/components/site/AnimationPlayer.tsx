"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Plays quietly on a loop, muted, with a pause control. Starts paused for anyone who prefers reduced motion. */
export function AnimationPlayer({ src, type }: { src: string; type: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {});
    else (v.pause(), setPlaying(false));
  };

  return (
    <figure className="no-print relative mt-12 overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-champagne bg-surface">
      <video ref={ref} muted loop playsInline preload="metadata" aria-hidden="true" className="block w-full">
        <source src={src} type={type} />
      </video>
      <button
        type="button"
        onClick={toggle}
        className="absolute bottom-3 right-3 inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-ink bg-surface px-4 font-bold"
      >
        {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
        {playing ? "Pause animation" : "Play animation"}
      </button>
    </figure>
  );
}
