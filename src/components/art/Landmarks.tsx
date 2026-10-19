/**
 * Hadamley's illustration set: line drawings of real places in Havering,
 * with flat colour blocks printed slightly off-register, like a riso print.
 * All decorative, so every SVG is hidden from assistive technology.
 */

const C = {
  lake: "var(--art-lake)",
  brick: "var(--art-brick)",
  meadow: "var(--art-meadow)",
  navy: "var(--art-navy)",
  rose: "var(--art-rose)",
  sun: "var(--art-sun)",
  lakeInk: "var(--sec-ltc)",
  brickInk: "var(--sec-mob)",
  meadowInk: "var(--sec-mh)",
  roseInk: "var(--sec-res)",
};

function Tree({ x, y = 210, s = 1, fill = C.meadow }: { x: number; y?: number; s?: number; fill?: string }) {
  return (
    <g className="tree" transform={`translate(${x} ${y}) scale(${s})`}>
      <path className="riso" d="M-26 -52 a20 20 0 0 1 14 -30 a22 22 0 0 1 36 4 a18 18 0 0 1 4 30 a16 16 0 0 1 -26 8 a18 18 0 0 1 -28 -12z" fill={fill} transform="translate(4 4)" />
      <path className="ln" d="M-26 -52 a20 20 0 0 1 14 -30 a22 22 0 0 1 36 4 a18 18 0 0 1 4 30 a16 16 0 0 1 -26 8 a18 18 0 0 1 -28 -12z" />
      <path className="ln" d="M0 0 V-38 M0 -30 L-9 -40 M0 -24 L8 -34" />
    </g>
  );
}

function Windmill({ x, y = 210 }: { x: number; y?: number }) {
  // Upminster Windmill: a smock mill on a brick base, with a stage and four sails.
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon className="riso" points="-24,-30 24,-30 14,-115 -14,-115" fill={C.brick} transform="translate(5 5)" />
      <rect className="ln fill-paper" x="-30" y="-30" width="60" height="30" />
      <path className="ln-thin" d="M-30 -20 H30 M-30 -10 H30 M-15 -30 V-20 M5 -30 V-20 M-5 -20 V-10 M15 -20 V-10 M-20 -10 V0 M10 -10 V0" />
      <polygon className="ln fill-paper" points="-24,-30 24,-30 14,-115 -14,-115" />
      <path className="ln-thin" d="M-8 -30 L-5 -115 M8 -30 L5 -115" />
      <path className="ln" d="M-36 -62 H36 M-34 -62 V-54 M-17 -62 V-54 M0 -62 V-54 M17 -62 V-54 M34 -62 V-54 M-36 -54 H36" />
      <path className="ln" d="M-6 0 V-14 a6 6 0 0 1 12 0 V0" />
      <rect className="ln fill-paper" x="-4" y="-96" width="8" height="10" />
      <path className="ln fill-paper" d="M-17 -115 Q0 -142 17 -115 Z" />
      <g transform="translate(0 -118)">
        <g className="sails">
          {[0, 90, 180, 270].map((a) => (
            <g key={a} transform={`rotate(${a})`}>
              <path className="ln" d="M0 -4 V-82" />
              <rect className="ln fill-paper" x="1.5" y="-80" width="12" height="62" />
              <path className="ln-thin" d="M1.5 -68 H13.5 M1.5 -56 H13.5 M1.5 -44 H13.5 M1.5 -32 H13.5 M7.5 -80 V-18" />
            </g>
          ))}
          <circle className="ln fill-paper" r="5" />
        </g>
      </g>
    </g>
  );
}

function Langtons({ x, y = 210 }: { x: number; y?: number }) {
  // Langtons House, Hornchurch: a Georgian house with a pedimented door and an orangery wing.
  const win = (wx: number, wy: number) => <rect key={`${wx}-${wy}`} className="ln-thin win" x={wx} y={wy} width="13" height="19" />;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="riso" x="0" y="-92" width="150" height="92" fill={C.rose} transform="translate(5 5)" />
      <rect className="ln fill-paper" x="150" y="-48" width="46" height="48" />
      {[160, 176].map((wx) => (
        <path key={wx} className="ln-thin" d={`M${wx} -8 V-30 a6 6 0 0 1 12 0 V-8`} />
      ))}
      <rect className="ln fill-paper" x="0" y="-92" width="150" height="92" />
      <polygon className="ln fill-paper" points="-8,-92 158,-92 140,-112 10,-112" />
      <rect className="ln fill-paper" x="26" y="-128" width="10" height="16" />
      <rect className="ln fill-paper" x="114" y="-128" width="10" height="16" />
      {[14, 44, 93, 123].map((wx) => [win(wx, -80), win(wx, -42)])}
      {win(68, -80)}
      <path className="ln" d="M64 0 V-30 H86 V0 M60 -30 L75 -42 L90 -30 Z M62 -30 V0 M88 -30 V0" />
      <path className="ln-thin" d="M-14 0 H210" />
    </g>
  );
}

