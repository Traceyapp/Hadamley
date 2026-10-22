import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getPost } from "@/lib/notice";
import { formatDate } from "@/lib/format";
import { Container, Disclaimer } from "@/components/site/bits";
import { PageHero } from "@/components/site/PageHero";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.title, description: p.summary } : {};
}

export default async function PostPage({ params }: Props) {
  const p = getPost((await params).slug);
  if (!p) notFound();
  return (
    <>
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
