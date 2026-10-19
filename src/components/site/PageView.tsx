import Link from "next/link";
import { ArrowRight, ExternalLink, MessageCircleQuestion } from "lucide-react";
import type { Page } from "@/lib/types";
import { withHeadingIds } from "@/lib/html";
import { childPages, getPageAnyStatus, getSettings, listingsForTopics, publishedResources, searchListings, topicIdsForSlugs } from "@/lib/repo";
import { Breadcrumbs, Container, Disclaimer, SectionIcon } from "./bits";
import { ListingCard } from "./ListingCard";
import { ResourceCard } from "./ResourceCard";
import { AskButton } from "./HelperWidget";
import { ContactForm } from "./ContactForm";

const FUNERAL_LINK_SECTIONS = new Set(["chronic-illness-support", "mental-health-support"]);

export function PageView({ page, preview = false }: { page: Page; preview?: boolean }) {
  const parent = page.parentId ? getPageAnyStatus(page.parentId) : undefined;
  const kids = childPages(page.id, preview);
  const siblings = parent ? childPages(parent.id, preview) : [];
  const { html, toc } = withHeadingIds(page.body);
  const listings = listingsForTopics(page.listingTopics, 6);
  const totalListings = page.listingTopics.length ? searchListings({ topic: page.listingTopics }).length : 0;
  const resources = page.listingTopics.length ? publishedResources(topicIdsForSlugs(page.listingTopics)).slice(0, 3) : [];
  const { funeralCompanionUrl } = getSettings();
  const isLegal = ["privacy", "accessibility", "about", "contact"].includes(page.section);

  const crumbs = [...(parent ? [{ label: parent.navLabel || parent.title, href: `/${parent.slug}` }] : []), { label: page.navLabel || page.title }];
  const sectionNav = parent ? siblings : kids;
  const sectionRoot = parent ?? page;

  return (
    <article>
      <header className="grain border-b border-line">
        <Container className="pb-12 pt-8 sm:pb-14 sm:pt-10">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start">
            {!isLegal && <SectionIcon section={page.section} className="size-16 sm:size-20" />}
            <div className="max-w-3xl">
              <h1 className="text-[2.3rem] font-semibold leading-[1.08] sm:text-[3rem]">{page.title}</h1>
              {page.summary && <p className="mt-4 text-[1.15rem] leading-relaxed text-ink-2">{page.summary}</p>}
            </div>
          </div>
        </Container>
      </header>

      {page.template === "section" && kids.length > 0 && (
        <Container className="pt-12">
          <h2 className="sr-only">Pages in this section</h2>
          <ul className="grid gap-4 md:grid-cols-3">
            {kids.map((k) => (
              <li key={k.id}>
                <Link
                  href={preview ? `/admin/pages/${k.id}/preview` : `/${k.slug}`}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand hover:shadow-lift"
                >
                  <span className="font-display text-[1.25rem] font-semibold leading-snug group-hover:text-brand">{k.title}</span>
                  <span className="mt-2 text-[0.95rem] text-ink-2">{k.summary}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-bold text-brand">
                    Read more <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      )}

      <Container className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div className="min-w-0">
          {html.trim() && <div className="prose-h" dangerouslySetInnerHTML={{ __html: html }} />}
          {page.slug === "contact" && (
            <div className="mt-10 max-w-2xl">
              <ContactForm />
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start" aria-label="Page navigation">
          {toc.length > 1 && (
            <nav aria-labelledby="toc-title" className="rounded-2xl border border-line bg-surface p-5">
              <h2 id="toc-title" className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ink-2">
                On this page
              </h2>
              <ul className="mt-3 space-y-1 border-l-2 border-line">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-0.5 block border-l-2 border-transparent py-1 pl-3 text-[0.95rem] text-ink hover:border-brand hover:text-brand">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {sectionNav.length > 0 && (
            <nav aria-labelledby="insection-title" className="rounded-2xl border border-line bg-surface p-5">
              <h2 id="insection-title" className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ink-2">
                In this section
              </h2>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link href={`/${sectionRoot.slug}`} aria-current={sectionRoot.id === page.id ? "page" : undefined} className="block rounded-lg px-3 py-2 font-bold hover:bg-sand aria-[current=page]:bg-brand-soft aria-[current=page]:text-brand-strong">
                    {sectionRoot.navLabel || sectionRoot.title}
                  </Link>
                </li>
                {sectionNav.map((s) => (
                  <li key={s.id}>
                    <Link href={`/${s.slug}`} aria-current={s.id === page.id ? "page" : undefined} className="block rounded-lg px-3 py-2 text-[0.95rem] hover:bg-sand aria-[current=page]:bg-brand-soft aria-[current=page]:font-bold aria-[current=page]:text-brand-strong">
                      {s.navLabel || s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {!isLegal && (
            <div className="rounded-2xl bg-brand p-5 text-paper">
              <MessageCircleQuestion className="size-7" aria-hidden />
              <p className="mt-3 font-display text-xl font-semibold">Have a question?</p>
              <p className="mt-1 text-[0.95rem] opacity-90">Ask in your own words. Answers come only from Hadamley.</p>
              <AskButton className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-paper px-4 font-bold text-brand-strong hover:bg-white">
                Ask Hadamley <ArrowRight className="size-4" aria-hidden />
              </AskButton>
            </div>
          )}
          {FUNERAL_LINK_SECTIONS.has(page.section) && (
            <div className="rounded-2xl border border-line bg-sand p-5 text-[0.95rem]">
              <p className="font-bold">Bereavement and funerals</p>
              <p className="mt-1 text-ink-2">Support with grief and arranging a funeral is on The Funeral Companion.</p>
              <a href={funeralCompanionUrl} target="_blank" rel="noopener" className="link mt-2 inline-flex items-center gap-1.5 font-bold">
                The Funeral Companion <ExternalLink className="size-3.5" aria-hidden />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </div>
          )}
        </aside>
      </Container>

      {listings.length > 0 && (
        <section aria-labelledby="listings-title" className="mt-16 border-y border-line bg-brand-tint py-14">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.85rem] font-bold uppercase tracking-[0.14em] text-accent">Local services</p>
                <h2 id="listings-title" className="mt-1 text-[1.9rem] font-semibold">
                  Services that can help
                </h2>
              </div>
              {totalListings > listings.length || page.listingTopics.length ? (
                <Link
                  href={`/find-support?${page.listingTopics.map((t) => `topic=${t}`).join("&")}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-brand px-4 font-bold text-brand hover:bg-brand hover:text-paper"
                >
                  {totalListings > listings.length ? `See all ${totalListings}` : "Search and filter"} in Find Support <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : null}
            </div>
            <ul className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <li key={l.id}>
                  <ListingCard listing={l} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {resources.length > 0 && (
        <section aria-labelledby="related-res" className="pt-14">
          <Container>
            <h2 id="related-res" className="text-[1.6rem] font-semibold">
              Helpful downloads
            </h2>
            <ul className="mt-6 grid gap-5 md:grid-cols-3">
              {resources.map((r) => (
                <li key={r.id}>
                  <ResourceCard r={r} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <Container className="pt-14">
        <Disclaimer />
        <p className="mt-4 text-sm text-ink-2">Page last updated {new Date(page.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      </Container>
    </article>
  );
}
