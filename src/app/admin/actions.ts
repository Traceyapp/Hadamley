"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkCredentials, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { mutate, nowIso, readDb, slugify, uid, UPLOAD_DIR } from "@/lib/db";
import { cleanBody } from "@/lib/sanitize";
import { buildAllChunks, reindexRecord } from "@/lib/ai/chunks";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { headers } from "next/headers";
import type { Delivery, Listing, ListingStatus, Page, PageSection, ProviderType, ResourceKind, Template, TriState } from "@/lib/types";

export type ActionState = { ok: boolean; message: string; id?: string } | null;

const str = (f: FormData, k: string, max = 5000) => String(f.get(k) ?? "").trim().slice(0, max);
const list = (f: FormData, k: string) => f.getAll(k).map(String).filter(Boolean);
const lines = (f: FormData, k: string) =>
  str(f, k, 4000)
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);

function refreshSite() {
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ auth */

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!rateLimit(clientKey({ headers: await headers() }, "login"), 8, 15 * 60_000)) {
    return { ok: false, message: "Too many attempts. Please wait 15 minutes and try again." };
  }
  const user = checkCredentials(str(form, "email", 200), String(form.get("password") ?? ""));
  if (!user) return { ok: false, message: "That email and password don't match an admin account." };
  await createSession(user.email);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/* ----------------------------------------------------------------- pages */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
const isReserved = (slug: string) => /^(admin|api|files)(\/|$)|^find-support\//.test(slug);

/** Reads accordion sections from the editor's JSON, cleaning every field. */
function parseSections(raw: FormDataEntryValue | null, fallback: PageSection[]): PageSection[] {
  if (typeof raw !== "string") return fallback;
  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return fallback;
    return arr
      .slice(0, 40)
      .map((s) => ({
        id: /^[a-z0-9-]{1,40}$/i.test(String(s?.id)) ? String(s.id) : `s-${uid()}`,
        heading: String(s?.heading ?? "").trim().slice(0, 200),
        body: cleanBody(String(s?.body ?? "")),
        resourceIds: Array.isArray(s?.resourceIds) ? s.resourceIds.map(String).slice(0, 20) : [],
        health: s?.health === true,
        urgent: String(s?.urgent ?? "").trim().slice(0, 1000) || undefined,
        sources: Array.isArray(s?.sources)
          ? s.sources
              .slice(0, 20)
              .map((x: { label?: unknown; url?: unknown }) => ({ label: String(x?.label ?? "").trim().slice(0, 200), url: String(x?.url ?? "").trim().slice(0, 500) }))
              .filter((x: { url: string }) => /^https?:\/\//i.test(x.url))
          : [],
        reviewedAt: /^\d{4}-\d{2}-\d{2}$/.test(String(s?.reviewedAt)) ? String(s.reviewedAt) : undefined,
      }))
      .filter((s) => s.heading);
  } catch {
    return fallback;
  }
}

