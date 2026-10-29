import fs from "node:fs";
import path from "node:path";
import type { Database, Listing, Page, Resource, Taxon } from "./types";
import { hashPassword } from "./password";
import { makePdf } from "./pdf";
import { buildAllChunks } from "./ai/chunks";
import { UPLOAD_DIR } from "./db";
import { migrate } from "./migrate";

/**
 * Starter content.
 *
 * Page copy is a working draft for Tracey to replace or approve.
 * Listings are SAMPLE records that show every field and state in the
 * workflow. Phone numbers use Ofcom's reserved drama ranges and websites
 * use example.org, so nothing here can be mistaken for a real contact.
 * Load the 14 content-pack listings through the admin area.
 */

const T = "2026-10-12T09:00:00.000Z";

function page(p: Partial<Page> & Pick<Page, "id" | "slug" | "title" | "template" | "section" | "summary" | "body">): Page {
  return {
    navLabel: undefined,
    parentId: null,
    navOrder: 0,
    showInNav: false,
    listingTopics: [],
    status: "published",
    updatedAt: T,
    updatedBy: "Seed content",
    ...p,
  };
}

const taxa: Taxon[] = [
  ["long-term-conditions", "Chronic illness"],
  ["disability-rehab", "Disability and rehabilitation"],
  ["physiotherapy", "Physiotherapy and movement"],
  ["occupational-therapy", "Occupational therapy"],
  ["hospitals-clinics", "Hospitals and clinics"],
  ["mental-health", "Mental health and wellbeing"],
  ["equipment", "Mobility aids and equipment"],
  ["transport", "Accessible transport"],
  ["assessments-costs", "Assessments and help with costs"],
].map(([slug, name], i) => ({ id: `t-${slug}`, slug, name, type: "topic" as const, parentId: null, order: i }));

taxa.push(
  ...[
    ["havering", "Havering (borough-wide)"],
    ["romford", "Romford"],
    ["hornchurch", "Hornchurch"],
    ["upminster", "Upminster"],
    ["rainham", "Rainham"],
    ["brentwood", "Brentwood"],
    ["online-national", "Online or UK-wide"],
  ].map(([slug, name], i) => ({ id: `a-${slug}`, slug, name, type: "area" as const, parentId: null, order: i })),
);

