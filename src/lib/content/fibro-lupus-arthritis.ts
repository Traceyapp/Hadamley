import { draftPage, nhs, section, src, SYMPTOM_NOTE, TREATMENT_TO_FOLLOW } from "./helpers";

/* ------------------------------------------------------------------ */
/* Understanding fibromyalgia: the main editorial priority            */
/* ------------------------------------------------------------------ */

const RCP = src("Royal College of Physicians: The diagnosis of fibromyalgia syndrome", "https://www.rcp.ac.uk/resources/the-diagnosis-of-fibromyalgia-syndrome/");
const NHS_FIBRO_TREAT = nhs("Fibromyalgia treatment", "conditions/fibromyalgia/treatment/");
const NICE_PAIN = src("NICE guideline NG193: Chronic pain", "https://www.nice.org.uk/guidance/ng193/chapter/recommendations");

export const fibroPage = draftPage({
  id: "p-fibro",
  slug: "chronic-illness-support/understanding-fibromyalgia",
  title: "Understanding fibromyalgia",
  navLabel: "Understanding fibromyalgia",
  section: "chronic-illness-support",
  parentId: "p-ltc",
  navOrder: 5,
  summary: "A recognised long-term condition that is often misunderstood. What it is, how it is diagnosed, how understanding has changed, and how to live with it.",
  body: `<p>Fibromyalgia is a recognised long-term condition. It causes pain all over the body, along with tiredness, poor sleep and problems with memory and concentration. Because it cannot be seen and there is no simple test for it, people with fibromyalgia are often misunderstood, and sometimes not believed.</p>
<p>This section brings together clear, up-to-date information. Open the topics below in any order. It is still being developed, and more will be added over time.</p>`,
  sections: [
    section(
      "fibro-what",
      "What is fibromyalgia?",
      `<p>Fibromyalgia is a long-term condition that causes widespread pain. Many people also have tiredness (fatigue), sleep that does not leave them refreshed, and problems with memory and concentration, often called fibro fog.</p>
<p>Experiences differ a lot from person to person, and symptoms can change from day to day.</p>
<p>Routine blood tests and scans are often normal in people with fibromyalgia. <strong>A normal test result does not mean the symptoms are imagined.</strong></p>`,
      [nhs("Fibromyalgia symptoms", "conditions/fibromyalgia/symptoms/"), src("NIAMS: Fibromyalgia (US, reviewed May 2024)", "https://www.niams.nih.gov/health-topics/fibromyalgia")],
    ),
    section(
      "fibro-history",
      "How understanding of fibromyalgia has changed",
      `<p>Widespread muscle pain was described under older names, such as fibrositis, long before the term fibromyalgia was used. Over time, doctors moved towards understanding it through the pattern of symptoms a person has.</p>
<ul>
<li><strong>1990:</strong> the American College of Rheumatology published classification criteria. These used widespread pain for at least 3 months, plus tenderness at 11 or more of 18 set points on the body (known as tender points). Classification criteria help researchers group patients in studies. They are not a laboratory test.</li>
<li><strong>2010:</strong> new preliminary diagnostic criteria removed the need for a tender-point examination and gave more weight to how severe a person's symptoms are, including fatigue, sleep and thinking problems.</li>
<li><strong>2016:</strong> a revision clarified what counts as generalised pain and how the criteria can be used for diagnosis.</li>
<li><strong>2022:</strong> the Royal College of Physicians published UK guidance on diagnosing fibromyalgia. Its current resource page is dated September 2023.</li>
</ul>
<p><em>More history, including the earliest descriptions, will be added once checked against suitable historical sources.</em></p>`,
      [
        src("1990 ACR classification criteria (PubMed)", "https://pubmed.ncbi.nlm.nih.gov/2306288/"),
        src("2010 preliminary diagnostic criteria (PubMed)", "https://pubmed.ncbi.nlm.nih.gov/20461783/"),
        src("2016 criteria revision (PubMed)", "https://pubmed.ncbi.nlm.nih.gov/27916278/"),
        RCP,
      ],
    ),
    section(
      "fibro-cause",
      "What might cause it?",
      `<p>The exact cause of fibromyalgia is not fully understood. One explanation is that the way the nervous system processes pain signals is altered, so the body becomes more sensitive to pain.</p>
<p>Genes and things that happen in a person's life may both play a part. Some people notice their symptoms began or got worse after an event such as an illness, injury or a stressful time, but this is not true for everyone. There is no single cause that applies to every person.</p>`,
      [src("NIAMS: Fibromyalgia (US, reviewed May 2024)", "https://www.niams.nih.gov/health-topics/fibromyalgia"), nhs("Fibromyalgia", "conditions/fibromyalgia/")],
    ),
    section(
      "fibro-misunderstood",
      "Why has it been misunderstood?",
      `<p>Fibromyalgia has been misunderstood for several reasons:</p>
<ul>
<li>it can be hard to diagnose, and there is no routine test that confirms it</li>
<li>the symptoms are often invisible and can change from day to day</li>
<li>recognition and diagnosis can take a long time</li>
</ul>
<p>Many people with fibromyalgia describe being disbelieved or judged by others. That is not everyone's experience, and many professionals understand the condition well.</p>
<p>Psychological support, such as talking therapy, can be one helpful part of care, as it is for many long-term conditions. Being offered it does not mean the illness is imaginary.</p>`,
      [src("Qualitative research on stigma in fibromyalgia (PubMed)", "https://pubmed.ncbi.nlm.nih.gov/41092545/"), RCP],
      { files: ["lib-guide-hidden"] },
    ),
    section(
      "fibro-symptoms",
      "Symptoms and everyday life",
      `${SYMPTOM_NOTE}
<ul>
<li>widespread pain and being more sensitive to pain</li>
<li>tiredness (fatigue)</li>
<li>sleep that does not leave you refreshed</li>
<li>problems with memory and concentration (fibro fog)</li>
<li>being sensitive to things like noise, light or temperature</li>
</ul>
<p>Symptoms often go up and down. This can affect work, household tasks, family life and relationships, and it can take an emotional toll too.</p>
<p><strong>Do not put a new or different symptom down to fibromyalgia without getting it checked.</strong> Some symptoms need assessment in their own right.</p>`,
      [nhs("Fibromyalgia symptoms", "conditions/fibromyalgia/symptoms/")],
    ),
    section(
      "fibro-diagnosis",
      "How is fibromyalgia diagnosed?",
      `<p>There is no established blood test or scan that confirms fibromyalgia. A diagnosis is based on:</p>
<ul><li>your history and symptoms</li><li>a physical examination</li><li>where the pain is, how severe the symptoms are, and how long they have lasted</li></ul>
<p>Tests may be used to look for other conditions that could cause similar symptoms, or that a person could have as well. Fibromyalgia can exist alongside other illnesses, so it is not simply what is left when every test is normal.</p>
<p>Doctors may use assessment tools that score where you have pain and how severe your symptoms are. These are clinical aids for a professional to use, not a self-test.</p>
<h4>Tender points</h4>
<p>Some people are told a professional will examine particular points on the body that are sensitive to pressure. These are called tender points. They are not the same as acupuncture or acupressure points, or the trigger points sometimes mentioned in muscle pain.</p>
<p>The 1990 classification criteria combined widespread pain for at least 3 months with pain at 11 or more of 18 tender points, shown below. Modern assessment does not need that count and looks at the wider pattern of symptoms. Tenderness can still be part of an examination, but a count on its own cannot confirm fibromyalgia.</p>
<figure>
<img src="/diagrams/fibromyalgia-tender-points.svg" width="1000" height="840" loading="lazy" alt="Front and back outlines of a body showing the 18 tender points used in the 1990 classification criteria. There are nine areas, each on both sides of the body: 1, occiput, at the base of the skull at the back. 2, low cervical, at the lower front of the neck. 3, trapezius, on top of the shoulder. 4, supraspinatus, above the shoulder blade. 5, second rib, on the upper chest beside the breastbone. 6, lateral epicondyle, just below the outer elbow. 7, gluteal, on the upper outer buttock. 8, greater trochanter, on the outer hip. 9, knee, on the inner side just above the joint." />
<figcaption>The 18 tender points used in the historical 1990 classification criteria. The numbers mark areas, not a score, and positions are approximate. Modern diagnosis does not need a tender-point count, and this is not a self-test. Original Hadamley diagram, draft for clinical review.</figcaption>
</figure>
<p>UK guidance from the Royal College of Physicians says fibromyalgia can be diagnosed by suitably skilled clinicians, and a rheumatologist does not need to confirm it in every case.</p>`,
      [nhs("Fibromyalgia diagnosis", "conditions/fibromyalgia/diagnosis/"), RCP],
    ),
    section(
      "fibro-treatment",
      "Treatments and medicines",
      `<p>Treatment is individual. It aims to ease symptoms and improve day-to-day life, rather than cure the condition. A healthcare professional may talk to you about a mix of approaches, including exercise and activity programmes, talking therapies and medicines.</p>
<p>No treatment works for everyone, and getting better is never a question of willpower.</p>
${TREATMENT_TO_FOLLOW("the treatments recommended in the UK")}`,
      [NHS_FIBRO_TREAT, NICE_PAIN],
    ),
    section(
      "fibro-living",
      "Living with fibromyalgia",
      `<p>Things many people find helpful, alongside their treatment:</p>
<ul>
<li>pacing: spreading activities out and planning rest, rather than pushing through on good days and paying for it later</li>
<li>looking after sleep with a regular routine</li>
<li>planning appointments, travel and tasks around your energy</li>
<li>finding ways to explain your needs to family, friends and work</li>
</ul>
<p>Everyone's limits are different. You should not be told to simply push through your symptoms.</p>`,
      [NHS_FIBRO_TREAT],
      { files: ["lib-appointment-notes", "lib-feel-today"] },
    ),
    section(
      "fibro-families",
      "For families, friends and employers",
      `<p>Someone with fibromyalgia may manage something one day and not the next. That is the nature of the condition, not a lack of effort.</p>
<ul>
<li>listen, and believe what they tell you about how they feel</li>
<li>ask what would help, rather than guessing</li>
<li>offer practical help, such as lifts, shopping or flexible plans</li>
<li>at work, talk about adjustments such as flexible hours or rest breaks</li>
</ul>
<p>Our free colouring page below shows a family at home together, and can be a gentle way to talk about it with children.</p>`,
      [nhs("Fibromyalgia", "conditions/fibromyalgia/")],
      { files: ["lib-fibro-family", "lib-mummy-rest"] },
    ),
    section(
      "fibro-research",
      "Research: what is changing?",
      `<p><em>Checked October 2026.</em> Research into fibromyalgia is active. It helps to separate what is known from early findings:</p>
<ul>
<li><strong>2025, King's College London:</strong> early-stage research suggested that antibodies from some patients may affect pain-sensing nerves. The researchers describe it as early work with questions still to answer.</li>
<li><strong>July 2026, King's College London:</strong> a large genetic study identified areas of DNA linked to fibromyalgia risk, involving nervous system pathways. It does not provide a genetic test or a new treatment.</li>
</ul>
<p>Neither study proves that all fibromyalgia is autoimmune, or that genes decide whether a particular person will develop it, and neither has produced a cure. We will update this section as research develops.</p>`,
      [
        src("King's College London: Immune system changes affecting sensory nerves (2025)", "https://www.kcl.ac.uk/news/immune-system-changes-affecting-sensory-nerves-could-cause-fibromyalgia"),
        src("King's College London: Genetic risk factors of fibromyalgia (2026)", "https://www.kcl.ac.uk/news/genetic-risk-factors-of-fibromyalgia-identified-in-largest-study-of-its-kind"),
      ],
    ),
  ],
});

