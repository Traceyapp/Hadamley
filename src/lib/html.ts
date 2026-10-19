import { slugify } from "./db";

export function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&pound;/g, "£");
}

export function htmlToText(html: string) {
  return decodeEntities(
    html
      .replace(/<li[^>]*>/gi, "\n- ")
      .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, "\n")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

export interface TocItem {
  id: string;
  text: string;
}

/** Adds stable ids to h2 headings and returns a table of contents. */
export function withHeadingIds(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const seen = new Set<string>();
  const out = html.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (_m, attrs: string, inner: string) => {
    const text = htmlToText(inner);
    const existing = /id="([^"]+)"/.exec(attrs)?.[1];
    let id = existing || slugify(text) || "section";
    while (!existing && seen.has(id)) id += "-2";
    seen.add(id);
    toc.push({ id, text });
    const rest = attrs.replace(/\s*id="[^"]*"/, "");
    return `<h2 id="${id}"${rest}>${inner}</h2>`;
  });
  return { html: out, toc };
}

/** Splits a page body into sections at each h2, for AI indexing. */
export function splitSections(html: string): { heading: string | null; id: string | null; text: string }[] {
  const { html: withIds } = withHeadingIds(html);
  const parts = withIds.split(/(?=<h2 )/i);
  return parts
    .map((part) => {
      const m = /<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/i.exec(part);
      return {
        heading: m ? htmlToText(m[2]) : null,
        id: m ? m[1] : null,
        text: htmlToText(m ? part.replace(m[0], "") : part),
      };
    })
    .filter((s) => s.text.length > 0);
}