const pages: Page[] = [
  page({
    id: "p-home",
    slug: "",
    title: "Home",
    template: "home",
    section: "home",
    summary:
      "Clear, local information for people living with long term conditions, disability and mental health needs in Havering, Romford, Brentwood and nearby.",
    body: "<p>Hadamley brings together trusted local information in one calm place, so you can find the right support without searching through dozens of websites. We check every listing and show when it was last checked.</p>",
  }),

  // ---------- Living with Long Term Conditions ----------
  page({
    id: "p-ltc",
    slug: "chronic-illness-support",
    title: "Living with Chronic Illness",
    navLabel: "Chronic illness",
    template: "section",
    section: "chronic-illness-support",
    navOrder: 1,
    showInNav: true,
    listingTopics: ["long-term-conditions", "disability-rehab"],
    summary:
      "Support for living well with a long term condition, disability or after illness or injury, from therapy and rehabilitation to hospital care.",
    body: `
<h2>Where to start</h2>
<p>Your GP practice is usually the first step. They can review your condition, refer you to specialist services and tell you what is available in your area. If you have a care plan, bring it with you to appointments so everyone works from the same information.</p>
<p>Many services in this section need a referral from a GP or another professional. Some accept self-referral. Each listing tells you exactly what the service itself says about referral, so you know before you call.</p>
<h2>Disability and rehabilitation</h2>
<p>Rehabilitation helps you recover strength, movement and independence after illness, injury or surgery, or when a condition changes. It can include physiotherapy, occupational therapy, speech and language therapy and support to return to work or daily routines.</p>
<ul>
<li>Ask your GP or hospital team whether a rehabilitation referral is right for you.</li>
<li>Some community groups run gentle exercise or condition-specific sessions.</li>
<li>Adaptations and equipment can make home life safer. See <a href="/mobility-daily-living-transport">Mobility, Daily Living and Transport</a>.</li>
</ul>
<h2>Looking after yourself</h2>
<p>Living with a long term condition can be tiring and stressful. It is normal to have difficult days. If your mood is low or you feel anxious most of the time, the <a href="/mental-health-support">Mental Health and Wellbeing</a> section lists local support, including services you can contact yourself.</p>
<h2>If you care for someone</h2>
<p>If you look after a family member or friend, you may be entitled to a carer's assessment from your local council. It looks at what support you need to keep caring and to look after your own health. See <a href="/mobility-daily-living-transport/assessments-and-costs">Assessments, advice and help with costs</a>.</p>`,
  }),
  page({
    id: "p-physio",
    slug: "physiotherapy",
    title: "Physiotherapy and movement",
    template: "information",
    section: "chronic-illness-support",
    parentId: "p-ltc",
    navOrder: 1,
    showInNav: true,
    listingTopics: ["physiotherapy"],
    summary: "How physiotherapy can help, how to access NHS and private physiotherapy locally, and what to ask before you book.",
    body: `
<h2>How physiotherapy can help</h2>
<p>Physiotherapists help people improve movement, manage pain and stay active. They work with back and joint problems, recovery after surgery or a fall, neurological conditions such as stroke or Parkinson's, and breathing conditions.</p>
<h2>Getting NHS physiotherapy</h2>
<p>Routes into NHS physiotherapy differ between services. Some accept self-referral for certain problems. Others only accept a referral from your GP, a hospital team or another professional. Check each listing below: it shows exactly what the service says.</p>
<ul>
<li>If you are registered with a GP in Havering, some community services may accept you directly.</li>
<li>If you have just left hospital, your hospital team may already have referred you. Ask them before you contact a service.</li>
<li>Waiting times vary. If your symptoms get worse while you wait, contact your GP or call NHS 111.</li>
</ul>
<h2>Private physiotherapy</h2>
<p>Private physiotherapists in the UK must be registered with the Health and Care Professions Council (HCPC). You can check a physiotherapist's registration on the HCPC website before you book.</p>
<h2>Questions to ask before you book</h2>
<ul>
<li>Do you treat my condition, and do I need a referral?</li>
<li>Do you offer home visits or online sessions?</li>
<li>What does the first appointment cost, and what about follow-ups?</li>
<li>Is the building accessible, and is there parking nearby?</li>
</ul>`,
  }),
  page({
    id: "p-ot",
    slug: "occupational-therapy",
    title: "Occupational therapy and daily living",
    navLabel: "Occupational therapy",
    template: "information",
    section: "chronic-illness-support",
    parentId: "p-ltc",
    navOrder: 2,
    showInNav: true,
    listingTopics: ["occupational-therapy"],
    summary: "What occupational therapists do, how to get an assessment through the council, NHS or privately, and what to expect.",
    body: `
<h2>What occupational therapists do</h2>
<p>Occupational therapists (OTs) help you carry on with the everyday activities that matter to you, such as washing, dressing, cooking, getting in and out of bed, or getting back to work. They look at the task, your health and your home, and suggest changes, equipment or new ways of doing things.</p>
<h2>Ways to get an OT assessment</h2>
<h3>Through the council</h3>
<p>Council adult social care teams employ OTs who can assess your needs at home. This is often the route for equipment, minor adaptations such as grab rails, and larger changes funded through a Disabled Facilities Grant.</p>
<h3>Through the NHS</h3>
<p>Hospital and community health teams include OTs. You are usually referred by your GP or hospital team, often when you are leaving hospital or after a change in your condition.</p>
<h3>Privately</h3>
<p>Private OTs can often see you sooner. Check they are registered with the Health and Care Professions Council (HCPC). Fees vary, so always confirm the cost in writing before you book.</p>
<h2>What to expect at an assessment</h2>
<ul>
<li>A conversation about what you find hard and what you would like to do.</li>
<li>Watching you do some everyday tasks, if you are comfortable.</li>
<li>A look at your home layout, stairs, bathroom and entrances.</li>
<li>Recommendations, which may include equipment, adaptations or referrals.</li>
</ul>`,
  }),
  page({
    id: "p-hosp",
    slug: "hospitals-and-clinics",
    title: "Hospitals and specialist clinics",
    navLabel: "Hospitals and clinics",
    template: "information",
    section: "chronic-illness-support",
    parentId: "p-ltc",
    navOrder: 3,
    showInNav: true,
    listingTopics: ["hospitals-clinics"],
    summary: "Getting referred to hospital and specialist clinics, preparing for appointments, and where to go if you have a concern.",
    body: `
<h2>Getting referred</h2>
<p>Most hospital outpatient and specialist clinic appointments start with a referral from your GP. In England you can often choose which hospital or clinic you are referred to. Ask your GP about your options.</p>
<h2>Preparing for an appointment</h2>
<ul>
<li>Write down your questions and any changes in your symptoms.</li>
<li>Bring a list of your medicines, or the boxes.</li>
<li>Ask if you can bring someone with you for support.</li>
<li>Check how to get there. If you cannot travel because of your health, you may be eligible for patient transport. See <a href="/mobility-daily-living-transport/transport">Accessible transport</a>.</li>
</ul>
<h2>If you have a concern or compliment</h2>
<p>Every NHS hospital has a Patient Advice and Liaison Service (PALS). PALS can help with questions, concerns or problems with your care, and explain how to make a formal complaint if you want to.</p>`,
  }),

  // ---------- Mental Health ----------
  page({
    id: "p-mh",
    slug: "mental-health-support",
    title: "Mental Health and Wellbeing",
    navLabel: "Mental health",
    template: "section",
    section: "mental-health-support",
    navOrder: 2,
    showInNav: true,
    listingTopics: ["mental-health"],
    summary: "Local and national support for your mental health and wellbeing, including services you can contact yourself.",
    body: `
<h2>Talking therapies</h2>
<p>NHS Talking Therapies services help with common problems such as anxiety, low mood, stress and depression. In England you can usually refer yourself without seeing your GP first. Each service sets its own age range, so check the listing.</p>
<h2>Talking to your GP</h2>
<p>Your GP can talk through how you are feeling, discuss treatment options and refer you to specialist mental health services if needed. If it feels hard to start the conversation, it can help to write down a few points before your appointment.</p>
<h2>Community and peer support</h2>
<p>Local groups offer a space to talk with people who understand. Some run drop-ins, others offer phone or online support. You do not usually need a referral.</p>
<h2>Looking after your wellbeing</h2>
<ul>
<li>Keep in touch with people you trust, even briefly.</li>
<li>Small amounts of movement and time outdoors can help.</li>
<li>Try to keep a regular sleep routine.</li>
<li>Be kind to yourself on harder days. Living with a health condition is demanding.</li>
</ul>`,
  }),

  // ---------- Mobility ----------
  page({
    id: "p-mob",
    slug: "mobility-daily-living-transport",
    title: "Mobility, Daily Living and Transport",
    navLabel: "Mobility and transport",
    template: "section",
    section: "mobility-daily-living-transport",
    navOrder: 3,
    showInNav: true,
    summary: "Equipment, accessible transport and help with assessments and costs, so you can stay independent at home and get out and about.",
    body: `
<h2>About this section</h2>
<p>This section covers the practical side of living with a health condition or disability: equipment and aids for daily living, getting around, and the assessments and grants that can help with costs.</p>
<p>If you are not sure where to start, an occupational therapy assessment is often the best first step. It can lead to equipment, adaptations and advice tailored to your home.</p>`,
  }),
  page({
    id: "p-equip",
    slug: "mobility-daily-living-transport/equipment",
    title: "Mobility aids and equipment",
    template: "information",
    section: "mobility-daily-living-transport",
    parentId: "p-mob",
    navOrder: 1,
    showInNav: true,
    listingTopics: ["equipment"],
    summary: "Borrowing, hiring and buying mobility aids and daily living equipment, and how to make sure it is right for you.",
    body: `
<h2>Borrowing equipment</h2>
<p>Councils and the NHS lend equipment such as walking frames, bath seats, raised toilet seats and hospital beds, usually after an assessment by an occupational therapist or another professional. Ask your GP, hospital team or council adult social care team.</p>
<h2>Hiring for a short time</h2>
<p>Short-term hire can help after an operation, during a visit or for a holiday. Check what is included: delivery, collection, servicing and what happens if something breaks.</p>
<h2>Buying equipment</h2>
<ul>
<li>Try before you buy where you can. Some suppliers have showrooms.</li>
<li>If you have a long term illness or disability, you may not have to pay VAT on some equipment. Ask the supplier about VAT relief.</li>
<li>For larger items such as stairlifts or riser beds, get an OT assessment first.</li>
</ul>
<h2>Staying safe</h2>
<p>Ask for equipment to be fitted and adjusted to you. If something no longer feels safe or your needs change, ask for a review.</p>`,
  }),
  page({
    id: "p-transport",
    slug: "mobility-daily-living-transport/transport",
    title: "Accessible transport",
    template: "information",
    section: "mobility-daily-living-transport",
    parentId: "p-mob",
    navOrder: 2,
    showInNav: true,
    listingTopics: ["transport"],
    summary: "Community transport, accessible taxis, NHS patient transport, and travel passes and parking for disabled people.",
    body: `
<h2>Community transport</h2>
<p>Community transport schemes offer door-to-door journeys for people who find public transport difficult. You usually need to register first and book in advance.</p>
<h2>Accessible taxis</h2>
<p>Some taxi firms have wheelchair accessible vehicles. When you book, ask whether you can stay in your wheelchair for the journey and whether the driver can help you in and out. Our listings only say this when the company has confirmed it.</p>
<h2>NHS non-emergency patient transport</h2>
<p>If your medical condition means you cannot get to a hospital appointment any other way, you may be eligible for free patient transport. Eligibility is based on medical need, not on whether you have a car. Ask your GP or the hospital department when the appointment is booked.</p>
<h2>Travel passes and parking</h2>
<ul>
<li>A Blue Badge lets you park closer to where you need to go. Apply through your local council.</li>
<li>If you live in a London borough such as Havering, you may be eligible for a Disabled Persons Freedom Pass for free travel.</li>
<li>If you live in Brentwood, ask Essex County Council about a disabled person's bus pass.</li>
</ul>`,
  }),
  page({
    id: "p-assess",
    slug: "mobility-daily-living-transport/assessments-and-costs",
    title: "Assessments, advice and help with costs",
    navLabel: "Assessments and costs",
    template: "information",
    section: "mobility-daily-living-transport",
    parentId: "p-mob",
    navOrder: 3,
    showInNav: true,
    listingTopics: ["assessments-costs"],
    summary: "Care needs and carer's assessments, wheelchair services, grants for adaptations, and where to get advice on benefits.",
    body: `
<h2>Care needs assessment</h2>
<p>Anyone who appears to need care and support can ask their local council for a free needs assessment. It looks at what you find difficult day to day and what would help. Contact your council's adult social care team.</p>
<h2>Carer's assessment</h2>
<p>If you care for someone, you can ask for your own assessment, even if the person you care for has not had one.</p>
<h2>Wheelchair services</h2>
<p>NHS wheelchair services assess people with a long term need for a wheelchair. You usually need a referral from your GP, therapist or hospital team.</p>
<h2>Grants for home adaptations</h2>
<p>A Disabled Facilities Grant from your council can help pay for changes such as a level-access shower, ramps or a stairlift. Grants for adults are means tested. An OT assessment is usually needed first.</p>
<h2>Benefits advice</h2>
<p>You may be entitled to benefits such as Personal Independence Payment (PIP) or Attendance Allowance. Free, independent advice services can help you check what you can claim and support you with forms.</p>`,
  }),

  // ---------- Directory, resources, supporting ----------
  page({
    id: "p-find",
    slug: "find-support",
    title: "Find Support",
    template: "directory",
    section: "find-support",
    navOrder: 4,
    showInNav: true,
    summary: "Search local services by what you need, where you live and how you want to be seen. Every listing shows when it was last checked.",
    body: "<p>Use the search and filters to narrow the list. Referral details are shown exactly as the service describes them.</p>",
  }),
  page({
    id: "p-res",
    slug: "resources",
    title: "Guides & Resources",
    navLabel: "Guides & Resources",
    template: "resources",
    section: "resources",
    navOrder: 5,
    showInNav: true,
    summary: "Journals, trackers, colouring, puzzles, guides and checklists to download and print. Free for individuals, families and professionals.",
    body: "<p>All downloads are free. You can print them or fill them in on screen.</p>",
  }),
  page({
    id: "p-about",
    slug: "about",
    title: "About Hadamley",
    template: "information",
    section: "about",
    navOrder: 6,
    summary: "Who we are, why Hadamley exists and how we check the information on this site.",
    body: `
<h2>Why Hadamley exists</h2>
<p>Finding the right support when you live with a long term condition or disability can mean hours of searching, calling and waiting. Hadamley brings local information together in one place, written clearly, so you can spend less time searching and more time getting help.</p>
<h2>How we check information</h2>
<p>Every service in our directory is checked against the provider's own published information before it appears on the site. Each listing shows the date it was last checked. We review listings regularly, and you can tell us if something has changed using the report link on any listing.</p>
<h2>What we do and do not do</h2>
<p>Hadamley provides information and signposting. We do not provide medical, legal or financial advice, and including a service does not mean we recommend it or work in partnership with it.</p>
<h2 id="funeral-companion">Bereavement and funeral support</h2>
<p>Information about grief, bereavement and funerals is on our sister site, The Funeral Companion.</p>`,
  }),
  page({
    id: "p-contact",
    slug: "contact",
    title: "Contact",
    template: "information",
    section: "contact",
    navOrder: 7,
    summary: "Get in touch about the website, suggest a service, or tell us about something that has changed.",
    body: `
<p>We read every message. We aim to reply within five working days.</p>
<p><strong>We cannot give medical advice or respond to urgent requests.</strong> If you need help now, call NHS 111. In an emergency, call 999.</p>`,
  }),
  page({
    id: "p-privacy",
    slug: "privacy",
    title: "Privacy",
    template: "information",
    section: "privacy",
    navOrder: 8,
    summary: "How Hadamley handles information when you use this website.",
    body: `
<h2>Summary</h2>
<p>You do not need an account to use Hadamley. We do not ask for or store information that identifies you, unless you choose to send it to us through a form.</p>
<h2>Forms</h2>
<p>If you use the contact form or report outdated details, we store what you send so we can act on it. Your contact details are optional on the report form. We delete messages once they are dealt with, and at the latest after 12 months.</p>
<h2>The AI helper</h2>
<p>The helper answers questions using only information published on this website. Please do not type personal details such as your name, address or medical history. Questions are not linked to you. <em>[Tracey to confirm whether anonymised questions are kept to improve the service.]</em></p>
<h2>Cookies</h2>
<p>We use only the cookies needed to run the site and remember your text size preference. We do not use advertising or tracking cookies.</p>
<h2>Contact</h2>
<p>To ask about your information, use the <a href="/contact">contact form</a>.</p>`,
  }),
  page({
    id: "p-access",
    slug: "accessibility",
    title: "Accessibility",
    template: "information",
    section: "accessibility",
    navOrder: 9,
    summary: "Our commitment to making Hadamley usable for everyone, and how to tell us about a problem.",
    body: `
<h2>Our aim</h2>
<p>We want as many people as possible to be able to use this website. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA.</p>
<h2>What you can do on this site</h2>
<ul>
<li>Make text bigger using the text size control at the top of every page, or your browser's zoom up to 400%.</li>
<li>Navigate the whole site using just a keyboard.</li>
<li>Use a screen reader. Pages use clear headings, labels and link text.</li>
<li>Use your device's dark mode setting.</li>
</ul>
<h2>Reporting a problem</h2>
<p>If you find something hard to use, please <a href="/contact">tell us</a>. Say which page and what happened, and we will try to fix it.</p>
<p><em>[Draft statement for Tracey to approve. Update after the pre-launch accessibility check.]</em></p>`,
  }),
];

