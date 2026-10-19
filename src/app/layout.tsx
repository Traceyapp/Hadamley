import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import "./globals.css";

// Atkinson Hyperlegible was designed for readers with low vision.
const body = Atkinson_Hyperlegible({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-body", display: "swap" });
const display = Fraunces({ subsets: ["latin"], axes: ["SOFT", "opsz"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Hadamley | Local support for long term conditions", template: "%s | Hadamley" },
  description:
    "Clear, local information for people living with long term conditions, disability and mental health needs in Havering, Romford, Brentwood and nearby.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#111a1c" },
  ],
};

// Applies the saved text size before first paint, so pages never jump.
const prefsScript = `try{var t=localStorage.getItem('hadamley-text');if(t)document.documentElement.dataset.text=t;}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${body.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prefsScript }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
