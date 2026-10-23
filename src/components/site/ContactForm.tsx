"use client";

import { useActionState } from "react";
import { sendContact, type FormState } from "@/app/(site)/actions";
import { FormMessage, inputCls, SpamFields } from "./forms";
import { CONTACT_TOPIC_LABEL, type ContactTopic } from "@/lib/types";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, null);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      <SpamFields />
      <fieldset>
        <legend className="mb-2 font-bold">What&apos;s this about?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(CONTACT_TOPIC_LABEL) as ContactTopic[]).map((t, i) => (
            <label key={t} className="flex min-h-12 cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] border-line-strong px-3 py-2 has-[:checked]:border-ink has-[:checked]:bg-accent-soft">
              <input type="radio" name="topic" value={t} defaultChecked={i === 0} className="size-4 accent-[var(--accent)]" />
              <span className="text-[0.95rem] font-bold leading-snug">{CONTACT_TOPIC_LABEL[t]}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="mb-1.5 block font-bold">
            Your name <span className="font-normal text-ink-2">(optional)</span>
          </label>
          <input id="c-name" name="name" autoComplete="name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="c-email" className="mb-1.5 block font-bold">
            Email <span className="font-normal text-ink-2">(if you want a reply)</span>
          </label>
          <input id="c-email" name="email" type="email" autoComplete="email" className={inputCls} />
        </div>
      </div>
      <div>
        <label htmlFor="c-msg" className="mb-1.5 block font-bold">
          Message
        </label>
        <textarea id="c-msg" name="message" required minLength={5} rows={6} className={inputCls} />
        <p className="mt-1.5 text-sm text-ink-2">Please don&apos;t include medical details.</p>
      </div>
      <FormMessage state={state} />
      <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-brand px-6 font-bold text-paper hover:bg-brand-strong disabled:opacity-60">
        {pending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
