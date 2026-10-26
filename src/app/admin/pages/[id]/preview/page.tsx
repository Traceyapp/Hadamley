import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getPageAnyStatus } from "@/lib/repo";
import { PageView } from "@/components/site/PageView";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";

export const metadata = { title: "Preview" };

/** Draft preview: visible to signed-in admins only. Lives outside the admin shell so it looks exactly like the site. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  await ensureDb({ fresh: true });
  await requireAdmin();
  const { id } = await params;
  const page = getPageAnyStatus(id);
  if (!page) notFound();
  const publicHref = page.template === "home" ? "/" : `/${page.slug}`;

  return (
    <>
      <div className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-ink px-4 py-2.5 text-center text-sm text-paper">
        <span className="inline-flex items-center gap-2 font-bold">
          <Eye className="size-4" aria-hidden /> Preview of {page.status === "draft" ? "a draft" : "the last saved version"}. Only admins can see this.
        </span>
        <Link href={`/admin/pages/${page.id}`} className="font-bold underline underline-offset-4">
          Back to editing
        </Link>
        {page.status === "published" && (
          <Link href={publicHref} className="underline underline-offset-4">
            View live page
          </Link>
        )}
      </div>
      <Header />
      <main id="main">{["home", "directory", "resources"].includes(page.template) ? <SpecialNote href={publicHref} /> : <PageView page={page} preview />}</main>
      <Footer />
    </>
  );
}

function SpecialNote({ href }: { href: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-semibold">This page uses a special template</h1>
      <p className="mt-3 text-ink-2">The homepage, Find Support and Resources pages build most of their content automatically. Open the live page to see your changes.</p>
      <Link href={href} className="mt-6 inline-flex min-h-11 items-center rounded-full bg-brand px-5 font-bold text-paper">
        Open {href}
      </Link>
    </div>
  );
}
