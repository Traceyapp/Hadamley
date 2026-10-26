import { ensureDb } from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Download, FileText, Inbox, MapPin, Megaphone } from "lucide-react";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/site/Logo";
import { Skyline } from "@/components/art/Landmarks";

export const metadata = { title: "Sign in" };

const MANAGE = [
  { icon: FileText, label: "Pages and health information" },
  { icon: MapPin, label: "Find support listings" },
  { icon: Download, label: "The free printable library" },
  { icon: Megaphone, label: "News and events" },
  { icon: Inbox, label: "Messages from visitors" },
];

export default async function LoginPage() {
  await ensureDb({ fresh: true });
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="grid min-h-dvh bg-paper lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Brand panel: always navy, in both themes */}
      <aside className="night-scope relative flex flex-col overflow-hidden bg-paper text-ink">
        <div className="relative z-10 flex items-center gap-3 px-6 py-5 sm:px-10 lg:pt-10">
          <LogoMark className="size-11 lg:size-14" />
          <span className="leading-tight">
            <span className="block font-display text-[1.45rem] font-semibold lg:text-[1.8rem]">Hadamley</span>
            <span className="block text-[0.72rem] font-bold uppercase tracking-[0.16em] text-accent">Information Services</span>
          </span>
        </div>
        <div className="relative z-10 hidden flex-1 flex-col justify-center px-10 pb-56 lg:flex xl:px-16">
          <p className="font-display text-[1.25rem] italic text-accent">Free Independent Resources</p>
          <h2 className="mt-3 max-w-md text-[2.6rem] font-semibold leading-[1.08]">Everything on the website, in one place.</h2>
          <ul className="mt-8 space-y-3.5">
            {MANAGE.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-[1.02rem] text-ink-2">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong text-accent">
                  <Icon className="size-4" aria-hidden />
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden overflow-hidden lg:block" aria-hidden="true">
          <Skyline animate className="block h-auto w-full min-w-[760px] translate-y-[2px]" />
        </div>
      </aside>

      {/* Sign-in form */}
      <main id="main" className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-[26rem]">
          <p className="text-[0.78rem] font-bold uppercase tracking-[0.16em] text-accent">Admin area</p>
          <h1 className="mt-2 text-[2.3rem] font-semibold leading-tight">Welcome back</h1>
          <p className="mt-2 text-ink-2">Sign in to manage the Hadamley website.</p>
          <LoginForm />
          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 text-[0.92rem] text-ink-2">
            <p>Forgotten your password? Ask your developer to reset it for you.</p>
            <Link href="/" className="inline-flex items-center gap-1.5 self-start font-bold text-brand underline-offset-4 hover:underline">
              <ArrowLeft className="size-4" aria-hidden /> Back to the website
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
