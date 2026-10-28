import { ExternalLink, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { getSettings, navigation } from "@/lib/repo";
import { AskButton } from "./HelperWidget";
import { Logo } from "./Logo";
import { DesktopNav, HeaderShell, MobileNav } from "./Nav";
import { TextSizeControl } from "./TextSize";
import { ThemeToggle } from "./ThemeToggle";
import { UrgentHelpButton } from "./UrgentHelp";
import { SearchPanel } from "./SearchPanel";

export function Header() {
  const items = navigation();
  const { funeralCompanionUrl } = getSettings();
  return (
    <>
      <div className="no-print relative z-40 border-b border-line bg-sand text-[0.85rem]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
          <p className="hidden text-ink-2 lg:block">Information and signposting for Havering, Romford, Brentwood and nearby</p>
          <div className="flex items-center gap-1 sm:gap-3">
            <TextSizeControl />
            <span className="h-5 w-px bg-line-strong" aria-hidden />
            <ThemeToggle />
          </div>
          <a
            href={funeralCompanionUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 font-bold text-brand underline-offset-4 hover:underline"
          >
            <span className="hidden lg:inline">Bereavement and funerals:</span> The Funeral Companion
            <ExternalLink className="size-3.5" aria-hidden />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </div>
      </div>
      <HeaderShell>
        <div className="site-bar mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6 xl:gap-3">
          <Logo />
          <DesktopNav items={[...items, { label: "Contact Us", href: "/contact", children: [] }]} />
          <div className="site-bar-actions flex items-center gap-1.5 sm:gap-2">
            <SearchPanel />
            <UrgentHelpButton />
            <MobileNav items={items} funeralUrl={funeralCompanionUrl} />
          </div>
        </div>
        <div className="flex divide-x divide-line border-t border-line bg-surface sm:hidden">
          <SearchPanel variant="bar" />
          <AskButton className="flex min-h-11 flex-1 items-center justify-center gap-2 px-4 text-sm font-bold text-brand">
            <MessageCircleQuestion className="size-4" aria-hidden /> Ask Hadamley
            <ArrowRight className="size-4" aria-hidden />
          </AskButton>
        </div>
      </HeaderShell>
    </>
  );
}
