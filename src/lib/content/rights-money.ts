import { draftPage, section, src } from "./helpers";

/** Shared pages linked from both the chronic illness and mental health sections. */

const NOT_ADVICE = (what: string) =>
  `<p><em>This is general information only, not ${what} advice. Rules depend on your circumstances and can change. For a decision about your own situation, speak to one of the advice services listed here.</em></p>`;

const GOV_DISABILITY = src("GOV.UK: Definition of disability under the Equality Act 2010", "https://www.gov.uk/definition-of-disability-under-equality-act-2010");

export const rightsPage = draftPage({
  id: "p-rights",
  slug: "your-rights",
  title: "Discrimination and your rights",
  navLabel: "Your rights",
  section: "support-rights",
  parentId: null,
  navOrder: 11,
  showInNav: false,
  summary: "Unfair treatment, stigma and disability discrimination, reasonable adjustments, and where to get specialist advice.",
  body: `<p>Living with a long-term condition or a mental health difficulty should never mean being treated unfairly. Conditions can be invisible, and they can change from day to day, but they are still real.</p>
<p>Not every unkind comment is unlawful discrimination, and having a diagnosis does not on its own guarantee legal protection. This page explains the basics and where to get proper advice.</p>
${NOT_ADVICE("legal")}`,
  sections: [
    section(
      "rights-law",
      "What the law says",
      `<p>In England, Scotland and Wales, the <strong>Equality Act 2010</strong> generally protects people who have a physical or mental impairment that has a substantial, long-term negative effect on their ability to do normal day-to-day activities.</p>
<p>The exact rules, exceptions and circumstances matter, so whether the law applies to a particular person or situation is something to check with an advice service. The Equality Act does not cover Northern Ireland, which has its own laws.</p>`,
      [GOV_DISABILITY, src("legislation.gov.uk: Equality Act 2010, section 6", "https://www.legislation.gov.uk/ukpga/2010/15/section/6")],
      { health: false },
    ),
    section(
      "rights-examples",
      "Where unfair treatment can happen",
      `<ul><li>at work, for example in recruitment, how you are treated, or being refused changes that would help</li><li>when using services, such as shops, transport, health care or housing</li><li>stigma and assumptions from other people, which can hurt even when they are not unlawful</li></ul>`,
      [GOV_DISABILITY],
      { health: false, files: ["lib-guide-discrimination", "lib-guide-hidden"] },
    ),
    section(
      "rights-adjustments",
      "Reasonable adjustments",
      `<p>Employers and service providers may have to make reasonable adjustments to remove disadvantages a disabled person faces. At work, examples can include:</p>
<ul><li>flexible working arrangements</li><li>rest breaks</li><li>suitable equipment</li><li>clear written instructions</li></ul>
<p>What counts as reasonable depends on the circumstances.</p>`,
      [src("Acas: Reasonable adjustments", "https://www.acas.org.uk/reasonable-adjustments"), src("Acas: Reasonable adjustments for mental health", "https://www.acas.org.uk/reasonable-adjustments/mental-health-adjustments")],
      { health: false },
    ),
    section(
      "rights-advice",
      "Where to get advice",
      `<ul>
<li><strong><a href="https://www.acas.org.uk/" target="_blank" rel="noopener">Acas</a></strong> for problems at work</li>
<li><strong><a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener">Equality Advisory and Support Service (EASS)</a></strong> for discrimination when using services</li>
<li><strong><a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener">Citizens Advice</a></strong> for free, independent advice on most issues</li>
</ul>
<p>Get advice promptly, because time limits may apply to making a complaint or claim.</p>`,
      [src("Equality Advisory and Support Service", "https://www.equalityadvisoryservice.com/"), src("GOV.UK: Equality Advisory and Support Service", "https://www.gov.uk/equality-advisory-support-service")],
      { health: false },
    ),
  ],
});

