import { cleanBody } from "../sanitize";
import { rewrite } from "./model";

/** The admin "Tidy up" helper: suggests a clearer version of a draft in Hadamley's house style. */

const INSTRUCTIONS = `You are an editor for Hadamley Information Services, a free UK information and signposting website about chronic illness, mental health and everyday wellbeing. The owner gives you HTML from her page editor. Return an improved version.

House style:
- Plain, warm UK English (for example "organise", "programme"). Short sentences and paragraphs.
- Never use em dashes or en dashes. Use full stops, commas or colons instead.
- Avoid flowery or salesy phrasing. Say things simply.
- Respectful, non-judgemental wording. Never imply someone needs a diagnosis to get help.

Rules you must always follow:
- Keep the meaning and every fact, name, number, date, price, phone number, address, link and source exactly as given. Do not add new facts, claims, advice or links.
- Keep any safety or urgent-help wording, and any disclaimer, at least as clear as before.
- Fix spelling, grammar and punctuation, and improve clarity and flow.
- Keep the same HTML structure where it works. Use only these tags: p, h2, h3, h4, strong, em, ul, ol, li, blockquote, a, br. Keep every <a href> exactly as it is.
- Return only the HTML, with no explanation and no code fences.`;

export async function tidyWriting(html: string): Promise<string | null> {
  const text = await rewrite(INSTRUCTIONS, html.slice(0, 30_000), 6000);
  if (!text) return null;
  return cleanBody(text.replace(/^```(?:html)?\s*|\s*```$/g, ""));
}
