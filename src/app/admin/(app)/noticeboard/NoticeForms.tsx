"use client";

import Link from "next/link";
import { EyeOff, Globe, Save, ExternalLink } from "lucide-react";
import { useActionState } from "react";
import { saveEvent, savePost, type ActionState } from "../../actions";
import type { NoticeEvent, Post } from "@/lib/types";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, Card, Field, input, PageStatusBadge } from "@/components/admin/ui";

function PublishCard({ status, state, viewHref }: { status?: "draft" | "published"; state: ActionState; viewHref?: string }) {
  return (
    <Card title="Publish" aside={status && <PageStatusBadge status={status} />}>
      <div className="grid gap-2">
        <SubmitButton intent="publish" className={btn.primary} pendingText="Publishing...">
          <Globe className="size-4" aria-hidden /> {status === "published" ? "Update" : "Publish"}
        </SubmitButton>
        {status !== "published" && (
          <SubmitButton intent="save" className={btn.secondary} pendingText="Saving...">
            <Save className="size-4" aria-hidden /> Save draft
          </SubmitButton>
        )}
        {status === "published" && (
          <SubmitButton intent="unpublish" className={btn.danger} pendingText="Taking down...">
            <EyeOff className="size-4" aria-hidden /> Take down
          </SubmitButton>
        )}
        {status === "published" && viewHref && (
          <Link href={viewHref} target="_blank" className={btn.ghost}>
            View on site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        )}
      </div>
      <div className="mt-3">
        <ActionMessage state={state} />
      </div>
    </Card>
  );
}

export function PostForm({ post, flash }: { post?: Post; flash?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(savePost, flash ? { ok: true, message: flash } : null);
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="intent" defaultValue="save" />
      <div className="min-w-0 space-y-6">
        <Card>
          <div className="space-y-5">
            <Field label="Title" htmlFor="title">
              <input id="title" name="title" required defaultValue={post?.title} className={`${input} text-lg font-bold`} />
            </Field>
            <Field label="Short summary" htmlFor="summary" hint="Shown on the noticeboard card.">
              <textarea id="summary" name="summary" rows={2} maxLength={400} defaultValue={post?.summary} className={input} />
            </Field>
          </div>
        </Card>
        <div>
          <p id="post-body" className="mb-2 font-bold">
            Post
          </p>
          <RichTextEditor name="body" initial={post?.body ?? ""} labelId="post-body" />
        </div>
      </div>
      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <PublishCard status={post?.status} state={state} viewHref={post ? `/noticeboard/news/${post.slug}` : undefined} />
        <Card title="Date">
          <Field label="Publish date" htmlFor="publishedAt" hint="Posts are ordered newest first.">
            <input id="publishedAt" name="publishedAt" type="date" defaultValue={post?.publishedAt ?? new Date().toISOString().slice(0, 10)} className={input} />
          </Field>
        </Card>
      </div>
    </form>
  );
}

export function EventForm({ event, flash }: { event?: NoticeEvent; flash?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(saveEvent, flash ? { ok: true, message: flash } : null);
  const e = event;
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
      <input type="hidden" name="id" value={e?.id ?? ""} />
      <input type="hidden" name="intent" defaultValue="save" />
      <div className="min-w-0 space-y-6">
        <Card>
          <div className="space-y-5">
            <Field label="Event name" htmlFor="title">
              <input id="title" name="title" required defaultValue={e?.title} className={`${input} text-lg font-bold`} />
            </Field>
            <Field label="Short summary" htmlFor="summary" hint="Shown on the event ticket.">
              <textarea id="summary" name="summary" rows={2} maxLength={400} defaultValue={e?.summary} className={input} />
            </Field>
          </div>
        </Card>
        <Card title="When and where">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Starts" htmlFor="startsAt">
              <input id="startsAt" name="startsAt" type="datetime-local" required defaultValue={e?.startsAt} className={input} />
            </Field>
            <Field label="Ends" htmlFor="endsAt">
              <input id="endsAt" name="endsAt" type="datetime-local" defaultValue={e?.endsAt} className={input} />
            </Field>
            <Field label="Location" htmlFor="location" hint="An address, or Online." className="sm:col-span-2">
              <input id="location" name="location" defaultValue={e?.location} className={input} />
            </Field>
            <label className="flex items-center gap-2.5 font-bold sm:col-span-2">
              <input type="checkbox" name="online" defaultChecked={e?.online} className="size-[1.1rem] accent-[var(--brand)]" />
              This event is online
            </label>
            <Field label="Cost" htmlFor="cost" hint="Leave empty for free.">
              <input id="cost" name="cost" defaultValue={e?.cost} className={input} />
            </Field>
            <Field label="Booking link" htmlFor="bookingUrl" hint="Optional.">
              <input id="bookingUrl" name="bookingUrl" type="url" placeholder="https://" defaultValue={e?.bookingUrl} className={input} />
            </Field>
          </div>
        </Card>
        <div>
          <p id="event-body" className="mb-2 font-bold">
            More about the event
          </p>
          <RichTextEditor name="body" initial={e?.body ?? ""} labelId="event-body" />
        </div>
      </div>
      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <PublishCard status={e?.status} state={state} viewHref={e ? `/noticeboard/events/${e.slug}` : undefined} />
        <p className="px-1 text-[0.85rem] text-ink-2">Past events drop off the board and out of the AI helper automatically.</p>
      </div>
    </form>
  );
}
