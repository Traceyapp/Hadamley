import Link from "next/link";
import { ArrowLeft, CheckCircle2, Inbox } from "lucide-react";
import type { ListingStatus, PageStatus } from "@/lib/types";
import { STATUS_LABEL } from "@/lib/types";

/* Shared admin building blocks: a calm app look in Hadamley's navy and champagne. */

export const input =
  "block w-full rounded-lg border border-line-strong/70 bg-surface px-3.5 py-2.5 text-[0.97rem] text-ink shadow-[inset_0_1px_1px_rgb(20_42_82/0.04)] placeholder:text-ink-2/70 transition focus:border-brand disabled:opacity-60";

export const btn = {
  primary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--brand)] px-4.5 font-bold text-[var(--paper)] shadow-[var(--admin-shadow)] transition hover:brightness-110 disabled:opacity-50",
  secondary:
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line-strong/70 bg-surface px-4.5 font-bold text-ink transition hover:border-brand hover:text-brand disabled:opacity-50",
  ghost: "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 font-bold text-ink-2 transition hover:bg-paper-2 hover:text-ink",
  danger: "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-urgent/40 bg-surface px-4.5 font-bold text-urgent transition hover:bg-urgent-soft",
};

export function AdminHeader({ title, description, actions, back }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-[0.82rem] font-bold text-ink-2 transition hover:border-brand hover:text-brand">
            <ArrowLeft className="size-3.5" aria-hidden /> {back.label}
          </Link>
        )}
        <h1 className="text-[1.9rem] font-semibold leading-tight tracking-tight sm:text-[2.15rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-[0.98rem] text-ink-2">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, description, children, className = "", aside }: { title?: string; description?: string; children: React.ReactNode; className?: string; aside?: React.ReactNode }) {
  return (
    <section className={`admin-card p-5 sm:p-6 ${className}`}>
      {(title || aside) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-sans text-[1.04rem] font-bold tracking-tight">{title}</h2>}
            {description && <p className="mt-0.5 text-[0.9rem] text-ink-2">{description}</p>}
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({ label, htmlFor, hint, children, className = "" }: { label: string; htmlFor?: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[0.92rem] font-bold">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[0.84rem] text-ink-2">{hint}</p>}
    </div>
  );
}

export function CheckGroup({ legend, name, options, selected, columns = 2 }: { legend: string; name: string; options: { value: string; label: string }[]; selected: string[]; columns?: number }) {
  return (
    <fieldset>
      <legend className="mb-2 text-[0.92rem] font-bold">{legend}</legend>
      <div className={`grid gap-1.5 ${columns === 3 ? "sm:grid-cols-3" : columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {options.map((o) => (
          <label
            key={o.value}
            className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-transparent px-2.5 transition hover:border-line hover:bg-paper-2 has-[:checked]:border-brand/40 has-[:checked]:bg-brand-tint"
          >
            <input type="checkbox" name={name} value={o.value} defaultChecked={selected.includes(o.value)} className="size-[1.05rem] accent-[var(--brand)]" />
            <span className="text-[0.94rem]">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const badge = "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.78rem] font-bold ring-1 ring-inset";

const LISTING_STYLE: Record<ListingStatus, { cls: string; dot: string }> = {
  to_research: { cls: "bg-paper-2 text-ink-2 ring-line", dot: "bg-ink-2" },
  online_checked: { cls: "bg-brand-tint text-brand ring-brand/20", dot: "bg-brand" },
  clarification_needed: { cls: "bg-warn-soft text-warn ring-warn/20", dot: "bg-warn" },
  approved: { cls: "bg-ok-soft text-ok ring-ok/20", dot: "bg-ok" },
};

export function ListingStatusBadge({ status }: { status: ListingStatus }) {
  const s = LISTING_STYLE[status];
  return (
    <span className={`${badge} ${s.cls}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden />
      {status === "approved" ? "Approved" : STATUS_LABEL[status]}
    </span>
  );
}

export function PageStatusBadge({ status }: { status: PageStatus }) {
  const live = status === "published";
  return (
    <span className={`${badge} ${live ? "bg-ok-soft text-ok ring-ok/20" : "bg-paper-2 text-ink-2 ring-line"}`}>
      <span className={`size-1.5 rounded-full ${live ? "bg-ok" : "bg-ink-2"}`} aria-hidden />
      {live ? "Published" : "Draft"}
    </span>
  );
}

export function Flash({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div role="status" className="mb-6 flex items-center gap-2.5 rounded-xl border border-ok/30 bg-ok-soft px-4 py-3 font-bold text-ok">
      <CheckCircle2 className="size-5 shrink-0" aria-hidden />
      {message}
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-line-strong/60 bg-paper-2/60 px-6 py-10 text-center text-ink-2">
      <span className="mb-3 grid size-11 place-items-center rounded-full bg-surface text-ink-2 shadow-[var(--admin-shadow)]">
        <Inbox className="size-5" aria-hidden />
      </span>
      <div className="max-w-md">{children}</div>
    </div>
  );
}
