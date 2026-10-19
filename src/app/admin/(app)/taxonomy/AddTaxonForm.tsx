"use client";

import { Plus } from "lucide-react";
import { useActionState } from "react";
import { saveTaxon, type ActionState } from "../../actions";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, input } from "@/components/admin/ui";

export function AddTaxonForm({ type }: { type: "topic" | "area" }) {
  const [state, action] = useActionState<ActionState, FormData>(saveTaxon, null);
  return (
    <form action={action} className="mt-4 space-y-3 border-t border-line pt-4">
      <input type="hidden" name="type" value={type} />
      <div className="flex gap-2">
        <label htmlFor={`add-${type}`} className="sr-only">
          New {type} name
        </label>
        <input id={`add-${type}`} name="name" required placeholder={type === "topic" ? "New topic" : "New area, for example Barking"} className={input} />
        <SubmitButton className={`${btn.secondary} shrink-0`}>
          <Plus className="size-4" aria-hidden /> Add
        </SubmitButton>
      </div>
      <ActionMessage state={state} />
    </form>
  );
}
