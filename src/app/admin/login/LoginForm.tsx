"use client";

import { useActionState } from "react";
import { login, type ActionState } from "../actions";
import { ActionMessage } from "@/components/admin/client";
import { btn, input } from "@/components/admin/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(login, null);
  return (
    <form action={action} className="space-y-5 rounded-3xl border border-line bg-surface p-7 shadow-lift">
      <div>
        <label htmlFor="email" className="mb-1.5 block font-bold">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={input} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block font-bold">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={input} />
      </div>
      <ActionMessage state={state} />
      <button type="submit" disabled={pending} className={`${btn.primary} w-full`}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
