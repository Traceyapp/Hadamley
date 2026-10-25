import type { Page, PageSection } from "../types";

/**
 * Shared building blocks for the health content drafted from Tracey's content
 * brief (24 October 2026). Everything is loaded as a draft: nothing is public
 * until Tracey has reviewed and published it in the admin.
 */

export const REVIEWED = "2026-10-24";
export const DRAFTED_BY = "Draft from content brief";
const T = "2026-10-24T09:00:00.000Z";

export type Source = { label: string; url: string };
export const src = (label: string, url: string): Source => ({ label, url });
export const nhs = (label: string, path: string): Source => ({ label: `NHS: ${label}`, url: `https://www.nhs.uk/${path}` });

/** The brief's suggested symptom introduction. */
export const SYMPTOM_NOTE =
  "<p><em>Everyone's experience is different. You may have some of these symptoms, and their severity can change. These summaries cannot diagnose a condition. Speak to a healthcare professional about new or changing symptoms.</em></p>";

/** Placeholder until medicine-specific copy has been drafted and checked, as the brief requires. */
export const TREATMENT_TO_FOLLOW = (what = "the options a healthcare professional may discuss with you") =>
  `<h4>Treatment and medicines</h4><p>Information about treatments, medicines and possible side effects is being prepared and checked. Until then, the NHS page in the sources below explains ${what}. Your pharmacist or the person who prescribes your medicine can answer questions about side effects.</p>`;

export function section(id: string, heading: string, body: string, sources: Source[], opts: { files?: string[]; urgent?: string; health?: boolean } = {}): PageSection {
  return { id, heading, body, resourceIds: opts.files ?? [], health: opts.health ?? true, urgent: opts.urgent, sources, reviewedAt: REVIEWED };
}

export function draftPage(p: Pick<Page, "id" | "slug" | "title" | "navLabel" | "section" | "parentId" | "navOrder" | "summary" | "body"> & { sections: PageSection[]; showInNav?: boolean }): Page {
  return {
    template: "information",
    listingTopics: [],
    showInNav: p.showInNav ?? true,
    status: "draft",
    updatedAt: T,
    updatedBy: DRAFTED_BY,
    ...p,
  };
}