function MarketStall({ x, y = 210, fill }: { x: number; y?: number; fill: string }) {
  // Romford Market: a striped awning on poles over a trestle of produce.
  return (
    <g transform={`translate(${x} ${y})`}>
      <path className="riso" d="M-2 -72 L33 -86 L68 -72 V-52 H-2 Z" fill={fill} transform="translate(4 4)" />
      <path className="ln" d="M4 0 V-72 M62 0 V-72" />
      <path className="ln fill-paper" d={`M-2 -72 L33 -86 L68 -72 V-58 h-70 Z`} />
      <path className="ln-thin" d="M9 -76 V-58 M20 -80 V-58 M33 -86 V-58 M46 -80 V-58 M57 -76 V-58" />
      <path className="ln fill-paper" d={`M-2 -58 ${Array.from({ length: 6 }, () => "q5.83 8 11.66 0").join(" ")}`} />
      <rect className="ln fill-paper" x="-4" y="-26" width="74" height="8" />
      <path className="ln" d="M2 -18 L-2 0 M64 -18 L68 0" />
      {[8, 18, 28, 40, 50, 60].map((cx, i) => (
        <circle key={cx} className="ln" cx={cx} cy={i % 2 ? -31 : -30} r="4.5" fill={i % 2 ? C.brick : C.meadow} />
      ))}
    </g>
  );
}

function Bus({ x, y = 210, animate = true }: { x: number; y?: number; animate?: boolean }) {
  // A low-floor community bus with a wheelchair space.
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className={animate ? "drive" : undefined}>
        <rect className="riso" x="0" y="-72" width="168" height="58" rx="12" fill={C.navy} transform="translate(5 5)" />
        <rect className="ln fill-paper" x="0" y="-72" width="168" height="58" rx="12" />
        {[12, 44, 76].map((wx) => (
          <rect key={wx} className="ln win" x={wx} y="-62" width="26" height="20" rx="3" />
        ))}
        <rect className="ln" x="112" y="-62" width="22" height="46" rx="2" />
        <path className="ln-thin" d="M123 -62 V-16" />
        <rect className="ln win" x="142" y="-62" width="20" height="22" rx="4" />
        <path className="ln-thin" d="M0 -34 H112 M134 -34 H168" />
        <g transform="translate(88 -28)" className="ln-thin">
          <circle cx="0" cy="-6" r="2" />
          <path d="M0 -3 V3 H5 L7 8 M-3 2 a5 5 0 1 0 7 6" />
        </g>
        <circle className="ln fill-paper" cx="36" cy="-12" r="12" />
        <circle className="ln-thin" cx="36" cy="-12" r="4" />
        <circle className="ln fill-paper" cx="138" cy="-12" r="12" />
        <circle className="ln-thin" cx="138" cy="-12" r="4" />
      </g>
    </g>
  );
}

function Spire({ x, y = 210 }: { x: number; y?: number }) {
  // St Edward the Confessor, Romford Market Place.
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon className="riso" points="-16,-82 16,-82 0,-150" fill={C.lake} transform="translate(5 5)" />
      <rect className="ln fill-paper" x="-16" y="-82" width="32" height="82" />
      <polygon className="ln fill-paper" points="-18,-82 18,-82 0,-150" />
      <path className="ln" d="M0 -150 V-164 M-5 -158 H5" />
      <circle className="ln" cx="0" cy="-62" r="7" />
      <path className="ln-thin" d="M0 -62 V-66 M0 -62 H3" />
      <path className="ln" d="M-6 0 V-20 a6 6 0 0 1 12 0 V0" />
      <path className="ln-thin" d="M-8 -40 V-30 M8 -40 V-30" />
    </g>
  );
}

