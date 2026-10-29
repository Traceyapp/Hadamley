import Link from "next/link";
import { ArrowRight, ChevronDown, Download } from "lucide-react";
import type { Page } from "@/lib/types";
import { childPages, getPublishedPage, publishedResources, topicIdsForSlugs } from "@/lib/repo";
import { formatBytes } from "@/lib/format";
import { Accordions } from "./Accordions";
import { ConditionFilter } from "./ConditionFilter";

type Group = { id: string; heading: string; pages?: string[]; children?: string; body?: boolean; conditions?: boolean; resources?: boolean; finder?: boolean };

/**
 * Accordion headings for the two health hubs, in the order of the 27 October
 * designs. A heading only shows once it has something published behind it,
 * so the page never shows an empty fold.
 */
const HUBS: Record<string, { groups: Group[]; across: { href: string; label: string } }> = {
  "chronic-illness-support": {
    groups: [
      { id: "conditions", heading: "Conditions A–Z", conditions: true, pages: ["chronic-illness-support/conditions-a-z", "chronic-illness-support/lupus", "chronic-illness-support/arthritis"] },
      { id: "fibromyalgia", heading: "Understanding fibromyalgia", pages: ["chronic-illness-support/understanding-fibromyalgia"] },
      { id: "living", heading: "Living with chronic illness", body: true },
      { id: "mobility", heading: "Mobility & practical help", children: "mobility-daily-living-transport", pages: ["mobility-daily-living-transport"] },
      { id: "care", heading: "Who is involved in your care?", pages: ["physiotherapy", "occupational-therapy", "hospitals-and-clinics"], finder: true },
      { id: "benefits", heading: "Benefits & financial help", pages: ["benefits-and-financial-help"] },
      { id: "rights", heading: "Hidden disabilities & discrimination", pages: ["your-rights"] },
      { id: "downloads", heading: "Free resources & downloads", resources: true },
    ],
    across: { href: "/mental-health-support", label: "Explore mental health support" },
  },
  "mental-health-support": {
    groups: [
      { id: "types", heading: "Types of mental health support", body: true, pages: ["mental-health-support/understanding-mental-health"] },
      { id: "conditions", heading: "Mental health conditions A–Z", conditions: true },
      { id: "who", heading: "Who can help?", finder: true },
      { id: "rights", heading: "Discrimination & your rights", pages: ["your-rights"] },
      { id: "benefits", heading: "Benefits & financial help", pages: ["benefits-and-financial-help"] },
      { id: "downloads", heading: "Free wellbeing resources & downloads", resources: true },
    ],
    across: { href: "/chronic-illness-support", label: "Explore chronic illness support" },
  },
};

export function isHealthHub(page: Page) {
  return !page.parentId && page.slug in HUBS;
}

const linkCard = "group flex items-center justify-between gap-4 rounded-xl border-[1.5px] border-line-strong bg-surface px-4 py-3 text-ink hover:border-ink";

export function HealthHub({ page, html, preview = false }: { page: Page; html: string; preview?: boolean }) {
  const hub = HUBS[page.slug];
  const resources = publishedResources(page.listingTopics.length ? topicIdsForSlugs(page.listingTopics) : undefined).slice(0, 6);
  const hasConditions = (page.sections ?? []).some((s) => preview || s.body.replace(/<[^>]*>/g, "").trim());

  const folds = hub.groups
    .map((g) => {
      const pages = [...(g.pages ?? []).map((slug) => getPublishedPage(slug)), ...(g.children ? childPages(getPublishedPage(g.children)?.id ?? "") : [])].filter(
        (p, i, all): p is Page => !!p && all.findIndex((x) => x?.id === p.id) === i,
      );
      const content = (
        <>
          {g.conditions && hasConditions && (
            <>
              <ConditionFilter />
              <Accordions sections={page.sections ?? []} preview={preview} nested />
            </>
          )}
          {g.body && html.trim() && <div className="prose-h" dangerouslySetInnerHTML={{ __html: html }} />}
          {pages.length > 0 && (
            <ul className="mt-4 space-y-2">
              {pages.map((p) => (
                <li key={p.id}>
                  <Link href={`/${p.slug}`} className={linkCard}>
                    <span>
                      <span className="block font-bold group-hover:underline">{p.navLabel || p.title}</span>
                      {p.summary && <span className="mt-0.5 block text-[0.95rem] text-ink-2 line-clamp-2">{p.summary}</span>}
                    </span>
                    <ArrowRight className="size-5 shrink-0" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {g.finder && (
            <p className="mt-4">
              <Link href={`/find-support${page.listingTopics.length ? `?${page.listingTopics.map((t) => `topic=${t}`).join("&")}` : ""}`} className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
                Search services in Find Support <ArrowRight className="size-4" aria-hidden />
              </Link>
            </p>
          )}
          {g.resources && resources.length > 0 && (
            <>
              <ul className="space-y-2">
                {resources.map((r) => (
                  <li key={r.id}>
                    <a href={`/files/${r.storedName}`} download={r.fileName} className="inline-flex min-h-11 items-center gap-2 font-bold text-brand hover:underline">
                      <Download className="size-4" aria-hidden /> {r.title}
                      <span className="font-normal text-ink-2">({r.fileName.split(".").pop()?.toUpperCase()}, {formatBytes(r.size)})</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4">
                <Link href="/resources" className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
                  All Guides &amp; Resources <ArrowRight className="size-4" aria-hidden />
                </Link>
              </p>
            </>
          )}
        </>
      );
      const has = (g.conditions && hasConditions) || (g.body && html.trim()) || pages.length > 0 || g.finder || (g.resources && resources.length > 0);
      return has ? { g, content } : null;
    })
    .filter((f) => !!f);

  return (
    <section aria-label="Explore this section" className="max-w-[68ch]">
      <p className="mb-4 text-ink-2">Tap a heading to explore each section.</p>
      <div className="space-y-3" data-accordions>
        {folds.map(({ g, content }, i) => (
          <details key={g.id} id={`hub-${g.id}`} open={g.conditions && i === 0 ? true : undefined} className={`fold group/hub scroll-mt-28 overflow-hidden rounded-[var(--radius-card)] border-[1.5px] border-champagne ${i % 2 ? "bg-surface" : "bg-[var(--pastel-sage)]"}`}>
            <summary className="flex min-h-14 cursor-pointer list-none items-center gap-4 px-5 py-3 marker:hidden [&::-webkit-details-marker]:hidden">
              <h2 className="flex-1 font-sans text-[1.15rem] font-bold leading-snug">{g.heading}</h2>
              <ChevronDown className="size-5 shrink-0 transition-transform duration-300 group-open/hub:rotate-180" aria-hidden />
            </summary>
            <div className="fold-body border-t border-line bg-surface px-5 pb-5 pt-4">{content}</div>
          </details>
        ))}
      </div>
      <p className="mt-8 text-center">
        <Link href={hub.across.href} className="link inline-flex min-h-11 items-center gap-1.5 font-bold">
          {hub.across.label} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </p>
    </section>
  );
}
