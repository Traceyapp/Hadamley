import Link from "next/link";
import { useId } from "react";

export function LogoMark({ className = "size-10" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1f5c6b" />
          <stop offset="1" stopColor="#1f5c6b" />
        </linearGradient>
        <radialGradient id={`lh-${id}`} cx="0.3" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill={`url(#lg-${id})`} />
            <path d="M19 46V18m26 28V18M19 34c0-6 5.8-10 13-10s13 4 13 10" fill="none" stroke="#fbf8f3" strokeWidth="6" strokeLinecap="round" />
      <circle cx="32" cy="13.5" r="4.2" fill="#f3b38f" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group inline-flex shrink-0 items-center gap-2 rounded-lg no-underline sm:gap-3" aria-label="Hadamley, go to homepage">
      <span className="relative">
        <LogoMark className="relative size-9 transition-transform duration-500 group-hover:-rotate-6 sm:size-11" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.3rem] font-semibold tracking-tight text-ink sm:text-[1.65rem]">Hadamley</span>
        <span className="mt-1 hidden text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-2 sm:block">Local support, clearly</span>
      </span>
    </Link>
  );
}
