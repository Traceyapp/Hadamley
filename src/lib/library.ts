import fs from "node:fs";
import path from "node:path";
import type { Database, Resource, ResourceKind } from "./types";

/**
 * Tracey's printable library (24 October 2026 collection). The PDFs live in
 * content/library and are copied into the uploads folder the first time the
 * site runs, so they survive a fresh install. Tracey can edit or replace any
 * of them in the admin afterwards; existing records are never overwritten.
 */

const LIBRARY_DIR = path.join(process.cwd(), "content", "library");
const T = "2026-10-24T09:00:00.000Z";

type Entry = { id: string; file: string; title: string; kind: ResourceKind; topics: string[]; description: string };

export const LIBRARY: Entry[] = [
  // Colouring
  { id: "lib-one-thing", file: "Hadamley_One_Thing_at_a_Time_Colouring.pdf", title: "One thing at a time", kind: "colouring", topics: ["mental-health"], description: "A woman at her desk surrounded by gentle reminders: take your time, pause and breathe, small steps count. A4, print at actual size." },
  { id: "lib-mummy-rest", file: "Hadamley_Mummy_Needs_a_Rest_Colouring.pdf", title: "Mummy needs a rest", kind: "colouring", topics: ["long-term-conditions"], description: "A child plays on the rug while Mum rests on the sofa. For families where a parent lives with a long-term condition. A4." },
  { id: "lib-fibro-family", file: "Hadamley_Understanding_Fibromyalgia_Family_Colouring.pdf", title: "Understanding fibromyalgia: family", kind: "colouring", topics: ["long-term-conditions"], description: "A family at home together while Dad reads Understanding Fibromyalgia. A calm picture to colour and talk about. A4." },
  { id: "lib-signpost", file: "Hadamley_Hospital_Signpost_Colouring.pdf", title: "Hospital signpost", kind: "colouring", topics: ["hospitals-clinics"], description: "A hospital signpost to colour, showing the departments people often visit. A4." },
  { id: "lib-signpost-mortuary", file: "Hadamley_Hospital_Signpost_Colouring_Mortuary.pdf", title: "Hospital signpost (with mortuary)", kind: "colouring", topics: ["hospitals-clinics"], description: "The hospital signpost colouring page, in a version that includes the mortuary sign. A4." },
  // Journals, trackers and worksheets
  { id: "lib-appointment-notes", file: "Hadamley_My_Appointment_Notes.pdf", title: "My appointment notes", kind: "tracker", topics: ["long-term-conditions", "hospitals-clinics"], description: "Prepare, ask questions and record next steps: what you want to discuss, what has changed, and what happens next." },
  { id: "lib-feel-today", file: "Hadamley_How_Do_I_Feel_Today.pdf", title: "How do I feel today?", kind: "journal", topics: ["mental-health"], description: "A personal check-in. Tick a box on each row or leave any question blank. A few ticks or words are enough." },
  { id: "lib-influences", file: "Hadamley_Influences_in_My_Life.pdf", title: "Influences in my life", kind: "worksheet", topics: ["mental-health"], description: "Circle exercises to think about the people and relationships around you, using names, initials or drawings." },
  // Puzzles and activities
  { id: "lib-word-search", file: "Hadamley_Chronic_Conditions_Word_Search.pdf", title: "Chronic conditions word search", kind: "puzzle", topics: ["long-term-conditions"], description: "How many conditions can you find? Words run across, down or diagonally, forwards or backwards. Answers included." },
  { id: "lib-words-transport", file: "Hadamley_Words_Within_Transport.pdf", title: "Words within TRANSPORT", kind: "puzzle", topics: ["transport"], description: "How many smaller words can you make from the letters in TRANSPORT? Answers included." },
  { id: "lib-match-department", file: "Hadamley_Match_the_Hospital_Department.pdf", title: "Match the hospital department", kind: "puzzle", topics: ["hospitals-clinics"], description: "A simple matching activity: draw a line from each example to the hospital department that helps with it." },
  { id: "lib-all-about-me", file: "Hadamley_All_About_Me_Childrens_Activity.pdf", title: "All about me", kind: "activity", topics: ["mental-health"], description: "A children's activity to draw, colour, write or point. Someone can help, too." },
  { id: "lib-life-stories", file: "Hadamley_Life_Stories_Care_Home_Pack.pdf", title: "Life stories and activities", kind: "activity", topics: ["mental-health"], description: "A 10-page personal activity pack to enjoy alone or with company, suited to care homes and family visits." },
  // Guides
  { id: "lib-guide-chronic", file: "Hadamley_Understanding_Chronic_Conditions.pdf", title: "Understanding chronic conditions", kind: "guide", topics: ["long-term-conditions"], description: "A short introduction: what a chronic condition is, how it can affect daily life, and where to find support." },
  { id: "lib-guide-hidden", file: "Hadamley_Understanding_Hidden_Disabilities.pdf", title: "Understanding hidden disabilities", kind: "guide", topics: ["long-term-conditions", "disability-rehab"], description: "What you cannot always see: a plain-English guide to non-visible disabilities and their everyday impact." },
  { id: "lib-guide-benefits", file: "Hadamley_Benefits_and_Financial_Support.pdf", title: "Benefits and financial support", kind: "guide", topics: ["long-term-conditions", "assessments-costs"], description: "Receiving benefits without shame, which benefits might help, and where to get a benefits check. For adults in England." },
  { id: "lib-guide-disability", file: "Hadamley_Understanding_Disability.pdf", title: "Understanding disability", kind: "guide", topics: ["disability-rehab"], description: "Everyday understanding and inclusion: disability is different for everyone, and many disabilities are not visible." },
  { id: "lib-guide-discrimination", file: "Hadamley_Understanding_Discrimination.pdf", title: "Understanding discrimination", kind: "guide", topics: ["long-term-conditions", "mental-health"], description: "A short guide to unfair treatment and your rights, focused on disability, mental health and long-term conditions." },
  { id: "lib-guide-mental-health", file: "Hadamley_Understanding_Mental_Health.pdf", title: "Understanding mental health", kind: "guide", topics: ["mental-health"], description: "Everyone has mental health. What it means, how difficulties can look, and support routes in England." },
  // Share Hadamley
  { id: "lib-leaflet", file: "Hadamley_Folded_Leaflet.pdf", title: "Hadamley folded leaflet", kind: "leaflet", topics: [], description: "Print and share: a tri-fold A4 leaflet about Hadamley, outside and inside." },
  { id: "lib-postcard", file: "Hadamley_Postcard.pdf", title: "Hadamley postcard", kind: "leaflet", topics: [], description: "Print and share: an A6 postcard, front and back, at finished size." },
  { id: "lib-business-card", file: "Hadamley_Business_Card.pdf", title: "Hadamley business card", kind: "leaflet", topics: [], description: "Print and share: an 85 x 55 mm card, front and back, at finished size." },
];

/** Adds any library file that isn't in the database yet. Returns true if anything changed. */
export function importLibrary(db: Database, uploadDir: string): boolean {
  if (!fs.existsSync(LIBRARY_DIR)) return false;
  fs.mkdirSync(uploadDir, { recursive: true });
  let changed = false;
  for (const e of LIBRARY) {
    if (db.resources.some((r) => r.id === e.id)) continue;
    const src = path.join(LIBRARY_DIR, e.file);
    if (!fs.existsSync(src)) continue;
    const storedName = `${e.id}-${e.file}`;
    fs.copyFileSync(src, path.join(uploadDir, storedName));
    const topicIds = e.topics.map((slug) => db.taxa.find((t) => t.type === "topic" && t.slug === slug)?.id).filter(Boolean) as string[];
    const r: Resource = {
      id: e.id,
      title: e.title,
      description: e.description,
      kind: e.kind,
      topicIds,
      fileName: e.file,
      storedName,
      mime: "application/pdf",
      size: fs.statSync(src).size,
      status: "published",
      updatedAt: T,
    };
    db.resources.push(r);
    changed = true;
  }
  return changed;
}
