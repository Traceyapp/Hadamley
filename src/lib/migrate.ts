import type { Database, NoticeEvent, Post } from "./types";

/**
 * Brings older data files up to date. Version 2 adds accordion sections,
 * news posts and events (with sample content so the noticeboard isn't empty).
 */
export const DB_VERSION = 2;

const T = "2026-10-20T09:00:00.000Z";

export const SAMPLE_POSTS: Post[] = [
  {
    id: "post-welcome",
    slug: "welcome-to-hadamley",
    title: "Welcome to the new Hadamley",
    summary: "A clearer way to find local support for long term conditions, disability and mental health in Havering and Brentwood.",
    body: "<p>Hadamley brings checked, local information together in one place. Every service in the directory shows when it was last checked, and you can tell us if anything has changed.</p><p>If you can't find what you need, try asking the Hadamley helper in your own words.</p>",
    status: "published",
    publishedAt: "2026-10-20",
    updatedAt: T,
  },
  {
    id: "post-winter",
    slug: "getting-ready-for-winter",
    title: "Getting ready for winter with a long term condition",
    summary: "Practical steps for the colder months, from repeat prescriptions to keeping warm and staying connected.",
    body: "<h2>Plan your prescriptions</h2><p>Order repeat prescriptions early, especially before bank holidays.</p><h2>Keep warm</h2><p>Cold weather can make some conditions harder to manage. Ask your council about help with heating costs.</p><h2>Stay connected</h2><p>Shorter days can affect mood. Local groups in the Mental Health section meet all year round.</p>",
    status: "published",
    publishedAt: "2026-10-14",
    updatedAt: T,
  },
];

export const SAMPLE_EVENTS: NoticeEvent[] = [
  {
    id: "event-dropin",
    slug: "wellbeing-drop-in-hornchurch",
    title: "Wellbeing drop-in",
    summary: "An informal morning to chat, share tips and find out about local support. No booking needed.",
    body: "<p>Come along for a cup of tea and a friendly chat. Volunteers can help you find local services.</p>",
    startsAt: "2026-11-05T10:00",
    endsAt: "2026-11-05T12:00",
    location: "Community hall, High Street, Hornchurch",
    online: false,
    cost: "Free",
    bookingUrl: "",
    status: "published",
    updatedAt: T,
  },
  {
    id: "event-carers",
    slug: "carers-online-session",
    title: "Online session for unpaid carers",
    summary: "An hour on looking after yourself while caring for someone, with time for questions.",
    body: "<p>Join from home on a phone, tablet or computer. The link is sent when you register.</p>",
    startsAt: "2026-11-18T18:30",
    endsAt: "2026-11-18T19:30",
    location: "Online",
    online: true,
    cost: "Free",
    bookingUrl: "https://example.org/carers-session",
    status: "published",
    updatedAt: T,
  },
];

export function migrate(db: Database): boolean {
  let changed = false;
  if (!Array.isArray(db.posts)) ((db.posts = []), (changed = true));
  if (!Array.isArray(db.events)) ((db.events = []), (changed = true));
  for (const p of db.pages) if (!Array.isArray(p.sections)) ((p.sections = []), (changed = true));

  if ((db.version ?? 1) < 2) {
    db.posts.push(...SAMPLE_POSTS.filter((s) => !db.posts.some((p) => p.id === s.id)));
    db.events.push(...SAMPLE_EVENTS.filter((s) => !db.events.some((e) => e.id === s.id)));
    const physio = db.pages.find((p) => p.id === "p-physio");
    if (physio && !physio.sections?.length) {
      physio.sections = [
        {
          id: "s-physio-wait",
          heading: "How long will I wait?",
          body: "<p>Waiting times change often. The service can tell you its current wait when you refer. If your symptoms get worse while you wait, contact your GP or call NHS 111.</p>",
          resourceIds: [],
        },
        {
          id: "s-physio-prepare",
          heading: "What should I bring to my first appointment?",
          body: "<p>Wear comfortable clothes you can move in, and bring a list of your medicines. It can help to note when your pain is better or worse.</p>",
          resourceIds: ["r-appointment", "r-symptoms"],
        },
        {
          id: "s-physio-private",
          heading: "How do I check a private physiotherapist?",
          body: '<p>All physiotherapists in the UK must be registered with the Health and Care Professions Council (HCPC). You can search the register on the <a href="https://www.hcpc-uk.org/check-the-register/">HCPC website</a>.</p>',
          resourceIds: [],
        },
      ];
    }
    db.version = 2;
    changed = true;
  }
  return changed;
}
