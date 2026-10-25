import { ensureDb } from "@/lib/db";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedPage } from "@/lib/repo";
import { PageView } from "@/components/site/PageView";

type Props = { params: Promise<{ slug: string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await ensureDb();
  const { slug } = await params;
  const page = getPublishedPage(slug.join("/"));
  return page ? { title: page.title, description: page.summary } : {};
}

export default async function InformationPage({ params }: Props) {
  await ensureDb();
  const { slug } = await params;
  const page = getPublishedPage(slug.join("/"));
  if (!page || page.template === "home" || page.template === "directory" || page.template === "resources") notFound();
  return <PageView page={page} />;
}
