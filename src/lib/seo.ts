import { SITE_URL } from "./site-url";

/** Creates one stable public URL, including for canonical and structured-data fields. */
export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export const SHARE_IMAGE = absoluteUrl("/brand/hadamley-logo.jpg");

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