function RainhamHall({ x, y = 210 }: { x: number; y?: number }) {
  // Rainham Hall: a small Georgian house with a hipped roof and a doorcase.
  const w = (wx: number, wy: number) => <rect key={`${wx}-${wy}`} className="ln-thin win" x={wx} y={wy} width="12" height="16" />;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="riso" x="0" y="-70" width="100" height="70" fill={C.lake} transform="translate(5 5)" />
      <rect className="ln fill-paper" x="0" y="-70" width="100" height="70" />
      <polygon className="ln fill-paper" points="-6,-70 106,-70 92,-88 8,-88" />
      <rect className="ln fill-paper" x="20" y="-98" width="8" height="10" />
      <rect className="ln fill-paper" x="72" y="-98" width="8" height="10" />
      {[12, 44, 76].map((wx) => w(wx, -60))}
      {[12, 76].map((wx) => w(wx, -30))}
      <path className="ln" d="M44 0 V-24 H56 V0 M42 -24 L50 -31 L58 -24" />
      <path className="ln-thin" d="M-10 0 H110 M-8 0 V-8 M108 0 V-8 M-8 -8 H10 M90 -8 H108" />
    </g>
  );
}

function Cathedral({ x, y = 210 }: { x: number; y?: number }) {
  // Brentwood Cathedral: a classical front with a portico and a lantern.
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect className="riso" x="0" y="-80" width="106" height="80" fill={C.navy} transform="translate(5 5)" />
      <rect className="ln fill-paper" x="41" y="-122" width="24" height="22" />
      <path className="ln fill-paper" d="M38 -122 Q53 -142 68 -122 Z" />
      <path className="ln" d="M53 -142 V-152 M49 -148 H57" />
      <rect className="ln fill-paper" x="0" y="-80" width="106" height="80" />
      <polygon className="ln fill-paper" points="-4,-80 110,-80 53,-102" />
      <rect className="ln fill-paper" x="12" y="-76" width="82" height="6" />
      <path className="ln" d="M20 -70 V0 M38 -70 V0 M68 -70 V0 M86 -70 V0" />
      <path className="ln" d="M47 0 V-24 a6 6 0 0 1 12 0 V0" />
      <rect className="ln-thin win" x="6" y="-60" width="8" height="18" />
      <rect className="ln-thin win" x="92" y="-60" width="8" height="18" />
      <path className="ln-thin" d="M-6 0 H112" />
    </g>
  );
}

function Birds({ x, y }: { x: number; y: number }) {
  return <path className="ln-thin" d={`M${x} ${y} q5 -5 10 0 q5 -5 10 0 M${x + 26} ${y - 12} q4 -4 8 0 q4 -4 8 0`} />;
}

/** Where each town's landmark stands in the skyline (x in the 1200-wide drawing, top of the landmark). */
export const SKYLINE_PLACES: Record<string, { x: number; top: number; label: string }> = {
  rainham: { x: 106, top: 98, label: "Rainham Hall" },
  upminster: { x: 262, top: 200, label: "Upminster Windmill" },
  hornchurch: { x: 458, top: 128, label: "Langtons, Hornchurch" },
  romford: { x: 742, top: 164, label: "Romford Market" },
  brentwood: { x: 1113, top: 152, label: "Brentwood Cathedral" },
};

/** Which part of the scene answers each need. */
const NEED_SCENE: Record<string, string> = {
  transport: "bus",
  "mental-health": "park",
  equipment: "romford",
  "assessments-costs": "romford",
};

export function sceneFor(place?: string, need?: string) {
  const lit = new Set<string>();
  if (place && SKYLINE_PLACES[place]) lit.add(place);
  if (need && NEED_SCENE[need]) lit.add(NEED_SCENE[need]);
  return lit;
}

/**
 * The Havering skyline: real landmarks for each town, a community bus and
 * the parks. It can draw itself on load, light up the places a visitor
 * picks, and turns to night in dark mode.
 */