// ---------------------------------------------------------------------------
// Sample listings
// ---------------------------------------------------------------------------

function listing(l: Partial<Listing> & Pick<Listing, "id" | "name" | "providerType" | "summary">): Listing {
  return {
    description: "",
    agesServed: "",
    eligibility: "",
    referralRoute: "",
    selfReferral: "unconfirmed",
    address: "",
    delivery: [],
    phone: "",
    email: "",
    contactUrl: "",
    website: "",
    fees: "",
    feeConfirmed: true,
    contactConfirmed: true,
    accessibility: "",
    sourceUrls: [],
    dateChecked: "2026-10-01",
    nextReviewDate: "2027-04-01",
    owner: "Tracey",
    status: "approved",
    topicIds: [],
    areaIds: [],
    extras: {},
    internalNotes: "Sample listing. Replace with content pack data.",
    createdAt: T,
    updatedAt: T,
    ...l,
  };
}

const listings: Listing[] = [
  listing({
    id: "havering-community-physiotherapy",
    name: "Havering Community Physiotherapy",
    providerType: "nhs",
    summary: "NHS physiotherapy for adults with muscle, joint and back problems, at local clinics.",
    description:
      "Assessment and treatment for adults with musculoskeletal problems such as back pain, neck pain and joint problems. Treatment may include exercise programmes, advice and group classes.",
    agesServed: "18 and over",
    eligibility: "Adults registered with a GP practice in the London Borough of Havering.",
    referralRoute: "Self-referral accepted for adults registered with a Havering GP, using the online form. GP referral also accepted.",
    selfReferral: "yes",
    address: "Community health centre, Romford RM1",
    delivery: ["clinic", "online"],
    phone: "01632 960 101",
    website: "https://example.org/havering-physio",
    fees: "Free (NHS)",
    accessibility: "Step-free access, accessible toilet, hearing loop at reception.",
    sourceUrls: ["https://example.org/havering-physio/referral"],
    dateChecked: "2026-10-02",
    nextReviewDate: "2027-04-02",
    topicIds: ["t-physiotherapy", "t-disability-rehab"],
    areaIds: ["a-havering", "a-romford"],
  }),
  listing({
    id: "romford-movement-clinic",
    name: "Romford Movement Clinic",
    providerType: "private",
    summary: "Private physiotherapy with evening appointments and home visits across Havering.",
    description: "HCPC-registered physiotherapists offering assessment and treatment for sports injuries, joint pain and recovery after surgery.",
    agesServed: "16 and over",
    eligibility: "Open to anyone. Home visits within Havering only.",
    referralRoute: "Self-referral. Book by phone or online. No GP referral needed.",
    selfReferral: "yes",
    address: "South Street, Romford RM1",
    delivery: ["clinic", "home"],
    phone: "01632 960 214",
    email: "hello@example.org",
    website: "https://example.org/romford-movement",
    fees: "Initial assessment £60. Follow-up £50. Home visits £80.",
    accessibility: "Ground floor treatment rooms. Two steps at entrance with portable ramp on request.",
    sourceUrls: ["https://example.org/romford-movement/prices"],
    dateChecked: "2026-09-24",
    nextReviewDate: "2026-11-05",
    topicIds: ["t-physiotherapy"],
    areaIds: ["a-romford", "a-havering"],
  }),
  listing({
    id: "brentwood-neuro-exercise-group",
    name: "Brentwood Neuro Exercise Group",
    providerType: "charity",
    summary: "Weekly seated and standing exercise classes for people with neurological conditions.",
    description:
      "Gentle group exercise led by a neurological physiotherapist, for people living with conditions such as Parkinson's, MS and stroke. Carers welcome.",
    agesServed: "Adults",
    eligibility: "People with a diagnosed neurological condition living in or near Brentwood.",
    referralRoute: "Professional referral only. Ask your GP, physiotherapist or consultant to refer you.",
    selfReferral: "no",
    address: "Community hall, Brentwood CM14",
    delivery: ["clinic"],
    phone: "01632 960 377",
    website: "https://example.org/brentwood-neuro",
    fees: "£4 per session, suggested donation",
    accessibility: "Level access, accessible parking bays, accessible toilet.",
    dateChecked: "2026-09-18",
    nextReviewDate: "2027-03-18",
    topicIds: ["t-physiotherapy", "t-disability-rehab", "t-long-term-conditions"],
    areaIds: ["a-brentwood"],
  }),
  listing({
    id: "havering-adult-social-care-ot",
    name: "Havering Adult Social Care Occupational Therapy",
    providerType: "council",
    summary: "Council OT assessments at home for equipment, minor adaptations and larger home changes.",
    description:
      "Occupational therapists assess what you find difficult at home and recommend equipment, minor adaptations or larger adaptations, including through a Disabled Facilities Grant.",
    agesServed: "18 and over",
    eligibility: "Havering residents (based on home address).",
    referralRoute: "Contact the council's adult social care front door by phone or online form. Self-referral and referral by family or professionals accepted.",
    selfReferral: "yes",
    address: "Town Hall, Romford RM1",
    delivery: ["home", "phone"],
    phone: "020 7946 0410",
    contactUrl: "https://example.org/havering-asc/contact",
    website: "https://example.org/havering-asc",
    fees: "Assessment is free. Some equipment and adaptations may be charged or means tested.",
    accessibility: "Home visits. Phone line offers interpreters on request.",
    dateChecked: "2026-10-05",
    nextReviewDate: "2027-04-05",
    topicIds: ["t-occupational-therapy", "t-assessments-costs", "t-equipment"],
    areaIds: ["a-havering"],
  }),
  listing({
    id: "ot-at-home-practice",
    name: "OT at Home Practice",
    providerType: "private",
    summary: "Private occupational therapy assessments and reports at home.",
    description: "Independent occupational therapists offering home assessments, equipment advice and reports.",
    agesServed: "All ages",
    eligibility: "Essex and East London.",
    referralRoute: "Self-referral by phone or email.",
    selfReferral: "yes",
    delivery: ["home"],
    phone: "01632 960 552",
    website: "https://example.org/ot-at-home",
    fees: "Home assessment £325 or £375 (two figures published, to confirm with provider)",
    feeConfirmed: false,
    status: "clarification_needed",
    dateChecked: "2026-09-30",
    nextReviewDate: "2026-10-30",
    topicIds: ["t-occupational-therapy"],
    areaIds: ["a-brentwood", "a-havering"],
    internalNotes: "Website shows £325 on one page and £375 on another. Email sent to confirm. Do not publish until fee confirmed.",
  }),
  listing({
    id: "havering-long-term-conditions-clinic",
    name: "Havering Long Term Conditions Clinic",
    providerType: "nhs",
    summary: "Specialist NHS clinic for diabetes and breathing conditions, with nurse-led reviews and education sessions.",
    description:
      "Specialist nurses and therapists support adults with diabetes, COPD and asthma. Includes structured education courses and pulmonary rehabilitation.",
    agesServed: "18 and over",
    eligibility: "Adults registered with a GP practice in Havering.",
    referralRoute: "GP or hospital referral required.",
    selfReferral: "no",
    address: "Outpatients, community hospital, Romford RM7",
    delivery: ["clinic", "phone"],
    phone: "020 7946 0533",
    website: "https://example.org/havering-ltc",
    fees: "Free (NHS)",
    accessibility: "Step-free throughout, wheelchairs available to borrow at main entrance.",
    dateChecked: "2026-09-12",
    nextReviewDate: "2026-11-12",
    topicIds: ["t-long-term-conditions", "t-hospitals-clinics"],
    areaIds: ["a-romford", "a-havering"],
  }),
  listing({
    id: "havering-talking-therapies",
    name: "Havering Talking Therapies (NHS)",
    providerType: "nhs",
    summary: "Free NHS talking therapies for anxiety, low mood, stress and depression.",
    description: "Free, confidential psychological therapies including guided self-help, CBT and counselling, by phone, online or face to face.",
    agesServed: "18 and over or over 18 (conflicting, to confirm)",
    eligibility: "Registered with a Havering GP.",
    referralRoute: "Self-referral online or by phone. GP referral also accepted.",
    selfReferral: "yes",
    delivery: ["clinic", "online", "phone"],
    phone: "020 7946 0612",
    website: "https://example.org/havering-tt",
    fees: "Free (NHS)",
    status: "clarification_needed",
    dateChecked: "2026-10-01",
    nextReviewDate: "2026-10-22",
    topicIds: ["t-mental-health"],
    areaIds: ["a-havering"],
    internalNotes: "Content pack open point: age shown as 'over 18' and '18 and over' in different places. Confirm before approving.",
  }),
  listing({
    id: "havering-wellbeing-hub",
    name: "Havering Wellbeing Hub",
    providerType: "charity",
    summary: "Drop-in peer support, wellbeing groups and a weekly evening phone line.",
    description:
      "A friendly local charity running weekly drop-ins, creative wellbeing groups and a supportive phone line staffed by trained volunteers. No diagnosis needed.",
    agesServed: "18 and over",
    eligibility: "Anyone living in Havering or nearby.",
    referralRoute: "No referral needed. Drop in, or call to book a first chat.",
    selfReferral: "yes",
    address: "High Street, Hornchurch RM12",
    delivery: ["clinic", "phone", "online"],
    phone: "01632 960 688",
    email: "hub@example.org",
    website: "https://example.org/wellbeing-hub",
    fees: "Free",
    accessibility: "Ground floor, step-free, quiet room available.",
    dateChecked: "2026-10-08",
    nextReviewDate: "2027-04-08",
    topicIds: ["t-mental-health"],
    areaIds: ["a-hornchurch", "a-havering"],
  }),
  listing({
    id: "brentwood-mindful-carers",
    name: "Brentwood Carers Wellbeing Circle",
    providerType: "charity",
    summary: "Monthly online and in-person support group for unpaid carers, focused on wellbeing.",
    description: "A relaxed group for people caring for someone with a long term condition or disability. Sessions cover stress, rest and practical tips.",
    agesServed: "18 and over",
    eligibility: "Unpaid carers in Brentwood and surrounding areas.",
    referralRoute: "Self-referral. Email to join the mailing list.",
    selfReferral: "yes",
    address: "Library meeting room, Brentwood CM15",
    delivery: ["clinic", "online"],
    email: "carers@example.org",
    website: "https://example.org/brentwood-carers",
    fees: "Free",
    accessibility: "Lift to first floor meeting room.",
    dateChecked: "2026-09-20",
    nextReviewDate: "2027-03-20",
    topicIds: ["t-mental-health", "t-long-term-conditions"],
    areaIds: ["a-brentwood"],
  }),
  listing({
    id: "havering-community-equipment-service",
    name: "Havering Community Equipment Service",
    providerType: "council",
    summary: "Free loan of daily living and mobility equipment after a professional assessment.",
    description: "Delivers, fits and collects loaned equipment such as walking frames, bath boards, commodes, hospital beds and pressure care.",
    agesServed: "All ages",
    eligibility: "Havering residents assessed as needing equipment by an OT, nurse or other professional.",
    referralRoute: "Professional referral only. Equipment is ordered by the assessing professional.",
    selfReferral: "no",
    delivery: ["home"],
    phone: "020 7946 0745",
    website: "https://example.org/havering-equipment",
    fees: "Free loan",
    extras: {
      deliveryCollection: "Delivered and fitted at home. Free collection when no longer needed.",
      bookingRequirements: "Ordered by your assessing professional. Call to arrange collection or report a fault.",
      hireLoanTerms: "Loaned for as long as you need it. Items are reviewed if your needs change.",
    },
    dateChecked: "2026-10-03",
    nextReviewDate: "2027-04-03",
    topicIds: ["t-equipment"],
    areaIds: ["a-havering"],
  }),
  listing({
    id: "romford-mobility-hire",
    name: "Romford Mobility Hire",
    providerType: "private",
    summary: "Short-term wheelchair and mobility scooter hire, with delivery across Havering and Brentwood.",
    description: "Hire manual and electric wheelchairs, scooters and walking aids by the day or week. Also sells new and reconditioned equipment.",
    agesServed: "All ages",
    eligibility: "Open to anyone.",
    referralRoute: "No referral needed. Book by phone or in store.",
    selfReferral: "yes",
    address: "Victoria Road, Romford RM1",
    delivery: ["clinic", "home"],
    phone: "01632 960 812",
    website: "https://example.org/romford-mobility",
    fees: "Manual wheelchair from £25 per week. Scooter from £60 per week. Refundable deposit required.",
    accessibility: "Level access showroom with try-before-you-buy area.",
    extras: {
      deliveryCollection: "Free collection from store. Delivery and collection within 10 miles for £15 each way.",
      bookingRequirements: "Book at least 48 hours ahead. Photo ID and deposit needed.",
      hireLoanTerms: "Minimum hire one day. Deposit returned when equipment comes back undamaged.",
    },
    dateChecked: "2026-09-27",
    nextReviewDate: "2027-03-27",
    topicIds: ["t-equipment"],
    areaIds: ["a-romford", "a-brentwood"],
  }),
  listing({
    id: "havering-community-transport",
    name: "Havering Community Transport",
    providerType: "charity",
    summary: "Door-to-door minibus journeys for people who find public transport difficult.",
    description: "Wheelchair accessible minibuses for shopping trips, appointments and social activities. Volunteer drivers trained in passenger assistance.",
    agesServed: "All ages",
    eligibility: "Havering residents with a disability or mobility difficulty, or aged 60 and over.",
    referralRoute: "Self-referral. Register by phone before your first journey.",
    selfReferral: "yes",
    delivery: ["phone"],
    phone: "020 7946 0901",
    website: "https://example.org/havering-ct",
    fees: "Annual membership £10. Journeys from £3 each way.",
    extras: {
      bookingRequirements: "Register first, then book at least two working days ahead. Office open weekdays 9am to 4pm.",
      wheelchairAccessible: "yes",
      passengerStaysInWheelchair: "yes",
    },
    dateChecked: "2026-10-06",
    nextReviewDate: "2027-04-06",
    topicIds: ["t-transport"],
    areaIds: ["a-havering", "a-romford", "a-hornchurch", "a-upminster", "a-rainham"],
  }),
  listing({
    id: "eastside-accessible-cars",
    name: "Eastside Accessible Cars",
    providerType: "private",
    summary: "Taxi firm with wheelchair accessible vehicles, covering Romford, Upminster and Brentwood.",
    description: "Local taxi company with a number of rear-ramp accessible vehicles. Airport and hospital runs available.",
    agesServed: "All ages",
    eligibility: "Open to anyone.",
    referralRoute: "Book directly by phone.",
    selfReferral: "yes",
    delivery: ["phone"],
    phone: "01632 960 933",
    website: "https://example.org/eastside-cars",
    fees: "Metered fares. Ask for a quote when booking.",
    extras: {
      bookingRequirements: "Book accessible vehicles 24 hours ahead where possible.",
      wheelchairAccessible: "yes",
      passengerStaysInWheelchair: "unconfirmed",
    },
    dateChecked: "2026-09-15",
    nextReviewDate: "2027-03-15",
    topicIds: ["t-transport"],
    areaIds: ["a-romford", "a-upminster", "a-brentwood"],
  }),
  listing({
    id: "disabled-facilities-grant-havering",
    name: "Disabled Facilities Grant (Havering Council)",
    providerType: "council",
    summary: "Council grant towards home adaptations such as level-access showers, ramps and stairlifts.",
    description: "Helps disabled people of all ages pay for adaptations so they can live safely and independently at home.",
    agesServed: "All ages (means test applies to adults only)",
    eligibility: "Havering homeowners and tenants. An OT assessment is usually required first.",
    referralRoute: "Usually follows a council OT assessment. Contact adult social care to start.",
    selfReferral: "unconfirmed",
    delivery: ["home", "phone"],
    phone: "020 7946 0410",
    website: "https://example.org/havering-dfg",
    fees: "Grant. Adults may need to contribute depending on the means test.",
    dateChecked: "2026-10-05",
    nextReviewDate: "2027-04-05",
    topicIds: ["t-assessments-costs", "t-equipment"],
    areaIds: ["a-havering"],
  }),
];