export async function savePage(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = str(form, "id");
  const intent = str(form, "intent"); // save | publish | unpublish
  const title = str(form, "title", 200);
  const template = str(form, "template") as Template;
  let slug = str(form, "slug", 200).replace(/^\/+|\/+$/g, "").toLowerCase();
  if (!title) return { ok: false, message: "Please give the page a title." };

  const db = readDb();
  const existing = db.pages.find((p) => p.id === id);
  if (existing?.template === "home") slug = "";
  else {
    if (!slug) slug = slugify(title);
    if (!SLUG_RE.test(slug)) return { ok: false, message: "The web address can only use lowercase letters, numbers, hyphens and slashes." };
    if (isReserved(slug))
      return { ok: false, message: "That web address is reserved. Please choose another." };
    if (db.pages.some((p) => p.slug === slug && p.id !== id)) return { ok: false, message: `Another page already uses /${slug}.` };
  }

  const parentId = str(form, "parentId") || null;
  const parent = parentId ? db.pages.find((p) => p.id === parentId) : undefined;
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : existing?.status ?? "draft";

  const next: Page = {
    id: existing?.id ?? uid("p-"),
    slug,
    title,
    navLabel: str(form, "navLabel", 60) || undefined,
    template: existing?.template === "home" ? "home" : template || "information",
    section: parent ? parent.section : slug.split("/")[0] || "home",
    parentId: parent?.id ?? null,
    navOrder: Number(str(form, "navOrder")) || 0,
    showInNav: form.get("showInNav") === "on",
    summary: str(form, "summary", 400),
    body: cleanBody(String(form.get("body") ?? "")),
    listingTopics: list(form, "listingTopics"),
    sections: parseSections(form.get("sections"), existing?.sections ?? []),
    status,
    updatedAt: nowIso(),
    updatedBy: user.name,
  };

  mutate((d) => {
    const i = d.pages.findIndex((p) => p.id === next.id);
    if (i >= 0) d.pages[i] = next;
    else d.pages.push(next);
    // Database trigger equivalent: re-index this page only.
    reindexRecord(d, "page", next.id);
  });
  refreshSite();
  const verb = intent === "publish" ? (existing?.status === "published" ? "Changes published" : "Page published") : intent === "unpublish" ? "Page unpublished and removed from the site and AI helper" : "Draft saved";
  if (!existing) redirect(`/admin/pages/${next.id}?saved=${encodeURIComponent(verb)}`);
  return { ok: true, message: verb, id: next.id };
}

export async function deletePage(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    const p = d.pages.find((x) => x.id === id);
    if (!p || p.template === "home" || d.pages.some((c) => c.parentId === id)) return;
    d.pages = d.pages.filter((x) => x.id !== id);
    d.chunks = d.chunks.filter((c) => !(c.sourceType === "page" && c.sourceId === id));
  });
  refreshSite();
  redirect("/admin/pages?saved=Page+deleted");
}

/* -------------------------------------------------------------- listings */

const TRI = (v: string): TriState => (v === "yes" || v === "no" ? v : "unconfirmed");

export async function saveListing(_prev: ActionState, form: FormData): Promise<ActionState> {
  const user = await requireAdmin();
  const id = str(form, "id");
  const name = str(form, "name", 200);
  if (!name) return { ok: false, message: "Please enter the service name." };
  const db = readDb();
  const existing = db.listings.find((l) => l.id === id);
  const status = (str(form, "status") || "to_research") as ListingStatus;
  const dateChecked = str(form, "dateChecked");
  if (status === "approved" && !dateChecked) return { ok: false, message: "Add the date checked before approving a listing." };

  let newId = existing?.id ?? slugify(name);
  if (!existing) {
    let n = 2;
    const base = newId;
    while (db.listings.some((l) => l.id === newId)) newId = `${base}-${n++}`;
  }

  const next: Listing = {
    id: newId,
    name,
    providerType: (str(form, "providerType") || "charity") as ProviderType,
    summary: str(form, "summary", 300),
    description: str(form, "description", 3000),
    agesServed: str(form, "agesServed", 200),
    eligibility: str(form, "eligibility", 1000),
    referralRoute: str(form, "referralRoute", 1000),
    selfReferral: TRI(str(form, "selfReferral")),
    address: str(form, "address", 300),
    delivery: list(form, "delivery") as Delivery[],
    phone: str(form, "phone", 60),
    email: str(form, "email", 200),
    contactUrl: str(form, "contactUrl", 500),
    website: str(form, "website", 500),
    fees: str(form, "fees", 500),
    feeConfirmed: form.get("feeConfirmed") === "on",
    contactConfirmed: form.get("contactConfirmed") === "on",
    accessibility: str(form, "accessibility", 1000),
    sourceUrls: lines(form, "sourceUrls"),
    dateChecked,
    nextReviewDate: str(form, "nextReviewDate"),
    owner: str(form, "owner", 100) || user.name,
    status,
    topicIds: list(form, "topicIds"),
    areaIds: list(form, "areaIds"),
    extras: {
      deliveryCollection: str(form, "deliveryCollection", 500) || undefined,
      bookingRequirements: str(form, "bookingRequirements", 500) || undefined,
      hireLoanTerms: str(form, "hireLoanTerms", 500) || undefined,
      wheelchairAccessible: TRI(str(form, "wheelchairAccessible")),
      passengerStaysInWheelchair: TRI(str(form, "passengerStaysInWheelchair")),
    },
    internalNotes: str(form, "internalNotes", 3000),
    createdAt: existing?.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };

  mutate((d) => {
    const i = d.listings.findIndex((l) => l.id === next.id);
    if (i >= 0) d.listings[i] = next;
    else d.listings.push(next);
    reindexRecord(d, "listing", next.id);
  });
  refreshSite();
  const msg =
    status === "approved"
      ? existing?.status === "approved"
        ? "Listing updated. The site and AI helper now show the new details."
        : "Listing approved. It is now live in the directory and the AI helper."
      : existing?.status === "approved"
        ? "Listing saved and removed from the site, search and AI helper."
        : "Listing saved. It is not public until approved.";
  if (!existing) redirect(`/admin/listings/${next.id}?saved=${encodeURIComponent(msg)}`);
  return { ok: true, message: msg, id: next.id };
}

