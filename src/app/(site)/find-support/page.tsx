import type { Metadata } from "next";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { areas, getPublishedPage, searchListings, topics } from "@/lib/repo";
import type { Delivery, ProviderType } from "@/lib/types";
import { DELIVERY_LABEL, PROVIDER_LABEL } from "@/lib/types";
import { Breadcrumbs, Container, Disclaimer } from "@/components/site/bits";
import { ListingCard } from "@/components/site/ListingCard";
import { AutoSubmitForm } from "@/components/site/AutoSubmit";
import { FiltersPanel } from "@/components/site/FiltersPanel";

export const metadata: Metadata = {
  title: "Find Support",
  description: "Search local services in Havering, Romford, Brentwood and nearby by need, area and how you want to be seen.",
};

type SP = Promise<Record<string, string | string[] | undefined>>;
const arr = (v: string | string[] | undefined) => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

function Fieldset({ legend, name, options, selected }: { legend: string; name: string; options: { value: string; label: string }[]; selected: string[] }) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-0 first:pt-0">
      <legend className="mb-3 font-bold">{legend}</legend>
      <div className="space-y-1">
        {options.map((o) => (
          <label key={o.value} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-sand">
            <input type="checkbox" name={name} value={o.value} defaultChecked={selected.includes(o.value)} className="size-5 shrink-0 accent-[var(--brand)]" />
            <span className="text-[0.97rem] leading-snug">{o.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default async function FindSupportPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const sel = {
    topic: arr(sp.topic),
    provider: arr(sp.provider) as ProviderType[],
    area: arr(sp.area),
    delivery: arr(sp.delivery) as Delivery[],
  };
  const results = searchListings({ q, ...sel });
  const page = getPublishedPage("find-support");
  const topicList = topics();
  const areaList = areas();
  const activeCount = sel.topic.length + sel.provider.length + sel.area.length + sel.delivery.length;

  const chips: { label: string; href: string }[] = [];
  const build = (drop: { key: string; value: string }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    for (const [k, vs] of Object.entries(sel)) for (const v of vs) if (!(k === drop.key && v === drop.value)) p.append(k, v);
    return `/find-support${p.size ? `?${p}` : ""}`;
  };
  sel.topic.forEach((v) => chips.push({ label: topicList.find((t) => t.slug === v)?.name ?? v, href: build({ key: "topic", value: v }) }));
  sel.provider.forEach((v) => chips.push({ label: PROVIDER_LABEL[v] ?? v, href: build({ key: "provider", value: v }) }));
  sel.area.forEach((v) => chips.push({ label: areaList.find((t) => t.slug === v)?.name ?? v, href: build({ key: "area", value: v }) }));
  sel.delivery.forEach((v) => chips.push({ label: DELIVERY_LABEL[v] ?? v, href: build({ key: "delivery", value: v }) }));

  const filters = (
    <div className="space-y-5">
      <Fieldset legend="What do you need?" name="topic" selected={sel.topic} options={topicList.map((t) => ({ value: t.slug, label: t.name }))} />
      <Fieldset legend="Area" name="area" selected={sel.area} options={areaList.map((t) => ({ value: t.slug, label: t.name }))} />
      <Fieldset legend="How you are seen" name="delivery" selected={sel.delivery} options={(Object.keys(DELIVERY_LABEL) as Delivery[]).map((d) => ({ value: d, label: DELIVERY_LABEL[d] }))} />
      <Fieldset legend="Type of provider" name="provider" selected={sel.provider} options={(Object.keys(PROVIDER_LABEL) as ProviderType[]).map((d) => ({ value: d, label: PROVIDER_LABEL[d] }))} />
      <noscript>
        <button type="submit" className="min-h-11 w-full rounded-xl bg-brand font-bold text-paper">
          Apply filters
        </button>
      </noscript>
    </div>
  );

  return (
    <>
      <header className="grain border-b border-line">
        <Container className="pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Find Support" }]} />
          <h1 className="mt-8 text-[2.4rem] font-semibold leading-tight sm:text-[3rem]">{page?.title ?? "Find Support"}</h1>
          <p className="mt-3 max-w-2xl text-[1.12rem] text-ink-2">{page?.summary}</p>
        </Container>
      </header>

      <AutoSubmitForm className="group">
        <Container className="pt-8">
          <div role="search" className="flex max-w-3xl gap-2 rounded-2xl border-2 border-ink/80 bg-surface p-1.5 shadow-soft focus-within:border-brand">
            <label htmlFor="dir-q" className="sr-only">
              Search services
            </label>
            <Search className="ml-2 mt-3 size-5 shrink-0 text-ink-2" aria-hidden />
            <input
              id="dir-q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search by service name, condition or need"
              className="min-h-12 w-full min-w-0 bg-transparent px-2 text-[1.05rem] outline-none placeholder:text-ink-2/80 focus-visible:shadow-none focus-visible:outline-none"
            />
            <button type="submit" className="min-h-12 shrink-0 rounded-xl bg-brand px-5 font-bold text-paper hover:bg-brand-strong">
              Search
            </button>
          </div>
        </Container>

        <Container className="grid gap-8 pt-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10">
          <div>
            <FiltersPanel activeCount={activeCount}>{filters}</FiltersPanel>
          </div>

          <section aria-labelledby="results-title" className="min-w-0 transition-opacity group-data-[pending]:opacity-60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="results-title" className="font-sans text-lg font-bold" aria-live="polite">
                {results.length} {results.length === 1 ? "service" : "services"}
                {q && (
                  <>
                    {" "}
                    for <span className="text-brand">&ldquo;{q}&rdquo;</span>
                  </>
                )}
              </h2>
              {(activeCount > 0 || q) && (
                <Link href="/find-support" className="link text-[0.95rem]">
                  Clear all
                </Link>
              )}
            </div>
            {chips.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2" aria-label="Active filters">
                {chips.map((c) => (
                  <li key={c.href + c.label}>
                    <Link href={c.href} scroll={false} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-brand-soft py-1 pl-3 pr-2 text-[0.9rem] font-bold text-brand-strong hover:bg-brand hover:text-paper">
                      {c.label}
                      <X className="size-4" aria-hidden />
                      <span className="sr-only">Remove filter</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {results.length > 0 ? (
              <ul className="mt-6 grid gap-5 md:grid-cols-2">
                {results.map((l) => (
                  <li key={l.id}>
                    <ListingCard listing={l} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
                <p className="font-display text-2xl font-semibold">No services match those filters</p>
                <p className="mx-auto mt-2 max-w-md text-ink-2">Try removing a filter or using fewer words. You can also ask the Hadamley helper in your own words.</p>
                <Link href="/find-support" className="mt-5 inline-flex min-h-11 items-center rounded-full border-2 border-brand px-5 font-bold text-brand">
                  Show all services
                </Link>
              </div>
            )}
            <Disclaimer className="mt-10" />
          </section>
        </Container>
      </AutoSubmitForm>
    </>
  );
}
