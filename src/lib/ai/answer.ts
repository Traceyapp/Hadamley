import OpenAI from "openai";
import { readDb, mutate } from "../db";
import { budgetLeft, getClient, MODEL, recordSpend } from "./model";
import { checkGuards, EMERGENCY_MESSAGES, type CallButton } from "./guard";
import { search, RELEVANCE_FLOOR, tokenize, type SearchHit } from "./search";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export interface Source {
  title: string;
  url: string;
  type: "page" | "listing" | "post" | "event";
}

export type HelperReply =
  | { kind: "crisis"; title: string; lines: string[]; calls: CallButton[] }
  | { kind: "funeral"; text: string; url: string }
  | { kind: "answer"; text: string; sources: Source[]; mode: "model" | "extract"; notice?: string }
  | { kind: "not_found"; text: string; suggestions: Source[] };

const SYSTEM = `You are the Hadamley helper. Hadamley is an information and signposting website for people living with chronic illness, disability and mental health needs in Havering, Romford, Brentwood and nearby.

Rules you must always follow:
- Answer ONLY from the numbered sources provided in the user's message. Never use outside knowledge, even if you are confident.
- If the sources do not answer the question, reply with exactly: NOT_FOUND
- If the question names a specific service or organisation that is not in the sources, reply with exactly: NOT_FOUND. Do not answer about a different service instead.
- Do not give medical, legal or financial advice. Do not recommend one service over another or make personal recommendations. Describe what the sources say and let the person decide.
- Quote fees, ages, eligibility and referral routes exactly as written in the source, and mention the "Last checked" date when you give them.
- Never say a service accepts self-referral unless its source says so.
- Cite sources inline with their number in square brackets, like [1]. Cite at least one source.
- Write in plain, warm UK English. Short paragraphs or a short list. Under 160 words. No headings. Do not use em dashes.
- If you are unsure, say so.`;

function sourcesFrom(hits: SearchHit[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const h of hits) {
    if (seen.has(h.chunk.url)) continue;
    seen.add(h.chunk.url);
    out.push({ title: h.chunk.title, url: h.chunk.url, type: h.chunk.sourceType });
  }
  return out;
}

/** Picks the sentences from a chunk that best match the question. */
function excerpt(text: string, query: string, max = 2) {
  const q = new Set(tokenize(query));
  const lines = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((s) => s.replace(/^- /, "").trim())
    .filter((s) => s.length > 20 && !/^Service:/.test(s));
  const scored = lines.map((s, i) => ({ s, i, n: tokenize(s).filter((t) => q.has(t)).length }));
  const top = scored
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, max)
    .sort((a, b) => a.i - b.i);
  return top.map((t) => t.s).join(" ");
}

function extractiveAnswer(hits: SearchHit[], query: string): string {
  const parts = hits.slice(0, 3).map((h, i) => {
    const c = h.chunk;
    if (c.sourceType === "listing") {
      const get = (label: string) => c.text.split("\n").find((l) => l.startsWith(label));
      const ref = get("Referral (as stated by the provider):");
      const checked = get("Last checked:");
      const summary = c.text.split("\n")[1] ?? "";
      return `**${c.title}** [${i + 1}]: ${summary}${ref ? ` ${ref.replace("Referral (as stated by the provider):", "Referral, as the provider states it:")}` : ""}${checked ? ` (${checked})` : ""}`;
    }
    return `**${c.title}** [${i + 1}]: ${excerpt(c.text, query)}`;
  });
  return `Here is what I found on Hadamley:\n\n${parts.join("\n\n")}`;
}

async function modelAnswer(hits: SearchHit[], question: string, history: ChatTurn[]) {
  const c = getClient();
  if (!c) return null;
  const sources = hits.map((h, i) => `[${i + 1}] ${h.chunk.title}\nURL: ${h.chunk.url}\n${h.chunk.text}`).join("\n\n---\n\n");
  const recent = history.slice(-4).map((t) => `${t.role === "user" ? "Visitor" : "Helper"}: ${t.content}`).join("\n");
  const response = await c.responses.create({
    model: MODEL,
    max_output_tokens: 2000,
    reasoning: { effort: "low" },
    store: false,
    instructions: SYSTEM,
    input: `<sources>\n${sources}\n</sources>\n${recent ? `\n<earlier_conversation>\n${recent}\n</earlier_conversation>\n` : ""}\n<question>${question}</question>`,
  });
  if (response.usage) await recordSpend(response.usage.input_tokens, response.usage.output_tokens);
  // A refusal or a cut-off reply is treated as "not found", so the visitor gets the page links instead.
  const refused = response.output.some((o) => o.type === "message" && o.content.some((c) => c.type === "refusal"));
  const text = (response.output_text ?? "").trim();
  if (refused || response.status === "incomplete" || !text) return { text: "NOT_FOUND" };
  return { text };
}

