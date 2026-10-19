import { approvedListings, areas } from "@/lib/repo";

/**
 * Illustrated map of the areas Hadamley covers. Positions follow real
 * geography (roughly), drawn in the guidebook's line style. Each town is
 * a link into the directory, sized by how many services cover it.
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
  const count = (slug: string) =>
    listings.filter((l) => {
      const slugs = l.areaIds.map((id) => areaList.find((a) => a.id === id)?.slug);
      return slugs.includes(slug) || (HAVERING_TOWNS.has(slug) && slugs.includes("havering"));
    }).length;
  const online = listings.filter((l) => l.areaIds.includes("a-online-national")).length;
  const boroughWide = listings.filter((l) => l.areaIds.includes("a-havering")).length;
  const max = Math.max(1, ...Object.keys(PLACES).map(count));

  return (
    <figure className={className}>
      <svg viewBox="0 0 600 470" className="art w-full" role="group" aria-label="Map of areas covered. Choose a town to see its services.">
        {/* Havering borough */}
        <path
          d="M78 132 C 120 96, 190 104, 236 118 C 300 136, 352 150, 404 176 C 436 196, 430 248, 414 292 C 400 334, 360 376, 304 410 C 262 432, 210 438, 176 420 C 140 402, 120 360, 104 318 C 88 276, 54 238, 52 196 C 50 166, 60 146, 78 132 Z"
          fill="var(--art-lake)"
          transform="translate(6 6)"
        />
        <path
          className="ln"
          strokeDasharray="1 0"
          d="M78 132 C 120 96, 190 104, 236 118 C 300 136, 352 150, 404 176 C 436 196, 430 248, 414 292 C 400 334, 360 376, 304 410 C 262 432, 210 438, 176 420 C 140 402, 120 360, 104 318 C 88 276, 54 238, 52 196 C 50 166, 60 146, 78 132 Z"
        />
        <a href="/find-support?area=havering" aria-label={`Havering, borough-wide: ${boroughWide} services`} className="group">
          <text x="286" y="356" className="font-display text-[17px] italic group-hover:underline" style={{ fill: "var(--sec-ltc)" }}>
            London Borough
          </text>
          <text x="286" y="376" className="font-display text-[17px] italic group-hover:underline" style={{ fill: "var(--sec-ltc)" }}>
            of Havering
          </text>
        </a>

        {/* River Thames */}
        <path d="M0 452 C 90 436, 160 462, 250 446 S 420 430, 600 448" fill="none" stroke="var(--art-navy)" strokeWidth="16" strokeLinecap="round" />
        <path className="ln-thin" d="M0 452 C 90 436, 160 462, 250 446 S 420 430, 600 448" />
        <text x="430" y="432" className="font-display text-[13px] italic" style={{ fill: "var(--ink-2)" }}>
          River Thames
        </text>

        {/* M25, running between Upminster and Brentwood */}
        <path d="M470 40 C 450 140, 452 240, 470 330 S 500 420, 520 470" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="7 6" opacity="0.6" />
        <text x="478" y="300" className="text-[12px] font-bold" style={{ fill: "var(--ink-2)" }}>
          M25
        </text>

        {/* A12 Romford to Brentwood */}
        <path className="ln-thin" d={`M${px(0.18)} ${py(51.577)} C 260 160, 380 120, ${px(0.305)} ${py(51.621)}`} />
        <text x="300" y="132" className="text-[12px] font-bold" style={{ fill: "var(--ink-2)" }} transform="rotate(-14 300 132)">
          A12
        </text>

        {/* Little landmarks */}
        <g transform="translate(410 262) scale(0.3)" aria-hidden="true">
          <polygon className="ln fill-paper" points="-24,-30 24,-30 14,-115 -14,-115" />
          <path className="ln" d="M0 -118 l-60 -60 M0 -118 l60 -60 M0 -118 l-60 60 M0 -118 l60 60" />
        </g>
        <g transform="translate(286 232)" aria-hidden="true">
          <path className="ln" d="M0 0 a10 10 0 0 1 6 -16 a12 12 0 0 1 20 2 a10 10 0 0 1 0 16 z M13 0 v12" fill="var(--art-meadow)" />
        </g>
        <g transform="translate(540 120)" aria-hidden="true">
          <path className="ln" d="M0 0 a10 10 0 0 1 6 -16 a12 12 0 0 1 20 2 a10 10 0 0 1 0 16 z M13 0 v12" fill="var(--art-meadow)" />
        </g>
        <text x="530" y="40" className="font-display text-[13px] italic" style={{ fill: "var(--ink-2)" }}>
          Essex
        </text>
        <path className="ln-thin" d="M560 70 l0 -14 m-5 5 l5 -5 l5 5" />
        <text x="566" y="66" className="text-[11px] font-bold" style={{ fill: "var(--ink-2)" }}>
          N
        </text>

        {/* Towns */}
        {Object.entries(PLACES).map(([slug, p]) => {
          const n = count(slug);
          const x = px(p.lon);
          const y = py(p.lat);
          const r = 16 + (n / max) * 18;
          return (
            <a key={slug} href={`/find-support?area=${slug}`} aria-label={`${name(slug)}: ${n} ${n === 1 ? "service" : "services"}`} className="group cursor-pointer outline-none">
              <circle cx={x + 4} cy={y + 4} r={r} fill="var(--ink)" />
              <circle cx={x} cy={y} r={r} className="transition-[r] duration-300" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.6" />
              <circle cx={x} cy={y} r={r - 5} fill="var(--sec-find-soft)" className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
              <text x={x} y={y + 7} textAnchor="middle" className="font-display text-[20px] font-semibold" style={{ fill: "var(--ink)" }}>
                {n}
              </text>
              <text
                x={p.side === "right" ? x + r + 10 : x + (p.dx ?? 0)}
                y={p.side === "right" ? y + 5 : y + r + 20 + (p.dy ?? 0)}
                textAnchor={p.side === "right" ? "start" : "middle"}
                className="text-[14px] font-bold group-hover:underline"
                style={{ fill: "var(--ink)" }}
              >
                {name(slug)}
              </text>
              <circle cx={x} cy={y} r={r + 6} fill="none" stroke="var(--focus)" strokeWidth="4" className="opacity-0 group-focus-visible:opacity-100" />
            </a>
          );
        })}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.9rem] text-ink-2">
        <span>Numbers show services covering each town, including borough-wide services.</span>
        {online > 0 && (
          <a href="/find-support?area=online-national" className="link font-bold">
            Plus {online} online or UK-wide
          </a>
        )}
      </figcaption>
    </figure>
  );
}