export async function deleteListing(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    d.listings = d.listings.filter((l) => l.id !== id);
    d.chunks = d.chunks.filter((c) => !(c.sourceType === "listing" && c.sourceId === id));
    d.reports = d.reports.filter((r) => r.listingId !== id);
  });
  refreshSite();
  redirect("/admin/listings?saved=Listing+deleted");
}

export async function markChecked(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const today = new Date().toISOString().slice(0, 10);
  const review = new Date(Date.now() + 182 * 86_400_000).toISOString().slice(0, 10);
  mutate((d) => {
    const l = d.listings.find((x) => x.id === id);
    if (!l) return;
    l.dateChecked = today;
    l.nextReviewDate = review;
    l.updatedAt = nowIso();
    reindexRecord(d, "listing", id);
  });
  refreshSite();
}

/* ------------------------------------------------------------- resources */

const MAX_FILE = 10 * 1024 * 1024;
const ALLOWED = /\.(pdf|docx?|xlsx?|pptx?|txt|rtf|odt|png|jpe?g|webp|gif|svg)$/i;

function storeFile(file: File) {
  const clean = file.name.replace(/[^\w.\-]+/g, "-").replace(/-+/g, "-").slice(-80);
  const storedName = `${uid()}-${clean}`;
  return { storedName, clean };
}

export async function saveResource(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title", 200);
  if (!title) return { ok: false, message: "Please give the download a title." };
  const file = form.get("file");
  const hasFile = file instanceof File && file.size > 0;
  const db = readDb();
  const existing = db.resources.find((r) => r.id === id);
  if (!existing && !hasFile) return { ok: false, message: "Please choose a file to upload." };
  if (hasFile) {
    if (file.size > MAX_FILE) return { ok: false, message: "Files must be 10 MB or smaller to keep the site fast." };
    if (!ALLOWED.test(file.name)) return { ok: false, message: "That file type isn't allowed. Use PDF, Word, Excel, PowerPoint, text or an image." };
  }

  let fileMeta = existing ? { fileName: existing.fileName, storedName: existing.storedName, mime: existing.mime, size: existing.size } : null;
  if (hasFile) {
    const { storedName: fresh, clean } = storeFile(file);
    // Replacing keeps the same stored name, so any link to the file keeps working.
    const storedName = existing?.storedName ?? fresh;
    fs.writeFileSync(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));
    fileMeta = { fileName: clean, storedName, mime: file.type || "application/octet-stream", size: file.size };
  }
  const newId = existing?.id ?? uid("r-");
  mutate((d) => {
    const next = {
      id: newId,
      title,
      description: str(form, "description", 600),
      kind: (str(form, "kind") || "guide") as ResourceKind,
      topicIds: list(form, "topicIds"),
      status: form.get("status") === "published" ? ("published" as const) : ("draft" as const),
      updatedAt: nowIso(),
      ...fileMeta!,
    };
    const i = d.resources.findIndex((r) => r.id === newId);
    if (i >= 0) d.resources[i] = next;
    else d.resources.unshift(next);
  });
  refreshSite();
  return { ok: true, message: existing ? (hasFile ? "File replaced and details saved." : "Details saved.") : "Download added.", id: newId };
}

