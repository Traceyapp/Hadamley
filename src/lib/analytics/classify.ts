/**
 * Turns raw request details into the dimensions the analytics board reports
 * on: device, browser, operating system, bot or not, and the marketing
 * channel a visit came from. Pure functions, so they are easy to test.
 */

export type Device = "Mobile" | "Tablet" | "Desktop";

export type Channel =
  | "Direct"
  | "Organic search"
  | "Social"
  | "AI assistants"
  | "NHS & council"
  | "Email"
  | "Paid"
  | "Referral";

export const CHANNELS: Channel[] = ["Direct", "Organic search", "Social", "AI assistants", "NHS & council", "Email", "Paid", "Referral"];

const BOT = /bot|crawl|spider|slurp|scrap|fetch|headless|lighthouse|pagespeed|preview|monitor|uptime|curl|wget|python|axios|node-fetch|go-http|java\/|phantom|selenium|puppeteer|playwright|facebookexternalhit|embedly|whatsapp\/|vercel-screenshot/i;

export function isBot(ua: string) {
  return !ua || ua.length < 20 || BOT.test(ua);
}

export function deviceOf(ua: string, width?: number): Device {
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(ua)) return "Tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(ua)) return "Mobile";
  // iPadOS reports itself as a Mac; the screen width gives it away.
  if (/Macintosh/.test(ua) && width && width <= 1366 && width >= 744 && /Safari/.test(ua) && !/Chrome/.test(ua)) return width < 1024 ? "Tablet" : "Desktop";
  return "Desktop";
}

export function browserOf(ua: string) {
  if (/SamsungBrowser/i.test(ua)) return "Samsung Internet";
  if (/Edg(e|A|iOS)?\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Firefox|FxiOS/.test(ua)) return "Firefox";
  if (/Chrome|CriOS/.test(ua)) return "Chrome";
  if (/Safari/.test(ua)) return "Safari";
  return "Other";
}

export function osOf(ua: string) {
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Mac OS X|Macintosh/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Other";
}

/** Android reports the app a link was opened from as android-app://<package>. */
const ANDROID_APPS: Record<string, string> = {
  "com.google.android.gm": "mail.google.com",
  "com.google.android.googlequicksearchbox": "google.com",
  "com.whatsapp": "whatsapp.com",
  "com.whatsapp.w4b": "whatsapp.com",
  "com.facebook.katana": "facebook.com",
  "com.facebook.lite": "facebook.com",
  "com.facebook.orca": "messenger.com",
  "com.instagram.android": "instagram.com",
  "com.linkedin.android": "linkedin.com",
  "com.twitter.android": "x.com",
  "com.zhiliaoapp.musically": "tiktok.com",
  "com.reddit.frontpage": "reddit.com",
  "org.telegram.messenger": "t.me",
  "com.nextdoor": "nextdoor.co.uk",
  "com.microsoft.office.outlook": "outlook.live.com",
};

/**
 * Social apps often open links in their own built-in browser and send no
 * referrer. Their browser identifies itself, so the source can still be named.
 */
export function inAppSource(ua: string) {
  if (/FBAN|FBAV|FB_IAB|FB4A|FBIOS/.test(ua)) return /Messenger/i.test(ua) ? "messenger.com" : "facebook.com";
  if (/Instagram/.test(ua)) return "instagram.com";
  if (/WhatsApp/i.test(ua)) return "whatsapp.com";
  if (/LinkedInApp/i.test(ua)) return "linkedin.com";
  if (/musical_ly|TikTok|BytedanceWebview/i.test(ua)) return "tiktok.com";
  if (/Snapchat/i.test(ua)) return "snapchat.com";
  if (/Pinterest/i.test(ua)) return "pinterest.com";
  if (/Twitter/i.test(ua)) return "x.com";
  return "";
}

/** Ad and social click ids the platforms add to links: fbclid (Facebook/Instagram), gclid (Google Ads), msclkid (Microsoft Ads). */
export function clickIdSource(id: string | undefined): { host: string; paid: boolean } | null {
  if (id === "fb") return { host: "facebook.com", paid: false };
  if (id === "g") return { host: "google.com", paid: true };
  if (id === "ms") return { host: "bing.com", paid: true };
  return null;
}

/** "https://l.facebook.com/x?y" -> "facebook.com". Returns "" for no referrer or our own site. */
export function referrerHost(referrer: string, ownHost?: string) {
  if (!referrer) return "";
  if (referrer.startsWith("android-app://")) {
    const app = referrer.slice("android-app://".length).split("/")[0] ?? "";
    return ANDROID_APPS[app] ?? (app.startsWith("com.google") ? "google.com" : app);
  }
  let host: string;
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return "";
  }
  host = host.replace(/^(www|m|l|lm|mobile|out)\./, "");
  if (ownHost && (host === ownHost.replace(/^www\./, "") || host === "localhost")) return "";
  return host;
}

