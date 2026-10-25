import Link from "next/link";
import Image from "next/image";

/** Tracey's emblem: heart, tree and hands. Sits on a white tile so it reads in dark mode too. */
export function LogoMark({ className = "size-10" }: { className?: string }) {
  return (
    <span className={`block overflow-hidden rounded-xl bg-white ring-1 ring-line ${className}`} aria-hidden="true">
      <Image src="/brand/emblem.png" alt="" width={256} height={256} priority className="size-full object-contain" />
    </span>
  );
}

export function Logo() {
  return (
    <Link href="/" className="group inline-flex shrink-0 items-center gap-2 rounded-lg no-underline sm:gap-3" aria-label="Hadamley Information Services, go to homepage">
      <span className="relative max-[359px]:hidden">
        <LogoMark className="relative size-8 transition-transform duration-500 group-hover:scale-105 min-[380px]:size-9 sm:size-12" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.15rem] font-semibold tracking-tight text-ink min-[380px]:text-[1.3rem] sm:text-[1.65rem]">Hadamley</span>
        <span className="mt-1 hidden text-[0.72rem] font-bold uppercase tracking-[0.14em] text-accent sm:block">Information Services</span>
      </span>
    </Link>
  );
}
