import { describe, expect, it } from "vitest";
import { metaDescription } from "@/lib/seo";

describe("meta descriptions", () => {
  it("leaves short descriptions alone", () => {
    expect(metaDescription("Free guides and local support.")).toBe("Free guides and local support.");
  });

  it("cuts long ones at the last full sentence that fits", () => {
    const long =
      "Living with a long-term health condition can affect everyday tasks, relationships, work and emotional wellbeing. This section brings together information, practical tips and local support for 22 conditions.";
    expect(long.length).toBeGreaterThan(160);
    expect(metaDescription(long)).toBe("Living with a long-term health condition can affect everyday tasks, relationships, work and emotional wellbeing.");
  });

  it("falls back to a word break with an ellipsis, never mid-word", () => {
    const out = metaDescription(`${"Support for carers, families and friends, ".repeat(6)}in Havering`);
    expect(out.length).toBeLessThanOrEqual(161);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toMatch(/,…$/);
  });
});
