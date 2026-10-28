import Link from "next/link";
import { ArrowRight, ExternalLink, MessageCircleQuestion } from "lucide-react";
import type { Page } from "@/lib/types";
import { withHeadingIds } from "@/lib/html";
import { childPages, getPageAnyStatus, getSettings, listingsForTopics, publishedResources, searchListings, topicIdsForSlugs } from "@/lib/repo";
import { Container, Disclaimer } from "./bits";
import { sectionClass } from "@/components/art/Landmarks";
import { PageHero } from "./PageHero";
import { Accordions } from "./Accordions";
import { Stagger } from "@/components/fx/motion";
import { ListingCard } from "./ListingCard";
import { ResourceCard } from "./ResourceCard";
import { AskButton } from "./HelperWidget";
import { ContactForm } from "./ContactForm";
import { HealthUrgentBox } from "./HealthUrgentBox";
import { EasyRead } from "./EasyRead";
import { HealthHub, isHealthHub } from "./HealthHub";

const FUNERAL_LINK_SECTIONS = new Set(["chronic-illness-support", "mental-health-support"]);

export function PageView({ page, preview = false }: { page: Page; preview?: boolean }) {
  const parent = page.parentId ? getPageAnyStatus(page.parentId) : undefined;
  const kids = childPages(page.id, preview);
  const siblings = parent ? childPages(parent.id, preview) : [];
  const { html, toc } = withHeadingIds(page.body);
  const listings = listingsForTopics(page.listingTopics, 6);
  const totalListings = page.listingTopics.length ? searchListings({ topic: page.listingTopics }).length : 0;
  const resources = page.listingTopics.length ? publishedResources(topicIdsForSlugs(page.listingTopics)).slice(0, 3) : [];
  const { funeralCompanionUrl, contactEmail } = getSettings();
  const hub = isHealthHub(page);
  const isLegal = ["privacy", "accessibility", "about", "contact", "cookies"].includes(page.section);

  const crumbs = [...(parent ? [{ label: parent.navLabel || parent.title, href: `/${parent.slug}` }] : []), { label: page.navLabel || page.title }];
  const sectionNav = parent ? siblings : kids;
  const sectionRoot = parent ?? page;

  return (
    <article className={isLegal ? "" : sectionClass(page.section)}>
      <PageHero
        crumbs={crumbs}
        title={page.title}
        summary={page.summary}
        section={isLegal ? undefined : page.section}
        morph={`page-${page.id}`}
      />

      {page.template === "section" && kids.length > 0 && !hub && (
        <Container className="relative z-10 pt-0">
          <h2 className="sr-only">Pages in this section</h2>
          <Stagger className="-mt-7 grid gap-6 md:grid-cols-3">
            {kids.map((k, i) => (
              <div key={k.id} className="h-full">
                <Link href={preview ? `/admin/pages/${k.id}/preview` : `/${k.slug}`} className="card-print card-print-hover group relative z-10 flex h-full flex-col p-6">
                  <span className="font-display text-[1.6rem] font-semibold leading-none text-sec">{String.fromCharCode(65 + i)}.</span>
                  <span className="mt-3 font-display text-[1.35rem] font-semibold leading-snug group-hover:underline">{k.title}</span>
                  <span className="mt-2 text-[0.95rem] text-ink-2">{k.summary}</span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 font-bold text-sec">
                    Read more
                    <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </div>
            ))}
          </Stagger>
        </Container>
      )}

      <Container className="grid gap-12 pt-12 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-16">
        <div className="min-w-0">
          {page.section === "mental-health-support" && <HealthUrgentBox kind="mental" />}
          {page.section === "chronic-illness-support" && <HealthUrgentBox kind="physical" />}
          {!isLegal && process.env.OPENAI_API_KEY && <EasyRead pageId={page.id} />}
          {hub ? (
            <HealthHub page={page} html={html} preview={preview} />
          ) : (
            <>
              {html.trim() && <div className="prose-h" dangerouslySetInnerHTML={{ __html: html }} />}
              <Accordions sections={page.sections ?? []} preview={preview} />
            </>
          )}
          {page.slug === "contact" && (
            <div className="mt-10 max-w-2xl">
              {contactEmail && (
                <p className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-card)] border-[1.5px] border-ink bg-surface px-5 py-4">
                  <span className="kicker text-ink-2">Email</span>
                  <a href={`mailto:${contactEmail}`} className="font-display text-xl font-semibold underline-offset-4 hover:underline">
                    {contactEmail}
                  </a>
                </p>
              )}
              <ContactForm />
            </div>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-36 lg:self-start" aria-label="Page navigation">
          {toc.length > 1 && !hub && (
            <nav aria-labelledby="toc-title" className="rounded-[var(--radius-card)] border-[1.5px] border-ink bg-surface p-5">
              <h2 id="toc-title" className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ink-2">
                On this page
              </h2>
              <ul className="mt-3 space-y-1 border-l-2 border-line">
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`} className="-ml-0.5 block border-l-2 border-transparent py-1 pl-3 text-[0.95rem] text-ink hover:border-ink hover:text-ink">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {sectionNav.length > 0 && !hub && (
            <nav aria-labelledby="insection-title" className="rounded-[var(--radius-card)] border-[1.5px] border-ink bg-surface p-5">
              <h2 id="insection-title" className="font-sans text-[0.8rem] font-bold uppercase tracking-[0.12em] text-ink-2">
                In this section
              </h2>
              <ul className="mt-3 space-y-1">
                <li>
                  <Link href={`/${sectionRoot.slug}`} aria-current={sectionRoot.id === page.id ? "page" : undefined} className="block rounded-lg px-3 py-2 font-bold hover:bg-sand aria-[current=page]:bg-sec-soft aria-[current=page]:text-ink">
                    {sectionRoot.navLabel || sectionRoot.title}
                  </Link>
                </li>
                {sectionNav.map((s) => (
                  <li key={s.id}>
                    <Link href={`/${s.slug}`} aria-current={s.id === page.id ? "page" : undefined} className="block rounded-lg px-3 py-2 text-[0.95rem] hover:bg-sand aria-[current=page]:bg-sec-soft aria-[current=page]:font-bold aria-[current=page]:text-ink">
                      {s.navLabel || s.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          {!isLegal && (
            <div className="card-print p-6">
              <span className="grid size-11 place-items-center rounded-full bg-ink text-paper">
                <MessageCircleQuestion className="size-6" aria-hidden />
              </span>
              <p className="mt-3 font-display text-xl font-semibold">Have a question?</p>
              <p className="mt-1 text-[0.95rem] text-ink-2">Ask in your own words. Answers come only from Hadamley.</p>
              <AskButton className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-ink px-5 font-bold text-paper transition hover:-translate-y-0.5">
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
        <section aria-labelledby="listings-title" className="mt-20 border-y-[1.5px] border-ink bg-paper-2 py-16">
          <Container className="relative z-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="kicker text-sec">Local services</p>
                <h2 id="listings-title" className="mt-1 text-[1.9rem] font-semibold">
                  Services that can help
                </h2>
              </div>
              {totalListings > listings.length || page.listingTopics.length ? (
                <Link
                  href={`/find-support?${page.listingTopics.map((t) => `topic=${t}`).join("&")}`}
                  className="card-print card-print-hover inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-bold text-paper"
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

      {resources.length > 0 && !hub && (
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
