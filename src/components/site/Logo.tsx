import Link from "next/link";

export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="18" className="fill-brand" />
      <path
        d="M19 46V18m26 28V18M19 34c0-6 5.8-10 13-10s13 4 13 10"
        fill="none"
        className="stroke-paper"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="32" cy="13.5" r="4" className="fill-accent" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group inline-flex shrink-0 items-center gap-2 rounded-lg no-underline sm:gap-3" aria-label="Hadamley, go to homepage">
      <LogoMark className="size-9 transition-transform group-hover:-rotate-3 sm:size-11" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.3rem] font-semibold tracking-tight text-ink sm:text-[1.65rem]">Hadamley</span>
        <span className="mt-1 hidden text-[0.72rem] font-bold uppercase tracking-[0.14em] text-ink-2 sm:block">Local support, clearly</span>
      </span>
    </Link>
  );
}
