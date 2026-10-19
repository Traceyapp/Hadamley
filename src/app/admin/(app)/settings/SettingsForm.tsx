"use client";

import { useActionState } from "react";
import { saveSettings, type ActionState } from "../../actions";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, Field, input } from "@/components/admin/ui";

export function SettingsForm({ funeralUrl, keepQuestions }: { funeralUrl: string; keepQuestions: boolean }) {
  const [state, action] = useActionState<ActionState, FormData>(saveSettings, null);
  const placeholder = funeralUrl.includes("example.com");
  return (
    <form action={action} className="space-y-5">
      <Field
        label="The Funeral Companion web address"
        htmlFor="fc"
        hint={placeholder ? <strong className="text-warn">Still a placeholder. Add the real address before launch.</strong> : "Used in the header, footer, relevant pages and the AI helper redirect."}
      >
        <input id="fc" name="funeralCompanionUrl" type="url" required defaultValue={funeralUrl} className={input} />
      </Field>
      <label className="flex items-start gap-2.5 rounded-xl border border-line p-3">
        <input type="checkbox" name="keepAnonymisedQuestions" defaultChecked={keepQuestions} className="mt-1 size-[1.1rem] accent-[var(--brand)]" />
        <span>
          <span className="font-bold">Keep anonymised AI questions</span>
          <span className="block text-sm text-ink-2">Stores question text only, with no visitor details, to help improve content. If you turn this on, say so in the privacy notice.</span>
        </span>
      </label>
      <ActionMessage state={state} />
      <SubmitButton className={btn.primary} pendingText="Saving...">
        Save settings
      </SubmitButton>
    </form>
  );
}
