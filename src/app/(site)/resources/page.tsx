import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPage, publishedResources, topics } from "@/lib/repo";
import { KIND_LABEL, KIND_PLURAL, type ResourceKind } from "@/lib/types";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";
import { Stagger } from "@/components/fx/motion";
import { ResourceCard } from "@/components/site/ResourceCard";

export const metadata: Metadata = { title: "Free printable library", description: "Journals, trackers, colouring, puzzles, guides and checklists to download and print, free." };

type SP = Promise<{ kind?: string; topic?: string }>;

export default async function ResourcesPage({ searchParams }: { searchParams: SP }) {
  await ensureDb();
  const { kind, topic } = await searchParams;
  const page = getPublishedPage("resources");
  const all = publishedResources();
  const topicList = topics().filter((t) => all.some((r) => r.topicIds.includes(t.id)));
  const t = topicList.find((x) => x.slug === topic);
  const list = all.filter((r) => (kind ? r.kind === kind : true)).filter((r) => (t ? r.topicIds.includes(t.id) : true));
  const kinds = (Object.keys(KIND_LABEL) as ResourceKind[]).filter((k) => all.some((r) => r.kind === k));

  const pill = (active: boolean) =>
    `inline-flex min-h-10 items-center rounded-full border-[1.5px] px-4 text-[0.95rem] font-bold ${active ? "border-ink bg-ink text-paper" : "border-ink bg-surface hover:bg-sand"}`;
  const href = (k?: string, tp?: string) => {
    const p = new URLSearchParams();
    if (k) p.set("kind", k);
    if (tp) p.set("topic", tp);
    return `/resources${p.size ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHero
        crumbs={[{ label: "Free printable library" }]}
        section="resources"
        title={page?.title ?? "Free printable library"}
        summary={page?.summary}
      />
      <Container className="pt-10">
        <p className="mb-6 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-full border-[1.5px] border-ink bg-surface px-4 py-2 font-bold">
          <span className="sec-res text-sec">Free to download and print</span>
          <span className="font-normal text-ink-2">Browse online. Download and print.</span>
        </p>
        <nav aria-label="Filter resources" className="space-y-3">
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href={href(undefined, topic)} className={pill(!kind)} aria-current={!kind ? "true" : undefined}>
                All types
              </Link>
            </li>
            {kinds.map((k) => (
              <li key={k}>
                <Link href={href(k, topic)} className={pill(kind === k)} aria-current={kind === k ? "true" : undefined}>
                  {KIND_PLURAL[k]}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="flex flex-wrap gap-2">
            <li>
              <Link href={href(kind)} className={pill(!t)} aria-current={!t ? "true" : undefined}>
                All topics
              </Link>
            </li>
            {topicList.map((x) => (
              <li key={x.id}>
                <Link href={href(kind, x.slug)} className={pill(t?.id === x.id)} aria-current={t?.id === x.id ? "true" : undefined}>
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <h2 className="sr-only">Downloads</h2>
        {list.length ? (
          <Stagger key={list.map((r) => r.id).join()} className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <ResourceCard key={r.id} r={r} />
            ))}
          </Stagger>
        ) : (
          <p className="mt-10 rounded-2xl border border-dashed border-line-strong p-10 text-center text-ink-2">No downloads match. Try another filter.</p>
        )}
        <Disclaimer className="mt-12" />
      </Container>
    </>
  );
}
