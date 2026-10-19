"use client";

import { RefreshCw } from "lucide-react";
import { useActionState } from "react";
import { refreshAiIndex, type ActionState } from "../../actions";
import { ActionMessage } from "@/components/admin/client";
import { btn } from "@/components/admin/ui";

export function RefreshAiButton() {
  const [state, action, pending] = useActionState<ActionState>(refreshAiIndex, null);
  return (
    <form action={action} className="space-y-3">
      <button type="submit" disabled={pending} className={btn.primary}>
        <RefreshCw className={`size-4 ${pending ? "animate-spin" : ""}`} aria-hidden />
        {pending ? "Refreshing..." : "Refresh AI helper"}
      </button>
      <ActionMessage state={state} />
    </form>
  );
}
