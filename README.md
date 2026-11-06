# Hadamley

Stage 1 of Hadamley: a form-driven information and signposting site for people living with long term conditions, disability and mental health needs in Havering, Romford, Brentwood and nearby. Built from `Hadamley_Build_Spec.pdf`.

## Run it

```bash
npm install
npm run dev -- -p 3100
```

Open http://localhost:3100. The admin area is at `/admin`. Sign-in details for the two local accounts (owner and developer support) are in `.env.local`, which is generated per machine and never committed.

`npm run reset-data` wipes `data/db.json` and uploads. The next request rebuilds them from the seed.

## Tests

```bash
npm test
```

52 tests cover the acceptance checklist without a browser: the crisis rule and Funeral Companion redirect, what the AI is allowed to see (approved and published content only, no unconfirmed fees or contacts, no internal notes), the three Addendum 1 listing demos, page publish and unpublish, every directory filter, and HTML sanitising. The Claude answer path is tested with the SDK mocked: citations, NOT_FOUND, refusals, API failure fallback and the monthly spend cap. Tests run on a throwaway copy of the seed and never touch `data/`.

To check answer quality against the real API (about 12 calls, roughly $0.15 to $0.30):

```bash
OPENAI_API_KEY=sk-... npm run eval:helper
```

## What's here

| Area | Where |
| --- | --- |
| 16 launch pages on 4 templates (Home, Section/Information, Directory, Resource library) | `src/app/(site)` |
| Directory: free-text search, filters for topic, provider type, area and delivery mode, listing detail, report outdated details | `src/app/(site)/find-support` |
| AI helper: crisis rule, Funeral Companion redirect, retrieval over approved content only, cited sources | `src/lib/ai`, `src/components/site/HelperWidget.tsx` |
| Admin: pages with rich-text editor, preview, publish and unpublish; listings with the four-state workflow and review dates; downloads with replace; topics, areas and menu; inbox; AI index refresh; settings and content export | `src/app/admin` |
| Visitor analytics: cookieless tracking and an admin board | `src/lib/analytics`, `src/app/admin/(app)/analytics` |
| Supabase schema (drafted, not in use) | `supabase/migrations/0001_hadamley_schema.sql` |

## How it is built

- Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript.
- Data lives in `data/db.json`, read and written through `src/lib/db.ts`. Public pages go through `src/lib/repo.ts`; the admin actions and the AI helper also call `db.ts` directly. A hosted database would replace `db.ts` and need those callers updated to await it, which is a moderate refactor, not a drop-in swap.
- **Hosting:** the JSON store needs a persistent, writable disk and a single server instance. Vercel and other serverless hosts reset their filesystem, so data and uploads would be lost there. Host on a small VM or a platform with a persistent volume (for example Render, Railway or Fly.io), and back up the `data/` folder. Supabase was considered and parked; the drafted schema in `supabase/migrations` is a starting point if that changes.
- Admin sign-in is an HMAC-signed, HTTP-only cookie with scrypt-hashed passwords, guarded by `requireAdmin()` in `src/lib/auth.ts`. Accounts live in the data store; the owner can remove the developer account from Settings.
- Re-indexing: saving a page or listing re-indexes that record only. Unpublishing or moving a listing out of Approved removes it from the index straight away. The Refresh button rebuilds everything and records the time.

### AI helper

1. Crisis wording returns the fixed NHS 111 / 999 message. The model is never called.
2. Grief, bereavement and funeral questions are redirected to The Funeral Companion.
3. The question is matched against approved, published content using BM25 keyword search with synonyms and a coverage rule, so off-topic questions don't match on a place name alone. Vector search (embeddings) is not built; it would help with unusual phrasings and is the natural next step for the helper.
4. With `OPENAI_API_KEY` set, OpenAI (`gpt-5.4-mini` at low reasoning effort) writes a short answer using only those chunks and cites them. Without a key, or past the monthly cap in `AI_MONTHLY_BUDGET_USD`, the helper quotes the matching content directly. If nothing relevant is found it says it can't find that on Hadamley.

Rate limit: 20 questions per visitor every 10 minutes, held in memory. That is correct for the single-server hosting above.

### Visitor analytics

Admin > Analytics (`/admin/analytics`) shows visitors, visits, page views, average visit time, bounce rate and "help found" (visits where someone went on to a service, tapped a phone number or email, downloaded a resource or got a useful answer from the helper). It also shows the trend over time, top and landing pages, channels and referring sites (including AI assistants and NHS or council sites), UTM campaigns, towns and countries with a local-reach share, devices, busiest hours and who is on the site now. Date ranges run from today to 12 months, and selecting any row filters the whole board.