const SEARCH = /(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|yahoo\.[a-z.]+|ecosia\.org|baidu\.com|yandex\.[a-z.]+|search\.brave\.com|startpage\.com|qwant\.com|ask\.com|aol\.[a-z.]+)$/;
const AI = /(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|bard\.google\.com|copilot\.microsoft\.com|you\.com|phind\.com|meta\.ai|grok\.com|deepseek\.com|mistral\.ai)$/;
const SOCIAL = /(^|\.)(facebook\.com|fb\.com|instagram\.com|t\.co|x\.com|twitter\.com|linkedin\.com|lnkd\.in|whatsapp\.com|wa\.me|nextdoor\.(com|co\.uk)|tiktok\.com|youtube\.com|youtu\.be|reddit\.com|pinterest\.[a-z.]+|threads\.net|bsky\.app|mastodon\.[a-z.]+|snapchat\.com|messenger\.com|telegram\.org|t\.me)$/;
const EMAIL = /(^|\.)(mail\.google\.com|outlook\.(live|office|office365)\.com|mail\.yahoo\.com|mail\.aol\.com|webmail\.|mail\.)/;
const PUBLIC = /(^|\.)(nhs\.uk|nhs\.net|gov\.uk|nhs\.scot|nhs\.wales|hscni\.net)$/;

/** The channel a visit came from, from its referrer host and any utm_ tags, in the usual industry groupings. */
export function channelOf(host: string, utm: { source?: string; medium?: string } = {}): Channel {
  const medium = (utm.medium ?? "").toLowerCase();
  const source = (utm.source ?? "").toLowerCase();
  if (/^(cpc|ppc|paid|paidsearch|paid[-_ ]?social|display|cpm|banner)/.test(medium)) return "Paid";
  if (/e-?mail|newsletter/.test(medium) || /newsletter|mailchimp|e-?mail/.test(source)) return "Email";
  if (/social|sm$/.test(medium)) return "Social";
  const h = host || source;
  if (!h) return "Direct";
  if (AI.test(h) || /chatgpt|perplexity|claude|gemini|copilot/.test(source)) return "AI assistants";
  // Before search, so mail.google.com is email rather than Google search.
  if (EMAIL.test(h)) return "Email";
  if (SEARCH.test(h) || /^(google|bing|duckduckgo|yahoo|ecosia)$/.test(source)) return "Organic search";
  if (SOCIAL.test(h) || /^(facebook|fb|instagram|twitter|x|linkedin|whatsapp|nextdoor|tiktok|youtube|reddit)$/.test(source)) return "Social";
  if (PUBLIC.test(h)) return "NHS & council";
  return "Referral";
}

/** Friendly names for the referrer list. */
export function sourceLabel(host: string) {
  if (!host) return "Direct / none";
  const known: [RegExp, string][] = [
    [/(^|\.)google\.[a-z.]+$/, "Google"],
    [/(^|\.)bing\.com$/, "Bing"],
    [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
    [/(^|\.)yahoo\.[a-z.]+$/, "Yahoo"],
    [/(^|\.)ecosia\.org$/, "Ecosia"],
    [/(^|\.)(facebook\.com|fb\.com|messenger\.com)$/, "Facebook"],
    [/(^|\.)instagram\.com$/, "Instagram"],
    [/(^|\.)(t\.co|x\.com|twitter\.com)$/, "X (Twitter)"],
    [/(^|\.)(linkedin\.com|lnkd\.in)$/, "LinkedIn"],
    [/(^|\.)(whatsapp\.com|wa\.me)$/, "WhatsApp"],
    [/(^|\.)nextdoor\.(com|co\.uk)$/, "Nextdoor"],
    [/(^|\.)(youtube\.com|youtu\.be)$/, "YouTube"],
    [/(^|\.)(chatgpt\.com|chat\.openai\.com)$/, "ChatGPT"],
    [/(^|\.)perplexity\.ai$/, "Perplexity"],
    [/(^|\.)claude\.ai$/, "Claude"],
    [/(^|\.)gemini\.google\.com$/, "Gemini"],
    [/(^|\.)copilot\.microsoft\.com$/, "Copilot"],
    [/(^|\.)mail\.google\.com$/, "Gmail"],
    [/(^|\.)outlook\.(live|office|office365)\.com$/, "Outlook"],
  ];
  for (const [re, name] of known) if (re.test(host)) return name;
  return host;
}

/** Towns and boroughs Hadamley serves, for the "local reach" figure. IP location is approximate. */
export const LOCAL_PLACES = [
  "Romford", "Hornchurch", "Upminster", "Rainham", "Harold Wood", "Harold Hill", "Gidea Park", "Collier Row", "Elm Park", "Havering",
  "Brentwood", "Shenfield", "Ingatestone", "Billericay", "Ilford", "Dagenham", "Barking", "Chadwell Heath", "Basildon", "Grays", "Thurrock",
  "Chelmsford", "South Ockendon", "Aveley", "Purfleet", "Chigwell", "Epping", "Loughton",
];
const LOCAL = new Set(LOCAL_PLACES.map((p) => p.toLowerCase()));
export const isLocalPlace = (city: string) => !!city && LOCAL.has(city.toLowerCase());
