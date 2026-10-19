import Link from "next/link";
import type { ListingStatus, PageStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

export const input =
  "block w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-[0.97rem] text-ink placeholder:text-ink-2/70 focus:border-brand disabled:opacity-60";
export const btn = {
  primary: "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-grad-brand px-5 font-bold text-white shadow-glow transition hover:-translate-y-px hover:brightness-110 disabled:opacity-50 disabled:shadow-none",
  secondary: "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-5 font-bold text-ink hover:border-brand hover:text-brand disabled:opacity-50",
  ghost: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 font-bold text-ink-2 hover:bg-sand hover:text-ink",
  danger: "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-urgent/50 px-5 font-bold text-urgent hover:bg-urgent-soft",
};

export function AdminHeader({ title, description, actions, back }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm font-bold text-ink-2 hover:text-brand">
            ← {back.label}
          </Link>
        )}
        <h1 className="text-[2rem] font-semibold leading-tight">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className = "", aside }: { title?: string; description?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <section className={`rounded-3xl border border-line bg-surface p-5 shadow-soft sm:p-6 ${className}`}>
      {(title || aside) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-sans text-lg font-bold">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.92rem] text-ink-2">{description}</p>}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, htmlFor, hint, children, className = "" }: { label: string; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.95rem] font-bold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.85rem] text-ink-2">{hint}</p>}
    </div>
  );
}

export function CheckGroup({ legend, name, options, selected, columns = 2 }: { legend: string; name: string; options: { value: string; label: string }[]; selected: string[]; columns?: number }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[0.95rem] font-bold">{legend}</legend>
      <div className={`grid gap-1 ${columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((o) => (
          <label key={o.value} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 hover:bg-sand">
            <input type="checkbox" name={name} value={o.value} defaultChecked={selected.includes(o.value)} className="size-[1.1rem] accent-[var(--brand)]" />
            <span className="text-[0.95rem]">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const LISTING_STYLE: Record<ListingStatus, string> = {
  to_research: "bg-sand-2 text-ink-2",
  online_checked: "bg-[#e6eef8] text-[#0b3d77] dark:bg-[#15263b] dark:text-[#a9c8f0]",
  clarification_needed: "bg-warn-soft text-warn",
  approved: "bg-ok-soft text-ok",
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.8rem] font-bold ${LISTING_STYLE[status]}`}>{status === "approved" ? "Approved" : STATUS_LABEL[status]}</span>;
}

export function PageStatusBadge({ status }: { status: PageStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.8rem] font-bold ${status === "published" ? "bg-ok-soft text-ok" : "bg-sand-2 text-ink-2"}`}>
      <span className={`size-1.5 rounded-full ${status === "published" ? "bg-ok" : "bg-ink-2"}`} aria-hidden />
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

export function Flash({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="status" className="mb-6 rounded-xl border border-ok/40 bg-ok-soft px-4 py-3 font-bold text-ok">
      {message}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center text-ink-2">{children}</div>;
}
