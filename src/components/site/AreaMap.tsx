import { approvedListings, areas } from "@/lib/repo";
import { PROVIDER_LABEL } from "@/lib/types";
import { AreaMapView, type MapTown } from "./AreaMapView";

/**
 * Illustrated map of the areas Hadamley covers. Positions follow real
 * geography (roughly), drawn in the guidebook's line style. Each town is
 * sized by how many services cover it; choosing one opens its services.
 */

// Approximate longitude/latitude, projected to the drawing.
const PLACES: Record<string, { lon: number; lat: number; dx?: number; dy?: number; side?: "right" }> = {
  romford: { lon: 0.18, lat: 51.577, dx: -14, dy: -4 },
  hornchurch: { lon: 0.212, lat: 51.557, dx: 4, dy: 10 },
  upminster: { lon: 0.251, lat: 51.556 },
  rainham: { lon: 0.191, lat: 51.517, side: "right" },
  brentwood: { lon: 0.305, lat: 51.621 },
};
const HAVERING_TOWNS = new Set(["romford", "hornchurch", "upminster", "rainham"]);
const px = (lon: number) => (lon - 0.1264) * 2800;
const py = (lat: number) => (51.64 - lat) * 3300;

export function AreaMap({ className = "" }: { className?: string }) {
  const listings = approvedListings();
  const areaList = areas();
  const name = (slug: string) => areaList.find((a) => a.slug === slug)?.name.replace(/ \(.*\)/, "") ?? slug;
  const covers = (slug: string) =>
    listings.filter((l) => {
      const slugs = l.areaIds.map((id) => areaList.find((a) => a.id === id)?.slug);
      return slugs.includes(slug) || (HAVERING_TOWNS.has(slug) && slugs.includes("havering"));
    });
  const max = Math.max(1, ...Object.keys(PLACES).map((s) => covers(s).length));

  const towns: MapTown[] = Object.entries(PLACES).map(([slug, p]) => {
    const services = covers(slug);
    const x = px(p.lon);
    const y = py(p.lat);
    const r = 16 + (services.length / max) * 18;
    return {
      slug,
      name: name(slug),
      x,
      y,
      r,
      labelX: p.side === "right" ? x + r + 10 : x + (p.dx ?? 0),
      labelY: p.side === "right" ? y + 5 : y + r + 20 + (p.dy ?? 0),
      anchor: p.side === "right" ? "start" : "middle",
      services: services.map((l) => ({ id: l.id, name: l.name, provider: PROVIDER_LABEL[l.providerType] })),
    };
  });

  return (
    <AreaMapView
      className={className}
      towns={towns}
      a12={`M${px(0.18)} ${py(51.577)} C 260 160, 380 120, ${px(0.305)} ${py(51.621)}`}
      online={listings.filter((l) => l.areaIds.includes("a-online-national")).length}
      boroughWide={listings.filter((l) => l.areaIds.includes("a-havering")).length}
    />
  );
}