export function Skyline({
  className = "",
  animate = true,
  draw = false,
  lit,
}: {
  className?: string;
  animate?: boolean;
  draw?: boolean;
  lit?: Set<string>;
}) {
  const on = (key: string) => `lm lm-${key}${lit?.has(key) ? " on" : ""}`;
  const d = (s: number) => ({ ["--d" as string]: `${s}s` }) as React.CSSProperties;
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 226"
      preserveAspectRatio="xMidYMax meet"
      className={`art skyline ${draw ? "draw" : ""} ${className}`}
      data-focus={lit && lit.size ? "1" : undefined}
    >
      {/* Day: the sun. Night: a crescent moon and stars. */}
      <g className="day" style={d(1.6)}>
        <circle className="riso" cx="1000" cy="48" r="24" fill={C.sun} />
        <circle className="ln-thin" cx="996" cy="44" r="24" />
      </g>
      <g className="night">
        <circle cx="1000" cy="46" r="20" fill="var(--art-sun)" />
        <circle cx="1010" cy="40" r="18" fill="var(--paper)" />
        {[
          [120, 40],
          [340, 28],
          [520, 54],
          [610, 22],
          [880, 34],
          [1080, 70],
          [1150, 30],
          [430, 14],
        ].map(([sx, sy], i) => (
          <path key={i} className="star" style={{ animationDelay: `${i * 0.37}s` }} d={`M${sx} ${sy - 4} V${sy + 4} M${sx - 4} ${sy} H${sx + 4}`} />
        ))}
      </g>
      <g style={d(1.2)}>
        <Birds x={300} y={58} />
        <Birds x={690} y={40} />
      </g>

      <g className={on("park")} style={d(0.9)}>
        <Tree x={26} s={0.8} />
        <Tree x={196} s={0.85} fill={C.lake} />
        <Tree x={592} s={1} />
        <Tree x={1186} s={0.6} fill={C.lake} />
      </g>
      <g className={on("rainham")} style={d(0.2)}>
        <RainhamHall x={56} />
      </g>
      <g className={on("upminster")} style={d(0.35)}>
        <Windmill x={262} />
      </g>
      <g className={on("hornchurch")} style={d(0.5)}>
        <Langtons x={360} />
      </g>
      <g className={on("romford")} style={d(0.65)}>
        <MarketStall x={632} fill={C.brick} />
        <MarketStall x={708} fill={C.lake} />
        <Spire x={818} />
      </g>
      <g className={on("bus")} style={d(0.8)}>
        <Bus x={860} animate={animate} />
      </g>
      <g className={on("brentwood")} style={d(0.95)}>
        <Cathedral x={1060} />
      </g>

      <g style={d(0)}>
        <path className="ln ground" d="M0 210 C 200 207, 400 213, 600 209 S 1000 207, 1200 211" />
        <path className="ln-thin" d="M20 218 h30 M140 220 h50 M330 217 h24 M560 219 h40 M820 218 h60 M1000 220 h30 M1130 217 h40" />
      </g>
    </svg>
  );
}

/* ---------------------------------------------------------- vignettes */

function Bench() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <Tree x={66} y={160} s={1.15} fill={C.lake} />
      <rect x="112" y="118" width="96" height="8" fill={C.lake} transform="translate(4 4)" />
      <path className="ln" d="M110 122 H210 M112 104 H208 M112 112 H208 M118 122 L114 160 M202 122 L206 160 M116 104 V122 M204 104 V122 M118 140 H202" />
      <path className="ln" d="M214 160 L196 92 a6 6 0 0 1 10 -4" />
      <path className="ln" d="M10 160 H230" />
      <path className="ln-thin" d="M30 168 h24 M150 168 h40" />
    </svg>
  );
}

function BusScene() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <g transform="translate(-4 0) scale(1)">
        <Bus x={18} y={150} animate={false} />
      </g>
      <path className="ln" d="M130 150 L118 160" />
      <path className="ln" d="M6 160 H234" />
      <circle cx="210" cy="40" r="16" fill={C.brick} />
      <circle className="ln-thin" cx="207" cy="37" r="16" />
    </svg>
  );
}

