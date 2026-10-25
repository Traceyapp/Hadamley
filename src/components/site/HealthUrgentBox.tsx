import { AlertTriangle, Phone } from "lucide-react";

const call = "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 font-bold";
const primary = `${call} bg-urgent text-white hover:bg-urgent-strong dark:text-[#1b0b0a]`;
const secondary = `${call} border-2 border-brand bg-surface text-brand hover:bg-brand-tint`;

/**
 * Urgent help shown above the content on health pages, never inside an
 * accordion, so it is visible without opening anything and works even if the
 * AI helper is unavailable. Wording is based on NHS guidance; review before launch.
 */
export function HealthUrgentBox({ kind }: { kind: "mental" | "physical" }) {
  if (kind === "mental") {
    return (
      <section aria-labelledby="urgent-mh" className="mb-10 rounded-[var(--radius-card)] border-2 border-urgent bg-urgent-soft p-5 sm:p-6">
        <h2 id="urgent-mh" className="flex items-center gap-2.5 font-display text-[1.45rem] font-semibold text-urgent">
          <AlertTriangle className="size-6 shrink-0" aria-hidden /> Feeling suicidal or need urgent help?
        </h2>
        <ul className="mt-3 space-y-2 text-ink">
          <li>
            <strong>Call 999 or go to A&amp;E</strong> if a life is at risk, or you or someone else cannot keep safe. Do not wait to fill in a form or use the helper.
          </li>
          <li>
            <strong>NHS 111:</strong> in England, call 111 and choose the mental health option for urgent help.
          </li>
          <li>
            <strong>Samaritans: 116 123.</strong> Free, day or night, 365 days a year. A safe place to talk without judgement.
          </li>
        </ul>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <a href="tel:999" className={primary}>
            <Phone className="size-4" aria-hidden /> Call 999
          </a>
          <a href="tel:111" className={secondary}>
            <Phone className="size-4" aria-hidden /> Call NHS 111
          </a>
          <a href="tel:116123" className={secondary}>
            <Phone className="size-4" aria-hidden /> Samaritans
          </a>
        </div>
        <p className="mt-4 text-[0.92rem] text-ink-2">
          Hadamley is an information service, not a counselling, crisis or emergency service.{" "}
          <a href="https://www.samaritans.org/how-we-can-help/contact-samaritan/" target="_blank" rel="noopener" className="link">
            Other ways to contact Samaritans
          </a>
          .
        </p>
      </section>
    );
  }
  return (
    <section aria-labelledby="urgent-ph" className="mb-10 rounded-[var(--radius-card)] border-2 border-urgent bg-urgent-soft p-5 sm:p-6">
      <h2 id="urgent-ph" className="flex items-center gap-2.5 font-display text-[1.45rem] font-semibold text-urgent">
        <AlertTriangle className="size-6 shrink-0" aria-hidden /> When to get urgent help
      </h2>
      <p className="mt-2 font-bold text-ink">Call 999 for:</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-ink">
        <li>chest pain that is sudden and does not go away, or spreads to the arms, neck, jaw, stomach or back, or comes with sweating, sickness or breathlessness</li>
        <li>any sign of a stroke: the face drops on one side, they cannot lift both arms, or speech is slurred. Even if it stops</li>
        <li>severe difficulty breathing: gasping, choking or not able to get words out</li>
        <li>swelling of the lips, tongue or throat after a possible allergic trigger</li>
      </ul>
      <p className="mt-3 font-bold text-ink">Contact NHS 111 or your GP the same day for:</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-ink">
        <li>a sudden, very painful joint that is hot, swollen or hard to move. It can be an infection, even without a temperature</li>
        <li>new or worsening symptoms that worry you</li>
      </ul>
      <p className="mt-3 text-ink">Do not put new symptoms down to a condition you already have without getting them checked.</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <a href="tel:999" className={primary}>
          <Phone className="size-4" aria-hidden /> Call 999
        </a>
        <a href="tel:111" className={secondary}>
          <Phone className="size-4" aria-hidden /> Call NHS 111
        </a>
      </div>
    </section>
  );
}
