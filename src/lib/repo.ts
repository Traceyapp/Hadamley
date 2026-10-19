import { readDb } from "./db";
import type { Delivery, Listing, Page, ProviderType, Resource, Taxon } from "./types";

/* Public read queries. Only published pages and approved listings leave here. */

export function getSettings() {
  return readDb().settings;
}

export function publishedPages(): Page[] {
  return readDb().pages.filter((p) => p.status === "published");
}

export function getPublishedPage(slug: string): Page | undefined {
  return publishedPages().find((p) => p.slug === slug);
}

export function getPageAnyStatus(id: string): Page | undefined {
  return readDb().pages.find((p) => p.id === id);
}

export function childPages(parentId: string, includeDrafts = false): Page[] {
  return readDb()
    .pages.filter((p) => p.parentId === parentId && (includeDrafts || p.status === "published"))
    .sort((a, b) => a.navOrder - b.navOrder);
}

export interface NavItem {
  label: string;
  href: string;
  children: { label: string; href: string; summary: string }[];
}

export function navigation(): NavItem[] {
  const pages = publishedPages();
  return pages
    .filter((p) => p.showInNav && !p.parentId && p.template !== "home")
    .sort((a, b) => a.navOrder - b.navOrder)
    .map((p) => ({
      label: p.navLabel || p.title,
      href: `/${p.slug}`,
      children: pages
        .filter((c) => c.parentId === p.id && c.showInNav)
        .sort((a, b) => a.navOrder - b.navOrder)
        .map((c) => ({ label: c.navLabel || c.title, href: `/${c.slug}`, summary: c.summary })),
    }));
}

export function topics(): Taxon[] {
  return readDb().taxa.filter((t) => t.type === "topic").sort((a, b) => a.order - b.order);
}

export function areas(): Taxon[] {
  return readDb().taxa.filter((t) => t.type === "area").sort((a, b) => a.order - b.order);
}

export function taxonById(id: string) {
  return readDb().taxa.find((t) => t.id === id);
}

export function approvedListings(): Listing[] {
  return readDb().listings.filter((l) => l.status === "approved");
}

export function getApprovedListing(id: string) {
  return approvedListings().find((l) => l.id === id);
}

export interface ListingQuery {
  q?: string;
  topic?: string[];
  provider?: ProviderType[];
  area?: string[];
  delivery?: Delivery[];
}

export function searchListings(query: ListingQuery): Listing[] {
  const db = readDb();
  const bySlug = (slug: string) => db.taxa.find((t) => t.slug === slug)?.id;
  const topicIds = (query.topic ?? []).map(bySlug).filter(Boolean) as string[];
  const areaIds = (query.area ?? []).map(bySlug).filter(Boolean) as string[];
  const words = (query.q ?? "").toLowerCase().split(/\s+/).filter((w) => w.length > 1);

  return approvedListings()
    .filter((l) => (topicIds.length ? l.topicIds.some((t) => topicIds.includes(t)) : true))
    .filter((l) => (areaIds.length ? l.areaIds.some((a) => areaIds.includes(a)) : true))
    .filter((l) => (query.provider?.length ? query.provider.includes(l.providerType) : true))
    .filter((l) => (query.delivery?.length ? l.delivery.some((d) => query.delivery!.includes(d)) : true))
    .map((l) => {
      if (!words.length) return { l, score: 0 };
      const hay = [l.name, l.summary, l.description, l.eligibility, l.address, ...l.topicIds.map((id) => db.taxa.find((t) => t.id === id)?.name ?? "")]
        .join(" ")
        .toLowerCase();
      const score = words.reduce((s, w) => s + (hay.includes(w) ? (l.name.toLowerCase().includes(w) ? 3 : 1) : 0), 0);
      return { l, score: words.every((w) => hay.includes(w.replace(/s$/, ""))) ? score + 2 : score };
    })
    .filter((x) => (words.length ? x.score > 0 : true))
    .sort((a, b) => b.score - a.score || a.l.name.localeCompare(b.l.name))
    .map((x) => x.l);
}

export function listingsForTopics(topicSlugs: string[], limit = 6): Listing[] {
  if (!topicSlugs.length) return [];
  return searchListings({ topic: topicSlugs }).slice(0, limit);
}

export function publishedResources(topicIds?: string[]): Resource[] {
  return readDb()
    .resources.filter((r) => r.status === "published")
    .filter((r) => (topicIds?.length ? r.topicIds.some((t) => topicIds.includes(t)) : true))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function topicIdsForSlugs(slugs: string[]) {
  const db = readDb();
  return slugs.map((s) => db.taxa.find((t) => t.slug === s)?.id).filter(Boolean) as string[];
}
