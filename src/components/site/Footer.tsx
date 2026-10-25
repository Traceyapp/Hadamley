import Link from "next/link";
import { ExternalLink, Phone } from "lucide-react";
import { getSettings, navigation } from "@/lib/repo";
import { LogoMark } from "./Logo";
import { Skyline } from "@/components/art/Landmarks";

export function Footer() {
  const items = navigation();
  const { funeralCompanionUrl } = getSettings();
  return (
    <footer className="mt-28">
      <div className="overflow-hidden">
        <Skyline animate={false} className="block h-auto w-full min-w-[720px] translate-y-[2px]" />
      </div>
      <div className="border-t-4 border-champagne bg-paper-2">
        <div className="mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.3fr]">
            <div>
              <div className="flex items-center gap-3">
                <LogoMark className="size-11" />
                <span className="leading-tight">
                  <span className="block font-display text-2xl font-semibold">Hadamley</span>
                  <span className="kicker block text-ink-2">Information Services</span>
                </span>
              </div>
              <p className="mt-4 font-display text-lg italic text-accent">Free Independent Resources</p>
              <p className="mt-2 font-bold">Independent information. Not a counselling or clinical service.</p>
              <p className="mt-2 max-w-sm text-ink-2">
                Information and resources, freely available: mental health, living with chronic illness, and printable journals, trackers, colouring and puzzles, with local support in Havering, Romford, Brentwood and nearby.
              </p>
            </div>
            <nav aria-label="Sections">
              <h2 className="kicker text-ink-2">The guide</h2>
              <ul className="mt-4 space-y-2.5">
                {[...items, { label: "Noticeboard", href: "/noticeboard" }].map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="link text-ink">
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="About this site">
              <h2 className="kicker text-ink-2">About</h2>
              <ul className="mt-4 space-y-2.5">
                {[
                  ["/about", "About Hadamley"],
                  ["/contact", "Contact"],
                  ["/privacy", "Privacy"],
                  ["/accessibility", "Accessibility"],
                  ["/cookies", "Cookies"],
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
            <div className="card-print p-6">
              <h2 className="font-display text-xl font-semibold text-urgent">Need help now?</h2>
              <p className="mt-2 text-[0.95rem]">
                For urgent mental health help call <strong>NHS 111</strong> and choose the mental health option. If a life is at risk, call <strong>999</strong> or go to A&amp;E.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href="tel:111" className="inline-flex min-h-11 items-center gap-2 rounded-full border-[1.5px] border-ink px-5 font-bold transition hover:bg-ink hover:text-paper">
                  <Phone className="size-4" aria-hidden /> 111
                </a>
                <a href="tel:999" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-urgent px-5 font-bold text-white dark:text-[#1b0b0a]">
                  <Phone className="size-4" aria-hidden /> 999
                </a>
              </div>
            </div>
          </div>
          <div className="mt-14 flex flex-col gap-3 border-t-[1.5px] border-ink pt-6 text-sm text-ink-2 sm:flex-row sm:items-start sm:justify-between">
            <p className="max-w-3xl">
              General information and signposting only. Health information does not replace advice from a qualified healthcare professional. Hadamley does not provide counselling, diagnosis or medical treatment. Including a service does not mean we recommend it or work in partnership with it.
            </p>
            <p className="shrink-0">© {new Date().getFullYear()} Hadamley Information Services</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
