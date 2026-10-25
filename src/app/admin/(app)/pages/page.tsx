import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import type { Page } from "@/lib/types";
import { AdminHeader, btn, Flash, PageStatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Pages" };

const TEMPLATE_LABEL: Record<Page["template"], string> = {
  home: "Home",
  section: "Section landing",
  information: "Information",
  directory: "Directory",
  resources: "Resource library",
};

export default async function PagesList({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await ensureDb();
  const { saved } = await searchParams;
  const pages = readDb().pages;
  const roots = pages.filter((p) => !p.parentId).sort((a, b) => (a.template === "home" ? -1 : b.template === "home" ? 1 : a.navOrder - b.navOrder));
  const rows: { p: Page; depth: number }[] = [];
  for (const r of roots) {
    rows.push({ p: r, depth: 0 });
    pages
      .filter((c) => c.parentId === r.id)
      .sort((a, b) => a.navOrder - b.navOrder)
      .forEach((c) => rows.push({ p: c, depth: 1 }));
  }

  return (
    <>
      <AdminHeader
        title="Pages"
        description={`${pages.length} pages on four templates. Drafts are only visible to signed-in admins.`}
        actions={
          <Link href="/admin/pages/new" className={btn.primary}>
            <Plus className="size-4" aria-hidden /> New page
          </Link>
        }
      />
      <Flash message={saved} />
      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
        <table className="w-full text-left text-[0.95rem]">
          <thead className="border-b border-line bg-sand text-[0.8rem] uppercase tracking-[0.08em] text-ink-2">
            <tr>
              <th scope="col" className="px-5 py-3 font-bold">
                Page
              </th>
              <th scope="col" className="hidden px-3 py-3 font-bold md:table-cell">
                Template
              </th>
              <th scope="col" className="px-3 py-3 font-bold">
                Status
              </th>
              <th scope="col" className="hidden px-3 py-3 font-bold lg:table-cell">
                Updated
              </th>
              <th scope="col" className="px-5 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ p, depth }) => (
              <tr key={p.id} className="hover:bg-brand-tint">
                <td className="px-5 py-3.5">
                  <div className={depth ? "border-l-2 border-line pl-4 ml-1" : ""}>
                    <Link href={`/admin/pages/${p.id}`} className="font-bold hover:text-brand">
                      {p.title}
                    </Link>
                    <p className="text-[0.82rem] text-ink-2">/{p.slug}</p>
                  </div>
                </td>
                <td className="hidden px-3 py-3.5 text-ink-2 md:table-cell">{TEMPLATE_LABEL[p.template]}</td>
                <td className="px-3 py-3.5">
                  <PageStatusBadge status={p.status} />
                </td>
                <td className="hidden px-3 py-3.5 text-[0.85rem] text-ink-2 lg:table-cell">{formatDateTime(p.updatedAt)}</td>
                <td className="px-5 py-3.5 text-right">
                  <Link
                    href={p.status === "published" ? `/${p.slug}` : `/admin/pages/${p.id}/preview`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline"
                  >
                    {p.status === "published" ? "View" : "Preview"} <ExternalLink className="size-3.5" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
