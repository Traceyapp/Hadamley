import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";
import { ensureDb } from "@/lib/db";
import { approvedListings, publishedPages } from "@/lib/repo";
import { publishedPosts, upcomingEvents } from "@/lib/notice";

export const dynamic = "force-dynamic";

/** Every public page: published pages, approved listings, news and upcoming events. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await ensureDb();
  const u = (p: string) => `${SITE_URL}${p}`;
  return [
    ...publishedPages().map((p) => ({ url: u(`/${p.slug}`), lastModified: p.updatedAt })),
    { url: u("/noticeboard") },
    ...approvedListings().map((l) => ({ url: u(`/find-support/${l.id}`), lastModified: l.updatedAt })),
    ...publishedPosts().map((p) => ({ url: u(`/noticeboard/news/${p.slug}`), lastModified: p.updatedAt })),
    ...upcomingEvents().map((e) => ({ url: u(`/noticeboard/events/${e.slug}`), lastModified: e.updatedAt })),
  ];
}
