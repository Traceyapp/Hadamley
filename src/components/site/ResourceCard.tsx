import { Download, FileText } from "lucide-react";
import type { Resource } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { formatBytes } from "@/lib/format";

export function ResourceCard({ r }: { r: Resource }) {
  const ext = r.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
  return (
    <article className="group relative flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-soft transition hover:border-line-strong hover:shadow-lift">
      <div className="flex items-start gap-4">
        <span className="relative grid h-16 w-13 shrink-0 place-items-center rounded-lg border border-line bg-paper text-brand">
          <FileText className="size-7" aria-hidden strokeWidth={1.5} />
          <span className="absolute -bottom-2 rounded bg-brand px-1.5 text-[0.65rem] font-bold text-paper">{ext}</span>
        </span>
        <div>
          <p className="text-[0.8rem] font-bold uppercase tracking-[0.12em] text-accent">{KIND_LABEL[r.kind]}</p>
          <h3 className="mt-1 text-[1.2rem] font-semibold leading-snug">{r.title}</h3>
        </div>
      </div>
      <p className="mt-3 text-ink-2">{r.description}</p>
      <a
        href={`/files/${r.storedName}`}
        download={r.fileName}
        className="mt-auto inline-flex min-h-11 items-center gap-2 self-start pt-4 font-bold text-brand after:absolute after:inset-0 hover:underline"
      >
        <Download className="size-5" aria-hidden />
        Download <span className="sr-only">{r.title}</span>
        <span className="font-normal text-ink-2">
          ({ext}, {formatBytes(r.size)})
        </span>
      </a>
    </article>
  );
}
