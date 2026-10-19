import { describe, expect, it } from "vitest";
import { searchListings } from "@/lib/repo";
import { readDb } from "@/lib/db";

const ids = (r: { id: string }[]) => r.map((l) => l.id);

describe("directory filters", () => {
  it("shows approved listings only", () => {
    const approved = readDb().listings.filter((l) => l.status === "approved");
    expect(searchListings({})).toHaveLength(approved.length);
    expect(ids(searchListings({}))).not.toContain("ot-at-home-practice");
  });

  it("filters by topic", () => {
    const r = searchListings({ topic: ["transport"] });
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((l) => l.topicIds.includes("t-transport"))).toBe(true);
  });

  it("filters by provider type", () => {
    expect(searchListings({ provider: ["nhs"] }).every((l) => l.providerType === "nhs")).toBe(true);
  });

  it("filters by delivery mode", () => {
    expect(searchListings({ delivery: ["home"] }).every((l) => l.delivery.includes("home"))).toBe(true);
  });

  it("includes borough-wide Havering services for Havering towns, but not for Brentwood", () => {
    expect(ids(searchListings({ area: ["romford"] }))).toContain("havering-adult-social-care-ot");
    expect(ids(searchListings({ area: ["brentwood"] }))).not.toContain("havering-adult-social-care-ot");
  });

  it("filters to self-referral and free services", () => {
    expect(searchListings({ self: true }).every((l) => l.selfReferral === "yes")).toBe(true);
    const free = searchListings({ free: true });
    expect(free.length).toBeGreaterThan(0);
    expect(free.every((l) => l.feeConfirmed && /free/i.test(l.fees))).toBe(true);
  });

  it("searches by free text", () => {
    expect(ids(searchListings({ q: "scooter" }))).toContain("romford-mobility-hire");
    expect(searchListings({ q: "zzzz-no-match" })).toHaveLength(0);
  });

  it("shows a date checked on every listing", () => {
    expect(searchListings({}).every((l) => /^\d{4}-\d{2}-\d{2}$/.test(l.dateChecked))).toBe(true);
  });
});
