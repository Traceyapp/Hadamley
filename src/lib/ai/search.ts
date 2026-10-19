import type { AiChunk } from "../types";

/**
 * Lexical retrieval (BM25) over the AI chunks.
 *
 * Production swaps this for pgvector similarity on the same chunks; the
 * interface (query in, ranked chunks out) stays the same. Lexical search
 * is also a sensible fallback if the embeddings API is down.
 */

const STOP = new Set(
  "a an and are as at be but by can could do does for from get got have how i i'm im if in into is it its me my near nearby of on or our please should so some that the their them there these they this to up us was we what when where which who why will with would you your about any anyone anything find help need looking want know tell myself best good great top recommend recommended cheap cheapest nice".split(
    " ",
  ),
);

/** Place and filler words that add context but are not enough on their own. */
const WEAK = new Set(
  "havering romford brentwood hornchurch upminster rainham essex london local area service services support thing things someone people person".split(" "),
);

const SYNONYMS: Record<string, string[]> = {
  physio: ["physiotherapy", "physiotherapist"],
  ot: ["occupational", "therapy"],
  wheelchair: ["wheelchair", "mobility"],
  taxi: ["taxi", "transport", "cars"],
  cab: ["taxi", "transport"],
  bus: ["transport", "minibus"],
  lift: ["transport", "stairlift"],
  depressed: ["depression", "mood", "mental"],
  depression: ["mood", "mental", "talking"],
  anxious: ["anxiety", "mental"],
  anxiety: ["anxious", "mental", "talking"],
  stress: ["stress", "wellbeing", "mental"],
  counselling: ["talking", "therapies", "counselling"],
  therapy: ["therapies", "therapy"],
  cbt: ["talking", "therapies"],
  scooter: ["scooter", "mobility", "hire"],
  walker: ["walking", "frame", "equipment"],
  rail: ["rails", "adaptations"],
  adaptation: ["adaptations", "grant"],
  grant: ["grant", "costs"],
  money: ["costs", "benefits", "grant"],
  benefits: ["benefits", "pip", "allowance"],
  carer: ["carer", "carers", "caring"],
  diabetes: ["diabetes", "conditions"],
  copd: ["copd", "breathing"],
  asthma: ["asthma", "breathing"],
  hospital: ["hospital", "outpatient", "clinic"],
  appointment: ["appointment", "appointments"],
  rehab: ["rehabilitation"],
  stroke: ["stroke", "neurological"],
  parkinsons: ["parkinson", "neurological"],
  ms: ["neurological"],
  cost: ["fees", "costs", "price"],
  price: ["fees", "costs"],
  free: ["free"],
  equipment: ["equipment", "aids"],
  hire: ["hire", "loan"],
  borrow: ["loan", "borrowing"],
  referral: ["referral", "refer"],
  refer: ["referral"],
};

function stem(w: string) {
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/'s\b/g, "")
    .split(/[^a-z0-9£]+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

function expand(query: string) {
  const raw = query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const terms = new Map<string, number>();
  for (const t of tokenize(query)) terms.set(t, 1);
  for (const w of raw) {
    for (const syn of SYNONYMS[w] ?? SYNONYMS[stem(w)] ?? []) {
      const s = stem(syn);
      if (!terms.has(s)) terms.set(s, 0.6);
    }
  }
  return terms;
}

export interface SearchHit {
  chunk: AiChunk;
  score: number;
  matched: string[];
}

export function search(chunks: AiChunk[], query: string, limit = 6): SearchHit[] {
  const terms = expand(query);
  const strong = [...terms.keys()].filter((t) => !WEAK.has(t));
  if (strong.length === 0) return [];
  // The words the visitor actually typed (not synonyms), used for coverage.
  const typed = [...terms.entries()].filter(([t, w]) => w === 1 && !WEAK.has(t)).map(([t]) => t);

  const docs = chunks.map((c) => {
    const toks = [...tokenize(c.title), ...tokenize(c.title), ...tokenize(c.text)];
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { c, tf, len: toks.length };
  });
  const N = docs.length || 1;
  const avg = docs.reduce((s, d) => s + d.len, 0) / N;
  const df = new Map<string, number>();
  for (const t of terms.keys()) df.set(t, docs.filter((d) => d.tf.has(t)).length);

  const k1 = 1.2;
  const b = 0.75;
  const hits: SearchHit[] = [];
  for (const d of docs) {
    let score = 0;
    const matched: string[] = [];
    let strongMatch = false;
    for (const [t, weight] of terms) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
      const w = WEAK.has(t) ? 0.25 : weight;
      score += w * idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avg)));
      matched.push(t);
      if (!WEAK.has(t)) strongMatch = true;
    }
    // A hit must cover at least half of what was typed (counting synonym matches),
    // so "pizza in Romford" can't ride in on the place name alone.
    const covered = typed.filter((t) => d.tf.has(t) || (SYNONYMS[t] ?? []).some((s) => d.tf.has(stem(s)))).length;
    const coverage = typed.length ? covered / typed.length : 1;
    if (strongMatch && score > 0 && coverage >= 0.5) hits.push({ chunk: d.c, score, matched });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit);
}

/** Minimum score for a hit to count as relevant. Tuned on the starter content. */
export const RELEVANCE_FLOOR = 2.2;
