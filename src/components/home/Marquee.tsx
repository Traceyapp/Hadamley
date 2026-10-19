import Link from "next/link";

/** Infinite, pausable strip of links. The list is duplicated for the loop; the copy is hidden from assistive tech. */
export function Marquee({ items, label }: { items: { label: string; href: string }[]; label: string }) {
  const row = (hidden: boolean) =>
    items.map((it, i) => (
      <li key={`${hidden}-${i}`} className="shrink-0" aria-hidden={hidden || undefined}>
        <Link
          href={it.href}
          tabIndex={hidden ? -1 : undefined}
          className="group mx-1.5 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 px-5 py-2.5 text-[0.98rem] font-bold text-ink shadow-soft backdrop-blur transition hover:-translate-y-0.5 hover:border-transparent hover:bg-grad-brand hover:text-white"
        >
          <span className="size-1.5 rounded-full bg-grad-brand transition group-hover:bg-white" />
          {it.label}
        </Link>
      </li>
    ));
  return (
    <nav aria-label={label} className="marquee overflow-hidden py-2">
      <ul className="marquee-track">
        {row(false)}
        {row(true)}
      </ul>
    </nav>
  );
}
