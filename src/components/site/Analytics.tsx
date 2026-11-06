"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { send, track } from "@/lib/analytics/track";

/**
 * Cookieless visitor analytics: a page view on each page, time on screen when
 * the visitor moves on, and the key actions that show help being found
 * (leaving for a service's website, tapping a phone number or email address,
 * downloading a resource, searching). See src/lib/analytics.
 */

let firstView = true;
let lastView = 0;

function utm() {
  const q = new URLSearchParams(location.search);
  const u = { s: q.get("utm_source") ?? undefined, m: q.get("utm_medium") ?? undefined, c: q.get("utm_campaign") ?? undefined };
  return u.s || u.m || u.c ? u : undefined;
}

/** Which platform's click id is on the address (Facebook, Google Ads, Microsoft Ads). Only the kind is sent, never the id. */
function clickId() {
  const q = new URLSearchParams(location.search);
  return q.has("fbclid") ? "fb" : q.has("gclid") || q.has("gbraid") || q.has("wbraid") ? "g" : q.has("msclkid") ? "ms" : undefined;
}

export function Analytics() {
  const path = usePathname();
  const params = useSearchParams();
  const q = path === "/search" || path === "/find-support" ? (params.get("q") ?? "").trim() : "";

  // Page views and time on screen.
  const shown = useRef({ path: "", visibleMs: 0, since: 0, notFound: false });
  useEffect(() => {
    const s = shown.current;
    const flush = () => {
      if (!s.path || s.notFound) return;
      const ms = s.visibleMs + (s.since ? Date.now() - s.since : 0);
      if (ms >= 1000) send({ k: "en", p: s.path, ms });
      s.visibleMs = 0;
      s.since = document.visibilityState === "visible" ? Date.now() : 0;
    };
    // React runs effects twice in development: don't count the same view twice.
    const repeat = s.path === path && Date.now() - lastView < 1500;
    if (!repeat) flush();
    s.path = path;
    s.visibleMs = 0;
    s.since = document.visibilityState === "visible" ? Date.now() : 0;
    // "Page not found" screens are left out of the numbers.
    s.notFound = !!document.querySelector("[data-analytics-404]");
    const view = () =>
      send({
        k: "pv",
        p: path,
        ...(firstView && document.referrer ? { r: document.referrer } : {}),
        ...(firstView ? { u: utm(), x: clickId() } : {}),
        w: window.innerWidth,
      });
    if (!repeat && !s.notFound) {
      lastView = Date.now();
      view();
    }
    firstView = false;

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (s.since) s.visibleMs += Date.now() - s.since;
        s.since = 0;
        // The visitor may never come back to this tab: report time so far.
        const ms = s.visibleMs;
        if (ms >= 1000 && !s.notFound) send({ k: "en", p: s.path, ms });
        s.visibleMs = 0;
      } else s.since = Date.now();
    };
    // Back and Forward can restore a page from the browser's memory without reloading it: that is a new view.
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted && !s.notFound) {
        s.visibleMs = 0;
        s.since = Date.now();
        view();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onShow);
    };
  }, [path]);

  // Searches, on the search page and the directory.
  useEffect(() => {
    if (q) track("search", q.toLowerCase());
  }, [path, q]);

  // Key actions from link clicks, anywhere on the page.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) return track("phone", href.slice(4).replace(/\s+/g, " "));
      if (href.startsWith("mailto:")) return track("email", href.slice(7).split("?")[0] ?? "");
      let url: URL;
      try {
        url = new URL(href, location.href);
      } catch {
        return;
      }
      if (url.origin === location.origin) {
        if (url.pathname.startsWith("/files/")) track("download", a.getAttribute("download") || decodeURIComponent(url.pathname.slice(7)));
        return;
      }
      if (url.protocol === "http:" || url.protocol === "https:") track("outbound", url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/$/, ""));
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
