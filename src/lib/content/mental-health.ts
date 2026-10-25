import { draftPage, nhs, section, src } from "./helpers";

/** Understanding mental health: introduction, support, who can help, and short condition snapshots. */

const CONDITIONS = nhs("Mental health conditions", "mental-health/conditions/");
const TEAMS = src("Royal College of Psychiatrists: Community mental health services and teams", "https://www.rcpsych.ac.uk/mental-health/treatments-and-wellbeing/mental-health-services-and-teams-in-the-community");

const condition = (id: string, heading: string, body: string, sources = [CONDITIONS]) =>
  section(id, heading, `${body}<p>This is a short introduction, not a way to diagnose yourself. If you are worried about your mental health, your GP is a good first step, and you do not need a diagnosis to ask for help.</p>`, sources);

export const mentalHealthPage = draftPage({
  id: "p-mh-understanding",
  slug: "mental-health-support/understanding-mental-health",
  title: "Understanding mental health",
  navLabel: "Understanding mental health",
  section: "mental-health-support",
  parentId: "p-mh",
  navOrder: 4,
  summary: "Everyone has mental health. What it covers, the support available, who can help, and short introductions to common conditions.",
  body: `<p>Everyone has mental health, just as everyone has physical health. It affects how we feel, think, cope and connect with other people. Some difficulties are short-lived; others involve conditions that need ongoing support and treatment.</p>
<p>Understanding and care have changed over time. In nineteenth- and twentieth-century Britain, many people with serious mental health difficulties were cared for in large institutions known as asylums. Experiences varied: some received support, while others faced restrictive conditions, isolation and inadequate care.</p>
<p>Today, support can include GP care, talking therapies, medication and community mental health teams, with hospital care when needed. There is greater recognition that mental health matters throughout everyday life, although stigma and barriers to care remain.</p>
<p><strong>Having mental health difficulties is nothing to be ashamed of.</strong> Nobody should be ridiculed, dismissed or discriminated against because of their mental health. Everyone deserves to be heard, treated with dignity and helped to find appropriate support. You do not need a diagnosis to ask for help.</p>
<p>See also: <a href="/your-rights">Discrimination and your rights</a> and <a href="/benefits-and-financial-help">Benefits and financial help</a>.</p>
<p class="text-sm">Sources: <a href="https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/mental-health/" target="_blank" rel="noopener">The National Archives</a>, <a href="https://www.rcpsych.ac.uk/about-us/history--art-and-exhibitions/history/our-history/the-early-days" target="_blank" rel="noopener">Royal College of Psychiatrists</a>, <a href="https://www.nhs.uk/every-mind-matters/" target="_blank" rel="noopener">NHS Every Mind Matters</a>.</p>`,
  sections: [
    section(
      "mh-types-of-support",
      "Types of mental health support",
      `<ul>
<li><strong>Your GP:</strong> often the first place to go. They can talk things through, check for physical causes, discuss treatment, and refer you to other services.</li>
<li><strong>Talking therapies and counselling:</strong> talking with a trained professional to understand difficulties and find ways of coping.</li>
<li><strong>NHS Talking Therapies:</strong> free NHS therapy for common problems such as anxiety and depression. In England you can usually refer yourself without seeing your GP first. Each service sets its own waiting times and criteria.</li>
<li><strong>Community and charity support:</strong> groups, helplines and drop-ins run by local and national organisations.</li>
<li><strong>Specialist mental health services:</strong> for more complex or severe difficulties, usually through a referral.</li>
</ul>
<p>Medicines are one option for some people. They are discussed and prescribed by an appropriate professional, such as your GP or a psychiatrist.</p>
<p>See <a href="/find-support?topic=mental-health">Find support</a> for local services.</p>`,
      [nhs("Talking therapies", "tests-and-treatments/talking-therapies/"), nhs("Find NHS Talking Therapies", "nhs-services/mental-health-services/find-nhs-talking-therapies-for-anxiety-and-depression/")],
    ),
    section(
      "mh-who-can-help",
      "Who can help?",
      `<p>The right help depends on your needs, how severe things are, what you prefer and what is available locally. Adult and children's services are different.</p>
<ul>
<li><strong>GP:</strong> often a first contact. Assesses difficulties, checks for physical causes, discusses treatment and referrals, and may prescribe medicines.</li>
<li><strong>Counsellor or psychotherapist:</strong> provides talking therapy to explore difficulties and develop ways of coping. Training and approaches differ.</li>
<li><strong>CBT therapist:</strong> provides cognitive behavioural therapy, a structured talking therapy. Specialist training matters for some conditions, such as OCD.</li>
<li><strong>Clinical or counselling psychologist:</strong> provides psychological assessment and therapies. In the UK they do not usually prescribe medicines.</li>
<li><strong>Psychiatrist:</strong> a medical doctor who specialises in mental health. Assesses, diagnoses and treats, including prescribing when appropriate. Not everyone needs to see a psychiatrist.</li>
<li><strong>Mental health nurse or community psychiatric nurse:</strong> gives ongoing support, coordinates care and helps with treatment and medicine monitoring within their service. Only nurses with an extra qualification can prescribe.</li>
<li><strong>Occupational therapist:</strong> helps with daily routines, meaningful activity, work and independence.</li>
<li><strong>Social worker:</strong> helps with social care needs and practical issues.</li>
<li><strong>Support worker:</strong> gives practical, day-to-day and recovery support.</li>
<li><strong>Pharmacist:</strong> gives advice on medicines, side effects and how medicines interact.</li>
</ul>
<p>Peer and community support can sit alongside professional care, but it does not replace urgent help.</p>`,
      [TEAMS, src("NI Direct: Mental health care professionals (role descriptions)", "https://www.nidirect.gov.uk/articles/mental-health-care-professionals")],
    ),
    section(
      "mh-stress",
      "Stress and feeling overwhelmed",
      `<p>Stress is the body's reaction to feeling under pressure. Everyone feels it at times, and it is not a mental health diagnosis in itself. Too much stress for too long can affect sleep, mood, concentration and physical health.</p>
<p>Small things can help: breaking tasks into steps, taking short breaks, talking to someone you trust, and getting some fresh air or gentle movement if you can. If stress is affecting your daily life, talk to your GP or contact NHS Talking Therapies.</p>`,
      [nhs("Stress", "mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/stress/")],
      { files: ["lib-one-thing", "lib-feel-today"] },
    ),
    section(
      "mh-supporting-someone",
      "Supporting someone else",
      `<ul>
<li>listen without judging, and take what they say seriously</li>
<li>ask what would help, rather than assuming</li>
<li>offer practical help, such as going with them to an appointment</li>
<li>encourage them to get professional support when they are ready</li>
<li>look after your own wellbeing too. Supporting someone can be tiring</li>
</ul>
<p>Family and friends make a real difference, but they cannot replace professional care. If someone's life is at risk, call 999.</p>`,
      [nhs("Mental health", "mental-health/")],
    ),
    section(
      "mh-resources",
      "Free wellbeing resources",
      `<p>Our free printables are optional activities you might find calming or useful. They are not a treatment and do not replace professional support. Find more in the <a href="/resources">free printable library</a>.</p>`,
      [],
      { health: false, files: ["lib-one-thing", "lib-feel-today", "lib-influences", "lib-all-about-me"] },
    ),
    condition(
      "mh-anxiety",
      "Anxiety disorders",
      `<p>Anxiety is a feeling of unease, such as worry or fear. Everyone feels anxious sometimes, but for some people it is strong, lasts a long time and affects daily life. Anxiety disorders include generalised anxiety disorder, panic disorder, social anxiety and phobias.</p>
<p><strong>New chest pain or difficulty breathing should never be assumed to be anxiety.</strong> Get urgent help.</p>`,
      [nhs("Anxiety, fear and panic", "mental-health/feelings-symptoms-behaviours/feelings-and-symptoms/anxiety-fear-panic/"), CONDITIONS],
    ),
    condition(
      "mh-bipolar",
      "Bipolar disorder",
      `<p>Bipolar disorder affects mood. People have episodes of depression (feeling very low) and episodes of mania or hypomania (feeling very high or overactive). These are more than ordinary ups and downs, and the pattern differs from person to person.</p>
<p>Bipolar disorder is not the same as schizophrenia or a personality disorder, and it does not mean someone has two personalities.</p>`,
      [nhs("Bipolar disorder", "mental-health/conditions/bipolar-disorder/overview/")],
    ),
    condition("mh-depression", "Depression", `<p>Depression is more than feeling unhappy for a few days. It is low mood that lasts for weeks or months and affects daily life. Some forms are linked to particular times of life, such as postnatal depression after having a baby.</p><p>Colouring, positive thinking or self-help on its own is not a treatment for depression. Please talk to your GP.</p>`),
    condition("mh-eating", "Eating disorders", `<p>Eating disorders are mental health conditions where someone uses control of food to cope with feelings and situations. They include anorexia nervosa, bulimia and binge eating disorder. They can affect anyone.</p>`),
    condition(
      "mh-ocd",
      "Obsessive compulsive disorder (OCD)",
      `<p>OCD is a recognised mental health condition. It involves distressing, unwanted thoughts that keep coming back (obsessions) and repeated behaviours or mental acts that a person feels they have to do (compulsions). It is not the same as liking things tidy.</p>`,
      [nhs("OCD", "mental-health/conditions/obsessive-compulsive-disorder-ocd/overview/")],
    ),
    condition("mh-personality", "Personality disorders", `<p>A personality disorder affects how someone thinks, feels and relates to other people, in ways that can cause them difficulty over a long time. Borderline personality disorder is one type. Support and treatment can help, and people with personality disorders deserve the same respect and care as anyone else.</p>`),
    condition("mh-ptsd", "Post-traumatic stress disorder (PTSD)", `<p>PTSD can develop after a very stressful, frightening or distressing event. People may relive the event through flashbacks or nightmares, and feel on edge or cut off.</p>`),
    condition("mh-psychosis", "Schizophrenia and psychosis", `<p>Psychosis is when a person sees or believes things differently from the people around them, for example hearing voices or holding beliefs others do not share. It is a set of experiences that can happen in several conditions. It is not another word for schizophrenia, which is one condition where psychosis can occur.</p>`),
  ],
});