/* ------------------------------------------------------------------ */
/* Lupus: a shorter supporting section                                */
/* ------------------------------------------------------------------ */

const NHS_LUPUS = nhs("Lupus", "conditions/lupus/");
const NIAMS_LUPUS = src("NIAMS: Lupus (US)", "https://www.niams.nih.gov/health-topics/lupus");

export const lupusPage = draftPage({
  id: "p-lupus",
  slug: "chronic-illness-support/lupus",
  title: "Lupus (SLE)",
  navLabel: "Lupus",
  section: "chronic-illness-support",
  parentId: "p-ltc",
  navOrder: 6,
  summary: "An introduction to systemic lupus erythematosus: symptoms, diagnosis, care, day-to-day support and treatment.",
  body: `<p>Systemic lupus erythematosus (SLE), usually just called lupus, is a long-term autoimmune condition. The immune system attacks healthy tissue, which can cause inflammation in different parts of the body. There are other forms of lupus. This page is about SLE.</p>
<p>Lupus and fibromyalgia can share some symptoms, and a person can have both, but they are different conditions with different tests and treatments. See <a href="/chronic-illness-support/understanding-fibromyalgia">Understanding fibromyalgia</a>.</p>`,
  sections: [
    section(
      "lupus-symptoms",
      "Symptoms",
      `${SYMPTOM_NOTE}
<ul><li>severe tiredness (fatigue)</li><li>painful or swollen joints, and muscle pain</li><li>rashes that are sensitive to sunlight, sometimes across the nose and cheeks</li><li>mouth ulcers</li><li>hair loss</li><li>a high temperature</li></ul>
<p>Not everyone gets a rash across the face. Lupus can also affect the kidneys, lungs, heart or other organs in some people, which is why regular monitoring matters. Symptoms often come and go in flares.</p>`,
      [NHS_LUPUS, NIAMS_LUPUS],
    ),
    section(
      "lupus-diagnosis",
      "How lupus is diagnosed",
      `<p>Lupus is diagnosed by looking at your symptoms and history, an examination, and blood and urine tests, with other tests where needed.</p>
<p>No single test confirms lupus. A positive ANA blood test on its own does not mean someone has lupus.</p>`,
      [NHS_LUPUS, src("NIAMS: Lupus diagnosis and treatment (US)", "https://www.niams.nih.gov/health-topics/lupus/diagnosis-treatment-and-steps-to-take")],
    ),
    section(
      "lupus-care",
      "Who might be involved in your care?",
      `<ul><li><strong>Rheumatologist:</strong> usually leads care, alongside your GP.</li><li><strong>Dermatologist:</strong> a skin specialist, if lupus affects your skin.</li><li><strong>Nephrologist:</strong> a kidney specialist, if lupus affects your kidneys.</li><li><strong>Other specialists</strong> depending on which parts of the body are affected.</li></ul>`,
      [src("University Hospitals Bristol: Lupus", "https://www.uhbristol.nhs.uk/patients-and-visitors/your-hospitals/bristol-royal-infirmary/what-we-do/rheumatology/conditions-we-treat/lupus/")],
    ),
    section(
      "lupus-daily",
      "Day-to-day support",
      `<p>These can help alongside medical treatment, not instead of it:</p>
<ul>
<li>pace tasks and plan rest breaks</li>
<li>protect your skin from sunlight with SPF 50 or higher sunscreen, clothing and shade</li>
<li>agree with your care team what activity suits you</li>
<li>go to your reviews and blood and urine tests</li>
<li>keep a note of changing symptoms and possible flare patterns</li>
<li>ask for practical and emotional support</li>
</ul>
<p><strong>Do not assume a new or severe symptom is a lupus flare.</strong> Chest pain, severe breathlessness and signs of a stroke need emergency help.</p>`,
      [NHS_LUPUS, src("LUPUS UK", "https://lupusuk.org.uk/")],
      { files: ["lib-appointment-notes"] },
    ),
    section(
      "lupus-treatment",
      "Treatments and medicines",
      `<p>Treatment aims to manage symptoms, reduce flares and protect the organs. Examples of medicines a specialist may discuss include:</p>
<ul>
<li><strong>Hydroxychloroquine</strong> for skin and joint symptoms and tiredness</li>
<li><strong>Corticosteroids (steroids)</strong> to reduce inflammation</li>
<li><strong>Immunosuppressants and biological medicines</strong> for some people</li>
<li><strong>Anti-inflammatory painkillers</strong> only when they are suitable for the person's kidneys and other health risks</li>
</ul>
<p>This is not a complete list or a recommendation, and it does not include doses.</p>
<h4>Possible side effects</h4>
<p>Hydroxychloroquine can cause side effects such as feeling sick, an upset stomach, diarrhoea, headache or a rash. Rarely, it can affect the eyes, which is why eye checks are important when your doctor recommends them. Hydroxychloroquine is also used for other conditions, so being prescribed it does not mean someone has lupus.</p>
<p>Information about side effects of steroids and immunosuppressants is being prepared and checked. Not everyone gets side effects. Your pharmacist or prescriber can answer questions, and you should not stop or change a medicine without talking to them first unless you are told to get urgent help.</p>`,
      [NHS_LUPUS, nhs("Hydroxychloroquine", "medicines/hydroxychloroquine/")],
    ),
    section(
      "lupus-support",
      "Where to find support",
      `<p><a href="https://lupusuk.org.uk/" target="_blank" rel="noopener">LUPUS UK</a> is a national charity offering information and support for people with lupus and those close to them.</p>`,
      [src("LUPUS UK", "https://lupusuk.org.uk/")],
      { health: false },
    ),
  ],
});

