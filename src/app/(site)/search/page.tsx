import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { siteSearch, type SearchKind } from "@/lib/site-search";
import { Container } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";

export const metadata: Metadata = { title: "Search" };

const LABEL: Record<SearchKind, string> = { service: "Services", page: "Guide pages", event: "Events", news: "News", download: "Downloads" };
const ORDER: SearchKind[] = ["service", "page", "event", "news", "download"];

/** Full results page: works without JavaScript, and is where the panel's Enter goes. */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await ensureDb();
  const q = ((await searchParams).q ?? "").slice(0, 120);
  const results = q ? siteSearch(q, 60) : [];
  return (
    <>
      <PageHero crumbs={[{ label: "Search" }]} title="Search Hadamley" summary="Services, guide pages, downloads, news and events in one place." />
      <Container className="pt-10">
        <form action="/search" role="search" className="card-print flex max-w-3xl items-center gap-2 rounded-2xl p-1.5">
          <Search className="ml-3 size-5 shrink-0" aria-hidden />
          <label htmlFor="sq" className="sr-only">
            Search
          </label>
          <input id="sq" name="q" type="search" defaultValue={q} className="min-h-12 w-full bg-transparent px-2 text-[1.05rem] outline-none focus-visible:shadow-none focus-visible:outline-none" />
          <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-ink px-6 font-bold text-paper">
            Search
          </button>
        </form>
        {q && (
          <p className="mt-8 font-bold" aria-live="polite">
            {results.length} {results.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
          </p>
        )}
        {ORDER.map((k) => {
          const items = results.filter((r) => r.kind === k);
          if (!items.length) return null;
          return (
            <section key={k} aria-labelledby={`h-${k}`} className="mt-8 max-w-3xl">
              <h2 id={`h-${k}`} className="kicker border-b-[1.5px] border-ink pb-2 font-sans text-ink-2">
                {LABEL[k]}
              </h2>
              <ul className="divide-y divide-line">
                {items.map((r) => (
                  <li key={r.url} className="py-4">
                    <Link href={r.url} className="text-[1.15rem] font-bold hover:underline">
                      {r.title}
                    </Link>
                    {r.meta && <p className="text-sm text-ink-2">{r.meta}</p>}
                    {r.snippet && <p className="mt-1 text-ink-2">{r.snippet}</p>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {q && !results.length && <p className="mt-4 text-ink-2">Nothing found. Try fewer or different words, or ask the Hadamley helper.</p>}
      </Container>
    </>
  );
}
