import { describe, expect, it } from "vitest";
import { mutate, readDb } from "@/lib/db";
import { reindexRecord } from "@/lib/ai/chunks";
import { getApprovedListing, getPublishedPage, searchListings } from "@/lib/repo";
import { answer } from "@/lib/ai/answer";
import type { Listing } from "@/lib/types";

/**
 * The three demos Addendum 1 asks for, plus page publishing. These mirror
 * what the admin save actions do: change the record, then re-index it.
 */

const base = (): Listing => ({
  id: "test-hydrotherapy-pool",
  name: "Upminster Hydrotherapy Pool",
  providerType: "charity",
  summary: "Warm-water hydrotherapy sessions for people with arthritis and joint pain.",
  description: "",
  agesServed: "Adults",
  eligibility: "Anyone",
  referralRoute: "Self-referral accepted. Call to book an assessment session first.",
  selfReferral: "yes",
  address: "",
  delivery: ["clinic"],
  phone: "01632 960 444",
  email: "",
  contactUrl: "",
  website: "",
  fees: "",
  feeConfirmed: false,
  contactConfirmed: true,
  accessibility: "",
  sourceUrls: [],
  dateChecked: "2026-10-19",
  nextReviewDate: "2027-04-19",
  owner: "Tracey",
  status: "to_research",
  topicIds: ["t-physiotherapy"],
  areaIds: ["a-upminster"],
  extras: {},
  internalNotes: "",
  createdAt: "2026-10-19T00:00:00.000Z",
  updatedAt: "2026-10-19T00:00:00.000Z",
});

function save(l: Listing) {
  mutate((db) => {
    const i = db.listings.findIndex((x) => x.id === l.id);
    if (i >= 0) db.listings[i] = l;
    else db.listings.push(l);
    reindexRecord(db, "listing", l.id);
  });
}

const helperUrls = async (q: string) => {
  const r = await answer(q);
  return "sources" in r ? r.sources.map((s) => s.url) : [];
};

describe("Addendum 1 demos", () => {
  it("1. a new listing stays hidden until approved, then appears in the directory and the helper", async () => {
    save(base());
    expect(getApprovedListing("test-hydrotherapy-pool")).toBeUndefined();
    expect(await helperUrls("hydrotherapy for arthritis in Upminster")).not.toContain("/find-support/test-hydrotherapy-pool");

    save({ ...base(), status: "approved" });
    expect(searchListings({ topic: ["physiotherapy"], area: ["upminster"] }).map((l) => l.id)).toContain("test-hydrotherapy-pool");
    expect(await helperUrls("hydrotherapy for arthritis in Upminster")).toContain("/find-support/test-hydrotherapy-pool");
  });

  it("2. an amended contact detail reaches the site and the helper", () => {
    save({ ...base(), status: "approved", phone: "01632 960 999" });
    expect(getApprovedListing("test-hydrotherapy-pool")?.phone).toBe("01632 960 999");
    const chunk = readDb().chunks.find((c) => c.sourceId === "test-hydrotherapy-pool");
    expect(chunk?.text).toContain("01632 960 999");
    expect(chunk?.text).not.toContain("01632 960 444");
  });

  it("3. moving a listing out of Approved removes it from the site, search and helper", async () => {
    save({ ...base(), status: "clarification_needed" });
    expect(getApprovedListing("test-hydrotherapy-pool")).toBeUndefined();
    expect(searchListings({ q: "hydrotherapy" })).toHaveLength(0);
    expect(readDb().chunks.some((c) => c.sourceId === "test-hydrotherapy-pool")).toBe(false);
    expect(await helperUrls("hydrotherapy for arthritis in Upminster")).not.toContain("/find-support/test-hydrotherapy-pool");
  });

  it("hides unconfirmed contact details from the helper", () => {
    save({ ...base(), status: "approved", contactConfirmed: false });
    const chunk = readDb().chunks.find((c) => c.sourceId === "test-hydrotherapy-pool");
    expect(chunk?.text).not.toContain("01632 960");
  });
});

describe("page publishing", () => {
  it("unpublishing a page removes it from the site and the helper, publishing brings it back", () => {
    const setStatus = (status: "draft" | "published") =>
      mutate((db) => {
        const p = db.pages.find((x) => x.id === "p-transport")!;
        p.status = status;
        reindexRecord(db, "page", p.id);
      });

    setStatus("draft");
    expect(getPublishedPage("mobility-daily-living-transport/transport")).toBeUndefined();
    expect(readDb().chunks.some((c) => c.sourceId === "p-transport")).toBe(false);

    setStatus("published");
    expect(getPublishedPage("mobility-daily-living-transport/transport")).toBeDefined();
    expect(readDb().chunks.some((c) => c.sourceId === "p-transport")).toBe(true);
  });
});