export async function deleteResource(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    const r = d.resources.find((x) => x.id === id);
    if (r) fs.rmSync(path.join(UPLOAD_DIR, r.storedName), { force: true });
    d.resources = d.resources.filter((x) => x.id !== id);
  });
  refreshSite();
  redirect("/admin/resources?saved=Download+removed");
}

/** Image upload for the rich-text editor. Returns the public URL. */
export async function uploadImage(form: FormData): Promise<{ ok: boolean; url?: string; message?: string }> {
  await requireAdmin();
  const file = form.get("file");
  const alt = str(form, "alt", 300);
  if (!(file instanceof File) || !file.size) return { ok: false, message: "No file chosen." };
  if (file.size > 4 * 1024 * 1024) return { ok: false, message: "Images must be 4 MB or smaller." };
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(file.type)) return { ok: false, message: "Use a PNG, JPG, WebP or GIF image." };
  const { storedName, clean } = storeFile(file);
  fs.writeFileSync(path.join(UPLOAD_DIR, storedName), Buffer.from(await file.arrayBuffer()));
  mutate((d) => {
    d.uploads.unshift({ id: uid("u-"), fileName: clean, storedName, mime: file.type, size: file.size, alt, createdAt: nowIso() });
  });
  return { ok: true, url: `/files/${storedName}` };
}

/* ----------------------------------------------------- topics, areas, nav */

export async function saveTaxon(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = str(form, "name", 100);
  const type = str(form, "type") === "area" ? "area" : "topic";
  if (!name) return { ok: false, message: "Please enter a name." };
  const slug = slugify(name);
  const db = readDb();
  if (db.taxa.some((t) => t.slug === slug)) return { ok: false, message: `"${name}" already exists.` };
  mutate((d) => {
    const order = d.taxa.filter((t) => t.type === type).length;
    d.taxa.push({ id: `${type === "topic" ? "t" : "a"}-${slug}`, name, slug, type, parentId: null, order });
  });
  refreshSite();
  return { ok: true, message: `${type === "topic" ? "Topic" : "Area"} added.` };
}

export async function renameTaxon(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const name = str(form, "name", 100);
  if (!name) return;
  mutate((d) => {
    const t = d.taxa.find((x) => x.id === id);
    if (t) t.name = name;
    d.chunks = buildAllChunks(d);
  });
  refreshSite();
}

export async function deleteTaxon(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    d.taxa = d.taxa.filter((t) => t.id !== id);
    for (const l of d.listings) {
      l.topicIds = l.topicIds.filter((x) => x !== id);
      l.areaIds = l.areaIds.filter((x) => x !== id);
    }
    for (const r of d.resources) r.topicIds = r.topicIds.filter((x) => x !== id);
    d.chunks = buildAllChunks(d);
  });
  refreshSite();
}

export async function moveTaxon(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const dir = str(form, "dir") === "up" ? -1 : 1;
  mutate((d) => {
    const t = d.taxa.find((x) => x.id === id);
    if (!t) return;
    const group = d.taxa.filter((x) => x.type === t.type).sort((a, b) => a.order - b.order);
    const i = group.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= group.length) return;
    [group[i].order, group[j].order] = [j, i];
    group.forEach((g, k) => {
      if (k !== i && k !== j) g.order = k;
    });
  });
  refreshSite();
}

export async function moveNav(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const dir = str(form, "dir") === "up" ? -1 : 1;
  mutate((d) => {
    const p = d.pages.find((x) => x.id === id);
    if (!p) return;
    const group = d.pages.filter((x) => x.parentId === p.parentId && x.showInNav && x.template !== "home").sort((a, b) => a.navOrder - b.navOrder);
    const i = group.findIndex((x) => x.id === id);
    const j = i + dir;
    if (j < 0 || j >= group.length) return;
    [group[i], group[j]] = [group[j], group[i]];
    group.forEach((g, k) => (g.navOrder = k + 1));
  });
  refreshSite();
}

