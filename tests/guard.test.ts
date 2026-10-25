import { describe, expect, it } from "vitest";
import { checkGuards, EMERGENCY_MESSAGES } from "@/lib/ai/guard";

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

describe("physical emergency rules", () => {
  it.each([
    ["my dad has chest pain", "chest"],
    ["chest pian since this morning", "chest"],
    ["crushing pain in my chest", "chest"],
    ["is this a heart attack", "chest"],
    ["her face is drooping on one side", "stroke"],
    ["sudden slurred speech", "stroke"],
    ["I think he's having a stroke", "stroke"],
    ["I can't breathe properly", "breathing"],
    ["she is choking", "breathing"],
    ["my throat is swelling after eating nuts", "anaphylaxis"],
    ["he is unconscious", "general"],
    ["my knee is hot and swollen and I can't walk", "joint"],
  ])("sends %j to the %s message", (q, topic) => {
    expect(checkGuards(q)).toEqual({ kind: "crisis", topic });
  });

  it("lets a fibromyalgia or anxiety diagnosis change nothing", () => {
    expect(checkGuards("I have fibromyalgia and chest pain")).toEqual({ kind: "crisis", topic: "chest" });
    expect(checkGuards("my anxiety gives me chest tightness")).toEqual({ kind: "crisis", topic: "chest" });
  });

  it("leaves stroke recovery questions alone", () => {
    expect(checkGuards("stroke rehab groups in Romford")).toBeNull();
  });

  it("every message says what the helper cannot do, except the mental health one which says what Hadamley is", () => {
    for (const [topic, m] of Object.entries(EMERGENCY_MESSAGES)) {
      const text = m.lines.join(" ");
      expect(text, topic).toMatch(topic === "mental" ? /not a crisis/ : /cannot assess an emergency/);
      expect(m.calls.length, topic).toBeGreaterThan(0);
    }
  });
});

describe("Funeral Companion redirect", () => {
  it.each(["How do I arrange a funeral?", "I'm grieving my husband", "bereavement counselling near me", "my mum passed away last week", "help with probate", "How do I register a death?", "getting a death certificate"])(
    "redirects %j",
    (q) => {
      expect(checkGuards(q)?.kind).toBe("funeral");
    },
  );

  it.each(["Can I refer myself for physiotherapy?", "Where can I hire a wheelchair?", "Who can help with anxiety?"])("leaves %j alone", (q) => {
    expect(checkGuards(q)).toBeNull();
  });
});
