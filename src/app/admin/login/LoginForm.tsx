"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { login, type ActionState } from "../actions";
import { ActionMessage } from "@/components/admin/client";

const field =
  "block w-full rounded-xl border border-line-strong bg-surface py-3 pl-11 pr-3.5 text-[1rem] text-ink placeholder:text-ink-2/70 transition focus:border-brand";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  const [show, setShow] = useState(false);
  // Kept in state so a failed attempt doesn't clear the email field.
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-[0.95rem] font-bold">
          Email
        </label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[1.15rem] -translate-y-1/2 text-ink-2" aria-hidden />
          <input id="email" name="email" type="email" autoComplete="username" required autoFocus placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-[0.95rem] font-bold">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[1.15rem] -translate-y-1/2 text-ink-2" aria-hidden />
          <input id="password" name="password" type={show ? "text" : "password"} autoComplete="current-password" required className={`${field} pr-12`} />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-ink-2 hover:bg-sand hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
          >
            {show ? <EyeOff className="size-[1.1rem]" aria-hidden /> : <Eye className="size-[1.1rem]" aria-hidden />}
          </button>
        </div>
      </div>
      <ActionMessage state={state} />
      <button
        type="submit"
        disabled={pending}
        className="group inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-[1.02rem] font-bold text-[var(--paper)] shadow-[var(--shadow)] transition hover:brightness-110 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {pending ? "Signing in..." : "Sign in"}
        {!pending && <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden />}
      </button>
    </form>
  );
}
