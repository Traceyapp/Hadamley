import Link from "next/link";
import { Container } from "@/components/site/bits";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="text-[0.85rem] font-bold uppercase tracking-[0.14em] text-accent">Page not found</p>
      <h1 className="mt-3 text-[2.6rem] font-semibold">We can&apos;t find that page</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-2">It may have moved or been removed. These links might help.</p>
      <ul className="mt-8 flex flex-wrap gap-3">
        <li>
          <Link href="/" className="inline-flex min-h-12 items-center rounded-full bg-brand px-5 font-bold text-paper">
            Go to the homepage
          </Link>
        </li>
        <li>
          <Link href="/find-support" className="inline-flex min-h-12 items-center rounded-full border-2 border-brand px-5 font-bold text-brand">
            Find Support
          </Link>
        </li>
      </ul>
    </Container>
  );
}
