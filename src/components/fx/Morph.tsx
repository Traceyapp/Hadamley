"use client";

import * as React from "react";

type VTProps = { name: string; children: React.ReactNode };

// React's ViewTransition, under whichever name this build exports it
// (Next's experimental React uses the unstable_ prefix). Looked up by
// name at runtime so the bundler doesn't warn about the missing export.
const R = React as unknown as Record<string, unknown>;
const VT_KEY = ["ViewTransition", "unstable_ViewTransition"].find((k) => k in R);
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
