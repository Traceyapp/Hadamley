import type { Page } from "../types";
import { htmlToText } from "../html";
import { cleanBody } from "../sanitize";
import { rewrite } from "./model";

/**
 * Easy read: an AI-simplified version of a published page, made on request
 * and cached until the page changes, so each version is paid for once.
 */

const INSTRUCTIONS = `You rewrite pages from Hadamley, a UK health and wellbeing information website, as an easy read version for people who find long or complex text hard.

Rules you must always follow:
- Use ONLY the information in the page you are given. Never add facts, advice, services, numbers or links that are not in it.
- Keep every safety message, warning, phone number, opening time, date, price and eligibility detail, worded so nobody can misread it. If the page says when to call 999, NHS 111 or a helpline, keep that near the top.
- Use short sentences and everyday words. Explain any medical or official word the first time you use it.
- Do not give medical, legal or financial advice beyond what the page already says.
- Write in plain UK English. Do not use em dashes.
- Output simple HTML only: <h3> for short headings, <p> for paragraphs, <ul><li> for lists, <strong> for the most important words. No other tags, no links, no images.
- Aim for under 450 words. Leave out repetition, not safety information.`;

type Cached = { key: string; html: string };
const g = globalThis as unknown as { __hadamleyEasyRead?: Map<string, Cached> };
const cache = (g.__hadamleyEasyRead ??= new Map());

/** The page as plain text, with headings kept so the model can follow its structure. */
export function pageAsText(page: Page) {
  const parts = [`# ${page.title}`, page.summary, htmlToText(page.body)];
  for (const s of page.sections ?? []) {
    const body = htmlToText(s.body);
    if (body.trim()) parts.push(`## ${s.heading}\n${s.urgent ? `URGENT: ${s.urgent}\n` : ""}${body}`);
  }
  return parts.filter(Boolean).join("\n\n").slice(0, 24_000);
}

export async function easyRead(page: Page): Promise<string | null> {
  const key = `${page.id}:${page.updatedAt}`;
  const hit = cache.get(page.id);
  if (hit?.key === key) return hit.html;
  const text = await rewrite(INSTRUCTIONS, pageAsText(page), 4000);
  if (!text) return null;
  const html = cleanBody(text.replace(/^```(?:html)?\s*|\s*```$/g, ""));
  cache.set(page.id, { key, html });
  return html;
}
