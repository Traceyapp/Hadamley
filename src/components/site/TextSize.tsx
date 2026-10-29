"use client";

import { useEffect, useState } from "react";

const SIZES = [
  { key: "", label: "Standard text size", scale: "text-[0.85rem]" },
  { key: "lg", label: "Large text size", scale: "text-[1.05rem]" },
  { key: "xl", label: "Largest text size", scale: "text-[1.25rem]" },
] as const;

export function TextSizeControl() {
  const [current, setCurrent] = useState<string>("");

  useEffect(() => {
    setCurrent(document.documentElement.dataset.text ?? "");
  }, []);

  function choose(key: string) {
    setCurrent(key);
    if (key) document.documentElement.dataset.text = key;
    else delete document.documentElement.dataset.text;
    try {
      if (key) localStorage.setItem("hadamley-text", key);
      else localStorage.removeItem("hadamley-text");
    } catch {}
  }

  return (
    <div role="group" aria-label="Text size" className="flex items-center gap-1">
      <span className="mr-1 hidden whitespace-nowrap text-ink-2 sm:inline">Text size</span>
      {SIZES.map((s) => (
        <button
          key={s.key}
          type="button"
          onClick={() => choose(s.key)}
          aria-pressed={current === s.key}
          aria-label={s.label}
          className={`grid size-8 place-items-center rounded-md pointer-coarse:size-11 font-bold leading-none ${s.scale} ${
            current === s.key ? "bg-ink text-paper" : "text-ink hover:bg-sand-2"
          }`}
        >
          A
        </button>
      ))}
    </div>
  );
}