// ---------------------------------------------------------------------------
// Starter downloads
// ---------------------------------------------------------------------------

const starterFiles: { r: Omit<Resource, "size" | "storedName" | "mime" | "updatedAt">; text: string }[] = [
  {
    r: { id: "r-appointment", title: "Preparing for an appointment", description: "A one-page checklist to help you get the most from GP, hospital and therapy appointments.", kind: "checklist", topicIds: ["t-long-term-conditions", "t-hospitals-clinics"], fileName: "preparing-for-an-appointment.pdf", status: "published" },
    text: "Before the appointment\n[ ] Write down what you want to talk about, most important first.\n[ ] Note any changes in your symptoms and when they started.\n[ ] List your medicines, or bring the boxes.\n[ ] Ask if you can bring someone with you.\n[ ] Check how you will get there and how long it takes.\n\nDuring the appointment\n[ ] Ask the person to explain anything you do not understand.\n[ ] Ask what happens next and who will contact you.\n\nAfter the appointment\n[ ] Write down what was agreed.\n[ ] Put any follow-up dates in your diary.",
  },
  {
    r: { id: "r-symptoms", title: "Symptom and energy diary", description: "Track symptoms, energy and activity over two weeks to spot patterns and share with your care team.", kind: "worksheet", topicIds: ["t-long-term-conditions"], fileName: "symptom-and-energy-diary.pdf", status: "published" },
    text: "Use this diary for two weeks. Each day, note:\n\nDate:\nEnergy (0 to 10):\nMain symptoms and how bad (0 to 10):\nWhat I did today:\nSleep last night (hours, quality):\nAnything that helped:\nAnything that made things worse:\n\nBring the diary to your next appointment.",
  },
  {
    r: { id: "r-home-safety", title: "Home safety and equipment checklist", description: "Walk through each room and note what is difficult, to prepare for an occupational therapy assessment.", kind: "checklist", topicIds: ["t-occupational-therapy", "t-equipment"], fileName: "home-safety-checklist.pdf", status: "published" },
    text: "Entrance: steps, rails, lighting, door width.\nStairs: rails on both sides, lighting, trip hazards.\nBathroom: getting in and out of the bath or shower, toilet height, grab rails.\nBedroom: getting in and out of bed, reaching clothes.\nKitchen: reaching cupboards, carrying hot drinks, standing to cook.\n\nFor each room, note what you find hard and how often. Share this with the occupational therapist.",
  },
  {
    r: { id: "r-transport", title: "Booking accessible transport", description: "Questions to ask when booking a taxi, community transport or patient transport.", kind: "guide", topicIds: ["t-transport"], fileName: "booking-accessible-transport.pdf", status: "published" },
    text: "When you book, ask:\n- Is the vehicle wheelchair accessible?\n- Can I stay in my wheelchair for the journey?\n- Can the driver help me in and out, and to the door?\n- Can someone travel with me?\n- What is the cost, and how do I pay?\n- What happens if my appointment runs late?\n\nFor NHS patient transport, ask your GP or the hospital department when the appointment is made.",
  },
];

