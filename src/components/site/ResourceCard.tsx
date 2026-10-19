import { Download, FileText } from "lucide-react";
import type { Resource } from "@/lib/types";
import { KIND_LABEL } from "@/lib/types";
import { formatBytes } from "@/lib/format";
import { Spotlight } from "@/components/fx/motion";

const KIND_GRADIENT: Record<Resource["kind"], string> = {
  guide: "linear-gradient(135deg,#0b5458,#1f8fae)",
  checklist: "linear-gradient(135deg,#1c9c83,#8fd18a)",
  worksheet: "linear-gradient(135deg,#7a62d9,#d77eb0)",
  leaflet: "linear-gradient(135deg,#e2804a,#f6c27d)",
};

export function ResourceCard({ r }: { r: Resource }) {
  const ext = r.fileName.split(".").pop()?.toUpperCase() ?? "FILE";
  return (
    <Spotlight className="ring-grad group h-full rounded-[var(--radius-card)] border border-line bg-surface shadow-soft transition duration-500 hover:-translate-y-1 hover:shadow-lift">
      <article className="relative flex h-full flex-col p-6">
        <div className="flex items-start gap-4">
          {/* Stacked-paper document icon */}
          <span aria-hidden="true" className="relative h-[4.5rem] w-14 shrink-0">
            <span className="absolute inset-0 translate-x-1.5 rotate-6 rounded-xl border border-line bg-sand transition duration-500 group-hover:translate-x-2.5 group-hover:rotate-12" />
            <span className="absolute inset-0 grid place-items-center rounded-xl text-white shadow-lift" style={{ background: KIND_GRADIENT[r.kind] }}>
              <FileText className="size-6" strokeWidth={1.75} />
            </span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-md bg-ink px-1.5 py-px text-[0.62rem] font-bold tracking-wide text-paper">{ext}</span>
          </span>
          <div className="min-w-0">
            <p className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-accent">{KIND_LABEL[r.kind]}</p>
            <h3 className="mt-1.5 text-[1.22rem] font-semibold leading-snug">{r.title}</h3>
          </div>
        </div>
        <p className="mt-4 text-ink-2">{r.description}</p>
        <a
          href={`/files/${r.storedName}`}
          download={r.fileName}
          className="mt-auto inline-flex min-h-11 items-center gap-2.5 self-start pt-5 font-bold text-brand after:absolute after:inset-0 after:z-10"
        >
          <span className="grid size-9 place-items-center rounded-full bg-brand-tint transition duration-300 group-hover:bg-grad-brand group-hover:text-white">
            <Download className="size-4 transition group-hover:translate-y-0.5" aria-hidden />
          </span>
          Download <span className="sr-only">{r.title}</span>
          <span className="font-normal text-ink-2">
            ({ext}, {formatBytes(r.size)})
          </span>
        </a>
      </article>
    </Spotlight>
  );
}
