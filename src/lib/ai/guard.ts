/**
 * Fixed rules that run BEFORE any retrieval or model call.
 * Crisis wording always wins over everything else.
 */

const CRISIS = [
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
  /\b(chest pain|can'?t breathe|not breathing|stroke symptoms|unconscious|heart attack)\b/i,
  /(?<!non[- ]?)\bemergency\b/i,
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

export type GuardResult = { kind: "crisis" } | { kind: "funeral" } | null;

export function checkGuards(message: string): GuardResult {
  if (CRISIS.some((r) => r.test(message))) return { kind: "crisis" };
  if (FUNERAL.some((r) => r.test(message))) return { kind: "funeral" };
  return null;
}

export const CRISIS_MESSAGE = {
  title: "If you need help now",
  lines: [
    "For urgent mental health help, call NHS 111 and choose the mental health option.",
    "If a life is at risk, or you or someone else cannot stay safe, call 999 or go to A&E now.",
  ],
};
