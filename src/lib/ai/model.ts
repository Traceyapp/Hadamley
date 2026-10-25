import OpenAI from "openai";
import { mutate, readDb } from "../db";

/**
 * The one OpenAI client and monthly spend cap shared by every AI feature:
 * the Ask Hadamley helper, easy read and the admin writing helper.
 */

export const MODEL = process.env.HADAMLEY_AI_MODEL || "gpt-5.4-mini";
// gpt-5.4-mini standard prices, USD per million tokens (OpenAI pricing page, October 2026).
// Update these if HADAMLEY_AI_MODEL is changed, so the monthly cap stays accurate.
const PRICE_IN = 0.75 / 1_000_000;
const PRICE_OUT = 4.5 / 1_000_000;

let client: OpenAI | null = null;
export function getClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  client ??= new OpenAI();
  return client;
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function budgetLeft(): boolean {
  const cap = Number(process.env.AI_MONTHLY_BUDGET_USD || 25);
  const spend = readDb().settings.aiSpend;
  if (spend.month !== currentMonth()) return true;
  return spend.usd < cap;
}

export async function recordSpend(inputTokens: number, outputTokens: number) {
  await mutate((db) => {
    const m = currentMonth();
    if (db.settings.aiSpend.month !== m) db.settings.aiSpend = { month: m, usd: 0, requests: 0 };
    db.settings.aiSpend.usd += inputTokens * PRICE_IN + outputTokens * PRICE_OUT;
    db.settings.aiSpend.requests += 1;
  });
}

/** One instructions + input call. Returns null when no key is set, the budget is spent, or the reply was refused or cut off. */
export async function rewrite(instructions: string, input: string, maxOutputTokens: number): Promise<string | null> {
  const c = getClient();
  if (!c || !budgetLeft()) return null;
  const response = await c.responses.create({ model: MODEL, max_output_tokens: maxOutputTokens, reasoning: { effort: "low" }, store: false, instructions, input });
  if (response.usage) await recordSpend(response.usage.input_tokens, response.usage.output_tokens);
  const refused = response.output.some((o) => o.type === "message" && o.content.some((part) => part.type === "refusal"));
  const text = (response.output_text ?? "").trim();
  if (refused || response.status === "incomplete" || !text) return null;
  return text;
}
