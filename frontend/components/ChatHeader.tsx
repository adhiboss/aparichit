"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnonymousIdentity } from "./AnonymousIdentity";
import { MessageSquare, Users, BookOpen, Compass } from "lucide-react";

export const ChatHeader: React.FC = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#232c3f] bg-[#0c0f17]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-[#171c28] border border-[#232c3f] group-hover:border-[#e6af2e]/50 text-[#e6af2e] transition-all shadow-md">
            <Compass className="w-5 h-5 text-[#e6af2e]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors">
                APARICHIT
              </span>
              <span className="text-xs text-[#d4af37] font-serif opacity-80">
                (अपारिचित)
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8] hidden sm:block">
              Ancient Wisdom for Modern Dilemmas
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname === "/"
                ? "bg-[#171c28] text-[#e6af2e] border border-[#232c3f]"
                : "text-[#94a3b8] hover:text-[#f0f2f5] hover:bg-[#171c28]/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </Link>

          <Link
            href="/community"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              pathname?.startsWith("/community")
                ? "bg-[#171c28] text-[#e6af2e] border border-[#232c3f]"
                : "text-[#94a3b8] hover:text-[#f0f2f5] hover:bg-[#171c28]/60"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community</span>
          </Link>
        </nav>

        {/* Anonymous Identity Pill */}
        <div className="shrink-0">
          <AnonymousIdentity />
        </div>
      </div>
    </header>
  );
};
