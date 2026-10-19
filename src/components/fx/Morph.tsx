"use client";

import * as React from "react";

type VTProps = { name: string; children: React.ReactNode };

// React's ViewTransition, under whichever name this build exports it
// (Next's experimental React uses the unstable_ prefix). Looked up by
// name at runtime so the bundler doesn't warn about the missing export.
const R = React as unknown as Record<string, unknown>;
const VT_KEY = ["ViewTransition", "unstable_ViewTransition"].find((k) => k in R);
/**
 * Browsers abort a view transition if the tab is hidden, rejecting its
 * promises ("Transition was aborted because of invalid state"). Skip the
 * animation when hidden, and swallow aborted transitions elsewhere.
 */
if (typeof document !== "undefined" && document.startViewTransition && !(window as unknown as { __hvt?: boolean }).__hvt) {
  (window as unknown as { __hvt?: boolean }).__hvt = true;
  const original = document.startViewTransition.bind(document);
  document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
    if (document.visibilityState === "hidden") {
      const cb = typeof arg === "function" ? arg : arg?.update;
      const done = Promise.resolve(cb?.());
      const ok = done.then(() => undefined);
      return { ready: ok, finished: ok, updateCallbackDone: ok, skipTransition() {}, types: new Set() } as unknown as ViewTransition;
    }
    const t = original(arg);
    t.ready.catch(() => {});
    t.finished.catch(() => {});
    return t;
  }) as typeof document.startViewTransition;
}

const VT = (VT_KEY ? R[VT_KEY] : undefined) as React.ComponentType<VTProps> | undefined;

/**
 * Shares an element between two pages so it morphs across navigation,
 * for example a listing card's title flowing into the listing page heading.
 * Falls back to a plain fragment where view transitions aren't supported.
 */
export function Morph({ name, children }: VTProps) {
  if (!VT) return <>{children}</>;
  return <VT name={name}>{children}</VT>;
}
