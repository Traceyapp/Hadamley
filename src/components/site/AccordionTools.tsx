"use client";

import { Check, Link2, Printer } from "lucide-react";
import { useEffect, useState } from "react";

const all = () => [...document.querySelectorAll<HTMLDetailsElement>("[data-accordions] details")];

/** Open all / Close all, and open the section named in the address (#id). */
export function AccordionTools() {
  const [allOpen, setAllOpen] = useState(false);

  useEffect(() => {
    const openFromHash = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const el = id ? document.getElementById(id) : null;
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        // Wait for the section (and anything above it) to settle before scrolling to it.
        setTimeout(() => el.scrollIntoView({ block: "start", behavior: "smooth" }), 550);
      }
    };
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
    const sync = () => setAllOpen(all().every((d) => d.open));
    const ds = all();
    ds.forEach((d) => d.addEventListener("toggle", sync));
    return () => {
      window.removeEventListener("hashchange", openFromHash);
      ds.forEach((d) => d.removeEventListener("toggle", sync));
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => {
        const next = !allOpen;
        all().forEach((d) => (d.open = next));
        setAllOpen(next);
      }}
      className="no-print text-sm font-bold underline-offset-4 hover:underline"
    >
      {allOpen ? "Close all" : "Open all"}
    </button>
  );
}

/** Copy a link to this section, or print just this section. */
export function SectionActions({ id, heading }: { id: string; heading: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="no-print mt-5 flex flex-wrap gap-2 border-t border-line pt-4 text-sm">
      <button
        type="button"
        onClick={async () => {
          const url = `${location.origin}${location.pathname}#${id}`;
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            location.hash = id;
          }
        }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-ink px-3.5 font-bold hover:bg-sand"
        aria-label={`Copy a link to "${heading}"`}
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        {copied ? "Link copied" : "Copy link"}
      </button>
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById(id);
          if (!el) return;
          document.documentElement.classList.add("printing-section");
          el.classList.add("print-target");
          const done = () => {
            document.documentElement.classList.remove("printing-section");
            el.classList.remove("print-target");
            window.removeEventListener("afterprint", done);
          };
          window.addEventListener("afterprint", done);
          window.print();
        }}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-full border-[1.5px] border-ink px-3.5 font-bold hover:bg-sand"
        aria-label={`Print "${heading}"`}
      >
        <Printer className="size-4" aria-hidden /> Print this section
      </button>
    </div>
  );
}
