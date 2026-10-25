"use server";

import { headers } from "next/headers";
import { mutate, nowIso, readDb, uid } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import type { ContactTopic } from "@/lib/types";

export type FormState = { ok: boolean; message: string } | null;

/** Spam protection: a hidden honeypot field and a minimum fill time. */
function looksLikeSpam(form: FormData) {
  if (String(form.get("website_url") ?? "").length > 0) return true;
  const started = Number(form.get("started_at") ?? 0);
  return !started || Date.now() - started < 2500;
}

export async function reportOutdated(_prev: FormState, form: FormData): Promise<FormState> {
  const listingId = String(form.get("listingId") ?? "");
  const message = String(form.get("message") ?? "").trim().slice(0, 2000);
  const contact = String(form.get("contact") ?? "").trim().slice(0, 200);

  if (!readDb().listings.some((l) => l.id === listingId)) return { ok: false, message: "We couldn't find that listing." };
  if (message.length < 5) return { ok: false, message: "Please tell us what has changed." };
  if (!rateLimit(clientKey({ headers: await headers() }, "report"), 5, 60 * 60_000)) {
    return { ok: false, message: "You've sent several reports recently. Please try again later." };
  }
  // Pretend success for bots so they don't retry.
  if (looksLikeSpam(form)) return { ok: true, message: "Thank you. We'll check this listing." };

  await mutate((db) => {
    db.reports.unshift({ id: uid("rep-"), listingId, message, contact, createdAt: nowIso(), handled: false, handledAt: null });
  });
  return { ok: true, message: "Thank you. We'll check this listing and update it if anything has changed." };
}

export async function sendContact(_prev: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const message = String(form.get("message") ?? "").trim().slice(0, 4000);
  const rawTopic = String(form.get("topic") ?? "general");
  const topic: ContactTopic = rawTopic === "resource" || rawTopic === "link" ? rawTopic : "general";
  if (!message || message.length < 5) return { ok: false, message: "Please write a message." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Please check your email address." };
  if (!rateLimit(clientKey({ headers: await headers() }, "contact"), 5, 60 * 60_000)) {
    return { ok: false, message: "You've sent several messages recently. Please try again later." };
  }
  if (looksLikeSpam(form)) return { ok: true, message: "Thank you, your message has been sent." };
  await mutate((db) => {
    db.messages.unshift({ id: uid("msg-"), topic, name, email, message, createdAt: nowIso(), handled: false });
  });
  return { ok: true, message: "Thank you, your message has been sent. We aim to reply within five working days." };
}
