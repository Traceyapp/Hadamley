"use client";

import { LifeBuoy, Phone, X } from "lucide-react";
import { useEffect, useRef } from "react";

export function UrgentHelpPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      <p className="text-ink">
        For urgent mental health help, call <strong>NHS 111</strong> and choose the mental health option.
      </p>
      <p className="text-ink">
        If a life is at risk, or you or someone else cannot stay safe, call <strong>999</strong> or go to A&amp;E now.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <a
          href="tel:111"
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-brand bg-surface px-4 font-bold text-brand hover:bg-brand-tint"
        >
          <Phone className="size-5" aria-hidden /> Call NHS 111
        </a>
        <a
          href="tel:999"
          className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-urgent px-4 font-bold text-white hover:bg-urgent-strong dark:text-[#1b0b0a]"
        >
          <Phone className="size-5" aria-hidden /> Call 999
        </a>
      </div>
    </div>
  );
}

export function UrgentHelpButton() {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === d) d.close();
    };
    d.addEventListener("click", onClick);
    return () => d.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border-[1.5px] border-urgent bg-urgent-soft px-2.5 text-[0.86rem] sm:gap-2 sm:px-4 sm:text-[0.95rem] font-bold text-urgent hover:bg-urgent hover:text-white dark:hover:text-[#1b0b0a]"
        aria-haspopup="dialog"
      >
        <LifeBuoy className="size-4 sm:size-5" aria-hidden />
        <span>Urgent help</span>
      </button>
      <dialog
        ref={ref}
        aria-labelledby="urgent-title"
        className="card-print m-auto w-[min(34rem,calc(100vw-2rem))] overflow-hidden !bg-paper p-0 text-ink backdrop:bg-[#1d1b16]/60"
      >
        <div className="flex items-start justify-between gap-4 border-b-[1.5px] border-ink bg-urgent-soft px-6 py-5">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-full bg-urgent text-white dark:text-[#1b0b0a]">
              <LifeBuoy className="size-6" aria-hidden />
            </span>
            <h2 id="urgent-title" className="text-2xl font-semibold">
              If you need help now
            </h2>
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface"
            aria-label="Close urgent help"
          >
            <X className="size-6" aria-hidden />
          </button>
        </div>
        <div className="px-6 py-6">
          <UrgentHelpPanel />
          <p className="mt-5 text-sm text-ink-2">Hadamley is an information website. We cannot respond to emergencies or give medical advice.</p>
        </div>
      </dialog>
    </>
  );
}
