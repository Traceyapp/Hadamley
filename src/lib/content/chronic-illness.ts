import type { PageSection } from "../types";

/**
 * Chronic Illness Support page, from Tracey's brief of 25 October 2026.
 * The condition wording follows section by section, so the accordions start
 * with headings only. Empty accordions are hidden from visitors until filled.
 */

export const CHRONIC_SUMMARY =
  "Living with a long-term health condition can affect everyday tasks, relationships, work and emotional wellbeing. The effects are not always visible, and other people may not understand how much effort an ordinary day can take.";

export const CHRONIC_BODY = `<p>Everyone's experience is different. Symptoms and abilities can change from day to day. Being able to do something today does not mean you will be able to do it tomorrow.</p>
<p>This section provides plain-English information about chronic conditions, common symptoms, treatments and the professionals who may be involved in your care. You can also find practical resources and information about discrimination, benefits and financial support.</p>
<p>Fibromyalgia has its own dedicated section, exploring the condition, its history, how it is diagnosed and the realities of living with it.</p>
<p><strong>You do not need a confirmed diagnosis to use our resources. You deserve to be listened to and treated with respect.</strong></p>
<p><em>Please remember: This information cannot diagnose a condition or replace advice from a qualified healthcare professional. Speak to your healthcare team about symptoms, treatment or changes to your health.</em></p>
<p>Select a condition below to read about its symptoms, treatment and available support.</p>`;

/** Accordion titles exactly as listed in the brief, in its alphabetical order. */
export const CONDITION_TITLES: [string, string][] = [
  ["cond-axial-spa", "Axial spondyloarthritis (including ankylosing spondylitis)"],
  ["cond-back-spine", "Back and spinal conditions"],
  ["cond-cppd", "Calcium pyrophosphate deposition disease (CPPD)"],
  ["cond-copd", "Chronic obstructive pulmonary disease (COPD)"],
  ["cond-crohns", "Crohn's disease"],
  ["cond-diabetes-1", "Diabetes - Type 1"],
  ["cond-diabetes-2", "Diabetes - Type 2"],
  ["cond-endometriosis", "Endometriosis"],
  ["cond-fibromyalgia", "Fibromyalgia"],
  ["cond-gout", "Gout"],
  ["cond-ibs", "Irritable bowel syndrome (IBS)"],
  ["cond-jia", "Juvenile idiopathic arthritis (JIA)"],
  ["cond-long-covid", "Long COVID"],
  ["cond-lupus", "Lupus (systemic lupus erythematosus, SLE)"],
  ["cond-me-cfs", "ME/CFS (myalgic encephalomyelitis/chronic fatigue syndrome)"],
  ["cond-migraine", "Migraine"],
  ["cond-ms", "Multiple sclerosis (MS)"],
  ["cond-osteoarthritis", "Osteoarthritis"],
  ["cond-psoriatic-arthritis", "Psoriatic arthritis"],
  ["cond-reactive-arthritis", "Reactive arthritis"],
  ["cond-rheumatoid-arthritis", "Rheumatoid arthritis"],
  ["cond-ulcerative-colitis", "Ulcerative colitis"],
];

export const conditionHeadings = (): PageSection[] =>
  CONDITION_TITLES.map(([id, heading]) => ({ id, heading, body: "", resourceIds: [], health: true, sources: [] }));
