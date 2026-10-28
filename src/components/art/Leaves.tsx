import { useId } from "react";

/**
 * Leaf sprigs for the corners of a page, drawn after the 27 October mock-ups:
 * a curving gold stem with almond leaves shading from deep teal to sage, each
 * with a gold vein. Leaves only, no flowers. Decoration: kept to edges and
 * corners, hidden from screen readers and print.
 */

// [x, y, angle, length, tone] along the stem; angle in degrees, 0 points right.
type Leaf = [number, number, number, number, "deep" | "soft"];

const LEAVES: Leaf[] = [
  [104, 46, -148, 56, "deep"],
  [150, 84, -98, 52, "deep"],
  [128, 66, 168, 52, "deep"],
  [178, 116, 176, 46, "deep"],
  [64, 37, -162, 42, "soft"],
  [48, 43, 158, 36, "soft"],
  [22, 53, 182, 36, "soft"],
  [190, 158, 162, 38, "soft"],
  [176, 180, 112, 36, "soft"],
  [182, 172, 68, 26, "soft"],
];

function leafPath(l: number) {
  const w = l * 0.42;
  return `M0 0C${l * 0.3} ${-w} ${l * 0.72} ${-w * 0.95} ${l} 0C${l * 0.72} ${w * 0.6} ${l * 0.3} ${w * 0.75} 0 0Z`;
}

function Sprig({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 220 220" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-deep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--leaf-deep)" />
          <stop offset="0.55" stopColor="var(--leaf)" />
          <stop offset="1" stopColor="var(--leaf-deep)" />
        </linearGradient>
        <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--leaf)" />
          <stop offset="1" stopColor="var(--leaf-2)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="var(--stem)" strokeLinecap="round">
        <path d="M222 168C196 128 156 76 104 46C76 31 46 38 20 54" strokeWidth="2.2" />
        <path d="M205 146C194 156 184 168 174 186" strokeWidth="1.6" />
        <path d="M150 84L144 94M178 116L170 118M128 66L120 70" strokeWidth="1.4" />
      </g>
      {LEAVES.map(([x, y, a, l, tone], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
          <path d={leafPath(l)} fill={`url(#${id}-${tone})`} />
          <path d={`M2 0Q${l * 0.5} ${-l * 0.04} ${l * 0.86} 0`} fill="none" stroke="var(--stem)" strokeWidth="0.9" opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}

/**
 * A pair of sprigs reaching in from the left and right edges, at the top or
 * bottom of the parent. `leftWide` keeps the left one for wide screens only,
 * for left-aligned headers whose breadcrumb sits in that corner.
 */
export function CornerLeaves({ bottom = false, leftWide = false }: { bottom?: boolean; leftWide?: boolean }) {
  const pos = bottom ? "bottom-0" : "top-0";
  const flipY = bottom ? "-scale-y-100" : "";
  return (
    <div className={`no-print pointer-events-none absolute inset-x-0 ${pos} -z-10 h-36 overflow-hidden sm:h-48`} aria-hidden="true">
      <Sprig className={`absolute left-0 ${pos} ${leftWide ? "hidden 2xl:block" : ""} size-32 -scale-x-100 sm:size-48 ${flipY}`} />
      <Sprig className={`absolute right-0 ${pos} size-32 sm:size-48 ${flipY}`} />
    </div>
  );
}
