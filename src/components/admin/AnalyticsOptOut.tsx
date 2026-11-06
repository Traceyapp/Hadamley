"use client";

import { useEffect } from "react";
import { markAsAdminDevice } from "@/lib/analytics/track";

/** Marks this browser as an admin's own, so its visits to the public site are never counted, even after signing out. */
export function AnalyticsOptOut() {
  useEffect(() => markAsAdminDevice(), []);
  return null;
}
