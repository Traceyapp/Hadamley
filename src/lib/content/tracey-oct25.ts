import type { Page, PageSection } from "../types";
import conditions from "./chronic-conditions.json";
import fibro from "./fibromyalgia-page.json";

/**
 * Tracey's condition wording (25 October 2026): 17 Chronic Illness Support
 * accordions (A to M) and the full Understanding fibromyalgia page.
 * Converted from her PDFs; her disclaimer is added automatically by the
 * accordion, and notes addressed to the developer are left out.
 */

type Source = { label: string; url: string };
export const CONDITION_CONTENT = conditions as { id: string; body: string; urgent: string | null; sources: Source[]; reviewedAt: string }[];

const F = fibro as { intro: string; urgent: string; sections: { num: number; title: string; body: string; sources: Source[] }[]; register: Record<string, Source> };

export const FIBRO_BODY = `${F.intro}<blockquote><p><strong>When to get urgent help.</strong> ${F.urgent}</p></blockquote>`;

export const FIBRO_SECTIONS: PageSection[] = [
  ...F.sections.map((s) => ({
    id: `fibro-${s.num}`,
    heading: s.title,
    body: s.body,
    resourceIds: s.num === 9 ? ["lib-fibro-family", "lib-mummy-rest"] : s.num === 8 ? ["lib-appointment-notes", "lib-feel-today"] : [],
    health: true,
    sources: s.sources,
    reviewedAt: "2026-10-25",
  })),
  {
    id: "fibro-support",
    heading: "Support and related resources",
    body: `<p><a href="https://www.fmauk.org/" target="_blank" rel="noopener">Fibromyalgia Action UK</a> offers information and community support. The <a href="https://www.nhs.uk/conditions/fibromyalgia/self-help/" target="_blank" rel="noopener">NHS self-help pages</a> have practical tips.</p><p>On Hadamley, see <a href="/chronic-illness-support">Chronic Illness Support</a> for other conditions and the <a href="/resources">free printable library</a> for practical downloads.</p>`,
    resourceIds: [],
    health: false,
    sources: [],
    reviewedAt: "2026-10-25",
  },
];

/** Applies Tracey's wording without overwriting anything she has written in the admin. */
export function applyTraceyOct25(pages: Page[], draftedBy: string) {
  const ltc = pages.find((p) => p.id === "p-ltc");
  if (ltc?.sections) {
    for (const c of CONDITION_CONTENT) {
      const s = ltc.sections.find((x) => x.id === c.id);
      if (!s || s.body.replace(/<[^>]*>/g, "").trim()) continue; // already has wording
      s.body = c.body;
      s.urgent = c.urgent ?? undefined;
      s.sources = c.sources;
      s.reviewedAt = c.reviewedAt;
      s.health = true;
    }
  }
  const fp = pages.find((p) => p.id === "p-fibro" && p.updatedBy === draftedBy);
  if (fp) {
    fp.body = FIBRO_BODY;
    fp.summary = "Fibromyalgia can affect much more than pain. What is known, how understanding has changed, and the care and practical support that may help.";
    fp.sections = structuredClone(FIBRO_SECTIONS);
  }
}
