"use client";

import { Info } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

/** Width of the explanation box, in pixels (w-64). */
const BOX = 256;

/**
 * A small ⓘ that explains a figure. Opens on tap, click or Enter (so it works
 * on an iPad, where hover tooltips never appear) and closes on a second tap,
 * a tap elsewhere or Escape. It is placed so it always stays on screen,
 * even from the left-hand tiles on a phone.
 */
export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Left edge of the box, relative to the ⓘ, chosen so the box stays on screen.
  const [left, setLeft] = useState(-BOX + 28);
  const id = useId();
  const wrap = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  return (
    <span ref={wrap} className="relative z-10 inline-flex">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`What does ${label} mean?`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const r = e.currentTarget.getBoundingClientRect();
          const width = Math.min(BOX, window.innerWidth - 32);
          // Prefer lining the box's right edge up with the ⓘ; slide it back on screen if that overflows either side.
          const screenLeft = Math.min(Math.max(r.right - width, 16), window.innerWidth - width - 16);
          setLeft(screenLeft - r.left);
          setOpen((o) => !o);
        }}
        className={`grid size-7 place-items-center rounded-full transition hover:bg-paper-2 hover:text-ink ${open ? "bg-paper-2 text-ink" : "text-ink-2"}`}
      >
        <Info className="size-4" aria-hidden />
      </button>
      {open && (
        <span
          id={id}
          role="note"
          style={{ left }}
          className="absolute top-8 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-line bg-surface px-3.5 py-3 text-left text-[0.86rem] font-normal leading-snug text-ink shadow-[var(--shadow-lg)]"
        >
          {children}
        </span>
      )}
    </span>
  );
}