export async function toggleNav(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    const p = d.pages.find((x) => x.id === id);
    if (p && p.template !== "home") p.showInNav = !p.showInNav;
  });
  refreshSite();
}

/* ------------------------------------------------------------------ inbox */

export async function toggleReport(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    const r = d.reports.find((x) => x.id === id);
    if (r) {
      r.handled = !r.handled;
      r.handledAt = r.handled ? nowIso() : null;
    }
  });
  revalidatePath("/admin", "layout");
}

export async function toggleMessage(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    const m = d.messages.find((x) => x.id === id);
    if (m) m.handled = !m.handled;
  });
  revalidatePath("/admin", "layout");
}

export async function deleteMessage(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  mutate((d) => {
    d.messages = d.messages.filter((m) => m.id !== id);
    d.reports = d.reports.filter((r) => r.id !== id);
  });
  revalidatePath("/admin", "layout");
}

/* -------------------------------------------------------------------- AI */

export async function refreshAiIndex(): Promise<ActionState> {
  await requireAdmin();
  const started = Date.now();
  const count = mutate((d) => {
    d.chunks = buildAllChunks(d);
    d.settings.aiLastIndexedAt = nowIso();
    d.settings.aiLastIndexMs = Date.now() - started;
    return d.chunks.length;
  });
  revalidatePath("/admin", "layout");
  return { ok: true, message: `AI helper refreshed: ${count} sections of approved content indexed in ${Date.now() - started} ms.` };
}

/* --------------------------------------------------------------- settings */

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const url = str(form, "funeralCompanionUrl", 300);
  if (!/^https?:\/\/[^\s]+$/.test(url)) return { ok: false, message: "Enter a full web address starting with https://" };
  const contactEmail = str(form, "contactEmail", 200);
  if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) return { ok: false, message: "Please check the contact email address." };
  mutate((d) => {
    d.settings.funeralCompanionUrl = url;
    d.settings.keepAnonymisedQuestions = form.get("keepAnonymisedQuestions") === "on";
    d.settings.contactEmail = contactEmail;
    if (!d.settings.keepAnonymisedQuestions) d.questions = [];
  });
  refreshSite();
  return { ok: true, message: "Settings saved." };
}

/** The signed-in admin updates their own name, email and password. */
export async function updateAccount(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const name = str(form, "name", 80);
  const email = str(form, "email", 200).toLowerCase();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (!name) return { ok: false, message: "Please enter your name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Please enter a valid email address." };
  const db = readDb();
  const user = db.admins.find((a) => a.email === me.email);
  if (!user || !verifyPassword(current, user.passwordHash)) return { ok: false, message: "Your current password isn't right." };
  if (email !== me.email && db.admins.some((a) => a.email === email)) return { ok: false, message: "Another admin already uses that email." };
  if (next || confirm) {
    if (next.length < 10) return { ok: false, message: "Choose a new password of at least 10 characters." };
    if (next !== confirm) return { ok: false, message: "The new passwords don't match." };
  }
  mutate((d) => {
    const u = d.admins.find((a) => a.email === me.email);
    if (!u) return;
    u.name = name;
    u.email = email;
    if (next) u.passwordHash = hashPassword(next);
  });
  // The session is tied to the email, so re-issue it if the email changed.
  if (email !== me.email) await createSession(email);
  revalidatePath("/admin", "layout");
  return { ok: true, message: next ? "Account and password updated." : "Account updated." };
}

export async function removeAdmin(form: FormData) {
  const me = await requireAdmin();
  if (me.role !== "owner") return;
  const email = str(form, "email");
  mutate((d) => {
    d.admins = d.admins.filter((a) => a.email !== email || a.role === "owner");
  });
  revalidatePath("/admin/settings");
}

/* ------------------------------------------------------------- noticeboard */

