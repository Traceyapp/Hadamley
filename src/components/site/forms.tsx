"use client";

import { useActionState, useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function SpamFields() {
  const [started, setStarted] = useState(0);
  useEffect(() => setStarted(Date.now()), []);
  return (
    <>
      <input type="hidden" name="started_at" value={started} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Leave this empty
          <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  );
}

export function FormMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state) return null;
  return (
    <div
      role={state.ok ? "status" : "alert"}
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${state.ok ? "border-ok/40 bg-ok-soft" : "border-urgent/40 bg-urgent-soft"}`}
    >
      {state.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden /> : <AlertCircle className="mt-0.5 size-5 shrink-0 text-urgent" aria-hidden />}
      <p className="text-ink">{state.message}</p>
    </div>
  );
}

export const inputCls =
  "block w-full rounded-xl border-2 border-line-strong bg-surface px-4 py-3 text-ink placeholder:text-ink-2/70 focus:border-brand";

export { useActionState };
