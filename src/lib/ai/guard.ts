/**
 * Fixed rules that run BEFORE any retrieval or model call.
 * Emergency wording always wins over everything else, and gets a prewritten
 * NHS-based message straight away, with no questions first. A message that
 * matches nothing here is never treated as "safe".
 */

export type EmergencyTopic = "mental" | "chest" | "stroke" | "breathing" | "anaphylaxis" | "joint" | "general";

/** Checked in this order; the first match decides the message. */
const RULES: [EmergencyTopic, RegExp[]][] = [
  [
    "mental",
    [
      /\bsuicid/i,
      /\bkill(ing)? (my ?self|myself)\b/i,
      /\bend(ing)? (it all|my life|things)\b/i,
      /\b(want|wanna|going) to die\b/i,
      /\bdon'?t want to (be here|live|go on)\b/i,
      /\bcan'?t (go on|cope any ?more|take (it|this) any ?more|keep (myself )?safe)\b/i,
      /\bself[- ]?harm/i,
      /\b(hurt|harm|cut)(ting)? my ?self\b/i,
      /\boverdos/i,
      /\bnot safe\b/i,
      /\bin danger\b/i,
    ],
  ],
  [
    "chest",
    [
      /\bche?st\s*(pain|pian|pains|ache|hurts?|hurting|tightness|pressure|discomfort)/i,
      /\b(pain|tightness|pressure|crushing|heaviness)\s+(in|across|on)\s+(my|his|her|their|the)\s+chest/i,
      /\btight\s+chest\b/i,
      /\bheart\s*attack/i,
    ],
  ],
  [
    "stroke",
    [
      /\bstroke\b(?!\s+(rehab|recovery|support group|survivor))/i,
      /\b(face|mouth|smile)\s+(is\s+)?(droop|drop|fall|fell|lopsided)/i,
      /\b(droop|drooping|dropped|fallen)\s+(face|mouth|side of (my|his|her|their) face)/i,
      /\bslurr?(ed|ing)\s+(speech|words)\b/i,
      /\b(can'?t|cannot|unable to)\s+(lift|raise|move)\s+(my|his|her|their|one)\s+arm/i,
      /\b(sudden\w*\s+)?(numb|weak)\w*\s+(on\s+)?one side\b/i,
    ],
  ],
  [
    "breathing",
    [
      /\b(can'?t|cannot|struggling to|unable to|hard to)\s+breathe?\b/i,
      /\bnot breathing\b/i,
      /\bgasping\b/i,
      /\bchok(e|ing)\b/i,
      /\b(can'?t|cannot)\s+(get|say)\s+(my\s+)?words\s+out\b/i,
      /\bturning blue|lips (are |look )?blue\b/i,
    ],
  ],
  [
    "anaphylaxis",
    [/\banaphyla/i, /\b(throat|tongue|lips?|face)\s+(is\s+|are\s+)?(swell|swollen|closing)/i, /\bepi-?pen\b/i, /\bsevere allergic reaction\b/i],
  ],
  [
    "general",
    [/\bunconscious\b/i, /\b(won'?t|can'?t|not) wake (up)?\b/i, /\bseizure (won'?t|not) stop/i, /(?<!non[- ]?)\bemergency\b/i],
  ],
  [
    "joint",
    [
      /\bseptic arthritis\b/i,
      /\bjoint infection\b/i,
      /\b(hot|red|warm)\b[^.?!]{0,30}\bswollen\b[^.?!]{0,20}\b(joint|knee|hip|ankle|elbow|wrist|shoulder)\b/i,
      /\bswollen\b[^.?!]{0,20}\b(hot|red|warm)\b[^.?!]{0,20}\b(joint|knee|hip|ankle|elbow|wrist|shoulder)\b/i,
      /\b(joint|knee|hip|ankle|elbow|wrist|shoulder)\b[^.?!]{0,20}\b(hot|red|warm)\b[^.?!]{0,15}\bswollen\b/i,
      /\b(joint|knee|hip|ankle|elbow|wrist|shoulder)\b[^.?!]{0,20}\bswollen\b[^.?!]{0,15}\b(hot|red|warm)\b/i,
    ],
  ],
];

const FUNERAL = [
  /\bgrie(f|ve|ving)\b/i,
  /\bbereave/i,
  /\bfuneral/i,
  /\bcremat/i,
  /\bburial\b/i,
  /\bpassed away\b/i,
  /\b(died|death of|lost my (mum|dad|mother|father|husband|wife|partner|son|daughter|child|baby|friend))\b/i,
  /\bmourn/i,
  /\bundertaker/i,
  /\bwill and probate|\bprobate\b/i,
];

export type GuardResult = { kind: "crisis"; topic: EmergencyTopic } | { kind: "funeral" } | null;

export function checkGuards(message: string): GuardResult {
  for (const [topic, patterns] of RULES) if (patterns.some((r) => r.test(message))) return { kind: "crisis", topic };
  if (FUNERAL.some((r) => r.test(message))) return { kind: "funeral" };
  return null;
}

export type CallButton = "999" | "111" | "116123";
export type EmergencyMessage = { title: string; lines: string[]; calls: CallButton[] };

const LIMITS = "This helper cannot assess an emergency, monitor you or call an ambulance. If you are unsure, get help anyway.";

/** Approved wording, based on NHS guidance. Review before launch and whenever NHS wording changes. */
export const EMERGENCY_MESSAGES: Record<EmergencyTopic, EmergencyMessage> = {
  mental: {
    title: "Feeling suicidal or need urgent help?",
    lines: [
      "If a life is at risk, or you or someone else cannot keep safe, call 999 or go to A&E now.",
      "For urgent mental health help in England, call NHS 111 and choose the mental health option.",
      "Samaritans are there to listen, day or night: call 116 123 free.",
      "Hadamley is an information service, not a crisis or counselling service.",
    ],
    calls: ["999", "111", "116123"],
  },
  chest: {
    title: "Chest pain can be an emergency",
    lines: [
      "Call 999 now if the chest pain is sudden and does not go away, spreads to the arms, neck, jaw, stomach or back, or comes with sweating, feeling sick, light-headedness or breathlessness.",
      "Do not wait to see if it passes, and do not put it down to anxiety or another condition you already have.",
      "For other chest pain, contact NHS 111 or your GP the same day.",
      LIMITS,
    ],
    calls: ["999", "111"],
  },
  stroke: {
    title: "These can be signs of a stroke",
    lines: [
      "Call 999 straight away for any one of these: the face has dropped on one side, they cannot lift both arms and keep them there, or their speech is slurred or muddled.",
      "Call 999 even if the signs have stopped. Do not drive yourself to A&E.",
      LIMITS,
    ],
    calls: ["999"],
  },
  breathing: {
    title: "Severe breathing difficulty is an emergency",
    lines: [
      "Call 999 if someone is gasping, choking, cannot get their words out, or their lips or skin are turning blue or grey.",
      "For breathlessness that is new or getting worse but not severe, contact NHS 111 or your GP the same day.",
      LIMITS,
    ],
    calls: ["999", "111"],
  },
  anaphylaxis: {
    title: "This could be anaphylaxis",
    lines: [
      "Call 999 now if there is swelling of the lips, tongue or throat, trouble breathing or swallowing, or sudden faintness after a possible allergic trigger.",
      "Use an adrenaline auto-injector if one has been prescribed, then call 999.",
      LIMITS,
    ],
    calls: ["999"],
  },
  general: {
    title: "If this is an emergency",
    lines: ["Call 999 if someone is unconscious, will not wake up, is having a seizure that will not stop, or their life may be at risk.", "For urgent help that is not life-threatening, call NHS 111.", LIMITS],
    calls: ["999", "111"],
  },
  joint: {
    title: "A hot, swollen joint needs urgent assessment",
    lines: [
      "A sudden, very painful joint that is swollen, hot, or hard to move or put weight on can be a joint infection. Contact NHS 111 or your GP the same day. A high temperature is not always present.",
      "Do not assume it is a normal flare or gout. Call 999 if the person seems very unwell, confused or is struggling to breathe.",
      LIMITS,
    ],
    calls: ["111", "999"],
  },
};
