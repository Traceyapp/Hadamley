"use client";

import { useRouter } from "next/navigation";
import { useRef, useTransition } from "react";

/**
 * A plain GET form that works without JavaScript. With JavaScript, filters
 * apply as soon as a box is ticked, without a full page reload.
 */
export function AutoSubmitForm({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);
  const [pending, start] = useTransition();

  function go() {
    const form = ref.current;
    if (!form) return;
    const params = new URLSearchParams();
    new FormData(form).forEach((v, k) => {
      if (typeof v === "string" && v.trim()) params.append(k, v.trim());
    });
    start(() => router.replace(`/find-support${params.size ? `?${params}` : ""}`, { scroll: false }));
  }

  return (
    <form
      ref={ref}
      id={id}
      action="/find-support"
      className={className}
      data-pending={pending || undefined}
      onChange={(e) => {
        if ((e.target as unknown as HTMLInputElement).type === "checkbox") go();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        go();
      }}
    >
      {children}
    </form>
  );
}
