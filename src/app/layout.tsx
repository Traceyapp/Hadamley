import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Caveat, Fraunces } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible was designed for readers with low vision.
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body", display: "swap" });
const display = Fraunces({ subsets: ["latin"], axes: ["SOFT", "opsz"], variable: "--font-display", display: "swap" });
// Handwritten margin notes, decorative only.
const hand = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-hand", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Hadamley Information Services | Free Independent Resources", template: "%s | Hadamley" },
  description:
    "Free, independent information and printable resources for mental health, chronic illness and everyday wellbeing, with local support in Havering, Romford, Brentwood and nearby.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#111a1c" },
  ],
};

// Applies saved text size and theme before first paint, so pages never jump or flash.
// Theme preference is auto | light | dark; data-theme always holds the resolved value.
const prefsScript = `try{var d=document.documentElement,t=localStorage.getItem('hadamley-text');if(t)d.dataset.text=t;var p=localStorage.getItem('hadamley-theme')||'auto';d.dataset.themePref=p;d.dataset.theme=p==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${body.variable} ${display.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
