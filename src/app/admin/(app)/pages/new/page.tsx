import { readDb } from "@/lib/db";
import { topics } from "@/lib/repo";
import { AdminHeader } from "@/components/admin/ui";
import { PageForm } from "../PageForm";

export const metadata = { title: "New page" };

export default function NewPage() {
  const parents = readDb()
    .pages.filter((p) => p.template === "section")
    .map((p) => ({ id: p.id, title: p.title }));
  return (
    <>
      <AdminHeader title="New page" back={{ href: "/admin/pages", label: "All pages" }} description="New pages start as drafts. Preview them, then publish when ready." />
      <PageForm parents={parents} topics={topics()} />
    </>
  );
}
