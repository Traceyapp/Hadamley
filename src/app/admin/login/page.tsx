import { redirect } from "next/navigation";
import { currentAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { LogoMark } from "@/components/site/Logo";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  if (await currentAdmin()) redirect("/admin");
  return (
    <div className="grain grid min-h-dvh place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-14" />
          <h1 className="mt-5 text-[2rem] font-semibold">Hadamley admin</h1>
          <p className="mt-1 text-ink-2">Sign in to manage pages, listings and downloads.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
