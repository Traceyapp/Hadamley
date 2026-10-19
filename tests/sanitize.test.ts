import { describe, expect, it } from "vitest";
import { cleanBody } from "@/lib/sanitize";
import { withHeadingIds } from "@/lib/html";

describe("page body sanitising", () => {
  it("strips scripts, event handlers and javascript links", () => {
    const out = cleanBody('<p onclick="x()">Hi</p><script>alert(1)</script><a href="javascript:alert(1)">bad</a><img src="x" onerror="y()">');
    expect(out).not.toMatch(/script|onclick|onerror|javascript:/i);
    expect(out).toContain("<p>Hi</p>");
  });

  it("opens external links safely in a new tab and leaves internal links alone", () => {
    const out = cleanBody('<a href="https://example.org">ext</a><a href="/find-support">int</a>');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('<a href="/find-support">int</a>');
  });

  it("keeps the formatting the editor produces", () => {
    const html = "<h2>Title</h2><h3>Sub</h3><ul><li><strong>a</strong></li></ul><ol><li><em>b</em></li></ol><blockquote><p>q</p></blockquote>";
    expect(cleanBody(html)).toBe(html);
  });
});

describe("heading anchors", () => {
  it("adds unique ids to h2 headings and builds a table of contents", () => {
    const { html, toc } = withHeadingIds("<h2>Getting help</h2><p>x</p><h2>Getting help</h2>");
    expect(toc.map((t) => t.id)).toEqual(["getting-help", "getting-help-2"]);
    expect(html).toContain('<h2 id="getting-help">');
  });
});
