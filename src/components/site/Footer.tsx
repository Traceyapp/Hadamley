import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { getSettings, navigation } from "@/lib/repo";
import { LogoMark } from "./Logo";

export function Footer() {
  const items = navigation();
  const { funeralCompanionUrl } = getSettings();
  return (
    <footer className="mt-24 border-t border-line bg-sand">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="size-10" />
              <span className="font-display text-2xl font-semibold">Hadamley</span>
            </div>
            <p className="mt-4 max-w-sm text-ink-2">
              Clear, local information for people living with long term conditions, disability and mental health needs.
            </p>
          </div>
          <nav aria-label="Sections">
            <h2 className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-ink-2">Sections</h2>
            <ul className="mt-4 space-y-2.5">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="link text-ink">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About this site">
            <h2 className="font-sans text-sm font-bold uppercase tracking-[0.12em] text-ink-2">About</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                ["/about", "About Hadamley"],
                ["/contact", "Contact"],
                ["/privacy", "Privacy"],
                ["/accessibility", "Accessibility"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="link text-ink">
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={funeralCompanionUrl} target="_blank" rel="noopener" className="link inline-flex items-center gap-1.5 text-ink">
                  The Funeral Companion <ExternalLink className="size-3.5" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="rounded-2xl border border-urgent/30 bg-surface p-5">
            <h2 className="font-sans text-base font-bold text-urgent">Need help now?</h2>
            <p className="mt-2 text-[0.95rem] text-ink">
              For urgent mental health help call <strong>NHS 111</strong> and choose the mental health option. If a life is at risk, call <strong>999</strong> or go to A&amp;E.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href="tel:111" className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-brand px-4 font-bold text-brand">
                <Phone className="size-4" aria-hidden /> 111
              </a>
              <a href="tel:999" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-urgent px-4 font-bold text-white dark:text-[#1b0b0a]">
                <Phone className="size-4" aria-hidden /> 999
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-line-strong/60 pt-6 text-sm text-ink-2">
          <p className="max-w-3xl">
            Hadamley provides information and signposting only. We do not give medical, legal or financial advice. Including a service does not mean we
            recommend it or work in partnership with it.
          </p>
          <p className="mt-3">© {new Date().getFullYear()} Hadamley</p>
        </div>
      </div>
    </footer>
  );
}
