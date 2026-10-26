import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { Check, Flag, Mail, RotateCcw, Trash2 } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { CONTACT_TOPIC_LABEL } from "@/lib/types";
import { deleteMessage, toggleMessage, toggleReport } from "../../actions";
import { AdminHeader, btn, Card, Empty } from "@/components/admin/ui";
import { ConfirmButton, SubmitButton } from "@/components/admin/client";

export const metadata = { title: "Inbox" };

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ show?: string; topic?: string }> }) {
  await ensureDb({ fresh: true });
  const { show, topic } = await searchParams;
  const showHandled = show === "all";
  const db = readDb();
  const reports = db.reports.filter((r) => showHandled || !r.handled);
  const messages = db.messages.filter((m) => showHandled || !m.handled).filter((m) => (topic ? (m.topic ?? "general") === topic : true));

  return (
    <>
      <AdminHeader
        title="Inbox"
        description="Outdated-details reports from listing pages, and messages from the contact form."
        actions={
          <Link href={showHandled ? "/admin/inbox" : "/admin/inbox?show=all"} className={btn.secondary}>
            {showHandled ? "Hide handled" : "Show handled"}
          </Link>
        }
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Outdated-details reports" aside={<Flag className="size-5 text-accent" aria-hidden />}>
          {reports.length === 0 ? (
            <Empty>No open reports.</Empty>
          ) : (
            <ul className="space-y-3">
              {reports.map((r) => {
                const l = db.listings.find((x) => x.id === r.listingId);
                return (
                  <li key={r.id} className={`rounded-xl border p-4 ${r.handled ? "border-line bg-paper-2 opacity-75" : "border-line-strong bg-surface"}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      {l ? (
                        <Link href={`/admin/listings/${l.id}`} className="font-bold hover:text-brand">
                          {l.name}
                        </Link>
                      ) : (
                        <span className="font-bold">Deleted listing</span>
                      )}
                      <span className="text-xs text-ink-2">{formatDateTime(r.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-ink">&ldquo;{r.message}&rdquo;</p>
                    {r.contact && <p className="mt-1 text-sm text-ink-2">Contact: {r.contact}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <form action={toggleReport}>
                        <input type="hidden" name="id" value={r.id} />
                        <SubmitButton className={r.handled ? btn.ghost : btn.primary}>
                          {r.handled ? <RotateCcw className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
                          {r.handled ? "Reopen" : "Mark handled"}
                        </SubmitButton>
                      </form>
                      {l && (
                        <Link href={`/admin/listings/${l.id}`} className={btn.secondary}>
                          Edit listing
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card title="Contact messages" aside={<Mail className="size-5 text-brand" aria-hidden />}>
          <nav aria-label="Filter messages" className="-mt-2 mb-4 flex flex-wrap gap-1.5 text-sm">
            {[["", "All"], ...Object.entries(CONTACT_TOPIC_LABEL)].map(([k, label]) => (
              <Link
                key={k}
                href={`/admin/inbox?${new URLSearchParams({ ...(showHandled ? { show: "all" } : {}), ...(k ? { topic: k } : {}) })}`}
                aria-current={(topic ?? "") === k ? "page" : undefined}
                className="rounded-full border border-line px-3 py-1 font-bold aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-paper"
              >
                {label}
              </Link>
            ))}
          </nav>
          {messages.length === 0 ? (
            <Empty>No new messages.</Empty>
          ) : (
            <ul className="space-y-3">
              {messages.map((m) => (
                <li key={m.id} className={`rounded-xl border p-4 ${m.handled ? "border-line bg-paper-2 opacity-75" : "border-line-strong bg-surface"}`}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <span className="font-bold">
                      {m.name || "No name given"}
                      <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">{CONTACT_TOPIC_LABEL[m.topic ?? "general"]}</span>
                    </span>
                    <span className="text-xs text-ink-2">{formatDateTime(m.createdAt)}</span>
                  </div>
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="link text-sm">
                      {m.email}
                    </a>
                  )}
                  <p className="mt-2 whitespace-pre-line text-ink">{m.message}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <form action={toggleMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <SubmitButton className={m.handled ? btn.ghost : btn.primary}>
                        {m.handled ? <RotateCcw className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
                        {m.handled ? "Reopen" : "Mark handled"}
                      </SubmitButton>
                    </form>
                    <form action={deleteMessage}>
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton className={btn.ghost} message="Delete this message?">
                        <Trash2 className="size-4" aria-hidden /> Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
