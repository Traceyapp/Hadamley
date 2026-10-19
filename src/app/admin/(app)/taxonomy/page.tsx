import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from "lucide-react";
import { readDb } from "@/lib/db";
import { deleteTaxon, moveNav, moveTaxon, renameTaxon, toggleNav } from "../../actions";
import { AdminHeader, Card, input } from "@/components/admin/ui";
import { ConfirmButton } from "@/components/admin/client";
import { AddTaxonForm } from "./AddTaxonForm";
import type { Taxon } from "@/lib/types";

export const metadata = { title: "Topics, areas and menu" };

const iconBtn = "grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-sand hover:text-ink disabled:opacity-30";

function TaxonList({ items, usage }: { items: Taxon[]; usage: (id: string) => number }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((t, i) => (
        <li key={t.id} className="flex items-center gap-2 py-2">
          <form action={renameTaxon} className="flex min-w-0 flex-1 items-center gap-2">
            <input type="hidden" name="id" value={t.id} />
            <label htmlFor={`n-${t.id}`} className="sr-only">
              Name
            </label>
            <input id={`n-${t.id}`} name="name" defaultValue={t.name} className={`${input} py-2`} />
            <button type="submit" className="shrink-0 rounded-lg px-2.5 py-2 text-sm font-bold text-brand hover:bg-brand-tint">
              Save
            </button>
          </form>
          <span className="w-16 shrink-0 text-right text-xs text-ink-2">{usage(t.id)} used</span>
          <form action={moveTaxon}>
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="dir" value="up" />
                            <button type="submit" disabled={i === 0} className={iconBtn} aria-label={`Move ${t.name} up`}>
              <ArrowUp className="size-4" aria-hidden />
            </button>
          </form>
          <form action={moveTaxon}>
            <input type="hidden" name="id" value={t.id} />
            <input type="hidden" name="dir" value="down" />
                            <button type="submit" disabled={i === items.length - 1} className={iconBtn} aria-label={`Move ${t.name} down`}>
              <ArrowDown className="size-4" aria-hidden />
            </button>
          </form>
          <form action={deleteTaxon}>
            <input type="hidden" name="id" value={t.id} />
            <ConfirmButton className={iconBtn} message={`Delete "${t.name}"? It will be removed from ${usage(t.id)} listings and downloads.`}>
              <Trash2 className="size-4" aria-hidden />
              <span className="sr-only">Delete {t.name}</span>
            </ConfirmButton>
          </form>
        </li>
      ))}
    </ul>
  );
}

export default function TaxonomyAdmin() {
  const db = readDb();
  const topics = db.taxa.filter((t) => t.type === "topic").sort((a, b) => a.order - b.order);
  const areas = db.taxa.filter((t) => t.type === "area").sort((a, b) => a.order - b.order);
  const usage = (id: string) => db.listings.filter((l) => l.topicIds.includes(id) || l.areaIds.includes(id)).length + db.resources.filter((r) => r.topicIds.includes(id)).length;

  const roots = db.pages.filter((p) => !p.parentId && p.template !== "home").sort((a, b) => Number(b.showInNav) - Number(a.showInNav) || a.navOrder - b.navOrder);

  return (
    <>
      <AdminHeader title="Topics, areas and menu" description="Topics and areas power the directory filters. The menu controls what appears in the site header." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Main menu" description="Order and visibility of pages in the header. Child pages appear in each section's dropdown." className="xl:col-span-2">
          <ul className="space-y-2">
            {roots.map((p) => {
              const inMenu = roots.filter((r) => r.showInNav);
              const idx = inMenu.findIndex((r) => r.id === p.id);
              const kids = db.pages.filter((c) => c.parentId === p.id).sort((a, b) => a.navOrder - b.navOrder);
              const kidsInMenu = kids.filter((k) => k.showInNav);
              return (
                <li key={p.id} className={`rounded-xl border ${p.showInNav ? "border-line bg-surface" : "border-dashed border-line-strong opacity-80"}`}>
                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className="min-w-0 flex-1 font-bold">
                      {p.navLabel || p.title} <span className="font-normal text-ink-2">/{p.slug}</span>
                      {p.status === "draft" && <span className="ml-2 text-xs text-warn">draft</span>}
                    </span>
                    {p.showInNav && (
                      <>
                        <form action={moveNav}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="dir" value="up" />
                            <button type="submit" disabled={idx === 0} className={iconBtn} aria-label={`Move ${p.title} up`}>
                            <ArrowUp className="size-4" aria-hidden />
                          </button>
                        </form>
                        <form action={moveNav}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="dir" value="down" />
                            <button type="submit" disabled={idx === inMenu.length - 1} className={iconBtn} aria-label={`Move ${p.title} down`}>
                            <ArrowDown className="size-4" aria-hidden />
                          </button>
                        </form>
                      </>
                    )}
                    <form action={toggleNav}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold text-ink-2 hover:bg-sand hover:text-ink">
                        {p.showInNav ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                        {p.showInNav ? "In menu" : "Hidden"}
                      </button>
                    </form>
                  </div>
                  {p.showInNav && kids.length > 0 && (
                    <ul className="border-t border-line px-3 py-1.5">
                      {kids.map((k) => {
                        const ki = kidsInMenu.findIndex((x) => x.id === k.id);
                        return (
                          <li key={k.id} className="flex items-center gap-2 py-1 pl-5">
                            <span className="min-w-0 flex-1 text-[0.95rem]">{k.navLabel || k.title}</span>
                            {k.showInNav && (
                              <>
                                <form action={moveNav}>
                                  <input type="hidden" name="id" value={k.id} />
                                  <input type="hidden" name="dir" value="up" />
                            <button type="submit" disabled={ki === 0} className={iconBtn} aria-label={`Move ${k.title} up`}>
                                    <ArrowUp className="size-4" aria-hidden />
                                  </button>
                                </form>
                                <form action={moveNav}>
                                  <input type="hidden" name="id" value={k.id} />
                                  <input type="hidden" name="dir" value="down" />
                            <button type="submit" disabled={ki === kidsInMenu.length - 1} className={iconBtn} aria-label={`Move ${k.title} down`}>
                                    <ArrowDown className="size-4" aria-hidden />
                                  </button>
                                </form>
                              </>
                            )}
                            <form action={toggleNav}>
                              <input type="hidden" name="id" value={k.id} />
                              <button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-bold text-ink-2 hover:bg-sand hover:text-ink">
                                {k.showInNav ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
                                {k.showInNav ? "In menu" : "Hidden"}
                              </button>
                            </form>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
        <Card title="Topics" description="What a service helps with.">
          <TaxonList items={topics} usage={usage} />
          <AddTaxonForm type="topic" />
        </Card>
        <Card title="Areas" description="Where a service is available. Add new areas as Hadamley grows.">
          <TaxonList items={areas} usage={usage} />
          <AddTaxonForm type="area" />
        </Card>
      </div>
    </>
  );
}
