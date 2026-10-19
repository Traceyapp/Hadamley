import { describe, expect, it } from "vitest";
import { checkGuards } from "@/lib/ai/guard";

describe("crisis rule", () => {
  it.each([
    "I want to end my life",
    "I feel like I can't go on",
    "I've been self harming again",
    "thinking about suicide",
    "I don't want to be here anymore",
    "my dad has chest pain",
    "I took an overdose",
  ])("treats %j as urgent", (q) => {
    expect(checkGuards(q)?.kind).toBe("crisis");
  });

  it("does not treat non-emergency patient transport as urgent", () => {
    expect(checkGuards("How do I book non-emergency patient transport?")).toBeNull();
    expect(checkGuards("non emergency transport to hospital")).toBeNull();
  });

  it("puts crisis ahead of the funeral redirect", () => {
    expect(checkGuards("since the funeral I want to die")?.kind).toBe("crisis");
  });
});

describe("Funeral Companion redirect", () => {
  it.each(["How do I arrange a funeral?", "I'm grieving my husband", "bereavement counselling near me", "my mum passed away last week", "help with probate"])(
    "redirects %j",
    (q) => {
      expect(checkGuards(q)?.kind).toBe("funeral");
    },
  );

  it.each(["Can I refer myself for physiotherapy?", "Where can I hire a wheelchair?", "Who can help with anxiety?"])("leaves %j alone", (q) => {
    expect(checkGuards(q)).toBeNull();
  });
});
