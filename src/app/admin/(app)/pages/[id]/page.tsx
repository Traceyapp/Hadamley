import { ensureDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { readDb } from "@/lib/db";
import { topics } from "@/lib/repo";
import { deletePage } from "../../../actions";
import { AdminHeader, btn } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { PageForm } from "../PageForm";

export const metadata = { title: "Edit page" };

export default async function EditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await ensureDb({ fresh: true });
  const { id } = await params;
  const { saved } = await searchParams;
  const db = readDb();
  const page = db.pages.find((p) => p.id === id);
  if (!page) notFound();
  const parents = db.pages.filter((p) => p.template === "section").map((p) => ({ id: p.id, title: p.title }));
  const hasChildren = db.pages.some((p) => p.parentId === id);
  const canDelete = !["home", "directory", "resources"].includes(page.template) && !hasChildren;

  return (
    <>
      <AdminHeader
        title={page.title}
        back={{ href: "/admin/pages", label: "All pages" }}
        actions={
          canDelete ? (
            <form action={deletePage}>
              <input type="hidden" name="id" value={page.id} />
              <ConfirmButton className={btn.ghost} message={`Delete "${page.title}"? This cannot be undone. To hide it instead, use Unpublish.`}>
                <Trash2 className="size-4" aria-hidden /> Delete page
              </ConfirmButton>
            </form>
          ) : undefined
        }
      />
      <PageForm page={page} parents={parents} topics={topics()} resources={readDb().resources.map((r) => ({ id: r.id, title: r.title }))} flash={saved} />
    </>
  );
}
