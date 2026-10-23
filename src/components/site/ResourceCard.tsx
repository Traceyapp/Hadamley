import { Download } from "lucide-react";
import type { Resource } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { formatBytes } from "@/lib/format";

/** A downloadable sheet: a little paper document with a folded corner. */
export function ResourceCard({ r }: { r: Resource }) {
  const ext = r.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
  return (
    <article className="card-print card-print-hover sec-res group relative flex h-full flex-col p-6">
      <div className="flex items-start gap-4">
        <span aria-hidden="true" className="relative h-[4.6rem] w-[3.6rem] shrink-0">
          <span className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-md bg-[var(--art-rose)]" />
          <span className="absolute inset-0 rounded-md border-[1.5px] border-ink bg-surface [clip-path:polygon(0_0,72%_0,100%_22%,100%_100%,0_100%)]" />
          <span className="absolute right-0 top-0 h-[22%] w-[28%] rounded-bl-sm border-b-[1.5px] border-l-[1.5px] border-ink bg-sand" />
          <span className="absolute inset-x-2.5 top-7 space-y-1.5">
            <span className="block h-0.5 bg-ink/40" />
            <span className="block h-0.5 w-3/4 bg-ink/40" />
            <span className="block h-0.5 bg-ink/40" />
          </span>
          <span className="absolute -bottom-2 left-1.5 rounded bg-ink px-1.5 py-px text-[0.6rem] font-bold tracking-wide text-paper">{ext}</span>
        </span>
        <div className="min-w-0">
          <p className="kicker text-sec">
            {KIND_LABEL[r.kind]} <span className="text-ink-2">· Free</span>
          </p>
          <h3 className="mt-1.5 text-[1.25rem] font-semibold leading-snug">{r.title}</h3>
        </div>
      </div>
      <p className="mt-4 text-ink-2">{r.description}</p>
      <a href={`/files/${r.storedName}`} download={r.fileName} className="mt-auto inline-flex min-h-11 items-center gap-2.5 self-start pt-5 font-bold after:absolute after:inset-0">
        <span className="grid size-9 place-items-center rounded-full border-[1.5px] border-ink transition group-hover:bg-ink group-hover:text-paper">
          <Download className="size-4" aria-hidden />
        </span>
        Download <span className="sr-only">{r.title}</span>
        <span className="font-normal text-ink-2">
          ({ext}, {formatBytes(r.size)})
        </span>
      </a>
    </article>
  );
}
