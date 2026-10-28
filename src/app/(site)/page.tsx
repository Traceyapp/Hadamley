import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, HeartPulse, Search } from "lucide-react";
import { ensureDb } from "@/lib/db";
import { Container } from "@/components/site/bits";
import { CornerLeaves } from "@/components/art/Leaves";

export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Wording agreed in the 27 October design notes. */
const WELCOME =
  "Free, independent information and resources for people living with chronic illness and mental health challenges. Explore helpful guides, practical information and signposting to support.";

const ENTRIES = [
  {
    href: "/chronic-illness-support",
    title: "Chronic illness",
    blurb: "Information, resources and support for living with a long-term condition.",
    Icon: HeartPulse,
    tone: "bg-[var(--pastel-sage)]",
  },
  {
    href: "/mental-health-support",
    title: "Mental health",
    blurb: "Information, resources and support for your mental health and wellbeing.",
    Icon: BrainCircuit,
    tone: "bg-[var(--pastel-rose)]",
  },
];

export default async function HomePage() {
  await ensureDb();
  return (
    <div className="relative isolate pb-8">
      <CornerLeaves />
      <CornerLeaves bottom />
      <Container className="max-w-4xl pt-12 text-center sm:pt-16">
        <h1 className="text-[2.6rem] font-semibold leading-[1.05] sm:text-[3.6rem]">Welcome to Hadamley</h1>
        <p className="mx-auto mt-5 max-w-2xl text-[1.15rem] leading-relaxed text-ink-2 sm:text-[1.25rem]">{WELCOME}</p>
      </Container>

      <Container className="max-w-4xl pt-10">
        <section aria-labelledby="find-title" className="rounded-[var(--radius-card)] border-[1.5px] border-champagne bg-surface p-5 sm:p-7">
          <h2 id="find-title" className="text-[1.8rem] font-semibold leading-tight">Find Support</h2>
          <p className="mt-1 text-ink-2">Find services and practical support for what you need.</p>
          <form action="/find-support" method="get" role="search" className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
            <label htmlFor="home-q" className="sr-only">What support are you looking for?</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-2" aria-hidden />
              <input
                id="home-q"
                name="q"
                type="search"
                placeholder="Service or type of support"
                className="min-h-13 w-full rounded-xl border-[1.5px] border-line-strong bg-surface pl-12 pr-4 text-[1.05rem] placeholder:text-ink-2"
              />
            </div>
            <button type="submit" className="min-h-13 rounded-xl bg-brand px-6 font-bold text-white hover:bg-brand-strong dark:text-paper">
              Search for support
            </button>
          </form>
        </section>
      </Container>

      <Container className="max-w-4xl pt-14">
        <h2 className="text-center text-[2rem] font-semibold">Explore Hadamley</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {ENTRIES.map(({ href, title, blurb, Icon, tone }) => (
            <li key={href}>
              <Link href={href} className={`group flex h-full flex-col items-center rounded-[var(--radius-card)] border-[1.5px] border-line-strong p-6 text-center text-ink hover:border-ink ${tone}`}>
                <Icon className="size-10 text-brand" aria-hidden />
                <span className="mt-3 font-display text-[1.6rem] font-semibold group-hover:underline">{title}</span>
                <span className="mt-1 text-ink-2">{blurb}</span>
                <ArrowRight className="mt-3 size-5 transition group-hover:translate-x-1" aria-hidden />
              </Link>
            </li>
          ))}
          <li className="sm:col-span-2">
            <Link href="/resources" className="group flex items-center gap-5 rounded-[var(--radius-card)] border-[1.5px] border-line-strong bg-[var(--pastel-cream)] p-6 text-ink hover:border-ink">
              <BookOpen className="size-12 shrink-0 text-brand" aria-hidden />
              <span className="flex-1">
                <span className="block font-display text-[1.6rem] font-semibold group-hover:underline">Guides &amp; Resources</span>
                <span className="text-ink-2">Browse free guides, colouring pages and activities.</span>
              </span>
              <ArrowRight className="size-5 shrink-0 transition group-hover:translate-x-1" aria-hidden />
            </Link>
          </li>
        </ul>
      </Container>
    </div>
  );
}
