import { ensureDb } from "@/lib/db";
import { ExternalLink, FileText, Trash2 } from "lucide-react";
import { readDb } from "@/lib/db";
import { topics } from "@/lib/repo";
import { formatBytes, formatDateTime } from "@/lib/format";
import { KIND_LABEL } from "@/lib/types";
import { deleteResource } from "../../actions";
import { AdminHeader, btn, Card, Empty, Flash, PageStatusBadge } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { ResourceForm } from "./ResourceForm";

export const metadata = { title: "Downloads" };

export default async function ResourcesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await ensureDb();
  const { saved } = await searchParams;
  const db = readDb();
  const t = topics();

  return (
    <>
      <AdminHeader title="Downloads" description="Files for the Resources library and section pages. Replacing a file keeps every link working." />
      <Flash message={saved} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="space-y-4">
          {db.resources.length === 0 && <Empty>No downloads yet.</Empty>}
          {db.resources.map((r) => (
            <details key={r.id} className="group rounded-2xl border border-line bg-surface shadow-soft">
              <summary className="flex cursor-pointer list-none flex-wrap items-center gap-4 p-5">
                <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                  <FileText className="size-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{r.title}</span>
                  <span className="block text-[0.85rem] text-ink-2">
                    {KIND_LABEL[r.kind]} · {r.fileName} · {formatBytes(r.size)} · updated {formatDateTime(r.updatedAt)}
                  </span>
                </span>
                <PageStatusBadge status={r.status} />
                <span className="text-sm font-bold text-brand group-open:hidden">Edit</span>
              </summary>
              <div className="border-t border-line p-5">
                <ResourceForm resource={r} topics={t} />
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                  <a href={`/files/${r.storedName}`} target="_blank" className="inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
                    Open file <ExternalLink className="size-3.5" aria-hidden />
                  </a>
                  <form action={deleteResource}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton className={btn.ghost} message={`Remove "${r.title}"? Links to this file will stop working.`}>
                      <Trash2 className="size-4" aria-hidden /> Remove
                    </ConfirmButton>
                  </form>
                </div>
              </div>
            </details>
          ))}
        </div>
        <div id="upload" className="xl:sticky xl:top-6 xl:self-start">
          <Card title="Upload a new download">
            <ResourceForm topics={t} />
          </Card>
        </div>
      </div>
    </>
  );
}