function Pond() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <Tree x={180} y={150} s={1.05} />
      <ellipse cx="104" cy="152" rx="86" ry="18" fill={C.lake} transform="translate(4 3)" />
      <ellipse className="ln" cx="104" cy="152" rx="86" ry="18" />
      <path className="ln-thin" d="M50 152 h20 M110 158 h30 M84 146 h14" />
      <g className="bob">
        <path className="ln fill-paper" d="M88 146 q-2 -10 8 -12 q8 -1 9 6 l8 -2 q-2 7 -9 8 q12 0 14 -6 q4 10 -8 14 h-16 q-8 -2 -6 -8z" />
        <circle cx="101" cy="137" r="1.2" fill="currentColor" />
      </g>
      <path className="ln" d="M24 150 q-2 -20 4 -36 M30 150 q2 -18 -2 -30 M36 150 q0 -14 6 -24" />
      <path className="ln" d="M4 160 H236" />
    </svg>
  );
}

function Signpost() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <polygon points="122,40 196,40 210,54 196,68 122,68" fill={C.navy} transform="translate(4 4)" />
      <path className="ln" d="M118 26 V160" />
      <polygon className="ln fill-paper" points="122,40 196,40 210,54 196,68 122,68" />
      <polygon className="ln fill-paper" points="114,78 48,78 34,92 48,106 114,106" />
      <polygon className="ln fill-paper" points="122,116 184,116 196,128 184,140 122,140" />
      <path className="ln-thin" d="M134 54 h44 M58 92 h44 M132 128 h36" />
      <circle className="ln fill-paper" cx="118" cy="24" r="5" />
      <path className="ln" d="M20 160 H220" />
      <path className="ln-thin" d="M96 160 q4 -10 8 0 q4 -10 8 0 M126 160 q4 -10 8 0" />
    </svg>
  );
}

function Leaflets() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <rect x="60" y="34" width="96" height="124" rx="6" fill={C.rose} transform="translate(5 5) rotate(-6 108 96)" />
      <rect className="ln fill-paper" x="60" y="34" width="96" height="124" rx="6" transform="rotate(-6 108 96)" />
      <g transform="rotate(4 140 100)">
        <rect className="ln fill-paper" x="96" y="30" width="96" height="128" rx="6" />
        <rect className="ln fill-paper" x="126" y="22" width="36" height="16" rx="4" />
        {[60, 84, 108, 132].map((yy) => (
          <g key={yy}>
            <rect className="ln-thin" x="108" y={yy - 7} width="12" height="12" rx="2" />
            <path className="ln" d={`M110 ${yy - 1} l3 3 l6 -7`} />
            <path className="ln-thin" d={`M128 ${yy} h50`} />
          </g>
        ))}
      </g>
      <path className="ln" d="M14 166 H226" />
    </svg>
  );
}

function PillarBox() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <rect x="92" y="46" width="56" height="110" rx="10" fill={C.brick} transform="translate(5 5)" />
      <path className="ln fill-paper" d="M92 156 V64 a28 18 0 0 1 56 0 V156 Z" />
      <rect className="ln fill-paper" x="86" y="148" width="68" height="12" rx="2" />
      <path className="ln" d="M104 86 H136" />
      <rect className="ln-thin" x="108" y="98" width="24" height="18" rx="2" />
      <path className="ln-thin" d="M92 66 H148" />
      <path className="ln" d="M20 160 H220" />
      <Tree x={200} y={160} s={0.7} />
    </svg>
  );
}

function MillScene() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 180" className="art size-full">
      <g transform="translate(0 -30) scale(0.95)">
        <Windmill x={126} y={220} />
      </g>
      <Tree x={36} y={160} s={0.7} fill={C.lake} />
      <path className="ln" d="M6 160 H234" />
    </svg>
  );
}

const VIGNETTES: Record<string, () => React.ReactElement> = {
  "chronic-illness-support": Bench,
  "mobility-daily-living-transport": BusScene,
  "mental-health-support": Pond,
  "find-support": Signpost,
  resources: Leaflets,
  contact: PillarBox,
};

/** A small scene that heads each chapter of the guide. */
export function SectionArt({ section, className = "" }: { section: string; className?: string }) {
  const Art = VIGNETTES[section] ?? MillScene;
  return (
    <div aria-hidden="true" className={className}>
      <Art />
    </div>
  );
}

export const SECTION_CLASS: Record<string, string> = {
  "chronic-illness-support": "sec-ltc",
  "mobility-daily-living-transport": "sec-mob",
  "mental-health-support": "sec-mh",
  "find-support": "sec-find",
  resources: "sec-res",
};

export function sectionClass(section: string) {
  return SECTION_CLASS[section] ?? "sec-ltc";
}
