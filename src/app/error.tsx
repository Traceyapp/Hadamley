"use client";

import { useEffect } from "react";

/** Friendly page shown if something goes wrong while a page loads. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
      <p className="kicker text-ink-2">Hadamley Information Services</p>
      <h1 className="mt-3 text-[2.2rem] font-semibold leading-tight">Sorry, this page didn&apos;t load</h1>
      <p className="mt-4 text-[1.1rem] text-ink-2">This is usually brief. Please try again in a moment.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" onClick={reset} className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 font-bold text-paper">
          Try again
        </button>
        <a href="/" className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-ink px-5 font-bold">
          Go to the homepage
        </a>
      </div>
      <div className="mt-10 rounded-[var(--radius-card)] border-2 border-urgent bg-urgent-soft p-5">
        <p className="font-bold text-urgent">Need help now?</p>
        <p className="mt-2">
          If a life is at risk, call <a href="tel:999" className="font-bold underline">999</a>. For urgent help, call{" "}
          <a href="tel:111" className="font-bold underline">NHS 111</a>. To talk to someone, call Samaritans free on{" "}
          <a href="tel:116123" className="font-bold underline">116 123</a>.
        </p>
      </div>
    </main>
  );
}
