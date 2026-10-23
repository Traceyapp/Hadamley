"use client";

import { useActionState } from "react";
import { updateAccount, type ActionState } from "../../actions";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, Field, input } from "@/components/admin/ui";

/** Your own login: name, email and password. */
export function AccountForm({ name, email }: { name: string; email: string }) {
  const [state, action] = useActionState<ActionState, FormData>(updateAccount, null);
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="acc-name">
          <input id="acc-name" name="name" required defaultValue={name} autoComplete="name" className={input} />
        </Field>
        <Field label="Email (your login)" htmlFor="acc-email">
          <input id="acc-email" name="email" type="email" required defaultValue={email} autoComplete="username" className={input} />
        </Field>
        <Field label="New password" htmlFor="acc-pw" hint="Leave empty to keep your current one. At least 10 characters.">
          <input id="acc-pw" name="password" type="password" minLength={10} autoComplete="new-password" className={input} />
        </Field>
        <Field label="New password again" htmlFor="acc-pw2">
          <input id="acc-pw2" name="confirm" type="password" autoComplete="new-password" className={input} />
        </Field>
      </div>
      <Field label="Current password" htmlFor="acc-current" hint="Needed to save any change.">
        <input id="acc-current" name="current" type="password" required autoComplete="current-password" className={input} />
      </Field>
      <ActionMessage state={state} />
      <SubmitButton className={btn.primary} pendingText="Saving...">
        Save my account
      </SubmitButton>
    </form>
  );
}
