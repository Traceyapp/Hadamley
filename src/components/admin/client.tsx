"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

/**
 * Submit button. With `intent`, it writes that value into the form's hidden
 * <input name="intent"> before submitting, which is more reliable than the
 * submitter's name/value across React form actions.
 */
export function SubmitButton({ children, className, intent, pendingText }: { children: React.ReactNode; className: string; intent?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!intent) return;
        const field = e.currentTarget.form?.elements.namedItem("intent");
        if (field instanceof HTMLInputElement) field.value = intent;
      }}
    >
      {pending && pendingText ? pendingText : children}
    </button>
  );
}

export function ConfirmButton({ children, className, message }: { children: React.ReactNode; className: string; message: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}

export function ActionMessage({ state }: { state: { ok: boolean; message: string } | null }) {
  const [shown, setShown] = useState(state);
  useEffect(() => {
    setShown(state);
    if (state?.ok) {
      const t = setTimeout(() => setShown(null), 6000);
      return () => clearTimeout(t);
    }
  }, [state]);
  if (!shown) return null;
  return (
    <div
      role={shown.ok ? "status" : "alert"}
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 font-bold ${shown.ok ? "border-ok/40 bg-ok-soft text-ok" : "border-urgent/40 bg-urgent-soft text-urgent"}`}
    >
      {shown.ok ? <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden /> : <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />}
      {shown.message}
    </div>
  );
}
