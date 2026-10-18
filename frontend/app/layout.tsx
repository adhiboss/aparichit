import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Noto_Serif, Outfit } from "next/font/google";
import "./globals.css";
import "lenis/dist/lenis.css";
import { SmoothScroll } from "@/components/SmoothScroll";

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
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
