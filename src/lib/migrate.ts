import fs from "node:fs";
import path from "node:path";
import type { Database, NoticeEvent, Post } from "./types";
import { UPLOAD_DIR } from "./db";
import { importLibrary } from "./library";
import { HEALTH_DRAFTS } from "./content";
import { DRAFTED_BY } from "./content/helpers";
import { CHRONIC_BODY, CHRONIC_SUMMARY, conditionHeadings } from "./content/chronic-illness";
import { applyTraceyOct25 } from "./content/tracey-oct25";

/**
 * Brings older data files up to date. Version 2 adds accordion sections,
 * news posts and events (with sample content so the noticeboard isn't empty).
 * Version 3 adds the cookie notice page.
 * Version 4 brings in Tracey's own About and Contact wording (only where the
 * page still holds our seed draft) and her contact email.
 * Version 6 follows her print materials: "Living with chronic illness" and the
 * "Free printable library" (again only on untouched seed pages).
 * Version 7 marks accordion sections on the health pages as health information,
 * so each one ends with the full medical disclaimer.
 * Version 8 loads Tracey's printable library and takes down our one-page
 * placeholder downloads (only if they are still the untouched placeholders).
 * Version 9 removes the mortuary signpost colouring page, which was in the
 * collection by mistake.
 * Version 10 adds the health content drafted from Tracey's content brief, as
 * drafts for her to review: conditions A to Z, fibromyalgia, lupus, arthritis,
 * mental health, your rights, and benefits. Pages already present are left alone.
 * Version 11 adds the tender-point explanation and diagram to the fibromyalgia
 * draft, if Tracey hasn't edited that page yet.
 * Version 12 follows Tracey's feedback of 25 October: medicine sections link to
 * the NHS pages instead of saying information is being prepared, and the
 * tender-point diagram is taken out until she supplies her own. It refreshes
 * every health draft she hasn't edited yet.
 * Version 13 follows the Chronic Illness Support brief of 25 October: Tracey's
 * introduction and the 22 condition accordion headings (wording to follow).
 * Version 14 removes the sample content before launch: the example outdated
 * report, the example news posts and events (unless Tracey edited them), and
 * the hidden one-page placeholder downloads and their files.
 * Version 15 adds Tracey's wording of 25 October: 17 condition accordions (A to M)
 * and the full Understanding fibromyalgia page (still a draft for her to publish).
 * Version 16 follows the design notes of 27 October: Mobility, Daily Living and
 * Transport moves under Chronic Illness ("Mobility & practical help"), so it
 * leaves the main menu. Its pages keep their addresses.
 */
export const DB_VERSION = 16;

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

const ABOUT_V4 = `<p>Hadamley Information Services was founded by Tracey Finch, drawing on personal experience of living with chronic illness and trying to find the right information and support.</p><p>Our aim is to make that search easier. We bring together information about mental health, chronic illness and everyday wellbeing, alongside free printable resources for individuals, families and professionals.</p><p>We signpost to NHS services, charities, community organisations and private providers. Our resources are free to access; services offered by other organisations may have their own charges.</p><p>Hadamley provides information and practical resources. We do not provide counselling, diagnosis or medical treatment.</p><h2>About the founder</h2><p>My name is Tracey Finch, and I founded Hadamley Information Services.</p><p>Living with chronic illness has shown me how difficult it can be to find information and support, particularly when you're tired, in pain or unsure where to start. Finding out what is available can take energy you simply haven't got.</p><p>My work on The Funeral Companion helped shape the idea for Hadamley: a place bringing together clear information, useful resources and links to support across mental health, chronic illness and everyday wellbeing.</p><p>I wanted everything on Hadamley to be free to access, including practical resources people can download and print for themselves or use when supporting others.</p><blockquote><p>I'm building Hadamley from lived experience, with the aim of making the search for information a little easier.</p><p><strong>Tracey Finch, founder</strong></p></blockquote><h2>How we check information</h2><p>Every service in our directory is checked against the provider's own published information before it appears on the site. Each listing shows the date it was last checked, and you can tell us if something has changed using the report link on any listing.</p><h2 id="funeral-companion">Bereavement and funeral support</h2><p>Information about grief, bereavement and funerals is on our sister site, The Funeral Companion.</p>`;

