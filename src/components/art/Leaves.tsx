/**
 * Light leaf sprigs for the corners of a page, after the leaf pattern in
 * Tracey's logo. Decoration only: kept to edges and corners, hidden from
 * screen readers and print.
 */
function Sprig({ className = "" }: { className?: string }) {
  const leaf = "M0 0C6-7 17-8 24-3C17 3 6 4 0 0Z";
  const leaves: [number, number, number][] = [
    [18, 14, -38],
    [34, 30, 8],
    [44, 48, -52],
    [60, 60, 14],
    [64, 82, -64],
    [26, 46, 72],
  ];
  return (
    <svg viewBox="0 0 110 110" className={className} aria-hidden="true" focusable="false">
      <path d="M4 4C30 18 58 46 76 104" fill="none" stroke="var(--champagne)" strokeWidth="1.6" strokeLinecap="round" />
      {leaves.map(([x, y, r], i) => (
        <path key={i} d={leaf} transform={`translate(${x} ${y}) rotate(${r}) scale(${i % 2 ? 1.05 : 1.2})`} fill={i % 3 ? "var(--leaf)" : "var(--leaf-2)"} />
      ))}
    </svg>
  );
}

export function CornerLeaves({ bottom = false }: { bottom?: boolean }) {
  const pos = bottom ? "bottom-0" : "top-0";
  const flipY = bottom ? "-scale-y-100" : "";
  return (
    <div className={`no-print pointer-events-none absolute inset-x-0 ${pos} -z-10 h-28 overflow-hidden sm:h-36`} aria-hidden="true">
      <Sprig className={`absolute left-0 ${pos} size-24 opacity-80 sm:size-32 ${flipY}`} />
      <Sprig className={`absolute right-0 ${pos} size-24 -scale-x-100 opacity-80 sm:size-32 ${bottom ? "-scale-y-100" : ""}`} />
    </div>
  );
}
