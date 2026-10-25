import { ensureDb } from "@/lib/db";
import { Bot, ShieldCheck } from "lucide-react";
import { readDb } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { AdminHeader, Card } from "@/components/admin/ui";
import { RefreshAiButton } from "./RefreshAiButton";
import { TestConsole } from "./TestConsole";

export const metadata = { title: "AI helper" };

export default async function AiAdmin() {
  await ensureDb();
  const db = readDb();
  const pages = new Set(db.chunks.filter((c) => c.sourceType === "page").map((c) => c.sourceId)).size;
  const listings = db.chunks.filter((c) => c.sourceType === "listing").length;
  const hiddenListings = db.listings.filter((l) => l.status !== "approved").length;
  const draftPages = db.pages.filter((p) => p.status === "draft").length;
  const cap = Number(process.env.AI_MONTHLY_BUDGET_USD || 25);
  const modelOn = Boolean(process.env.OPENAI_API_KEY);
  const month = new Date().toISOString().slice(0, 7);
  const spend = db.settings.aiSpend.month === month ? db.settings.aiSpend : { usd: 0, requests: 0 };

  return (
    <>
      <AdminHeader title="AI helper" description="The helper answers only from published pages and approved listings. Changes are picked up as soon as you save." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-6">
          <Card title="Try a question" description="Test the helper exactly as a visitor would see it.">
            <TestConsole />
          </Card>
          <Card title="Guardrails" aside={<ShieldCheck className="size-5 text-ok" aria-hidden />}>
            <ul className="space-y-2.5 text-[0.95rem]">
              {[
                "Urgent or crisis wording shows a fixed NHS 111 and 999 message. The AI model is never called.",
                "Grief, bereavement and funeral questions are redirected to The Funeral Companion.",
                "Answers use only approved listings and published pages, and always link to the source.",
                "Unconfirmed fees and contact details are never indexed.",
                "If nothing relevant is found, the helper says it can't find that on Hadamley.",
                "No medical, legal or financial advice, and no personal recommendations.",
                "Rate limited to 20 questions per visitor every 10 minutes, with a monthly spend cap.",
              ].map((g) => (
                <li key={g} className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ok" aria-hidden />
                  {g}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Index" aside={<Bot className="size-5 text-brand" aria-hidden />}>
            <dl className="space-y-3 text-[0.95rem]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Last updated</dt>
                <dd className="text-right font-bold">{formatDateTime(db.settings.aiLastIndexedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Pages indexed</dt>
                <dd className="font-bold">{pages}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Listings indexed</dt>
                <dd className="font-bold">{listings}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Sections in total</dt>
                <dd className="font-bold">{db.chunks.length}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-2">Kept out (not approved or draft)</dt>
                <dd className="font-bold">
                  {hiddenListings} listings, {draftPages} pages
                </dd>
              </div>
            </dl>
            <div className="mt-5 border-t border-line pt-5">
              <RefreshAiButton />
              <p className="mt-2 text-[0.82rem] text-ink-2">Rebuilds everything. You only need this if something looks out of date.</p>
            </div>
          </Card>
          <Card title="Answer writing">
            <p className="text-[0.95rem]">
              {modelOn ? (
                <>
                  <strong className="text-ok">The AI model is writing answers</strong> from the retrieved content, with sources.
                </>
              ) : (
                <>
                  <strong>Quoting mode.</strong> No AI key is set, so the helper shows the closest matching content directly. Add <code className="rounded bg-sand px-1">OPENAI_API_KEY</code> to switch on written answers.
                </>
              )}
            </p>
            {modelOn && (
              <div className="mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-ink-2">This month</span>
                  <span className="font-bold">
                    ${spend.usd.toFixed(2)} of ${cap}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sand-2" role="progressbar" aria-valuenow={Math.round((spend.usd / cap) * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Monthly AI spend">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (spend.usd / cap) * 100)}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-ink-2">{spend.requests} answers written. At the cap, the helper switches to quoting mode until next month.</p>
              </div>
            )}
          </Card>
          {db.settings.keepAnonymisedQuestions && db.questions.length > 0 && (
            <Card title="Recent questions" description="Anonymised. Turn off in Settings.">
              <ul className="space-y-2 text-[0.9rem]">
                {db.questions.slice(0, 10).map((q, i) => (
                  <li key={i} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{q.q}</span>
                    <span className="shrink-0 text-xs text-ink-2">{q.kind.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
