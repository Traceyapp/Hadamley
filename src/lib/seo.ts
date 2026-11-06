import { SITE_URL } from "./site-url";

/** Creates one stable public URL, including for canonical and structured-data fields. */
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export const SHARE_IMAGE = absoluteUrl("/brand/hadamley-logo.jpg");

/**
 * A meta description that fits a Google result (about 160 characters).
 * Longer text is cut at the last full sentence that fits, or else at a word
 * break with an ellipsis, rather than mid-word by the search engine.
 */
export function metaDescription(text: string, max = 160) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const sentence = cut.match(/^.*[.!?](?=\s|$)/)?.[0];
  if (sentence && sentence.length >= 70) return sentence;
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + "…";
}

export function breadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}
