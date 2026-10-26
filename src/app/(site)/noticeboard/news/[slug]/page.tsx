import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPost } from "@/lib/notice";
import { formatDate } from "@/lib/format";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbSchema } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureDb();
  const p = getPost((await params).slug);
  return p
    ? {
        title: p.title,
        description: p.summary,
        alternates: { canonical: `/noticeboard/news/${p.slug}` },
        openGraph: { type: "article", url: `/noticeboard/news/${p.slug}`, title: p.title, description: p.summary, publishedTime: p.publishedAt, modifiedTime: p.updatedAt },
      }
    : {};
}

export default async function PostPage({ params }: Props) {
  await ensureDb();
  const p = getPost((await params).slug);
  if (!p) notFound();
  const path = `/noticeboard/news/${p.slug}`;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "NewsArticle", headline: p.title, description: p.summary, datePublished: p.publishedAt, dateModified: p.updatedAt, mainEntityOfPage: absoluteUrl(path), publisher: { "@id": absoluteUrl("/#organization") } }} />
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Noticeboard", path: "/noticeboard" }, { name: p.title, path }])} />
      <PageHero crumbs={[{ label: "Noticeboard", href: "/noticeboard" }, { label: p.title }]} eyebrow={<span className="kicker text-ink-2">{formatDate(p.publishedAt)}</span>} title={p.title} summary={p.summary} />
      <Container className="pt-12">
        <article className="prose-h" dangerouslySetInnerHTML={{ __html: p.body }} />
        <Link href="/noticeboard" className="mt-12 inline-flex items-center gap-2 font-bold hover:underline">
          <ArrowLeft className="size-4" aria-hidden /> Back to the noticeboard
        </Link>
        <Disclaimer className="mt-10" />
      </Container>
    </>
  );
}
