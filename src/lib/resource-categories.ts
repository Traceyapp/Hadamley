import type { ResourceKind } from "./types";

/**
 * Guides & Resources subcategories, used by the resources page and the menu.
 * The first three are the cards from the 27 October design; the menu lists
 * all five (28 October navigation feedback). Every download kind belongs to one.
 */
export const RESOURCE_CATEGORIES: { slug: string; title: string; menu: string; blurb: string; kinds: ResourceKind[]; card: boolean }[] = [
  { slug: "guides", title: "Information Guides", menu: "Information guides", blurb: "Plain-English guides about health, disability and practical support.", kinds: ["guide", "checklist", "worksheet"], card: true },
  { slug: "journals", title: "Journals & Trackers", menu: "Journals and trackers", blurb: "Check-ins, appointment notes and trackers to fill in at your own pace.", kinds: ["journal", "tracker"], card: false },
  { slug: "colouring", title: "Colouring Pages", menu: "Colouring", blurb: "Printable designs for a quiet, creative moment.", kinds: ["colouring"], card: true },
  { slug: "activities", title: "Puzzles & Activities", menu: "Games and puzzles", blurb: "Word searches, word games and other printable activities.", kinds: ["puzzle", "activity"], card: true },
  { slug: "printables", title: "Printable Materials", menu: "Printable materials", blurb: "Leaflets, postcards and cards to print and share Hadamley.", kinds: ["leaflet"], card: false },
];