export const benefitsPage = draftPage({
  id: "p-benefits",
  slug: "benefits-and-financial-help",
  title: "Benefits and financial help",
  navLabel: "Benefits and money",
  section: "support-rights",
  parentId: null,
  navOrder: 12,
  showInNav: false,
  summary: "Benefits that may be relevant, help with household costs, and where to get a free benefits check. For adults in England.",
  body: `<p>Living with a chronic condition or a mental health difficulty can change how much work you can do, or mean you cannot work at all. Needing financial support is not a personal failure. Your worth is not measured by your wages, and you do not have to apologise for needing enough money to live.</p>
<p>This page is a starting point, not a full eligibility check. Benefits have different rules, and a diagnosis does not automatically mean someone is entitled to a payment.</p>
${NOT_ADVICE("financial or benefits")}`,
  sections: [
    section(
      "benefits-which",
      "Benefits that may be relevant",
      `<p>Different benefits do different jobs. Some help with the extra costs of a disability, some help people on a low income, and some support people whose health affects their ability to work. Some can be paid while you are working.</p>
<ul>
<li><strong>Personal Independence Payment (PIP):</strong> helps with extra living costs if a long-term condition or disability makes daily life or getting around harder. It is not based on income or savings.</li>
<li><strong>Universal Credit:</strong> a means-tested payment, which can include extra support if your health limits your ability to work.</li>
<li><strong>New Style Employment and Support Allowance (ESA):</strong> may be available if you have paid enough National Insurance and your health affects how much you can work.</li>
<li><strong>Attendance Allowance:</strong> for people over State Pension age who need help with care because of an illness or disability.</li>
</ul>
<p>Whether you qualify depends on the benefit and your circumstances, and not every benefit can be combined. Different nations of the UK have some different benefits and names. Check current official guidance for rates and rules.</p>`,
      [src("GOV.UK: Check benefits and financial support you can get", "https://www.gov.uk/check-benefits-financial-support"), src("Citizens Advice: What benefits can I get", "https://www.citizensadvice.org.uk/benefits/benefits-introduction/what-benefits-can-i-get/")],
      { health: false, files: ["lib-guide-benefits"] },
    ),
    section(
      "benefits-costs",
      "Help with housing, Council Tax and bills",
      `<p>You may be able to get help with rent, Council Tax and household bills, and some councils run local welfare schemes or grants. What is available depends on where you live.</p>
<p>If you live in Havering, start with the council's pages on Housing Benefit, Council Tax Support and reducing your Council Tax bill.</p>`,
      [
        src("Havering Council: Housing Benefit and Council Tax Support", "https://www.havering.gov.uk/housing-benefit-council-tax-support"),
        src("Havering Council: Reduce your Council Tax bill", "https://www.havering.gov.uk/council-tax/reduce-council-tax-bill"),
        src("GOV.UK: Cost of living help", "https://www.gov.uk/cost-of-living/benefits-tax-work"),
      ],
      { health: false },
    ),
    section(
      "benefits-check",
      "Get a free benefits check",
      `<ul>
<li><a href="https://www.gov.uk/benefits-calculators" target="_blank" rel="noopener">GOV.UK benefits calculators</a> are free, independent and anonymous. They give an estimate, not a decision, and may not cover every situation.</li>
<li><a href="https://www.citizensadvice.org.uk/" target="_blank" rel="noopener">Citizens Advice</a> and local welfare rights services can give free advice on what you might be entitled to and help with applications.</li>
</ul>
<p>Independent advice is especially important before making decisions, or if you already receive other benefits.</p>`,
      [src("GOV.UK: Benefits calculators", "https://www.gov.uk/benefits-calculators")],
      { health: false },
    ),
    section(
      "benefits-carers",
      "Support for carers",
      `<p>If you care for someone, there may be support for you too. Whether you qualify, and how it affects the benefits of the person you care for, depends on your situation, so get advice before claiming.</p>`,
      [src("Citizens Advice: What benefits can I get", "https://www.citizensadvice.org.uk/benefits/benefits-introduction/what-benefits-can-i-get/")],
      { health: false },
    ),
    section(
      "benefits-dignity",
      "Receiving benefits without shame",
      `<p>Comments like "You look well enough to work" can hurt. Someone may see a good day without seeing the pain, exhaustion and recovery afterwards. Receiving benefits does not mean someone is lazy or living an easy life.</p>
<p>You do not owe friends, neighbours or strangers your medical or financial history. Official applications do need accurate information, and any required changes must be reported.</p>`,
      [],
      { health: false, files: ["lib-guide-benefits"] },
    ),
  ],
});