export function buildSeed(): Database {
  const uploadDir = UPLOAD_DIR;
  fs.mkdirSync(uploadDir, { recursive: true });

  const resources: Resource[] = starterFiles.map(({ r, text }) => {
    const buf = makePdf(r.title, text);
    const storedName = `${r.id}-${r.fileName}`;
    fs.writeFileSync(path.join(uploadDir, storedName), buf);
    return { ...r, storedName, mime: "application/pdf", size: buf.length, updatedAt: T };
  });

  const admins = [] as Database["admins"];
  const ownerEmail = process.env.ADMIN_OWNER_EMAIL;
  const ownerPw = process.env.ADMIN_OWNER_PASSWORD;
  if (ownerEmail && ownerPw) admins.push({ email: ownerEmail.toLowerCase(), name: "Tracey", role: "owner", passwordHash: hashPassword(ownerPw), createdAt: T });
  const devEmail = process.env.ADMIN_DEV_EMAIL;
  const devPw = process.env.ADMIN_DEV_PASSWORD;
  if (devEmail && devPw) admins.push({ email: devEmail.toLowerCase(), name: "Developer support", role: "developer", passwordHash: hashPassword(devPw), createdAt: T });

  const db: Database = {
    version: 1,
    posts: [],
    events: [],
    pages,
    listings,
    taxa,
    resources,
    reports: [
      {
        id: "rep-sample",
        listingId: "romford-movement-clinic",
        message: "I think their follow-up price went up to £55 last month.",
        contact: "",
        createdAt: "2026-10-14T15:12:00.000Z",
        handled: false,
        handledAt: null,
      },
    ],
    messages: [],
    chunks: [],
    admins,
    uploads: [],
    questions: [],
    settings: {
      funeralCompanionUrl: process.env.FUNERAL_COMPANION_URL || "https://example.com/the-funeral-companion",
      aiLastIndexedAt: null,
      aiLastIndexMs: null,
      aiSpend: { month: new Date().toISOString().slice(0, 7), usd: 0, requests: 0 },
      keepAnonymisedQuestions: false,
    },
  };
  const started = Date.now();
  migrate(db);
  db.chunks = buildAllChunks(db);
  db.settings.aiLastIndexedAt = new Date().toISOString();
  db.settings.aiLastIndexMs = Date.now() - started;
  return db;
}
