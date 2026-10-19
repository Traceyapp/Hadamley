/** Drifting blurred light. Purely decorative. */
export function Aurora({ soft = false, className = "" }: { soft?: boolean; className?: string }) {
  return (
    <div aria-hidden="true" className={`aurora ${soft ? "aurora-soft" : ""} ${className}`}>
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

/** Aurora + dot grid + film grain, layered behind a section. */
export function Backdrop({ soft = false }: { soft?: boolean }) {
  return (
    <>
      <Aurora soft={soft} />
      <div aria-hidden="true" className="dot-grid pointer-events-none absolute inset-0 z-0 opacity-70" />
    </>
  );
}
