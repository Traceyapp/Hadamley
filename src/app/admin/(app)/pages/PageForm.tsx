"use client";

import Link from "next/link";
import { Eye, Globe, EyeOff, Save } from "lucide-react";
import { useActionState } from "react";
import { savePage, type ActionState } from "../../actions";
import type { Page, Taxon } from "@/lib/types";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SectionsEditor } from "@/components/admin/SectionsEditor";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, Card, CheckGroup, Field, input, PageStatusBadge } from "@/components/admin/ui";

const TEMPLATES = [
  { value: "information", label: "Information page", hint: "Text, with optional embedded listings" },
  { value: "section", label: "Section landing", hint: "Shows its child pages as cards" },
];

export function PageForm({ page, parents, topics, resources = [], flash }: { page?: Page; parents: { id: string; title: string }[]; topics: Taxon[]; resources?: { id: string; title: string }[]; flash?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(savePage, flash ? { ok: true, message: flash } : null);
  const isHome = page?.template === "home";
  const isSpecial = page && ["home", "directory", "resources"].includes(page.template);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="id" value={page?.id ?? ""} />
      <input type="hidden" name="intent" defaultValue="save" />
      <div className="min-w-0 space-y-6">
        <Card>
          <div className="space-y-5">
            <Field label="Page title" htmlFor="title">
              <input id="title" name="title" required defaultValue={page?.title} className={`${input} text-lg font-bold`} />
            </Field>
            <Field label="Short introduction" htmlFor="summary" hint="One or two sentences shown under the title. Also used by search engines.">
              <textarea id="summary" name="summary" rows={2} maxLength={400} defaultValue={page?.summary} className={input} />
            </Field>
          </div>
        </Card>

        <div>
          <p id="body-label" className="mb-2 font-bold">
            Page content
          </p>
          <RichTextEditor name="body" initial={page?.body ?? ""} labelId="body-label" />
          <p className="mt-2 text-sm text-ink-2">Use headings to break the page into sections. Each heading appears in the &ldquo;On this page&rdquo; menu.</p>
        </div>

        {!isSpecial && (
          <Card title="Fold-out sections" description="Accordion sections shown after the main content. Visitors can open them one at a time, link to them, or print them.">
            <SectionsEditor initial={page?.sections ?? []} resources={resources} />
          </Card>
        )}

        {!isSpecial && (
          <Card title="Embedded listings" description="Approved listings with any of these topics appear at the bottom of the page.">
            <CheckGroup legend="Show listings for" name="listingTopics" options={topics.map((t) => ({ value: t.slug, label: t.name }))} selected={page?.listingTopics ?? []} />
          </Card>
        )}
        {isSpecial && page?.listingTopics.map((t) => <input key={t} type="hidden" name="listingTopics" value={t} />)}
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card title="Publish" aside={page && <PageStatusBadge status={page.status} />}>
          <div className="grid gap-2">
            <SubmitButton intent="publish" className={btn.primary} pendingText="Publishing...">
              <Globe className="size-4" aria-hidden /> {page?.status === "published" ? "Update live page" : "Publish"}
            </SubmitButton>
            {page?.status !== "published" && (
              <SubmitButton intent="save" className={btn.secondary} pendingText="Saving...">
                <Save className="size-4" aria-hidden /> Save draft
              </SubmitButton>
            )}
            {page && (
              <Link href={`/admin/pages/${page.id}/preview`} target="_blank" className={btn.secondary}>
                <Eye className="size-4" aria-hidden /> Preview
              </Link>
            )}
            {page?.status === "published" && !isHome && (
              <SubmitButton intent="unpublish" className={btn.danger} pendingText="Unpublishing...">
                <EyeOff className="size-4" aria-hidden /> Unpublish
              </SubmitButton>
            )}
          </div>
          <div className="mt-3">
            <ActionMessage state={state} />
          </div>
          <p className="mt-3 text-[0.82rem] text-ink-2">{page?.status === "published"
              ? "Updates go live on the site and in the AI helper straight away. To work on changes privately, unpublish first."
              : "Drafts are only visible to admins. Save, preview, then publish when ready."}</p>
        </Card>

        <Card title="Page settings">
          <div className="space-y-4">
            {!isHome && (
              <Field label="Web address" htmlFor="slug" hint="Lowercase words joined by hyphens. Leave empty to create one from the title.">
                <div className="flex items-center rounded-xl border border-line-strong bg-surface focus-within:border-brand">
                  <span className="pl-3 text-ink-2">/</span>
                  <input id="slug" name="slug" defaultValue={page?.slug} readOnly={isSpecial} className="min-w-0 flex-1 bg-transparent px-1 py-2.5 outline-none focus-visible:shadow-none focus-visible:outline-none" />
                </div>
              </Field>
            )}
            {!isSpecial ? (
              <Field label="Template" htmlFor="template">
                <select id="template" name="template" defaultValue={page?.template ?? "information"} className={input}>
                  {TEMPLATES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
            ) : (
              <input type="hidden" name="template" value={page!.template} />
            )}
            {!isSpecial && (
              <Field label="Belongs to section" htmlFor="parentId">
                <select id="parentId" name="parentId" defaultValue={page?.parentId ?? ""} className={input}>
                  <option value="">None (top level)</option>
                  {parents
                    .filter((p) => p.id !== page?.id)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                </select>
              </Field>
            )}
            {!isHome && (
              <>
                <Field label="Short menu label" htmlFor="navLabel" hint="Optional. Used in the menu if the title is long.">
                  <input id="navLabel" name="navLabel" maxLength={60} defaultValue={page?.navLabel} className={input} />
                </Field>
                <div className="flex items-end gap-3">
                  <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-2.5 font-bold">
                    <input type="checkbox" name="showInNav" defaultChecked={page?.showInNav ?? false} className="size-[1.1rem] accent-[var(--brand)]" />
                    Show in menu
                  </label>
                  <Field label="Order" htmlFor="navOrder" className="w-20">
                    <input id="navOrder" name="navOrder" type="number" min={0} defaultValue={page?.navOrder ?? 0} className={input} />
                  </Field>
                </div>
              </>
            )}
          </div>
        </Card>
        {page && (
          <p className="px-1 text-[0.82rem] text-ink-2">
            Last updated {new Date(page.updatedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} by {page.updatedBy}
          </p>
        )}
      </div>
    </form>
  );
}
