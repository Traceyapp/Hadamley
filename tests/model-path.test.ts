import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The OpenAI answer path, with the SDK mocked so no real calls are made.
 * Checks citations, NOT_FOUND handling, refusals, API failures and the
 * monthly spend cap.
 */

const create = vi.fn();

vi.mock("openai", () => {
  class APIError extends Error {
    status = 500;
  }
  class OpenAI {
    static APIError = APIError;
    responses = { create };
  }
  return { default: OpenAI, APIError };
});

process.env.OPENAI_API_KEY = "test-key-not-real";
process.env.AI_MONTHLY_BUDGET_USD = "25";

const { answer } = await import("@/lib/ai/answer");
const { mutate, readDb } = await import("@/lib/db");

const reply = (text: string, stop_reason = "end_turn") => ({
  status: "completed",
  output_text: stop_reason === "refusal" ? "" : text,
  output: [{ type: "message", content: stop_reason === "refusal" ? [{ type: "refusal", refusal: "no" }] : [{ type: "output_text", text }] }],
  usage: { input_tokens: 2000, output_tokens: 200 },
});

beforeEach(async () => {
  create.mockReset();
  await mutate((db) => {
    db.settings.aiSpend = { month: new Date().toISOString().slice(0, 7), usd: 0, requests: 0 };
  });
});

describe("AI answer path", () => {
  it("sends only retrieved content, with the guardrail instructions", async () => {
    create.mockResolvedValue(reply("Some services accept self-referral [1]."));
    await answer("Can I refer myself for physiotherapy?");
    const params = create.mock.calls[0][0];
    expect(params.model).toBe("gpt-5.4-mini");
    expect(params.instructions).toMatch(/ONLY from the numbered sources/);
    expect(params.instructions).toMatch(/medical, legal or financial advice/);
    expect(params.store).toBe(false);
    expect(params.input).toMatch(/<sources>[\s\S]*\[1\][\s\S]*<\/sources>/);
  });

  it("keeps only the sources the model cited and renumbers them", async () => {
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

describe("easy read and the writing helper", () => {
  it("makes an easy read version once per page version, cleaned of unsafe HTML", async () => {
    const { easyRead } = await import("@/lib/ai/easy-read");
    const page = readDb().pages.find((p) => p.id === "p-physio")!;
    create.mockResolvedValue(reply('<h3>Physiotherapy</h3><p>A physio helps you move.</p><script>alert(1)</script><a href="https://evil.example">x</a>'));
    const html = await easyRead(page);
    expect(html).toContain("<h3>Physiotherapy</h3>");
    expect(html).not.toContain("<script");
    expect(create.mock.calls[0][0].instructions).toMatch(/Use ONLY the information in the page/);
    expect(create.mock.calls[0][0].input).toContain(page.title);
    await easyRead(page);
    expect(create).toHaveBeenCalledTimes(1); // cached until the page changes
  });

  it("suggests a tidy-up without changing links and strips code fences", async () => {
    const { tidyWriting } = await import("@/lib/ai/writing");
    create.mockResolvedValue(reply('```html\n<p>Call us on <a href="tel:01708000000">01708 000000</a>.</p><iframe src="x"></iframe>\n```'));
    const out = await tidyWriting("<p>call us on <a href=\"tel:01708000000\">01708 000000</a></p>");
    expect(out).toBe('<p>Call us on <a href="tel:01708000000">01708 000000</a>.</p>');
    expect(create.mock.calls[0][0].instructions).toMatch(/Never use em dashes/);
  });

  it("returns nothing when the monthly budget is used up", async () => {
    const { tidyWriting } = await import("@/lib/ai/writing");
    await mutate((db) => {
      db.settings.aiSpend.usd = 25;
    });
    expect(await tidyWriting("<p>Some text to tidy up here.</p>")).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });
});
