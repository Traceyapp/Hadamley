import { Reveal } from "@/components/fx/motion";
import { SectionArt, sectionClass } from "@/components/art/Landmarks";
import { Breadcrumbs, Container } from "./bits";
import { Morph } from "@/components/fx/Morph";

const CHAPTER: Record<string, { n: string; name: string }> = {
  "chronic-illness-support": { n: "01", name: "Living with chronic illness" },
  "mobility-daily-living-transport": { n: "02", name: "Mobility and transport" },
  "mental-health-support": { n: "03", name: "Mental health" },
  "find-support": { n: "04", name: "Find support" },
  resources: { n: "05", name: "Printable library" },
};

/**
 * Chapter opener for inner pages: the section's colour, its chapter number
 * and a small illustrated scene. Legal and info pages get a plain version.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  summary,
  section,
  morph,
  children,
}: {
  crumbs: { label: string; href?: string }[];
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  summary?: React.ReactNode;
  section?: string;
  /** Shared-element name so a card title can morph into this heading. */
  morph?: string;
  /** Kept for older callers; the chapter art replaces it. */
  icon?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const chapter = section ? CHAPTER[section] : undefined;
  return (
    <header className={`${section ? sectionClass(section) : ""} border-b-[1.5px] border-ink ${chapter ? "bg-sec-soft" : "bg-paper-2"}`}>
      <Container className="grid gap-8 pb-12 pt-8 sm:pb-14 sm:pt-10 lg:grid-cols-[1fr_17rem] lg:items-end">
        <div>
          <Breadcrumbs items={crumbs} />
          <Reveal className="mt-10 max-w-3xl" y={10}>
            {chapter && (
              <p className="kicker flex items-center gap-3 text-sec">
                <span className="font-display text-[1.6rem] font-semibold normal-case tracking-normal">{chapter.n}</span>
                <span className="h-px w-8 bg-current" aria-hidden />
                {chapter.name}
              </p>
            )}
            {eyebrow && <div className="mb-4">{eyebrow}</div>}
            {(() => {
              const h = (
                <h1 className={`${chapter ? "mt-3" : ""} text-[2.5rem] font-semibold leading-[1.04] sm:text-[3.5rem]`}>{typeof title === "string" ? <AccentTitle text={title} /> : title}</h1>
              );
              return morph ? <Morph name={morph}>{h}</Morph> : h;
            })()}
            {summary && <p className="mt-5 max-w-2xl text-[1.18rem] leading-relaxed text-ink-2">{summary}</p>}
            {children}
          </Reveal>
        </div>
        {section && (
          <div className="hidden lg:block">
            <div className="card-print rotate-[1.5deg] p-3">
              <SectionArt section={section} className="vignette-draw aspect-[4/3] w-full" />
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}

/** Sets the last word of a title in the section colour, in italic. */
export function AccentTitle({ text }: { text: string }) {
  const i = text.trimEnd().lastIndexOf(" ");
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i + 1)}
      <span className="font-normal italic text-sec">{text.slice(i + 1)}</span>
    </>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className="kicker inline-flex items-center gap-2 text-ink-2">{children}</span>;
}
