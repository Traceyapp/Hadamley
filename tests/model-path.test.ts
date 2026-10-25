import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The Claude answer path, with the SDK mocked so no real calls are made.
 * Checks citations, NOT_FOUND handling, refusals, API failures and the
 * monthly spend cap.
 */

const create = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  class APIError extends Error {
    status = 500;
  }
  class Anthropic {
    static APIError = APIError;
    beta = { messages: { create } };
  }
  return { default: Anthropic, APIError };
});

process.env.ANTHROPIC_API_KEY = "test-key-not-real";
process.env.AI_MONTHLY_BUDGET_USD = "25";

const { answer } = await import("@/lib/ai/answer");
const { mutate, readDb } = await import("@/lib/db");

const reply = (text: string, stop_reason = "end_turn") => ({
  content: [{ type: "text", text }],
  stop_reason,
  usage: { input_tokens: 2000, output_tokens: 200 },
});

beforeEach(async () => {
  create.mockReset();
  await mutate((db) => {
    db.settings.aiSpend = { month: new Date().toISOString().slice(0, 7), usd: 0, requests: 0 };
  });
});

describe("Claude answer path", () => {
  it("sends only retrieved content, with the guardrail system prompt and refusal fallbacks", async () => {
    create.mockResolvedValue(reply("Some services accept self-referral [1]."));
    await answer("Can I refer myself for physiotherapy?");
    const params = create.mock.calls[0][0];
    expect(params.model).toBe("claude-opus-5-5");
    expect(params.system).toMatch(/ONLY from the numbered sources/);
    expect(params.system).toMatch(/medical, legal or financial advice/);
    expect(params.fallbacks).toBe("default");
    expect(params.betas).toContain("server-side-fallback-2026-07-01");
    expect(params.messages[0].content).toMatch(/<sources>[\s\S]*\[1\][\s\S]*<\/sources>/);
  });

  it("keeps only the sources Claude cited and renumbers them", async () => {
    create.mockResolvedValue(reply("Romford Mobility Hire offers wheelchair hire [3]."));
    const r = await answer("Where can I hire a wheelchair?");
    expect(r.kind).toBe("answer");
    if (r.kind !== "answer") return;
    expect(r.mode).toBe("model");
    expect(r.text).toContain("[1]");
    expect(r.text).not.toContain("[3]");
    expect(r.sources).toHaveLength(1);
  });

  it("turns NOT_FOUND into a 'can't find that' reply", async () => {
    create.mockResolvedValue(reply("NOT_FOUND"));
    expect((await answer("Can I refer myself for physiotherapy?")).kind).toBe("not_found");
  });

  it("treats a refusal as not found rather than showing an empty answer", async () => {
    create.mockResolvedValue(reply("", "refusal"));
    expect((await answer("Can I refer myself for physiotherapy?")).kind).toBe("not_found");
  });

  it("falls back to quoting the content if the API fails", async () => {
    create.mockRejectedValue(new Error("network down"));
    const r = await answer("Can I refer myself for physiotherapy?");
    expect(r.kind).toBe("answer");
    if (r.kind === "answer") {
      expect(r.mode).toBe("extract");
      expect(r.notice).toMatch(/having trouble/);
    }
  });

  it("records spend, and stops calling Claude once the monthly cap is reached", async () => {
    create.mockResolvedValue(reply("Answer [1]."));
    await answer("Can I refer myself for physiotherapy?");
    expect(readDb().settings.aiSpend.requests).toBe(1);
    expect(readDb().settings.aiSpend.usd).toBeGreaterThan(0);

    await mutate((db) => {
      db.settings.aiSpend.usd = 25;
    });
    create.mockClear();
    const r = await answer("Can I refer myself for physiotherapy?");
    expect(create).not.toHaveBeenCalled();
    expect(r.kind === "answer" && r.mode).toBe("extract");
  });

  it("never calls Claude for crisis wording", async () => {
    await answer("I want to end my life");
    expect(create).not.toHaveBeenCalled();
  });
});
