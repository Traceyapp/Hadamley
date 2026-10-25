export type PageStatus = "draft" | "published";
export type Template = "home" | "section" | "information" | "directory" | "resources";

export interface Page {
  id: string;
  /** Full path without the leading slash. "" is the homepage. */
  slug: string;
  title: string;
  navLabel?: string;
  template: Template;
  /** Top-level section key, e.g. "chronic-illness-support". */
  section: string;
  parentId: string | null;
  navOrder: number;
  showInNav: boolean;
  /** Short intro, also used as the meta description. */
  summary: string;
  /** Sanitised HTML from the rich-text editor. */
  body: string;
  /** Approved listings tagged with any of these topic slugs are embedded on the page. */
  listingTopics: string[];
  /** Fold-out accordion sections shown after the body. */
  sections?: PageSection[];
  status: PageStatus;
  updatedAt: string;
  updatedBy: string;
}

export interface PageSection {
  id: string;
  heading: string;
  /** Sanitised HTML. */
  body: string;
  /** Resources (downloads) attached to this section. */
  resourceIds: string[];
  /** Health information: ends with the full medical disclaimer. */
  health?: boolean;
  /** Condition-specific urgent warning, shown above the ordinary content. Plain text. */
  urgent?: string;
  /** Where the information comes from. */
  sources?: { label: string; url: string }[];
  /** "YYYY-MM-DD" the content was last reviewed. */
  reviewedAt?: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  status: PageStatus;
  publishedAt: string;
  updatedAt: string;
}

export interface NoticeEvent {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  /** Local date-time, "YYYY-MM-DDTHH:mm" (Europe/London). */
  startsAt: string;
  endsAt: string;
  location: string;
  online: boolean;
  cost: string;
  bookingUrl: string;
  status: PageStatus;
  updatedAt: string;
}

export type ProviderType = "nhs" | "council" | "charity" | "private";
export type Delivery = "clinic" | "home" | "online" | "phone";
export type ListingStatus = "to_research" | "online_checked" | "clarification_needed" | "approved";
export type TriState = "yes" | "no" | "unconfirmed";

export interface ListingExtras {
  deliveryCollection?: string;
  bookingRequirements?: string;
  hireLoanTerms?: string;
  wheelchairAccessible?: TriState;
  passengerStaysInWheelchair?: TriState;
}

export interface Listing {
  id: string;
  name: string;
  providerType: ProviderType;
  summary: string;
  description: string;
  agesServed: string;
  eligibility: string;
  /** Exactly what the provider says about referral. Never paraphrased. */
  referralRoute: string;
  selfReferral: TriState;
  address: string;
  delivery: Delivery[];
  phone: string;
  email: string;
  contactUrl: string;
  website: string;
  fees: string;
  feeConfirmed: boolean;
  contactConfirmed: boolean;
  accessibility: string;
  sourceUrls: string[];
  dateChecked: string;
  nextReviewDate: string;
  owner: string;
  status: ListingStatus;
  topicIds: string[];
  areaIds: string[];
  extras: ListingExtras;
  internalNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Taxon {
  id: string;
  name: string;
  slug: string;
  type: "topic" | "area";
  parentId: string | null;
  order: number;
}

export type ResourceKind = "guide" | "checklist" | "worksheet" | "journal" | "tracker" | "colouring" | "puzzle" | "activity" | "leaflet";

export interface Resource {
  id: string;
  title: string;
  description: string;
  kind: ResourceKind;
  topicIds: string[];
  fileName: string;
  storedName: string;
  mime: string;
  size: number;
  status: PageStatus;
  updatedAt: string;
}

export interface OutdatedReport {
  id: string;
  listingId: string;
  message: string;
  contact: string;
  createdAt: string;
  handled: boolean;
  handledAt: string | null;
}

export type ContactTopic = "general" | "resource" | "link";

export const CONTACT_TOPIC_LABEL: Record<ContactTopic, string> = {
  general: "General enquiry",
  resource: "Suggest a useful resource",
  link: "Report an incorrect or broken link",
};

export interface ContactMessage {
  id: string;
  topic?: ContactTopic;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  handled: boolean;
}

export interface AiChunk {
  id: string;
  sourceType: "page" | "listing" | "post" | "event";
  sourceId: string;
  title: string;
  url: string;
  text: string;
  updatedAt: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: "owner" | "developer";
  passwordHash: string;
  createdAt: string;
}

export interface Settings {
  funeralCompanionUrl: string;
  aiLastIndexedAt: string | null;
  aiLastIndexMs: number | null;
  aiSpend: { month: string; usd: number; requests: number };
  keepAnonymisedQuestions: boolean;
  /** Public contact email shown on the Contact page. */
  contactEmail?: string;
}

export interface Upload {
  id: string;
  fileName: string;
  storedName: string;
  mime: string;
  size: number;
  alt: string;
  createdAt: string;
}

export interface Database {
  version: number;
  pages: Page[];
  posts: Post[];
  events: NoticeEvent[];
  listings: Listing[];
  taxa: Taxon[];
  resources: Resource[];
  reports: OutdatedReport[];
  messages: ContactMessage[];
  chunks: AiChunk[];
  admins: AdminUser[];
  uploads: Upload[];
  questions: { q: string; at: string; kind: string }[];
  settings: Settings;
}

export const PROVIDER_LABEL: Record<ProviderType, string> = {
  nhs: "NHS",
  council: "Council",
  charity: "Charity",
  private: "Private",
};

export const DELIVERY_LABEL: Record<Delivery, string> = {
  clinic: "Clinic",
  home: "Home visit",
  online: "Online",
  phone: "Phone",
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  to_research: "To research",
  online_checked: "Online checked",
  clarification_needed: "Clarification needed",
  approved: "Approved for publication",
};

export const KIND_LABEL: Record<ResourceKind, string> = {
  guide: "Guide",
  checklist: "Checklist",
  worksheet: "Worksheet",
  journal: "Journal",
  tracker: "Tracker",
  colouring: "Colouring",
  puzzle: "Puzzle",
  activity: "Activity",
  leaflet: "Leaflet",
};

export const KIND_PLURAL: Record<ResourceKind, string> = {
  guide: "Guides",
  checklist: "Checklists",
  worksheet: "Worksheets",
  journal: "Journals",
  tracker: "Trackers",
  colouring: "Colouring",
  puzzle: "Puzzles",
  activity: "Activities",
  leaflet: "Leaflets",
};