const LOCAL_DT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function uniqueSlug(base: string, taken: string[], own?: string) {
  let slug = base || "item";
  let n = 2;
  while (taken.includes(slug) && slug !== own) slug = `${base}-${n++}`;
  return slug;
}

export async function savePost(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const intent = str(form, "intent");
  const title = str(form, "title", 200);
  if (!title) return { ok: false, message: "Please give the post a title." };
  const db = readDb();
  const existing = db.posts.find((p) => p.id === id);
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : existing?.status ?? "draft";
  const next = {
    id: existing?.id ?? uid("post-"),
    slug: existing?.slug ?? uniqueSlug(slugify(title), db.posts.map((p) => p.slug)),
    title,
    summary: str(form, "summary", 400),
    body: cleanBody(String(form.get("body") ?? "")),
    status: status as "draft" | "published",
    publishedAt: str(form, "publishedAt") || existing?.publishedAt || new Date().toISOString().slice(0, 10),
    updatedAt: nowIso(),
  };
  mutate((d) => {
    const i = d.posts.findIndex((p) => p.id === next.id);
    if (i >= 0) d.posts[i] = next;
    else d.posts.unshift(next);
    reindexRecord(d, "post", next.id);
  });
  refreshSite();
  const msg = intent === "publish" ? "Post published on the noticeboard." : intent === "unpublish" ? "Post taken down." : "Draft saved.";
  if (!existing) redirect(`/admin/noticeboard/posts/${next.id}?saved=${encodeURIComponent(msg)}`);
  return { ok: true, message: msg, id: next.id };
}

export async function saveEvent(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const intent = str(form, "intent");
  const title = str(form, "title", 200);
  const startsAt = str(form, "startsAt");
  const endsAt = str(form, "endsAt");
  if (!title) return { ok: false, message: "Please give the event a title." };
  if (!LOCAL_DT.test(startsAt)) return { ok: false, message: "Please choose a start date and time." };
  if (endsAt && (!LOCAL_DT.test(endsAt) || endsAt < startsAt)) return { ok: false, message: "The end time must be after the start time." };
  const bookingUrl = str(form, "bookingUrl", 500);
  if (bookingUrl && !/^https?:\/\//.test(bookingUrl)) return { ok: false, message: "The booking link must start with https://" };
  const db = readDb();
  const existing = db.events.find((e) => e.id === id);
  const status = intent === "publish" ? "published" : intent === "unpublish" ? "draft" : existing?.status ?? "draft";
  const next = {
    id: existing?.id ?? uid("event-"),
    slug: existing?.slug ?? uniqueSlug(slugify(title), db.events.map((e) => e.slug)),
    title,
    summary: str(form, "summary", 400),
    body: cleanBody(String(form.get("body") ?? "")),
    startsAt,
    endsAt,
    location: str(form, "location", 200),
    online: form.get("online") === "on",
    cost: str(form, "cost", 100),
    bookingUrl,
    status: status as "draft" | "published",
    updatedAt: nowIso(),
  };
  mutate((d) => {
    const i = d.events.findIndex((e) => e.id === next.id);
    if (i >= 0) d.events[i] = next;
    else d.events.unshift(next);
    reindexRecord(d, "event", next.id);
  });
  refreshSite();
  const msg = intent === "publish" ? "Event pinned to the noticeboard." : intent === "unpublish" ? "Event taken down." : "Draft saved.";
  if (!existing) redirect(`/admin/noticeboard/events/${next.id}?saved=${encodeURIComponent(msg)}`);
  return { ok: true, message: msg, id: next.id };
}

export async function deleteNotice(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const kind = str(form, "kind") === "event" ? "event" : "post";
  mutate((d) => {
    if (kind === "event") d.events = d.events.filter((e) => e.id !== id);
    else d.posts = d.posts.filter((p) => p.id !== id);
    d.chunks = d.chunks.filter((c) => !(c.sourceType === kind && c.sourceId === id));
  });
  refreshSite();
  redirect("/admin/noticeboard?saved=Removed+from+the+noticeboard");
}
