"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useActionState, useState } from "react";
import { saveListing, type ActionState } from "../../actions";
import type { Listing, ListingStatus, Taxon } from "@/lib/types";
import { DELIVERY_LABEL, PROVIDER_LABEL, STATUS_LABEL } from "@/lib/types";
import { ActionMessage, SubmitButton } from "@/components/admin/client";
import { btn, Card, CheckGroup, Field, input } from "@/components/admin/ui";

const STATUS_HELP: Record<ListingStatus, string> = {
  to_research: "Not checked yet. Hidden from the site and the AI helper.",
  online_checked: "Checked against the provider's website. Still hidden until approved.",
  clarification_needed: "Something needs confirming with the provider. Hidden until approved.",
  approved: "Live on the site, in search and in the AI helper.",
};

function TriSelect({ name, label, value }: { name: string; label: string; value?: string }) {
  return (
    <Field label={label} htmlFor={name}>
      <select id={name} name={name} defaultValue={value ?? "unconfirmed"} className={input}>
        <option value="unconfirmed">Not confirmed</option>
        <option value="yes">Yes, confirmed</option>
        <option value="no">No</option>
      </select>
    </Field>
  );
}

export function ListingForm({ listing, topics, areas, flash }: { listing?: Listing; topics: Taxon[]; areas: Taxon[]; flash?: string }) {
  const [state, action] = useActionState<ActionState, FormData>(saveListing, flash ? { ok: true, message: flash } : null);
  const [status, setStatus] = useState<ListingStatus>(listing?.status ?? "to_research");
  const today = new Date().toISOString().slice(0, 10);
  const l = listing;

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <input type="hidden" name="id" value={l?.id ?? ""} />
      <div className="min-w-0 space-y-6">

        <Card title="The service">
          <div className="grid gap-5 sm:grid-cols-[1fr_12rem]">
            <Field label="Service name" htmlFor="name">
              <input id="name" name="name" required defaultValue={l?.name} className={`${input} font-bold`} />
            </Field>
            <Field label="Provider type" htmlFor="providerType">
              <select id="providerType" name="providerType" defaultValue={l?.providerType ?? "charity"} className={input}>
                {Object.entries(PROVIDER_LABEL).map(([v, label]) => (
                  <option key={v} value={v}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="One-line description" htmlFor="summary" hint="Shown on listing cards." className="sm:col-span-2">
              <input id="summary" name="summary" maxLength={300} defaultValue={l?.summary} className={input} />
            </Field>
            <Field label="Full description" htmlFor="description" className="sm:col-span-2">
              <textarea id="description" name="description" rows={4} defaultValue={l?.description} className={input} />
            </Field>
          </div>
        </Card>

        <Card title="Who it is for and how to access it">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Ages served" htmlFor="agesServed" hint="Copy exactly what the provider says.">
              <input id="agesServed" name="agesServed" defaultValue={l?.agesServed} className={input} />
            </Field>
            <Field label="Self-referral" htmlFor="selfReferral" hint="Only choose Yes if the provider says so.">
              <select id="selfReferral" name="selfReferral" defaultValue={l?.selfReferral ?? "unconfirmed"} className={input}>
                <option value="unconfirmed">Not confirmed</option>
                <option value="yes">Yes, self-referral accepted</option>
                <option value="no">No, referral needed</option>
              </select>
            </Field>
            <Field label="Eligibility" htmlFor="eligibility" hint="Include GP practice or postcode rules, not only the clinic address." className="sm:col-span-2">
              <textarea id="eligibility" name="eligibility" rows={2} defaultValue={l?.eligibility} className={input} />
            </Field>
            <Field label="Referral route (exact wording)" htmlFor="referralRoute" hint="Shown word for word on the listing. Never summarise as self-referral unless stated." className="sm:col-span-2">
              <textarea id="referralRoute" name="referralRoute" rows={2} defaultValue={l?.referralRoute} className={input} />
            </Field>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <CheckGroup legend="Topics" name="topicIds" options={topics.map((t) => ({ value: t.id, label: t.name }))} selected={l?.topicIds ?? []} columns={1} />
            <CheckGroup legend="Areas covered" name="areaIds" options={areas.map((t) => ({ value: t.id, label: t.name }))} selected={l?.areaIds ?? []} columns={1} />
          </div>
          <div className="mt-5">
            <CheckGroup legend="How it is delivered" name="delivery" options={Object.entries(DELIVERY_LABEL).map(([v, label]) => ({ value: v, label }))} selected={l?.delivery ?? []} columns={3} />
          </div>
        </Card>

        <Card title="Contact and cost">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Phone" htmlFor="phone">
              <input id="phone" name="phone" type="tel" defaultValue={l?.phone} className={input} />
            </Field>
            <Field label="Email" htmlFor="email">
              <input id="email" name="email" type="email" defaultValue={l?.email} className={input} />
            </Field>
            <Field label="Website" htmlFor="website">
              <input id="website" name="website" type="url" placeholder="https://" defaultValue={l?.website} className={input} />
            </Field>
            <Field label="Contact form link" htmlFor="contactUrl">
              <input id="contactUrl" name="contactUrl" type="url" placeholder="https://" defaultValue={l?.contactUrl} className={input} />
            </Field>
            <Field label="Address" htmlFor="address" className="sm:col-span-2">
              <input id="address" name="address" defaultValue={l?.address} className={input} />
            </Field>
            <label className="flex items-start gap-2.5 rounded-xl border border-line p-3 sm:col-span-2">
              <input type="checkbox" name="contactConfirmed" defaultChecked={l?.contactConfirmed ?? false} className="mt-1 size-[1.1rem] accent-[var(--brand)]" />
              <span>
                <span className="font-bold">Contact details confirmed</span>
                <span className="block text-sm text-ink-2">Unconfirmed contact details are hidden on the site and never given to the AI helper.</span>
              </span>
            </label>
            <Field label="Fees" htmlFor="fees" hint="Copy the provider's wording." className="sm:col-span-2">
              <input id="fees" name="fees" defaultValue={l?.fees} className={input} />
            </Field>
            <label className="flex items-start gap-2.5 rounded-xl border border-line p-3 sm:col-span-2">
              <input type="checkbox" name="feeConfirmed" defaultChecked={l?.feeConfirmed ?? false} className="mt-1 size-[1.1rem] accent-[var(--brand)]" />
              <span>
                <span className="font-bold">Fee confirmed</span>
                <span className="block text-sm text-ink-2">Unconfirmed fees show as &ldquo;check with the provider&rdquo; and are never given to the AI helper.</span>
              </span>
            </label>
            <Field label="Accessibility" htmlFor="accessibility" className="sm:col-span-2">
              <textarea id="accessibility" name="accessibility" rows={2} defaultValue={l?.accessibility} className={input} />
            </Field>
          </div>
        </Card>

        <Card title="Mobility and transport details" description="Optional. Shown only on listings tagged with equipment or transport topics.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Delivery or collection options" htmlFor="deliveryCollection" className="sm:col-span-2">
              <input id="deliveryCollection" name="deliveryCollection" defaultValue={l?.extras.deliveryCollection} className={input} />
            </Field>
            <Field label="Booking requirements" htmlFor="bookingRequirements" className="sm:col-span-2">
              <input id="bookingRequirements" name="bookingRequirements" defaultValue={l?.extras.bookingRequirements} className={input} />
            </Field>
            <Field label="Hire or loan terms" htmlFor="hireLoanTerms" className="sm:col-span-2">
              <input id="hireLoanTerms" name="hireLoanTerms" defaultValue={l?.extras.hireLoanTerms} className={input} />
            </Field>
            <TriSelect name="wheelchairAccessible" label="Wheelchair accessible" value={l?.extras.wheelchairAccessible} />
            <TriSelect name="passengerStaysInWheelchair" label="Passenger can stay in wheelchair" value={l?.extras.passengerStaysInWheelchair} />
          </div>
        </Card>

        <Card title="Sources and notes">
          <div className="space-y-5">
            <Field label="Source links" htmlFor="sourceUrls" hint="One web address per line. Shown publicly on the listing.">
              <textarea id="sourceUrls" name="sourceUrls" rows={3} defaultValue={l?.sourceUrls.join("\n")} className={input} />
            </Field>
            <Field label="Internal notes" htmlFor="internalNotes" hint="Private. Never shown on the site or to the AI helper.">
              <textarea id="internalNotes" name="internalNotes" rows={3} defaultValue={l?.internalNotes} className={input} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <Card title="Status">
          <fieldset>
            <legend className="sr-only">Listing status</legend>
            <div className="space-y-2">
              {(Object.keys(STATUS_LABEL) as ListingStatus[]).map((s) => (
                <label
                  key={s}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 ${status === s ? (s === "approved" ? "border-ok bg-ok-soft" : "border-brand bg-brand-tint") : "border-line hover:bg-sand"}`}
                >
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="mt-1 accent-[var(--brand)]" />
                  <span>
                    <span className="block font-bold">{STATUS_LABEL[s]}</span>
                    <span className="block text-[0.82rem] text-ink-2">{STATUS_HELP[s]}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <SubmitButton className={`${btn.primary} mt-4 w-full`} pendingText="Saving...">
            {status === "approved" ? (l?.status === "approved" ? "Save live listing" : "Save and approve") : "Save listing"}
          </SubmitButton>
          <div className="mt-3">
            <ActionMessage state={state} />
          </div>
          {l?.status === "approved" && (
            <Link href={`/find-support/${l.id}`} target="_blank" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:underline">
              View on site <ExternalLink className="size-3.5" aria-hidden />
            </Link>
          )}
        </Card>

        <Card title="Checking">
          <div className="space-y-4">
            <Field label="Date checked" htmlFor="dateChecked" hint="Shown on the listing.">
              <input id="dateChecked" name="dateChecked" type="date" max={today} defaultValue={l?.dateChecked ?? today} className={input} />
            </Field>
            <Field label="Next review date" htmlFor="nextReviewDate" hint="Only you can see this.">
              <input id="nextReviewDate" name="nextReviewDate" type="date" defaultValue={l?.nextReviewDate} className={input} />
            </Field>
            <Field label="Owner" htmlFor="owner">
              <input id="owner" name="owner" defaultValue={l?.owner} className={input} />
            </Field>
          </div>
        </Card>
      </div>
    </form>
  );
}
