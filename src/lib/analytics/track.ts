"use client";

import type { Beacon } from "./collect";

/**
 * Browser side of Hadamley's analytics. Sends small beacons to /api/hv.
 * Sets no cookies. The only thing kept in the browser is the "don't count me"
 * mark on an admin's own devices (see markAsAdminDevice).
 */

const IGNORE_KEY = "hadamley-analytics-ignore";

/** Called on every admin screen: from then on this browser is never counted, even after signing out. */
export function markAsAdminDevice() {
  try {
    localStorage.setItem(IGNORE_KEY, "1");
  } catch {
    // Private browsing can block storage; signed-in visits are still skipped on the server.
  }
}

/** Not counted: an admin's own device, or a browser driven by automation (testing tools, scrapers). */
export function shouldSkip() {
  try {
    if (navigator.webdriver) return true;
    return localStorage.getItem(IGNORE_KEY) === "1";
  } catch {
    return false;
  }
}

export function send(b: Beacon) {
  try {
    if (shouldSkip()) return;
    const body = JSON.stringify(b);
    if (navigator.sendBeacon?.(new URL("/api/hv", location.href), new Blob([body], { type: "text/plain" }))) return;
    void fetch("/api/hv", { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  } catch {
    // Analytics must never get in a visitor's way.
  }
}

/** Records a key action, such as a helper question or a phone tap. */
export function track(name: "outbound" | "phone" | "email" | "download" | "search" | "helper", target = "") {
  if (typeof window === "undefined") return;
  if (document.querySelector("[data-analytics-404]")) return;
  send({ k: "ev", p: location.pathname, n: name, t: target.slice(0, 200) });
}
