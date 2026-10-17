"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnonymousAccount } from "@/lib/types";
import { getOrInitAccount, createAnonymousAccount } from "@/lib/auth";
import {
  Search,
  RefreshCw,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  User,
} from "lucide-react";

interface ChatHeaderProps {
  onSearch?: (query: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onSearch }) => {
  const pathname = usePathname();
  const [account, setAccount] = useState<AnonymousAccount | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const acc = await getOrInitAccount();
        if (mounted) setAccount(acc);
      } catch (err) {
        console.error("Failed to initialize account", err);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRotate = async () => {
    if (isRotating) return;
    setIsRotating(true);
    try {
      const newAcc = await createAnonymousAccount();
      setAccount(newAcc);
    } finally {
      setIsRotating(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Chat", href: "/chat" },
    { label: "Community", href: "/community" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#10131b]/90 backdrop-blur-xl border-b border-[#232b3e] shadow-[0_1px_8px_rgba(0,0,0,0.45)]">
      <div className="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title from Stitch */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* Lotus Emblem */}
            <div className="w-9 h-9 rounded-lg bg-[#f2ca50]/10 border border-[#f2ca50]/30 flex items-center justify-center text-[#f2ca50] shadow-[0_0_12px_rgba(212,175,55,0.15)] group-hover:scale-105 transition-all">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M12 3c-1.5 2-3 4.5-3 7 0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-2.5-1.5-5-3-7z" />
                <path d="M8 9C6 10.5 4 13 4 15.5 4 17.5 5.5 19 8 19c1.5 0 2.8-.7 3.5-1.8" />
                <path d="M16 9c2 1.5 4 4 4 6.5 0 2-1.5 3.5-4 3.5-1.5 0-2.8-.7-3.5-1.8" />
                <path d="M12 21c-4 0-7-1.5-7-3.5 0-.5.5-1 1.5-1.5" />
                <path d="M12 21c4 0 7-1.5 7-3.5 0-.5-.5-1-1.5-1.5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline text-lg sm:text-xl font-medium tracking-wider text-[#f2ca50]">
                  APARICHIT
                </span>
                <span className="font-headline text-base sm:text-lg text-[#d0c5af] font-light">
                  (अपारिचित)
                </span>
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest text-[#99907c]">
                Ancient Wisdom & Sanctuary
              </span>
            </div>
          </Link>

          {/* Navigation with Stitch Underline Indicator */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`font-label text-sm tracking-wide transition-colors relative py-1 ${
                    active
                      ? "text-[#f2ca50] font-semibold after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-[#f2ca50]"
                      : "text-[#d0c5af] hover:text-[#e0e2ee]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center/Search (optional) */}
        {onSearch && (
          <div className="hidden lg:flex flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-[#99907c] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Search sanctuary discourses..."
                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[#181b24] border border-[#232b3e] text-xs text-[#e0e2ee] placeholder-[#99907c] focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        )}

        {/* Right: Incognito Seeker Pill & Identity Menu */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-3 py-1.5 px-3 sm:px-4 rounded-full bg-[#181b24] border border-[#232b3e] hover:border-[#d4af37]/50 shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-[#f2ca50] animate-pulse shrink-0" />
              <div className="flex flex-col text-right">
                <span className="font-label text-xs sm:text-sm text-[#e0e2ee] font-medium max-w-[130px] truncate">
                  {account?.display_name || "Seeker #4812"}
                </span>
                <span className="font-label text-[10px] text-[#99907c] leading-tight">
                  Incognito Session
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#d0c5af] ml-1" />
            </button>

            {/* Dropdown Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#1d1f28] border border-[#232b3e] shadow-[0_20px_48px_-12px_rgba(0,0,0,0.7)] p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 border-b border-[#232b3e] pb-2">
                  <div className="font-label text-[10px] uppercase text-[#99907c] tracking-widest font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#f2ca50]" />
                    Zero-Knowledge Seeker
                  </div>
                  <div className="text-sm font-semibold text-[#f2ca50] mt-1">
                    {account?.display_name || "Seeker #4812"}
                  </div>
                  <div className="text-[11px] text-[#94a3b8] mt-0.5">
                    100% Anonymous • Ephemeral identity
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleRotate();
                    setShowAccountMenu(false);
                  }}
                  disabled={isRotating}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#d0c5af] hover:text-[#e0e2ee] hover:bg-[#272a33] transition-colors text-left"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#f2ca50] ${isRotating ? "animate-spin" : ""}`}
                  />
                  <span className="font-label">Rotate Seeker Identity</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
