import { ensureDb } from "@/lib/db";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { readDb } from "@/lib/db";
import { deleteNotice } from "../../../../actions";
import { AdminHeader, btn } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { EventForm } from "../../NoticeForms";

export const metadata = { title: "Event" };

export default async function EditEvent({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await ensureDb();
  const { id } = await params;
  const { saved } = await searchParams;
  const item = id === "new" ? undefined : readDb().events.find((x) => x.id === id);
  if (id !== "new" && !item) notFound();
  return (
    <>
      <AdminHeader
        title={item?.title ?? "New event"}
        back={{ href: "/admin/noticeboard", label: "Noticeboard" }}
        actions={
          item ? (
            <form action={deleteNotice}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="kind" value="event" />
              <ConfirmButton className={btn.ghost} message={`Delete "${item.title}"? To hide it instead, take it down.`}>
                <Trash2 className="size-4" aria-hidden /> Delete
              </ConfirmButton>
            </form>
          ) : undefined
        }
      />
      <EventForm event={item} flash={saved} />
    </>
  );
}
