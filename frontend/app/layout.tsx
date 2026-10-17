import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serifFont = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "APARICHIT (अपारिचित) — Ancient Wisdom for Modern Dilemmas",
  description:
    "An anonymous AI-guided advice platform rooted in classical philosophical and scriptural traditions with an empathetic peer community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${serifFont.variable} dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-screen bg-[#0c0f17] text-[#f0f2f5] antialiased selection:bg-[#e6af2e]/30 selection:text-[#f0f2f5]">
        {children}
      </body>
    </html>
  );
}
