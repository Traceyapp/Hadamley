import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageAnyStatus, getPublishedPage } from "@/lib/repo";
import { PageView } from "@/components/site/PageView";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureDb();
  const { slug } = await params;
  const page = getPublishedPage(slug.join("/"));
  return page
    ? {
        title: page.title,
        description: page.summary,
        alternates: { canonical: `/${page.slug}` },
        openGraph: { type: "website", url: `/${page.slug}`, title: page.title, description: page.summary },
      }
    : {};
}

export default async function InformationPage({ params }: Props) {
  await ensureDb();
  const { slug } = await params;
  const page = getPublishedPage(slug.join("/"));
  if (!page || page.template === "home" || page.template === "directory" || page.template === "resources") notFound();
  // Breadcrumbs follow the page's real parent, using page titles rather than web addresses.
  const parent = page.parentId ? getPageAnyStatus(page.parentId) : undefined;
  const crumbs = [
    { name: "Home", path: "/" },
    ...(parent?.status === "published" ? [{ name: parent.title, path: `/${parent.slug}` }] : []),
    { name: page.title, path: `/${page.slug}` },
  ];
  return (
    <>
      <JsonLd data={{ ...breadcrumbSchema(crumbs), mainEntity: { "@type": "WebPage", "@id": absoluteUrl(`/${page.slug}`) } }} />
      <PageView page={page} />
    </>
  );
}
