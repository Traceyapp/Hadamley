import Link from "next/link";
import { ArrowUpRight, ExternalLink, Phone } from "lucide-react";
import { getSettings, navigation } from "@/lib/repo";
import { LogoMark } from "./Logo";
import { Aurora } from "@/components/fx/Aurora";

export function Footer() {
  const items = navigation();
  const { funeralCompanionUrl } = getSettings();
  return (
    <footer className="relative isolate mt-28 overflow-hidden bg-[#06282b] text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_0%_0%,#0f6b66_0%,transparent_60%),radial-gradient(ellipse_60%_60%_at_100%_100%,#1d5f86_0%,transparent_60%)]" />
      <Aurora soft className="-z-10 opacity-50" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,#5fd3bf,#7cc4f0,#ffc49a,transparent)]" />

      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.25fr]">
          <div>
            <div className="flex items-center gap-3">
              <LogoMark className="size-11" />
              <span className="font-display text-2xl font-semibold">Hadamley</span>
            </div>
            <p className="mt-5 max-w-sm text-white/75">
              Clear, local information for people living with long term conditions, disability and mental health needs.
            </p>
          </div>
          <nav aria-label="Sections">
            <h2 className="font-sans text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#a8f0e2]">Sections</h2>
            <ul className="mt-5 space-y-3">
              {items.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="group inline-flex items-center gap-1 text-white/85 transition hover:text-white">
                    {i.label}
                    <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="About this site">
            <h2 className="font-sans text-[0.78rem] font-bold uppercase tracking-[0.16em] text-[#a8f0e2]">About</h2>
            <ul className="mt-5 space-y-3">
              {[
                ["/about", "About Hadamley"],
                ["/contact", "Contact"],
                ["/privacy", "Privacy"],
                ["/accessibility", "Accessibility"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="group inline-flex items-center gap-1 text-white/85 transition hover:text-white">
                    {label}
                    <ArrowUpRight className="size-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
                  </Link>
                </li>
              ))}
              <li>
                <a href={funeralCompanionUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-white/85 transition hover:text-white">
                  The Funeral Companion <ExternalLink className="size-3.5" aria-hidden />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </li>
            </ul>
          </nav>
          <div className="rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-xl">
            <h2 className="font-sans text-base font-bold text-[#ffb3ac]">Need help now?</h2>
            <p className="mt-2 text-[0.95rem] text-white/85">
              For urgent mental health help call <strong className="text-white">NHS 111</strong> and choose the mental health option. If a life is at risk, call{" "}
              <strong className="text-white">999</strong> or go to A&amp;E.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="tel:111" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 font-bold text-[#073b3e] transition hover:-translate-y-0.5">
                <Phone className="size-4" aria-hidden /> 111
              </a>
              <a href="tel:999" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#d4392b] px-5 font-bold text-white transition hover:-translate-y-0.5">
                <Phone className="size-4" aria-hidden /> 999
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/65 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-3xl">
            Hadamley provides information and signposting only. We do not give medical, legal or financial advice. Including a service does not mean we
            recommend it or work in partnership with it.
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} Hadamley</p>
        </div>
      </div>

      {/* Oversized wordmark that bleeds off the bottom edge */}
      <p
        aria-hidden="true"
        className="pointer-events-none mt-6 select-none text-center font-display text-[24vw] font-semibold leading-[0.78] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_rgba(168,240,226,0.25)] [mask-image:linear-gradient(180deg,#000_30%,transparent_95%)] lg:text-[17rem]"
      >
        Hadamley
      </p>
    </footer>
  );
}
