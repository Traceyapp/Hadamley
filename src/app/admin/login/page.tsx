import { ensureDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/site/Logo";
import { Skyline } from "@/components/art/Landmarks";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  await ensureDb();
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 pb-48 pt-12">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden">
        <Skyline animate={false} className="block h-auto w-full min-w-[720px] translate-y-[2px]" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="mt-5 text-[2.2rem] font-semibold">Hadamley <span className="font-normal italic text-brand">admin</span></h1>
          <p className="mt-1 text-ink-2">Sign in to manage pages, listings and downloads.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
