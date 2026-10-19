import Link from "next/link";
import {
  Accessibility,
  Building2,
  CalendarCheck,
  ChevronRight,
  FileText,
  Globe,
  HeartHandshake,
  HeartPulse,
  Home,
  Info,
  MapPin,
  Phone,
  Search,
  Sprout,
  Video,
  type LucideIcon,
} from "lucide-react";
import type { Delivery, ProviderType, TriState } from "@/lib/types";
import { DELIVERY_LABEL, PROVIDER_LABEL } from "@/lib/types";
import { formatDate } from "@/lib/format";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${className}`}>{children}</div>;
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[0.92rem]">
      <ol className="flex flex-wrap items-center gap-1.5 text-ink-2">
        <li>
          <Link href="/" className="link text-ink-2">
            Home
          </Link>
        </li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <ChevronRight className="size-4 opacity-60" aria-hidden />
            {it.href ? (
              <Link href={it.href} className="link text-ink-2">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Disclaimer({ className = "" }: { className?: string }) {
  return (
    <aside className={`flex gap-3 rounded-2xl border border-line bg-sand px-5 py-4 text-[0.95rem] text-ink-2 ${className}`} aria-label="About this information">
      <Info className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
      <p>
        Hadamley provides information and signposting. It is not medical, legal or financial advice. Including a service does not mean we recommend it or
        work in partnership with it. Please check details with the provider.
      </p>
    </aside>
  );
}

const PROVIDER_STYLE: Record<ProviderType, string> = {
  nhs: "bg-[#e6eef8] text-[#0b3d77] dark:bg-[#15263b] dark:text-[#a9c8f0]",
  council: "bg-[#efe8f6] text-[#4b2a78] dark:bg-[#271d36] dark:text-[#cdb6ef]",
  charity: "bg-ok-soft text-ok",
  private: "bg-accent-soft text-accent",
};

export function ProviderBadge({ type }: { type: ProviderType }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.8rem] font-bold tracking-wide ${PROVIDER_STYLE[type]}`}>
      {PROVIDER_LABEL[type]}
    </span>
  );
}

export const DELIVERY_ICON: Record<Delivery, LucideIcon> = {
  clinic: Building2,
  home: Home,
  online: Video,
  phone: Phone,
};

export function DeliveryList({ delivery }: { delivery: Delivery[] }) {
  if (!delivery.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.9rem] text-ink-2" aria-label="How it is delivered">
      {delivery.map((d) => {
        const Icon = DELIVERY_ICON[d];
        return (
          <li key={d} className="inline-flex items-center gap-1.5">
            <Icon className="size-4" aria-hidden /> {DELIVERY_LABEL[d]}
          </li>
        );
      })}
    </ul>
  );
}

export function CheckedDate({ date }: { date: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[0.88rem] text-ink-2">
      <CalendarCheck className="size-4 text-ok" aria-hidden />
      Last checked {formatDate(date)}
    </span>
  );
}

export function TriStateText({ value }: { value?: TriState }) {
  if (value === "yes") return <span className="font-bold text-ok">Yes, confirmed by the provider</span>;
  if (value === "no") return <span className="font-bold">No</span>;
  return <span className="text-ink-2">Not confirmed. Please ask when booking.</span>;
}

export const SECTION_ICON: Record<string, LucideIcon> = {
  "chronic-illness-support": HeartPulse,
  "mental-health-support": Sprout,
  "mobility-daily-living-transport": Accessibility,
  "find-support": Search,
  resources: FileText,
  about: HeartHandshake,
  contact: Phone,
  privacy: Info,
  accessibility: Accessibility,
};

export const SECTION_GRADIENT: Record<string, string> = {
  "chronic-illness-support": "linear-gradient(135deg,#0b5458 0%,#13857a 55%,#2a95b8 100%)",
  "mental-health-support": "linear-gradient(135deg,#1c9c83 0%,#36b48f 60%,#8fd18a 100%)",
  "mobility-daily-living-transport": "linear-gradient(135deg,#e2804a 0%,#f0a065 55%,#f6c27d 100%)",
  "find-support": "linear-gradient(135deg,#2f6fc4 0%,#4a7fdc 50%,#6c6ad8 100%)",
  resources: "linear-gradient(135deg,#7a62d9 0%,#a274e0 50%,#d77eb0 100%)",
};

export function SectionIcon({ section, className = "size-12" }: { section: string; className?: string }) {
  const Icon = SECTION_ICON[section] ?? Info;
  return (
    <span
      className={`relative grid shrink-0 place-items-center rounded-[28%] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_12px_28px_-10px_rgba(11,84,88,0.55)] ${className}`}
      style={{ background: SECTION_GRADIENT[section] ?? "var(--grad-brand)" }}
    >
      <span aria-hidden="true" className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.4),transparent_55%)]" />
      <Icon className="relative size-[50%]" aria-hidden strokeWidth={1.9} />
    </span>
  );
}

export { Globe, MapPin };
