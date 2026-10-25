import { ensureDb } from "@/lib/db";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { HelperWidget } from "@/components/site/HelperWidget";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  await ensureDb();
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer />
      <HelperWidget />
    </>
  );
}
