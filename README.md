# Hadamley

Stage 1 of Hadamley: a form-driven information and signposting site for people living with long term conditions, disability and mental health needs in Havering, Romford, Brentwood and nearby. Built from `Hadamley_Build_Spec.pdf`.

## Run it

```bash
npm install
npm run dev -- -p 3100
```

Open http://localhost:3100. The admin area is at `/admin`. Sign-in details for the two local accounts (owner and developer support) are in `.env.local`, which is generated per machine and never committed.

`npm run reset-data` wipes `data/db.json` and uploads. The next request rebuilds them from the seed.

## What's here

| Area | Where |
| --- | --- |
| 16 launch pages on 4 templates (Home, Section/Information, Directory, Resource library) | `src/app/(site)` |
| Directory: free-text search, filters for topic, provider type, area and delivery mode, listing detail, report outdated details | `src/app/(site)/find-support` |
| AI helper: crisis rule, Funeral Companion redirect, retrieval over approved content only, cited sources | `src/lib/ai`, `src/components/site/HelperWidget.tsx` |
| Admin: pages with rich-text editor, preview, publish and unpublish; listings with the four-state workflow and review dates; downloads with replace; topics, areas and menu; inbox; AI index refresh; settings and content export | `src/app/admin` |
| Supabase schema with RLS, pgvector and the re-index trigger | `supabase/migrations/0001_hadamley_schema.sql` |

## How it is built

- Next.js 15 (App Router), React 19, Tailwind CSS 4, TypeScript.
- Locally, data lives in `data/db.json` behind `src/lib/db.ts` and `src/lib/repo.ts`. Every read and write goes through those two files, so the move to Supabase replaces them and nothing else. The SQL migration mirrors the same rules: public reads only see published pages and approved listings, unconfirmed fees and contact details are hidden, and taking something off the site deletes its AI chunks in the same transaction.
- Admin sign-in is an HMAC-signed cookie, guarded by `requireAdmin()` in `src/lib/auth.ts`. In production that guard switches to Supabase Auth.
- Re-indexing: saving a page or listing re-indexes that record only. Unpublishing or moving a listing out of Approved removes it from the index straight away. The Refresh button rebuilds everything and records the time.

### AI helper

1. Crisis wording returns the fixed NHS 111 / 999 message. The model is never called.
2. Grief, bereavement and funeral questions are redirected to The Funeral Companion.
3. The question is matched against approved, published content. Locally this is BM25 lexical search; in production it is pgvector (`match_chunks`), with lexical search kept as the fallback.
4. With `ANTHROPIC_API_KEY` set, Claude (`claude-opus-5-5` at low effort, with server-side refusal fallbacks) writes a short answer using only those chunks and cites them. Without a key, or past the monthly cap in `AI_MONTHLY_BUDGET_USD`, the helper quotes the matching content directly. If nothing relevant is found it says it can't find that on Hadamley.

Rate limit: 20 questions per visitor every 10 minutes. The in-memory limiter suits one server; on Vercel, move it to a shared store.

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
- [ ] Supabase project, domain, handover recording and written guide

## Before launch

- **Sample listings.** The 14 listings are samples that show every field and workflow state. Phone numbers use Ofcom drama ranges and websites use example.org. Replace them with the content pack listings.
- **The Funeral Companion URL** is a placeholder. Set it in Admin > Settings.
- **Privacy and Accessibility pages** are drafts for Tracey to approve, including the decision on keeping anonymised AI questions.
- **Content pack open points** are loaded as "Clarification needed" so they stay off the site: the Talking Therapies age wording and the OT fee (£325 or £375).
- **Supabase**: create the project, run the migration, add a Storage bucket called `downloads`, deploy the re-index edge function (gte-small embeddings), and set `app.reindex_function_url` and `app.reindex_secret`.
