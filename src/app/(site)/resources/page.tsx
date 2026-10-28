import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Pencil, Puzzle } from "lucide-react";
import { publishedResources } from "@/lib/repo";
import type { ResourceKind } from "@/lib/types";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";
import { Stagger } from "@/components/fx/motion";
import { ResourceCard } from "@/components/site/ResourceCard";
import { CornerLeaves } from "@/components/art/Leaves";
import { AnimationSlot } from "@/components/site/AnimationSlot";

/** The three categories agreed on 27 October. Every download kind belongs to one. */
const CATEGORIES = [
  {
    slug: "colouring",
    title: "Colouring Pages",
    blurb: "Printable designs for a quiet, creative moment.",
    cta: "Browse colouring pages",
    kinds: ["colouring"] as ResourceKind[],
    Icon: Pencil,
    tone: "bg-[var(--pastel-sage)]",
  },
  {
    slug: "guides",
    title: "Information Guides",
    blurb: "Plain-English guides about health, disability and practical support.",
    cta: "Browse information guides",
    kinds: ["guide", "leaflet", "checklist", "journal", "tracker", "worksheet"] as ResourceKind[],
    Icon: BookOpen,
    tone: "bg-[var(--pastel-cream)]",
  },
  {
    slug: "activities",
    title: "Puzzles & Activities",
    blurb: "Word searches, word games and other printable activities.",
    cta: "Browse puzzles & activities",
    kinds: ["puzzle", "activity"] as ResourceKind[],
    Icon: Puzzle,
    tone: "bg-[var(--pastel-blue)]",
  },
];

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
      <CornerLeaves />
      <PageHero crumbs={[{ label: "Guides & Resources" }]} title="Guides & Resources" summary="Browse free downloads to read, colour and enjoy." />
      <Container className="max-w-4xl pt-10">
        <h2 className="sr-only">Categories</h2>
        <ul className="grid gap-5">
          {CATEGORIES.map(({ slug, title, blurb, cta, Icon, tone, kinds }) => {
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
        <p className="mt-6 text-center font-bold text-ink-2">All downloads are free.</p>
        <AnimationSlot />
      </Container>
    </div>
  );
}
