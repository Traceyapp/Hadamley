/** The public address of the site, for the sitemap and share links. Set SITE_URL once the domain is live. */
export const SITE_URL = (process.env.SITE_URL || (process.env.NODE_ENV === "production" ? "https://www.hadamley.com" : "http://localhost:3100")).replace(/\/+$/, "");
