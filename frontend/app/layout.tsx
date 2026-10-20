import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#171A1F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
import Script from "next/script";
import { Plus_Jakarta_Sans, Noto_Serif, Outfit } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const outfitFont = Outfit({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  title: "APARICHIT (अपारिचित) — Ancient Wisdom & Sanctuary",
  description:
    "An anonymous AI-guided sanctuary and peer support platform rooted in classical philosophical canons.",
  icons: {
    icon: [
      { url: "/aparichit-favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/aparichit-favicon.svg",
    apple: "/aparichit-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sansFont.variable} ${serifFont.variable} ${outfitFont.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#171A1F] text-[#E7E1D5] antialiased selection:bg-[#B69A61]/25 selection:text-[#E7E1D5]"
      >
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
          strategy="afterInteractive"
        />
        <SmoothScroll />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
