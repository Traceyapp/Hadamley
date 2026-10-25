"use client";

/** Last-resort page if the whole site layout fails. Plain styles, so it works even without the site's CSS. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const wrap = { fontFamily: "Arial, Helvetica, sans-serif", color: "#142a52", background: "#ffffff", maxWidth: 640, margin: "0 auto", padding: "64px 20px", lineHeight: 1.6 } as const;
  return (
    <html lang="en-GB">
      <body style={{ margin: 0, background: "#ffffff" }}>
        <main style={wrap}>
          <p style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 13, color: "#8a6a2f", fontWeight: 700 }}>Hadamley Information Services</p>
          <h1 style={{ fontSize: 32, margin: "8px 0 0" }}>Sorry, the site didn&apos;t load</h1>
          <p style={{ fontSize: 18, color: "#4b5772" }}>This is usually brief. Please try again in a moment.</p>
          <button type="button" onClick={reset} style={{ minHeight: 44, padding: "0 20px", borderRadius: 999, border: 0, background: "#1b3a6b", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
            Try again
          </button>
          <div style={{ marginTop: 32, border: "2px solid #b42318", background: "#fbe5e2", borderRadius: 16, padding: 20 }}>
            <p style={{ margin: 0, fontWeight: 700, color: "#b42318" }}>Need help now?</p>
            <p style={{ margin: "8px 0 0" }}>
              If a life is at risk, call <a href="tel:999">999</a>. For urgent help, call <a href="tel:111">NHS 111</a>. To talk to someone, call Samaritans free on <a href="tel:116123">116 123</a>.
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
