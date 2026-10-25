import { draftPage, nhs, section, src, SYMPTOM_NOTE, TREATMENT_NHS } from "./helpers";

/** Chronic conditions A to Z: short snapshots, in alphabetical order. */

const care = (rows: [string, string][]) =>
  `<h4>Who might be involved in your care?</h4><ul>${rows.map(([who, role]) => `<li><strong>${who}:</strong> ${role}</li>`).join("")}</ul><p>Local services and individual needs vary, so these are people who <em>may</em> be involved, not a promise of a referral.</p>`;

const symptoms = (items: string[], extra = "") => `<h4>Common symptoms</h4>${SYMPTOM_NOTE}<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>${extra}`;

const GP = ["GP", "usually the first person you see. They can assess symptoms, arrange tests, start treatment and refer you on."] as [string, string];
const NURSE = ["Practice nurse", "often helps with regular reviews and checks at your surgery."] as [string, string];

export const conditionsPage = draftPage({
  id: "p-conditions",
  slug: "chronic-illness-support/conditions-a-z",
  title: "Chronic conditions A to Z",
  navLabel: "Conditions A to Z",
  section: "chronic-illness-support",
  parentId: "p-ltc",
  navOrder: 4,
  summary: "Short, plain-English introductions to common long-term conditions: what they are, common symptoms, and who may be involved in your care.",
  body: `<p>A chronic condition is a health problem that lasts a long time and may need ongoing care. Many can be managed rather than cured, and the same condition can affect people very differently.</p>
<p>Open a condition below for a short introduction. These pages give general information only. They cannot tell you what is wrong, and they do not replace advice from your own healthcare team.</p>
<p>Looking for more? See <a href="/chronic-illness-support/understanding-fibromyalgia">Understanding fibromyalgia</a>, <a href="/chronic-illness-support/lupus">Lupus</a> and <a href="/chronic-illness-support/arthritis">Arthritis and related joint conditions</a>, or our guides to <a href="/your-rights">your rights</a> and <a href="/benefits-and-financial-help">benefits and financial help</a>.</p>`,
  sections: [
    section(
      "copd",
      "Chronic obstructive pulmonary disease (COPD)",
      `<p>COPD is the name for a group of long-term lung conditions that make it harder to breathe, and that usually get slowly worse over time.</p>
${symptoms(["breathlessness, especially when you are active", "a cough that does not go away, often with phlegm", "wheezing", "chest infections that keep coming back"])}
<h4>How it can affect everyday life</h4><p>Breathlessness can make stairs, shopping, housework and getting out more tiring. Planning the day and pacing activities can help.</p>
${care([GP, NURSE, ["Respiratory specialist", "a doctor who specialises in the lungs, who may be involved when more specialist care is needed."]])}
${TREATMENT_NHS()}`,
      [nhs("COPD symptoms", "conditions/chronic-obstructive-pulmonary-disease-copd/symptoms/")],
    ),
    section(
      "crohns",
      "Crohn's disease",
      `<p>Crohn's disease is a long-term condition in which parts of the digestive system become inflamed. It is one of the two main types of inflammatory bowel disease (IBD).</p>
${symptoms(["tummy pain", "diarrhoea", "tiredness (fatigue)", "reduced appetite and weight loss", "for some people, blood or mucus in their poo"])}
<h4>How it can affect everyday life</h4><p>Symptoms can come and go. During a flare, needing a toilet urgently can make travel, work and social plans harder.</p>
${care([GP, ["Gastroenterologist", "a doctor who specialises in the digestive system."], ["IBD nurse", "a specialist nurse who helps you manage the condition day to day."], ["Surgeon", "may be involved if surgery is needed."]])}
${TREATMENT_NHS()}`,
      [nhs("Crohn's disease", "conditions/crohns-disease/"), src("Royal Surrey NHS: Gastroenterology and IBD", "https://www.royalsurrey.nhs.uk/gastro-ibd/")],
    ),
    section(
      "diabetes",
      "Diabetes",
      `<p>Diabetes is a condition in which the level of sugar (glucose) in the blood is too high. The two main types are different conditions:</p>
<ul><li><strong>Type 1 diabetes</strong> happens when the body cannot make insulin, the hormone that controls blood sugar.</li><li><strong>Type 2 diabetes</strong> happens when the body does not make enough insulin, or the insulin it makes does not work properly.</li></ul>
${symptoms(["feeling very thirsty", "peeing more than usual", "feeling very tired", "losing weight without trying"], "<p>Type 2 diabetes may cause no noticeable symptoms at all, which is one reason regular checks matter.</p>")}
<h4>How it can affect everyday life</h4><p>Many people manage diabetes alongside work and family life, with regular checks, planning around meals and activity, and support from their care team.</p>
${care([GP, NURSE, ["Diabetes specialist nurse", "helps with day-to-day management and checks."], ["Diabetologist or endocrinologist", "a doctor who specialises in diabetes and hormones, for specialist care."]])}
${TREATMENT_NHS()}`,
      [
        nhs("Type 1 diabetes symptoms", "conditions/type-1-diabetes/symptoms/"),
        nhs("Type 2 diabetes symptoms", "conditions/type-2-diabetes/symptoms/"),
        src("Diabetes UK: Your healthcare team", "https://www.diabetes.org.uk/about-diabetes/looking-after-diabetes/interactions-with-healthcare-professionals"),
      ],
    ),
    section(
      "endometriosis",
      "Endometriosis",
      `<p>Endometriosis is a long-term condition in which tissue similar to the lining of the womb grows in other places, such as the ovaries and fallopian tubes.</p>
${symptoms(["pain in the lower tummy, pelvis or lower back", "painful periods", "tiredness (fatigue)", "pain during or after sex", "pain when peeing or pooing"])}
<h4>How it can affect everyday life</h4><p>Pain and tiredness can affect work, study, relationships and mood. It can take time to get a diagnosis.</p>
${care([GP, ["Gynaecologist", "a doctor who specialises in the female reproductive system."], ["Specialist endometriosis team", "for complex cases, possibly including bowel, bladder and pain specialists."]])}
${TREATMENT_NHS()}`,
      [nhs("Endometriosis", "conditions/endometriosis/"), src("Chelsea and Westminster NHS: Endometriosis", "https://www.chelwest.nhs.uk/services/womens-health-services/gynaecology-services/endometriosis")],
    ),
    section(
      "fibromyalgia",
      "Fibromyalgia",
      `<p>Fibromyalgia is a long-term condition that causes pain all over the body. It is often misunderstood, so we have a <a href="/chronic-illness-support/understanding-fibromyalgia">full section on understanding fibromyalgia</a>.</p>
${symptoms(["widespread pain", "being more sensitive to pain", "stiffness", "tiredness (fatigue)", "sleep that does not leave you feeling refreshed", "problems with memory and concentration, sometimes called fibro fog"])}
<h4>How it can affect everyday life</h4><p>Symptoms often change from day to day. Someone may manage a task one day and not the next, which other people do not always understand.</p>
${care([["GP", "care is often led by your GP."], ["Pain and support services", "may be involved where appropriate."], ["Rheumatologist", "a joint and muscle specialist, who may help check for another condition. This is not an automatic referral."]])}
${TREATMENT_NHS()}`,
      [nhs("Fibromyalgia symptoms", "conditions/fibromyalgia/symptoms/"), nhs("Fibromyalgia diagnosis", "conditions/fibromyalgia/diagnosis/")],
      { files: ["lib-fibro-family"] },
    ),
    section(
      "ibs",
      "Irritable bowel syndrome (IBS)",
      `<p>IBS is a common long-term condition of the digestive system. Symptoms tend to come and go over time.</p>
${symptoms(["tummy cramps", "bloating", "diarrhoea, constipation, or both"])}
<h4>How it can affect everyday life</h4><p>Flare-ups can make it harder to plan journeys, meals and time away from home.</p>
${care([["GP", "usually manages IBS."], ["Dietitian", "can help you look at food and eating patterns."], ["Specialist", "a referral may be considered for persistent, severe symptoms."]])}
${TREATMENT_NHS()}`,
      [nhs("IBS symptoms", "conditions/irritable-bowel-syndrome-ibs/symptoms/"), nhs("IBS help and support", "conditions/irritable-bowel-syndrome-ibs/further-help-and-support/")],
    ),
    section(
      "long-covid",
      "Long COVID",
      `<p>Long COVID is when symptoms continue for weeks or months after a COVID-19 infection.</p>
${symptoms(["tiredness (fatigue)", "breathlessness", "aching muscles and joints", "problems with memory and concentration"], "<p>Symptoms often go up and down over time.</p>")}
<h4>How it can affect everyday life</h4><p>Fluctuating symptoms can make it hard to return to work or usual routines at the same pace as before.</p>
${care([GP, ["Specialist assessment or rehabilitation team", "where appropriate and available locally."]])}
${TREATMENT_NHS()}`,
      [nhs("Long-term effects of COVID-19", "conditions/long-covid/")],
    ),
    section(
      "lupus",
      "Lupus (systemic lupus erythematosus, SLE)",
      `<p>Lupus (SLE) is a long-term autoimmune condition, which means the immune system attacks healthy tissue. It can affect different parts of the body. See our <a href="/chronic-illness-support/lupus">lupus page</a> for more.</p>
${symptoms(["severe tiredness (fatigue)", "joint and muscle pain", "rashes that are sensitive to sunlight", "mouth ulcers", "hair loss"], "<p>Symptoms, and which parts of the body are affected, vary a lot from person to person.</p>")}
<h4>How it can affect everyday life</h4><p>Lupus often has flares and calmer periods. Planning rest and protecting skin from sunlight are part of daily life for many people.</p>
${care([["Rheumatologist", "usually leads care, alongside your GP."], ["Other specialists", "such as skin or kidney specialists, depending on which parts of the body are affected."]])}
${TREATMENT_NHS()}`,
      [nhs("Lupus", "conditions/lupus/")],
    ),
    section(
      "me-cfs",
      "ME/CFS (myalgic encephalomyelitis or chronic fatigue syndrome)",
      `<p>ME/CFS is a long-term condition with many symptoms. The most common is extreme tiredness that does not go away with rest.</p>
${symptoms(["overwhelming tiredness (fatigue)", "sleep that does not leave you feeling refreshed", "problems with thinking and memory, sometimes called brain fog", "post-exertional malaise: symptoms getting worse after activity, sometimes a day or more later"])}
<h4>How it can affect everyday life</h4><p>Activity needs careful planning, because doing too much can make symptoms worse for days afterwards.</p>
${care([GP, ["ME/CFS specialist team", "including professionals with experience of ME/CFS."]])}
${TREATMENT_NHS()}`,
      [nhs("ME/CFS symptoms", "conditions/chronic-fatigue-syndrome-cfs/symptoms/"), src("NICE guideline NG206: ME/CFS", "https://www.nice.org.uk/guidance/NG206/chapter/recommendations")],
    ),
    section(
      "migraine",
      "Migraine",
      `<p>A migraine is usually a moderate or severe headache, felt as a throbbing pain, often on one side of the head. Some people have them often.</p>
${symptoms(["attacks of severe headache", "feeling or being sick", "being sensitive to light"])}
<h4>How it can affect everyday life</h4><p>Attacks can mean time off work or school and cancelled plans, and worry about the next one.</p>
${care([["GP", "usually manages migraine."], ["Headache specialist or neurologist", "a doctor who specialises in the brain and nerves, when more assessment or treatment is needed."]])}
${TREATMENT_NHS()}`,
      [nhs("Migraine", "conditions/migraine/")],
    ),
    section(
      "ms",
      "Multiple sclerosis (MS)",
      `<p>MS is a condition that can affect the brain and spinal cord, causing a wide range of symptoms.</p>
${symptoms(["tiredness (fatigue)", "problems with vision", "numbness or tingling", "problems with balance", "stiffness or muscle spasms", "bladder problems"])}
<h4>How it can affect everyday life</h4><p>MS affects people very differently. Some people have periods of symptoms followed by recovery, while for others symptoms change more gradually.</p>
${care([["Neurologist", "a doctor who specialises in the brain and nerves."], ["MS nurse", "a specialist nurse who supports you day to day."], ["Physiotherapist or occupational therapist", "may help with movement, daily activities and independence."]])}
${TREATMENT_NHS()}`,
      [nhs("Multiple sclerosis", "conditions/multiple-sclerosis/")],
    ),
    section(
      "osteoarthritis",
      "Osteoarthritis",
      `<p>Osteoarthritis is a condition that affects the whole joint, including the cartilage and other tissues. It is not simply wear and tear. See <a href="/chronic-illness-support/arthritis">Arthritis and related joint conditions</a> for other types.</p>
${symptoms(["joint pain", "stiffness", "tenderness", "difficulty moving the joint", "for some people, swelling or a grating feeling"])}
<h4>How it can affect everyday life</h4><p>Painful, stiff joints can make walking, stairs, gripping and getting comfortable harder.</p>
${care([["GP and physiotherapist", "usually the main people involved."], ["Orthopaedic surgeon", "may assess you if surgery could be appropriate."], ["Rheumatologist", "may help when the diagnosis is uncertain. Osteoarthritis is not usually led by a rheumatologist."]])}
${TREATMENT_NHS()}`,
      [
        nhs("Osteoarthritis symptoms", "conditions/osteoarthritis/symptoms/"),
        nhs("Osteoarthritis treatment", "conditions/osteoarthritis/treatment/"),
        src("Royal Devon NHS: Osteoarthritis", "https://www.royaldevon.nhs.uk/services/rheumatology-musculoskeletal-system-joints/conditions-we-treat/osteoarthritis/"),
      ],
    ),
    section(
      "rheumatoid-arthritis",
      "Rheumatoid arthritis",
      `<p>Rheumatoid arthritis is an autoimmune condition that causes pain and swelling in the joints, and can affect more than the joints. See <a href="/chronic-illness-support/arthritis">Arthritis and related joint conditions</a>.</p>
${symptoms(["painful, swollen, stiff joints", "stiffness that lasts a long time in the morning", "tiredness and low energy"])}
<h4>How it can affect everyday life</h4><p>Hands, wrists and feet are often affected, which can make everyday tasks such as dressing and cooking harder during a flare.</p>
${care([["Rheumatologist", "a doctor who specialises in inflammatory joint conditions, who generally leads care."], GP])}
${TREATMENT_NHS()}`,
      [nhs("Rheumatoid arthritis symptoms", "conditions/rheumatoid-arthritis/symptoms/"), nhs("Rheumatoid arthritis diagnosis", "conditions/rheumatoid-arthritis/diagnosis/")],
    ),
    section(
      "ulcerative-colitis",
      "Ulcerative colitis",
      `<p>Ulcerative colitis is a long-term condition in which the colon and rectum become inflamed. It is one of the two main types of inflammatory bowel disease (IBD).</p>
${symptoms(["diarrhoea, which may contain blood", "tummy pain", "needing to poo urgently or often", "tiredness (fatigue)"])}
<h4>How it can affect everyday life</h4><p>Urgent toilet needs during a flare can make travel, work and going out harder to plan.</p>
${care([["Gastroenterologist", "a doctor who specialises in the digestive system."], ["IBD nurse", "a specialist nurse who helps you manage the condition."], ["Surgical team", "may be involved if surgery is needed."]])}
${TREATMENT_NHS()}`,
      [nhs("Ulcerative colitis", "conditions/ulcerative-colitis/"), src("Royal Surrey NHS: Gastroenterology and IBD", "https://www.royalsurrey.nhs.uk/gastro-ibd/")],
    ),
  ],
});
