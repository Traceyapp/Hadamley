import { Backdrop } from "@/components/fx/Aurora";
import { Reveal } from "@/components/fx/motion";
import { Breadcrumbs, Container } from "./bits";

/** Shared hero for inner pages: soft aurora, breadcrumb, title and intro. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  summary,
  icon,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  summary?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="grain relative isolate overflow-hidden border-b border-line">
      <Backdrop soft />
      <Container className="relative z-10 pb-14 pt-8 sm:pb-16 sm:pt-10">
        <Breadcrumbs items={crumbs} />
        <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-start">
          {icon && <Reveal y={12}>{icon}</Reveal>}
          <Reveal className="max-w-3xl" delay={0.05}>
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            <h1 className="text-[2.5rem] font-semibold leading-[1.04] sm:text-[3.4rem]">{typeof title === "string" ? <AccentTitle text={title} /> : title}</h1>
            {summary && <p className="mt-5 text-[1.18rem] leading-relaxed text-ink-2">{summary}</p>}
            {children}
          </Reveal>
        </div>
      </Container>
    </header>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.85rem] font-bold text-ink-2 shadow-soft">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--glow-1)] opacity-60" />
        <span className="relative inline-flex size-2 rounded-full bg-grad-brand" />
      </span>
      {children}
    </span>
  );
}

/** Gives the last word of a title the gradient italic treatment. */
export function AccentTitle({ text }: { text: string }) {
  const i = text.trimEnd().lastIndexOf(" ");
  if (i < 0) return <span className="text-gradient">{text}</span>;
  return (
    <>
      {text.slice(0, i + 1)}
      <span className="text-gradient italic font-normal pr-1">{text.slice(i + 1)}</span>
    </>
  );
}
