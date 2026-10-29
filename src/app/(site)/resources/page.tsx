import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Pencil, Puzzle, type LucideIcon } from "lucide-react";
import { publishedResources } from "@/lib/repo";
import { RESOURCE_CATEGORIES } from "@/lib/resource-categories";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";
import { Stagger } from "@/components/fx/motion";
import { ResourceCard } from "@/components/site/ResourceCard";
import { AnimationSlot } from "@/components/site/AnimationSlot";

/** Look of the three design cards; the categories themselves are shared with the menu. */
const CARD_STYLE: Record<string, { cta: string; Icon: LucideIcon; tone: string }> = {
  colouring: { cta: "Browse colouring pages", Icon: Pencil, tone: "bg-[var(--pastel-sage)]" },
  guides: { cta: "Browse information guides", Icon: BookOpen, tone: "bg-[var(--pastel-cream)]" },
  activities: { cta: "Browse puzzles & activities", Icon: Puzzle, tone: "bg-[var(--pastel-blue)]" },
};
const CARD_ORDER = ["colouring", "guides", "activities"];
const CATEGORIES = RESOURCE_CATEGORIES;

type SP = Promise<{ category?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { category } = await searchParams;
  const c = CATEGORIES.find((x) => x.slug === category);
  return {
    title: c ? `${c.title}: Guides & Resources` : "Guides & Resources",
    description: "Free colouring pages, information guides, puzzles and activities to download and print.",
    alternates: { canonical: c ? `/resources?category=${c.slug}` : "/resources" },
    openGraph: { type: "website", url: "/resources", title: "Guides & Resources", description: "Free downloads to read, colour and enjoy." },
  };
}

export default async function ResourcesPage({ searchParams }: { searchParams: SP }) {
  await ensureDb();
  const { category } = await searchParams;
  const all = publishedResources();
  const current = CATEGORIES.find((c) => c.slug === category);

  if (current) {
    const list = all.filter((r) => current.kinds.includes(r.kind));
    return (
      <>
        <PageHero crumbs={[{ label: "Guides & Resources", href: "/resources" }, { label: current.title }]} title={current.title} summary={current.blurb} />
        <Container className="pt-10">
          <h2 className="sr-only">Downloads</h2>
          {list.length ? (
            <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {list.map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </Stagger>
          ) : (
            <p className="rounded-2xl border border-dashed border-line-strong p-10 text-center text-ink-2">New downloads are on the way. Please check back soon.</p>
          )}
          <p className="mt-10">
            <Link href="/resources" className="link inline-flex items-center gap-1.5 font-bold">
              All Guides &amp; Resources <ArrowRight className="size-4" aria-hidden />
            </Link>
          </p>
          <Disclaimer className="mt-12" />
        </Container>
      </>
    );
  }

  return (
    <div className="relative isolate">
      <PageHero crumbs={[{ label: "Guides & Resources" }]} title="Guides & Resources" summary="Browse free downloads to read, colour and enjoy." />
      <Container className="max-w-4xl pt-10">
        <h2 className="sr-only">Categories</h2>
        <ul className="grid gap-5">
          {CARD_ORDER.map((slug) => CATEGORIES.find((c) => c.slug === slug)!).map(({ slug, title, blurb, kinds }) => {
            const { cta, Icon, tone } = CARD_STYLE[slug];
            const count = all.filter((r) => kinds.includes(r.kind)).length;
            return (
              <li key={slug} className={`flex flex-col gap-5 rounded-[var(--radius-card)] border-[1.5px] border-champagne p-6 sm:flex-row sm:items-center ${tone}`}>
                <span className="grid size-20 shrink-0 place-items-center rounded-full bg-surface">
                  <Icon className="size-9 text-brand" aria-hidden />
                </span>
                <div className="flex-1">
                  <h3 className="text-[1.6rem] font-semibold leading-tight">{title}</h3>
                  <p className="mt-1 text-ink-2">{blurb}</p>
                  <Link href={`/resources?category=${slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border-[1.5px] border-brand bg-surface px-4 font-bold text-brand hover:bg-brand-tint">
                    {cta} <span className="font-normal text-ink-2">({count})</span> <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
        <nav aria-labelledby="more-title" className="mt-6 rounded-[var(--radius-card)] border-[1.5px] border-line-strong bg-surface p-5">
          <h3 id="more-title" className="font-sans text-[1.05rem] font-bold">More to print</h3>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {CATEGORIES.filter((c) => !c.card).map((c) => (
              <li key={c.slug}>
                <Link href={`/resources?category=${c.slug}`} className="link inline-flex items-center gap-1.5 font-bold">
                  {c.title} <span className="font-normal text-ink-2">({all.filter((r) => c.kinds.includes(r.kind)).length})</span>
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 text-center font-bold text-ink-2">All downloads are free.</p>
        <AnimationSlot />
      </Container>
    </div>
  );
}
