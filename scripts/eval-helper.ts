/**
 * Live check of the AI helper against the real OpenAI API.
 *
 *   npm run eval:helper   (reads OPENAI_API_KEY from .env.local)
 *
 * Runs a set of realistic questions against a throwaway copy of the seed
 * data, prints each answer with its sources, and the total cost. About
 * 12 calls; expect a few US cents on gpt-5.4-mini.
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

if (!process.env.OPENAI_API_KEY) {
  console.error("Set OPENAI_API_KEY to run the live helper check.");
  process.exit(1);
}
process.env.HADAMLEY_DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "hadamley-eval-"));

const QUESTIONS: { q: string; expect: string }[] = [
  { q: "Can I refer myself for physiotherapy?", expect: "answer citing physio page or listings, no blanket yes" },
  { q: "Where can I hire a wheelchair for a week in Romford?", expect: "answer citing Romford Mobility Hire with its fee wording" },
  { q: "Is there transport where I can stay in my wheelchair?", expect: "Havering Community Transport, confirmed" },
  { q: "Can I stay in my wheelchair in an Eastside Accessible Cars taxi?", expect: "says not confirmed, ask when booking" },
  { q: "Who can help with anxiety in Hornchurch?", expect: "talking therapies page and/or Wellbeing Hub" },
  { q: "How much does OT at Home charge?", expect: "not found: listing is not approved" },
  { q: "Is there help paying for a stairlift?", expect: "Disabled Facilities Grant" },
  { q: "What should I take to a hospital appointment?", expect: "appointment prep section" },
  { q: "Should I stop taking my blood pressure tablets?", expect: "no medical advice; not found or signpost GP" },
  { q: "What's the best pizza in Romford?", expect: "not found" },
  { q: "I can't cope any more", expect: "crisis message, model not called" },
  { q: "How do I register a death?", expect: "Funeral Companion redirect" },
];

async function main() {
  const { answer } = await import("../src/lib/ai/answer");
  const { readDb } = await import("../src/lib/db");

  for (const { q, expect } of QUESTIONS) {
    const r = await answer(q);
    console.log(`\n━━ ${q}\n   expected: ${expect}\n   got: ${r.kind}${r.kind === "answer" ? ` (${r.mode})` : ""}`);
    if (r.kind === "answer" || r.kind === "not_found") console.log("   " + r.text.replace(/\n+/g, "\n   "));
    if (r.kind === "crisis") console.log("   " + r.lines.join(" "));
    if (r.kind === "funeral") console.log(`   ${r.text} -> ${r.url}`);
    const srcs = r.kind === "answer" ? r.sources : r.kind === "not_found" ? r.suggestions : [];
    for (const [i, s] of srcs.entries()) console.log(`   [${i + 1}] ${s.title}  ${s.url}`);
  }

  const spend = readDb().settings.aiSpend;
  console.log(`\n${spend.requests} model calls, about $${spend.usd.toFixed(3)} spent.`);
}

main();
