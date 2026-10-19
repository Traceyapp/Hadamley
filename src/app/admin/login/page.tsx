import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/site/Logo";
import { Backdrop } from "@/components/fx/Aurora";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="grain relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-12">
      <Backdrop />
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="mt-5 text-[2.2rem] font-semibold">Hadamley <span className="text-gradient italic font-normal">admin</span></h1>
          <p className="mt-1 text-ink-2">Sign in to manage pages, listings and downloads.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
