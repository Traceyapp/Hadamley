"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Pref = "auto" | "light" | "dark";
const ORDER: Pref[] = ["auto", "light", "dark"];
const LABEL: Record<Pref, string> = { auto: "Auto", light: "Light", dark: "Dark" };
const ICON = { auto: Monitor, light: Sun, dark: Moon };

function apply(pref: Pref) {
  const d = document.documentElement;
  const dark = pref === "dark" || (pref === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  d.dataset.theme = dark ? "dark" : "light";
  d.dataset.themePref = pref;
}

/** One button that cycles Auto → Light → Dark and remembers the choice. */
export function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("auto");

  useEffect(() => {
    setPref((document.documentElement.dataset.themePref as Pref) || "auto");
  }, []);

  // In Auto, follow the device if it switches while the page is open.
  useEffect(() => {
    if (pref !== "auto") return;
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const on = () => apply("auto");
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [pref]);

  const next = ORDER[(ORDER.indexOf(pref) + 1) % ORDER.length];
  const Icon = ICON[pref];
  return (
    <button
      type="button"
      onClick={() => {
        setPref(next);
        apply(next);
        try {
          if (next === "auto") localStorage.removeItem("hadamley-theme");
          else localStorage.setItem("hadamley-theme", next);
        } catch {}
      }}
      aria-label={`Theme: ${LABEL[pref]}. Switch to ${LABEL[next]}.`}
      title={`Theme: ${LABEL[pref]}`}
      className="inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-md px-2 pointer-coarse:h-11 pointer-coarse:min-w-11 font-bold text-ink hover:bg-sand-2"
    >
      <Icon className="size-4" aria-hidden />
      <span className="hidden sm:inline">{LABEL[pref]}</span>
    </button>
  );
}