async function logQuestion(q: string, kind: string) {
  const db = readDb();
  if (!db.settings.keepAnonymisedQuestions) return;
  await mutate((d) => {
    d.questions.unshift({ q: q.slice(0, 300), at: new Date().toISOString(), kind });
    d.questions = d.questions.slice(0, 500);
  });
}

export async function answer(question: string, history: ChatTurn[] = []): Promise<HelperReply> {
  const db = readDb();

  // 1. Crisis wording: fixed message, never reaches the model.
  // 2. Grief and funerals: redirect to The Funeral Companion.
  const guard = checkGuards(question);
  if (guard?.kind === "crisis") {
    await logQuestion(`[${guard.topic} rule]`, "crisis");
    return { kind: "crisis", ...EMERGENCY_MESSAGES[guard.topic] };
  }
  if (guard?.kind === "funeral") {
    await logQuestion(question, "funeral");
    return {
      kind: "funeral",
      text: "Hadamley does not cover grief, bereavement or funerals. Our sister site, The Funeral Companion, has information and local support for that.",
      url: db.settings.funeralCompanionUrl,
    };
  }

  // 3. Retrieve from approved, published content only.
  const lastUser = [...history].reverse().find((t) => t.role === "user")?.content ?? "";
  const shortFollowUp = tokenize(question).length < 3 && lastUser;
  const query = shortFollowUp ? `${question} ${lastUser}` : question;
  const seen = new Set<string>();
  const hits = search(db.chunks, query, 10)
    .filter((h) => h.score >= RELEVANCE_FLOOR)
    .filter((h) => (seen.has(h.chunk.url) ? false : (seen.add(h.chunk.url), true)))
    .slice(0, 6);

  if (hits.length === 0) {
    await logQuestion(question, "not_found");
    return {
      kind: "not_found",
      text: "I can't find that on Hadamley. You can browse Find Support or one of the sections below, or try asking in a different way.",
      suggestions: [
        { title: "Find Support", url: "/find-support", type: "page" },
        { title: "Living with Chronic Illness", url: "/chronic-illness-support", type: "page" },
        { title: "Mental Health and Wellbeing", url: "/mental-health-support", type: "page" },
        { title: "Mobility, Daily Living and Transport", url: "/mobility-daily-living-transport", type: "page" },
      ],
    };
  }

  // 4. Answer from those chunks only.
  if (getClient() && budgetLeft()) {
    try {
      const res = await modelAnswer(hits, question, history);
      if (res) {
        if (res.text === "NOT_FOUND" || res.text.startsWith("NOT_FOUND")) {
          await logQuestion(question, "not_found");
          return {
            kind: "not_found",
            text: "I can't find that on Hadamley. These pages might still help:",
            suggestions: sourcesFrom(hits).slice(0, 3),
          };
        }
        const cited = new Set([...res.text.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1]) - 1));
        const used = hits.filter((_, i) => cited.has(i));
        // Renumber citations to match the sources list we show.
        const order = [...cited].sort((a, b) => a - b);
        const text = res.text.replace(/\[(\d+)\]/g, (_m, n) => `[${order.indexOf(Number(n) - 1) + 1}]`);
        await logQuestion(question, "answer");
        return { kind: "answer", text, sources: sourcesFrom(used.length ? used : hits.slice(0, 2)), mode: "model" };
      }
    } catch (err) {
      console.error("[ai] model call failed, using extractive fallback", err instanceof OpenAI.APIError ? `${err.status} ${err.message}` : err);
      await logQuestion(question, "answer_fallback");
      return {
        kind: "answer",
        text: extractiveAnswer(hits, question),
        sources: sourcesFrom(hits.slice(0, 3)),
        mode: "extract",
        notice: "The helper is having trouble writing a full answer right now, so here are the closest matching parts of the site.",
      };
    }
  }

  await logQuestion(question, "answer");
  return { kind: "answer", text: extractiveAnswer(hits, question), sources: sourcesFrom(hits.slice(0, 3)), mode: "extract" };
}
