import Link from "next/link";
import { ArrowRight, ExternalLink, MessageCircleQuestion } from "lucide-react";
import type { Page } from "@/lib/types";
import { withHeadingIds } from "@/lib/html";
import { childPages, getPageAnyStatus, getSettings, listingsForTopics, publishedResources, searchListings, topicIdsForSlugs } from "@/lib/repo";
import { Container, Disclaimer, SectionIcon } from "./bits";
import { PageHero } from "./PageHero";
import { Spotlight, Stagger } from "@/components/fx/motion";
import { Aurora } from "@/components/fx/Aurora";
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
      <PageHero
        crumbs={crumbs}
        title={page.title}
        summary={page.summary}
        icon={!isLegal ? <SectionIcon section={page.section} className="size-16 sm:size-[5.5rem]" /> : undefined}
      />

      {page.template === "section" && kids.length > 0 && (
        <Container className="relative z-10 pt-0">
          <h2 className="sr-only">Pages in this section</h2>
          <Stagger className="-mt-6 grid gap-5 md:grid-cols-3">
            {kids.map((k, i) => (
              <Spotlight key={k.id} className="ring-grad group relative z-10 h-full rounded-[var(--radius-card)] border border-line bg-surface shadow-lift transition duration-500 hover:-translate-y-1">
                <Link href={preview ? `/admin/pages/${k.id}/preview` : `/${k.slug}`} className="flex h-full flex-col p-6">
                  <span className="font-display text-[0.95rem] font-semibold text-gradient">0{i + 1}</span>
                  <span className="mt-2 font-display text-[1.35rem] font-semibold leading-snug group-hover:text-brand">{k.title}</span>
                  <span className="mt-2 text-[0.95rem] text-ink-2">{k.summary}</span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 font-bold text-brand">
                    Read more
                    <span className="grid size-7 place-items-center rounded-full bg-brand-tint transition group-hover:translate-x-1 group-hover:bg-grad-brand group-hover:text-white">
                      <ArrowRight className="size-3.5" aria-hidden />
                    </span>
                  </span>
                </Link>
              </Spotlight>
            ))}
          </Stagger>
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
            <nav aria-labelledby="toc-title" className="rounded-3xl border border-line bg-surface/80 p-5 shadow-soft backdrop-blur">
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
            <nav aria-labelledby="insection-title" className="rounded-3xl border border-line bg-surface/80 p-5 shadow-soft backdrop-blur">
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
            <div className="relative isolate overflow-hidden rounded-3xl bg-[#06282b] p-6 text-white shadow-lift">
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_90%_70%_at_0%_0%,#0f7a6c_0%,transparent_65%),radial-gradient(ellipse_70%_70%_at_100%_100%,#1f8fae_0%,transparent_65%)]" />
              <div aria-hidden="true" className="absolute -right-6 -top-6 -z-10 size-28 rounded-full bg-[#ffc49a]/30 blur-2xl" />
              <span className="grid size-11 place-items-center rounded-xl bg-white/15 ring-1 ring-white/25">
                <MessageCircleQuestion className="size-6" aria-hidden />
              </span>
              <p className="mt-3 font-display text-xl font-semibold">Have a question?</p>
              <p className="mt-1 text-[0.95rem] opacity-90">Ask in your own words. Answers come only from Hadamley.</p>
              <AskButton className="group mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 font-bold text-[#073b3e] transition hover:-translate-y-0.5">
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
        <section aria-labelledby="listings-title" className="grain relative isolate mt-20 overflow-hidden border-y border-line py-16">
          <Aurora soft />
          <Container className="relative z-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[0.85rem] font-bold uppercase tracking-[0.18em] text-accent">Local services</p>
                <h2 id="listings-title" className="mt-1 text-[1.9rem] font-semibold">
                  Services that can help
                </h2>
              </div>
              {totalListings > listings.length || page.listingTopics.length ? (
                <Link
                  href={`/find-support?${page.listingTopics.map((t) => `topic=${t}`).join("&")}`}
                  className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-grad-brand px-5 font-bold text-white shadow-glow transition hover:-translate-y-0.5"
                >
                  {totalListings > listings.length ? `See all ${totalListings}` : "Search and filter"} in Find Support <ArrowRight className="size-4" aria-hidden />
                </Link>
              ) : null}
            </div>
            <Stagger className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </Stagger>
          </Container>
        </section>
      )}

      {resources.length > 0 && (
        <section aria-labelledby="related-res" className="pt-14">
          <Container>
            <h2 id="related-res" className="text-[1.6rem] font-semibold">
              Helpful downloads
            </h2>
            <Stagger className="mt-6 grid gap-5 md:grid-cols-3">
              {resources.map((r) => (
                <ResourceCard key={r.id} r={r} />
              ))}
            </Stagger>
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
