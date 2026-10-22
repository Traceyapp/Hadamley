import Link from "next/link";
import { Plus } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { eventParts, londonNow } from "@/lib/notice";
import { AdminHeader, btn, Card, Empty, Flash, PageStatusBadge } from "@/components/admin/ui";

export const metadata = { title: "Noticeboard" };

export default async function NoticeboardAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const db = readDb();
  const now = londonNow();
  const events = [...db.events].sort((a, b) => b.startsAt.localeCompare(a.startsAt));
  const posts = [...db.posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <>
      <AdminHeader
        title="Noticeboard"
        description="News posts and local events. Only published items appear on the site and in the AI helper."
        actions={
          <>
            <Link href="/admin/noticeboard/events/new" className={btn.primary}>
              <Plus className="size-4" aria-hidden /> New event
            </Link>
            <Link href="/admin/noticeboard/posts/new" className={btn.secondary}>
              <Plus className="size-4" aria-hidden /> New post
            </Link>
          </>
        }
      />
      <Flash message={saved} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Events">
          {events.length ? (
            <ul className="divide-y divide-line">
              {events.map((e) => {
                const s = eventParts(e.startsAt);
                const past = (e.endsAt || e.startsAt) < now;
                return (
                  <li key={e.id} className={`flex items-center gap-4 py-3 ${past ? "opacity-60" : ""}`}>
                    <span className="w-14 shrink-0 text-center">
                      <span className="block text-xs font-bold uppercase text-ink-2">{s.month}</span>
                      <span className="font-display text-2xl font-semibold leading-none">{s.day}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link href={`/admin/noticeboard/events/${e.id}`} className="font-bold hover:text-brand">
                        {e.title}
                      </Link>
                      <span className="block text-sm text-ink-2">
                        {s.time} · {e.location || "No location"}
                        {past && " · finished"}
                      </span>
                    </span>
                    <PageStatusBadge status={e.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No events yet.</Empty>
          )}
        </Card>
        <Card title="News posts">
          {posts.length ? (
            <ul className="divide-y divide-line">
              {posts.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3">
                  <span className="min-w-0 flex-1">
                    <Link href={`/admin/noticeboard/posts/${p.id}`} className="font-bold hover:text-brand">
                      {p.title}
                    </Link>
                    <span className="block text-sm text-ink-2">{formatDate(p.publishedAt)}</span>
                  </span>
                  <PageStatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No posts yet.</Empty>
          )}
        </Card>
      </div>
    </>
  );
}
