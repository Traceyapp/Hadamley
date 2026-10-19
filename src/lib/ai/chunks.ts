import type { AiChunk, Database, Listing, Page } from "../types";
import { DELIVERY_LABEL, PROVIDER_LABEL } from "../types";
import { splitSections } from "../html";
import { formatDate } from "../format";

/**
 * Builds the AI helper's knowledge from PUBLISHED pages and APPROVED
 * listings only. Unconfirmed fees and contact details are left out.
 */

export function isIndexable(db: Database, type: "page" | "listing", id: string) {
  if (type === "page") return db.pages.find((p) => p.id === id)?.status === "published";
  return db.listings.find((l) => l.id === id)?.status === "approved";
}

export function pageChunks(page: Page): AiChunk[] {
  if (page.status !== "published") return [];
  const url = `/${page.slug}`;
  const now = new Date().toISOString();
  const chunks: AiChunk[] = [];
  const intro = page.summary ? `${page.summary}\n` : "";
  splitSections(page.body).forEach((s, i) => {
    chunks.push({
      id: `page:${page.id}:${i}`,
      sourceType: "page",
      sourceId: page.id,
      title: s.heading ? `${page.title}: ${s.heading}` : page.title,
      url: s.id ? `${url}#${s.id}` : url,
      text: (i === 0 ? intro : "") + s.text,
      updatedAt: now,
    });
  });
  if (chunks.length === 0 && page.summary) {
    chunks.push({ id: `page:${page.id}:0`, sourceType: "page", sourceId: page.id, title: page.title, url, text: page.summary, updatedAt: now });
  }
  return chunks;
}

export function listingChunk(l: Listing, db: Database): AiChunk[] {
  if (l.status !== "approved") return [];
  const topics = l.topicIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
  const areas = l.areaIds.map((id) => db.taxa.find((t) => t.id === id)?.name).filter(Boolean).join(", ");
  const lines = [
    `Service: ${l.name} (${PROVIDER_LABEL[l.providerType]})`,
    l.summary,
    l.description,
    topics && `Topics: ${topics}`,
    areas && `Areas covered: ${areas}`,
    l.agesServed && `Ages served: ${l.agesServed}`,
    l.eligibility && `Eligibility: ${l.eligibility}`,
    l.referralRoute && `Referral (as stated by the provider): ${l.referralRoute}`,
    l.delivery.length && `How it is delivered: ${l.delivery.map((d) => DELIVERY_LABEL[d]).join(", ")}`,
    l.feeConfirmed && l.fees && `Fees (as listed): ${l.fees}`,
    l.contactConfirmed && l.phone && `Phone: ${l.phone}`,
    l.contactConfirmed && l.email && `Email: ${l.email}`,
    l.contactConfirmed && l.website && `Website: ${l.website}`,
    l.address && `Address: ${l.address}`,
    l.accessibility && `Accessibility: ${l.accessibility}`,
    l.extras.deliveryCollection && `Delivery or collection: ${l.extras.deliveryCollection}`,
    l.extras.bookingRequirements && `Booking: ${l.extras.bookingRequirements}`,
    l.extras.hireLoanTerms && `Hire or loan terms: ${l.extras.hireLoanTerms}`,
    l.extras.wheelchairAccessible === "yes" && "Wheelchair accessible vehicle: confirmed",
    l.extras.passengerStaysInWheelchair === "yes" && "Passenger can stay in their wheelchair: confirmed",
    `Last checked: ${formatDate(l.dateChecked)}`,
  ].filter(Boolean);
  return [
    {
      id: `listing:${l.id}`,
      sourceType: "listing",
      sourceId: l.id,
      title: l.name,
      url: `/find-support/${l.id}`,
      text: lines.join("\n"),
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function chunksFor(db: Database, type: "page" | "listing", id: string): AiChunk[] {
  if (type === "page") {
    const p = db.pages.find((x) => x.id === id);
    return p ? pageChunks(p) : [];
  }
  const l = db.listings.find((x) => x.id === id);
  return l ? listingChunk(l, db) : [];
}

export function buildAllChunks(db: Database): AiChunk[] {
  return [
    ...db.pages.flatMap((p) => pageChunks(p)),
    ...db.listings.flatMap((l) => listingChunk(l, db)),
  ];
}

/** Replace one record's chunks in place. Removes them if it is no longer public. */
export function reindexRecord(db: Database, type: "page" | "listing", id: string) {
  db.chunks = db.chunks.filter((c) => !(c.sourceType === type && c.sourceId === id));
  db.chunks.push(...chunksFor(db, type, id));
  db.settings.aiLastIndexedAt = new Date().toISOString();
}
