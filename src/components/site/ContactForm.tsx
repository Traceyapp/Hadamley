"use client";

import { useActionState } from "react";
import { sendContact, type FormState } from "@/app/(site)/actions";
import { FormMessage, inputCls, SpamFields } from "./forms";

export function ContactForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(sendContact, null);
  if (state?.ok) return <FormMessage state={state} />;
  return (
    <form action={action} className="relative space-y-5 rounded-[var(--radius-card)] border border-line bg-surface p-6 shadow-soft sm:p-8">
      <h2 className="text-2xl font-semibold">Send us a message</h2>
      <SpamFields />
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