- **Cookieless and anonymous.** No cookies, no third-party scripts, no IP addresses stored, and nothing stored in visitors' browsers. Each visitor gets an HMAC hash of IP and browser with a salt that changes at UK midnight (keyed by `SESSION_SECRET`), so nobody can be followed across days. Helper questions are never recorded, only the kind of reply. Records older than 400 days are deleted.
- **Accuracy filters** (the Stage 2 plan's promises, each covered in `tests/analytics.test.ts`):
  - Admins' own visits are never counted, even after signing out. Every admin screen sets a `hadamley-analytics-ignore` mark in that browser's localStorage, and the endpoint also skips anyone signed in.
  - Search engine robots, link-preview fetchers and automated browsers (`navigator.webdriver`) are left out.
  - Test copies never touch the real numbers: Vercel preview and development deployments are ignored, and so is a local copy pointed at the real Supabase.
  - Each page counts once per view, including when Back or Forward restores it from the browser's memory. "Page not found" screens are left out (marked with `data-analytics-404`).
  - Days follow UK time.
  - Facebook, Instagram and WhatsApp are recognised when the app hides the referrer: from Android's `android-app://` referrer, the apps' built-in browsers, or the `fbclid` on the link. `gclid` and `msclkid` mark paid search.
- **Help found** counts visits that went on to a service's website, tapped a phone number or email, downloaded a resource, or got a useful helper reply. Helper replies that found nothing don't count.
- **Definitions** follow GA4 and Plausible: a visit ends after 30 minutes without activity, and a visit is "engaged" if it lasts 10 seconds or more, views 2 or more pages, or includes a key action. Bounce rate is the share of visits that were not engaged. Visitors are counted per day.
- **Where things are:** tracker `src/components/site/Analytics.tsx`, endpoint `src/app/api/hv/route.ts`, logic `src/lib/analytics`, board `src/app/admin/(app)/analytics`.
- **Storage:** the Supabase table `analytics_events`. Run `supabase/migrations/0002_analytics.sql` once in the SQL Editor; until then the board shows setup steps. Without Supabase, records go to `data/analytics.jsonl`.
- **Location** comes from Vercel's `x-vercel-ip-*` headers (Cloudflare's `cf-ipcountry` as a fallback), so towns show only when hosted on Vercel. IP location is approximate.
- **Check Supabase is ready:** `npm run analytics:check` (read-only; needs the Supabase keys in `.env.local`).

### Search engines

- `/sitemap.xml` lists every published page and approved listing; `/robots.txt` points to it and keeps `/admin`, `/api` and `/files` out.
- Every page's title, description, canonical and share tags are in the `<head>` for all visitors (`htmlLimitedBots` in `next.config.ts`). Descriptions are trimmed to about 160 characters at a sentence break (`metaDescription` in `src/lib/seo.ts`).
- **Google Search Console:** a Domain property verified by a DNS TXT record is best (it covers www and non-www). If DNS isn't available, use the URL-prefix property's HTML tag: set `GOOGLE_SITE_VERIFICATION` to the tag's `content` value and redeploy.
- **Bing Webmaster Tools:** use "Import from Google Search Console" once Google is verified, or set `BING_SITE_VERIFICATION` (the `msvalidate.01` value). Bing also feeds Yahoo and DuckDuckGo.
- Submit `https://www.hadamley.com/sitemap.xml` in both.
- Lighthouse on 6 November 2026: performance 90–99 on phones and 97–100 on desktop; accessibility, best practices and SEO all 100.

## Acceptance checklist status

Checked locally in the browser and against the API:

- [x] Add a listing, approve it, see it in the directory and in an AI answer with the right link
- [x] Amend a contact detail, see the new detail on the site and in the AI index
- [x] Unapprove a listing: gone from the site (404), search and AI answers
- [x] Create, preview, publish and unpublish an information page
- [x] Filters for topic, provider type, area and delivery mode; date checked on every listing
- [x] Report outdated details creates a report Tracey can see and mark handled
- [x] Urgent wording shows the NHS 111 and 999 message without calling the model
- [x] Funeral questions redirect to The Funeral Companion; link in header and footer
- [x] Off-topic questions get "can't find that"
- [x] Refresh AI helper works and shows the last run time
- [x] Works at phone and desktop widths; keyboard focus styles, skip link, labelled forms, text size control
- [ ] Replace a downloadable file (built, not yet clicked through)
- [ ] Formal accessibility audit (axe, screen reader pass)
- [ ] Live check of AI-written answers (`npm run eval:helper` with a real key)
- [ ] Hosting with a persistent disk, domain, handover recording and written guide

## Before launch

- **Sample listings.** The 14 listings are samples that show every field and workflow state. Phone numbers use Ofcom drama ranges and websites use example.org. Replace them with the content pack listings.
- **The Funeral Companion URL** is a placeholder. Set it in Admin > Settings.
- **Privacy and Accessibility pages** are drafts for Tracey to approve, including the decision on keeping anonymised AI questions.
- **Content pack open points** are loaded as "Clarification needed" so they stay off the site: the Talking Therapies age wording and the OT fee (£325 or £375).
- **Hosting**: choose a host with a persistent disk (see above), set the environment variables from `.env.example`, and schedule a backup of `data/`.