/* ------------------------------------------------------------------ */
/* Arthritis and related joint conditions                             */
/* ------------------------------------------------------------------ */

const JOINT_URGENT =
  "A sudden, very painful joint that is hot, swollen, or hard to move or put weight on can be a joint infection (septic arthritis). Contact NHS 111 or your GP the same day, even if you do not have a temperature. Do not assume it is a normal flare or gout. Call 999 if the person seems very unwell.";

export const arthritisPage = draftPage({
  id: "p-arthritis",
  slug: "chronic-illness-support/arthritis",
  title: "Arthritis and related joint conditions",
  navLabel: "Arthritis",
  section: "chronic-illness-support",
  parentId: "p-ltc",
  navOrder: 7,
  summary: "Arthritis is an umbrella term for many different conditions. Short introductions to the main types, in alphabetical order.",
  body: `<p>Arthritis is not one condition. It is an umbrella term for conditions that cause pain and inflammation in the joints. They have different causes and different treatments: not all are autoimmune, not all are linked to age, and they are not all treated with the same medicines.</p>
<p>Fibromyalgia and lupus can cause joint pain, but they are not types of arthritis. See <a href="/chronic-illness-support/understanding-fibromyalgia">Understanding fibromyalgia</a> and <a href="/chronic-illness-support/lupus">Lupus</a>.</p>`,
  sections: [
    section(
      "axial-spa",
      "Axial spondyloarthritis (including ankylosing spondylitis)",
      `<p>Axial spondyloarthritis is a type of inflammatory arthritis that mainly affects the spine and the joints where the spine meets the pelvis. Ankylosing spondylitis is the form that shows up on X-rays. Not every case of axial spondyloarthritis is ankylosing spondylitis.</p>
${SYMPTOM_NOTE}<ul><li>long-lasting pain and stiffness in the lower back or buttocks, often worse at night or after rest and easing with movement</li><li>tiredness (fatigue)</li></ul>
<p><strong>Who may be involved:</strong> usually a rheumatologist, with physiotherapy and specialist nursing as needed.</p>
${TREATMENT_TO_FOLLOW()}`,
      [nhs("Ankylosing spondylitis", "conditions/ankylosing-spondylitis/"), src("Royal Free London NHS: Axial spondyloarthritis", "https://www.royalfree.nhs.uk/patients-and-visitors/patient-information-leaflets/axial-spondyloarthritis")],
    ),
    section(
      "cppd",
      "Calcium pyrophosphate deposition (CPPD) disease",
      `<p>CPPD is joint disease caused by calcium crystals. Sudden attacks were once called pseudogout. It is not the same as gout, which is caused by a different type of crystal.</p>
${SYMPTOM_NOTE}<ul><li>a sudden, painful, warm and swollen joint, often the knee</li></ul>
<p>Because an attack can look like a joint infection or gout, a new hot swollen joint needs checking.</p>
<p><strong>Who may be involved:</strong> your GP, and a rheumatologist depending on the diagnosis.</p>
${TREATMENT_TO_FOLLOW()}`,
      [src("Arthritis UK: Acute CPP crystal arthritis", "https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/acute-cpp-crystal-arthritis/"), src("University Hospitals Bristol: Gout and pseudogout", "https://www.uhbristol.nhs.uk/patients-and-visitors/your-hospitals/bristol-royal-infirmary/what-we-do/rheumatology/conditions-we-treat/gout-and-pseudogout/")],
      { urgent: JOINT_URGENT },
    ),
    section(
      "gout",
      "Gout",
      `<p>Gout is a type of inflammatory arthritis linked to crystals of urate (uric acid) forming in and around joints. It is not simply caused by diet or lifestyle.</p>
${SYMPTOM_NOTE}<ul><li>sudden, severe joint pain</li><li>a hot, swollen joint, often the big toe, although other joints can be affected</li></ul>
<p><strong>Who may be involved:</strong> gout can often be managed by your GP. Specialist care depends on the diagnosis and how complex it is.</p>
${TREATMENT_TO_FOLLOW()}`,
      [nhs("Gout", "conditions/gout/")],
      { urgent: JOINT_URGENT },
    ),
    section(
      "jia",
      "Juvenile idiopathic arthritis (JIA)",
      `<p>JIA is a group of arthritis conditions that start before the age of 16. It can continue into adulthood. Treatment for children is different from treatment for adults.</p>
${SYMPTOM_NOTE}<ul><li>stiff, swollen or painful joints</li><li>a limp, tiredness or being less active than usual</li></ul>
<p>Symptoms depend on the type of JIA.</p>
<p><strong>Who may be involved:</strong> a team with expertise in children's rheumatology.</p>
${TREATMENT_TO_FOLLOW()}`,
      [src("Arthritis UK: Juvenile idiopathic arthritis", "https://www.arthritis-uk.org/information-and-support/understanding-arthritis/conditions/juvenile-idiopathic-arthritis/")],
    ),
    section(
      "oa",
      "Osteoarthritis",
      `<p>Osteoarthritis affects the whole joint, including the cartilage and other tissues. It should not be dismissed as just wear and tear.</p>
${SYMPTOM_NOTE}<ul><li>joint pain, stiffness and difficulty moving the joint</li><li>sometimes tenderness, swelling or a grating feeling</li></ul>
<p><strong>Who may be involved:</strong> usually your GP and physiotherapist, with an orthopaedic surgeon if surgery may be appropriate.</p>
${TREATMENT_TO_FOLLOW()}`,
      [nhs("Osteoarthritis", "conditions/osteoarthritis/")],
    ),
    section(
      "psa",
      "Psoriatic arthritis",
      `<p>Psoriatic arthritis is an inflammatory arthritis linked to psoriasis, a skin condition. The skin symptoms are not always obvious when joint symptoms start.</p>
${SYMPTOM_NOTE}<ul><li>joint pain, swelling and stiffness</li><li>swelling of a whole finger or toe</li><li>changes to the nails, such as pitting</li><li>tiredness, and sometimes psoriasis skin symptoms</li></ul>
<p><strong>Who may be involved:</strong> usually a rheumatologist, with specialist nursing, physiotherapy and occupational therapy as needed.</p>
${TREATMENT_TO_FOLLOW()}`,
      [nhs("Psoriatic arthritis", "conditions/psoriatic-arthritis/")],
    ),
    section(
      "reactive",
      "Reactive arthritis",
      `<p>Reactive arthritis is joint inflammation that develops after an infection. It often goes away within a few months, but it can come back or last longer, so not every case is long term.</p>
${SYMPTOM_NOTE}<ul><li>sore, swollen, stiff joints, often in the legs</li><li>tiredness</li><li>for some people, eye or urinary symptoms</li></ul>
${TREATMENT_TO_FOLLOW()}`,
      [nhs("Reactive arthritis", "conditions/reactive-arthritis/")],
    ),
    section(
      "ra",
      "Rheumatoid arthritis",
      `<p>Rheumatoid arthritis is an autoimmune, inflammatory arthritis that can affect more than the joints.</p>
${SYMPTOM_NOTE}<ul><li>joint pain, swelling and warmth</li><li>long-lasting stiffness after rest or in the morning</li><li>tiredness</li></ul>
<p>The hands, wrists and feet are often affected, sometimes on both sides of the body.</p>
<p><strong>Who may be involved:</strong> generally a rheumatologist, with specialist nursing, physiotherapy and occupational therapy as needed.</p>
${TREATMENT_TO_FOLLOW()}`,
      [nhs("Rheumatoid arthritis", "conditions/rheumatoid-arthritis/")],
    ),
    section(
      "septic",
      "Urgent: a sudden hot, swollen joint",
      `<p>Septic arthritis is an infection in a joint. It can be serious and needs urgent assessment.</p>
<p>Get help the same day from NHS 111 or your GP if a joint becomes suddenly very painful and is swollen, hot, or hard to move or put weight on, especially if you also feel unwell. A high temperature is not always present.</p>
<p>Do not assume a new hot, swollen joint is gout or a normal flare. Call 999 if the person seems very unwell.</p>`,
      [nhs("Septic arthritis", "conditions/septic-arthritis/")],
      { urgent: JOINT_URGENT },
    ),
  ],
});
