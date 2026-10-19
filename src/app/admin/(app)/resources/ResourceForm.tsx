"use client";

import { useActionState, useRef } from "react";
import { saveResource, type ActionState } from "../../actions";
import type { Resource, Taxon } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, CheckGroup, Field, input } from "@/components/admin/ui";

export function ResourceForm({ resource, topics }: { resource?: Resource; topics: Taxon[] }) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<ActionState, FormData>(async (prev, fd) => {
    const res = await saveResource(prev, fd);
    if (res?.ok && !resource) ref.current?.reset();
    return res;
  }, null);
  const r = resource;
  const uid = r?.id ?? "new";

  return (
    <form ref={ref} action={action} className="space-y-5">
      <input type="hidden" name="id" value={r?.id ?? ""} />
      <div className="grid gap-5 sm:grid-cols-[1fr_11rem]">
        <Field label="Title" htmlFor={`t-${uid}`}>
          <input id={`t-${uid}`} name="title" required defaultValue={r?.title} className={input} />
        </Field>
        <Field label="Type" htmlFor={`k-${uid}`}>
          <select id={`k-${uid}`} name="kind" defaultValue={r?.kind ?? "guide"} className={input}>
            {Object.entries(KIND_LABEL).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Short description" htmlFor={`d-${uid}`}>
        <textarea id={`d-${uid}`} name="description" rows={2} maxLength={600} defaultValue={r?.description} className={input} />
      </Field>
      <Field
        label={r ? "Replace file (optional)" : "File"}
        htmlFor={`f-${uid}`}
        hint={r ? `Current file: ${r.fileName}. Uploading a new file replaces it at the same place on the site.` : "PDF, Word, Excel, PowerPoint, text or image. Up to 10 MB."}
      >
        <input
          id={`f-${uid}`}
          name="file"
          type="file"
          required={!r}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.png,.jpg,.jpeg,.webp,.gif,.svg"
          className="block w-full text-[0.95rem] file:mr-3 file:min-h-10 file:rounded-lg file:border-0 file:bg-brand-soft file:px-4 file:font-bold file:text-brand-strong"
        />
      </Field>
      <CheckGroup legend="Topics" name="topicIds" options={topics.map((t) => ({ value: t.id, label: t.name }))} selected={r?.topicIds ?? []} />
      <label className="flex items-center gap-2.5 font-bold">
        <input type="checkbox" name="status" value="published" defaultChecked={r ? r.status === "published" : true} className="size-[1.1rem] accent-[var(--brand)]" />
        Published (visible on the site)
      </label>
      <ActionMessage state={state} />
      <SubmitButton className={btn.primary} pendingText="Uploading...">
        {r ? "Save changes" : "Upload download"}
      </SubmitButton>
    </form>
  );
}
