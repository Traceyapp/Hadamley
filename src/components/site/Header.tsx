import { ExternalLink } from "lucide-react";
import { getSettings, navigation } from "@/lib/repo";
import { Logo } from "./Logo";
import { DesktopNav, HeaderShell, MobileNav } from "./Nav";
import { TextSizeControl } from "./TextSize";
import { UrgentHelpButton } from "./UrgentHelp";

export function Header() {
  const items = navigation();
  const { funeralCompanionUrl } = getSettings();
  return (
    <>
      <div className="relative z-40 border-b border-line bg-sand/80 text-[0.85rem] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
          <p className="hidden text-ink-2 lg:block">Information and signposting for Havering, Romford, Brentwood and nearby</p>
          <TextSizeControl />
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
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
          <Logo />
          <DesktopNav items={items} />
          <div className="flex items-center gap-2">
            <UrgentHelpButton />
            <MobileNav items={items} funeralUrl={funeralCompanionUrl} />
          </div>
        </div>
      </HeaderShell>
    </>
  );
}
