"use client";

import { Flag } from "lucide-react";
import { useActionState } from "react";
import { reportOutdated, type FormState } from "@/app/(site)/actions";
import { FormMessage, inputCls, SpamFields } from "./forms";

export function ReportForm({ listingId, listingName }: { listingId: string; listingName: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(reportOutdated, null);

  return (
    <details id="report" className="group rounded-2xl border border-line bg-surface open:shadow-soft">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 font-bold text-ink hover:text-brand">
        <Flag className="size-5 text-accent" aria-hidden />
        Report outdated details
        <span className="ml-auto text-sm font-normal text-ink-2 group-open:hidden">Open form</span>
      </summary>
      <div className="border-t border-line px-5 pb-5 pt-4">
        {state?.ok ? (
          <FormMessage state={state} />
        ) : (
          <form action={action} className="relative space-y-4">
            <input type="hidden" name="listingId" value={listingId} />
            <SpamFields />
            <p className="text-[0.95rem] text-ink-2">Tell us what has changed for {listingName}. We check every report.</p>
            <div>
              <label htmlFor="report-msg" className="mb-1.5 block font-bold">
                What has changed?
              </label>
              <textarea id="report-msg" name="message" required minLength={5} rows={4} className={inputCls} placeholder="For example, the phone number or price is different" />
            </div>
            <div>
              <label htmlFor="report-contact" className="mb-1.5 block font-bold">
                Email or phone <span className="font-normal text-ink-2">(optional, only if you want a reply)</span>
              </label>
              <input id="report-contact" name="contact" className={inputCls} autoComplete="email" />
            </div>
            <FormMessage state={state} />
            <button type="submit" disabled={pending} className="min-h-12 rounded-xl bg-brand px-6 font-bold text-paper hover:bg-brand-strong disabled:opacity-60">
              {pending ? "Sending..." : "Send report"}
            </button>
          </form>
        )}
      </div>
    </details>
  );
}