const CONTACT_V4 = `<p>For general enquiries, to suggest a useful resource or to let us know about an incorrect or broken link, please get in touch using the form below.</p><p>This inbox is not monitored continuously. <strong>We cannot provide medical advice or urgent support.</strong> If you need help now, call NHS 111. In an emergency, call 999.</p>`;

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
  if ((db.version ?? 1) < 3) {
    if (!db.pages.some((p) => p.slug === "cookies")) {
      db.pages.push({
        id: "p-cookies",
        slug: "cookies",
        title: "Cookies",
        template: "information",
        section: "cookies",
        parentId: null,
        navOrder: 10,
        showInNav: false,
        summary: "The small files this website stores on your device, and why.",
        body: `<h2>Summary</h2><p>Hadamley uses only the cookies and storage needed to make the website work. We do not use advertising, tracking or analytics cookies, so we don't ask you to accept them.</p><h2>What we store</h2><ul><li><strong>Your text size and theme choice</strong> are saved in your browser so the site looks the way you set it next time. They never leave your device.</li><li><strong>An admin sign-in cookie</strong> is set only for people who manage the website, and only after they sign in.</li></ul><h2>The Hadamley helper</h2><p>The helper does not use cookies. Your questions are not linked to you.</p><h2>Changing your mind</h2><p>You can clear these at any time in your browser settings. The website still works without them; it just won't remember your text size or theme.</p><p><em>[Draft for Tracey to approve.]</em></p>`,
        listingTopics: [],
        sections: [],
        status: "published",
        updatedAt: new Date().toISOString(),
        updatedBy: "Seed content",
      });
    }
    db.version = 3;
    changed = true;
  }

  if ((db.version ?? 1) < 4) {
    const seeded = (id: string) => db.pages.find((p) => p.id === id && p.updatedBy === "Seed content");
    const about = seeded("p-about");
    if (about) {
      about.title = "About Hadamley";
      about.summary = "Founded by Tracey Finch from lived experience, to make finding information and support a little easier.";
      about.body = ABOUT_V4;
    }
    const contact = seeded("p-contact");
    if (contact) {
      contact.title = "Contact us";
      contact.summary = "Get in touch with a general enquiry, to suggest a useful resource, or to report an incorrect or broken link.";
      contact.body = CONTACT_V4;
    }
    const home = seeded("p-home");
    if (home) home.summary = "Free, independent information and printable resources for mental health, chronic illness and everyday wellbeing, with local support in Havering, Romford, Brentwood and nearby.";
    db.settings.contactEmail ??= "support@hadamley.com";
    db.version = 4;
    changed = true;
  }

  if ((db.version ?? 1) < 6) {
    const seeded = (id: string) => db.pages.find((p) => p.id === id && p.updatedBy === "Seed content");
    const chronic = db.pages.find((p) => p.slug === "chronic-illness-support" && p.updatedBy === "Seed content");
    if (chronic) {
      chronic.title = "Living with Chronic Illness";
      chronic.navLabel = "Chronic illness";
    }
    const library = db.pages.find((p) => p.slug === "resources" && p.updatedBy === "Seed content") ?? seeded("p-resources");
    if (library) {
      library.title = "Free printable library";
      library.navLabel = "Printables";
      library.summary = "Journals, trackers, colouring, puzzles, guides and checklists to download and print. Free for individuals, families and professionals.";
    }
    const topic = db.taxa.find((t) => t.slug === "long-term-conditions" && t.name === "Long term conditions");
    if (topic) topic.name = "Chronic illness";
    db.version = 6;
    changed = true;
  }

  if ((db.version ?? 1) < 7) {
    for (const p of db.pages) {
      if (p.section !== "chronic-illness-support" && p.section !== "mental-health-support") continue;
      for (const s of p.sections ?? []) s.health ??= true;
    }
    db.version = 7;
    changed = true;
  }

  if ((db.version ?? 1) < 8) {
    importLibrary(db, UPLOAD_DIR);
    const placeholders = new Set(["r-appointment", "r-symptoms", "r-home-safety", "r-transport"]);
    for (const r of db.resources) if (placeholders.has(r.id) && r.size < 5000) r.status = "draft";
    db.version = 8;
    changed = true;
  }

  if ((db.version ?? 1) < 9) {
    const r = db.resources.find((x) => x.id === "lib-signpost-mortuary");
    if (r) {
      fs.rmSync(path.join(UPLOAD_DIR, path.basename(r.storedName)), { force: true });
      db.resources = db.resources.filter((x) => x.id !== r.id);
      for (const p of db.pages) for (const s of p.sections ?? []) s.resourceIds = s.resourceIds.filter((id) => id !== r.id);
    }
    db.version = 9;
    changed = true;
  }

  if ((db.version ?? 1) < 10) {
    for (const p of HEALTH_DRAFTS) {
      if (db.pages.some((x) => x.id === p.id || x.slug === p.slug)) continue;
      const ok = !p.parentId || db.pages.some((x) => x.id === p.parentId);
      db.pages.push(structuredClone({ ...p, parentId: ok ? p.parentId : null }));
    }
    db.version = 10;
    changed = true;
  }

  if ((db.version ?? 1) < 11) {
    const page = db.pages.find((p) => p.id === "p-fibro" && p.updatedBy === DRAFTED_BY);
    const fresh = HEALTH_DRAFTS.find((p) => p.id === "p-fibro")?.sections?.find((s) => s.id === "fibro-diagnosis");
    const i = page?.sections?.findIndex((s) => s.id === "fibro-diagnosis") ?? -1;
    if (page && fresh && i >= 0) page.sections![i] = structuredClone(fresh);
    db.version = 11;
    changed = true;
  }

  if ((db.version ?? 1) < 12) {
    for (const fresh of HEALTH_DRAFTS) {
      const page = db.pages.find((p) => p.id === fresh.id && p.updatedBy === DRAFTED_BY);
      if (!page) continue;
      page.body = fresh.body;
      page.sections = structuredClone(fresh.sections);
    }
    db.version = 12;
    changed = true;
  }

  if ((db.version ?? 1) < 13) {
    const page = db.pages.find((p) => p.id === "p-ltc");
    if (page) {
      if (page.updatedBy === "Seed content") {
        page.title = "Chronic Illness Support";
        page.summary = CHRONIC_SUMMARY;
        page.body = CHRONIC_BODY;
      }
      const have = new Set((page.sections ?? []).map((s) => s.id));
      page.sections = [...(page.sections ?? []), ...conditionHeadings().filter((s) => !have.has(s.id))];
    }
    db.version = 13;
    changed = true;
  }

  if ((db.version ?? 1) < 14) {
    db.reports = db.reports.filter((r) => r.id !== "rep-sample");
    const samplePosts = new Set(SAMPLE_POSTS.map((p) => p.id));
    db.posts = db.posts.filter((p) => !(samplePosts.has(p.id) && p.updatedAt === T));
    const sampleEvents = new Set(SAMPLE_EVENTS.map((e) => e.id));
    db.events = db.events.filter((e) => !(sampleEvents.has(e.id) && e.updatedAt === T));
    const placeholders = new Set(["r-appointment", "r-symptoms", "r-home-safety", "r-transport"]);
    const gone = db.resources.filter((r) => placeholders.has(r.id) && r.status === "draft" && r.size < 5000);
    for (const r of gone) fs.rmSync(path.join(UPLOAD_DIR, path.basename(r.storedName)), { force: true });
    const goneIds = new Set(gone.map((r) => r.id));
    db.resources = db.resources.filter((r) => !goneIds.has(r.id));
    for (const p of db.pages) for (const s of p.sections ?? []) s.resourceIds = s.resourceIds.filter((id) => !goneIds.has(id));
    db.chunks = db.chunks.filter((c) => !(c.sourceType === "post" && samplePosts.has(c.sourceId)) && !(c.sourceType === "event" && sampleEvents.has(c.sourceId)));
    db.version = 14;
    changed = true;
  }

  if ((db.version ?? 1) < 15) {
    applyTraceyOct25(db.pages, DRAFTED_BY);
    db.version = 15;
    changed = true;
  }

  if ((db.version ?? 1) < 16) {
    const mobility = db.pages.find((p) => p.slug === "mobility-daily-living-transport");
    if (mobility) mobility.showInNav = false;
    db.version = 16;
    changed = true;
  }
  return changed;
}
