"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnonymousAccount } from "@/lib/types";
import { getOrInitAccount, createAnonymousAccount } from "@/lib/auth";
import {
  Compass,
  Search,
  Moon,
  Sun,
  RefreshCw,
  Sparkles,
  ChevronDown,
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
    <header className="sticky top-0 z-50 w-full border-b border-[#232c3f] bg-[#0d111a]/95 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Lotus Emblem */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Golden Lotus Icon */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#e6af2e]/20 to-[#e6af2e]/5 border border-[#e6af2e]/40 flex items-center justify-center text-[#e6af2e] shadow-sm">
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
              <span className="font-serif tracking-widest font-bold text-base text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors">
                APARICHIT
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            {navLinks.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                    active
                      ? "text-[#e6af2e] bg-[#1a2130] font-semibold"
                      : "text-[#94a3b8] hover:text-[#f0f2f5] hover:bg-[#151b26]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#64748b] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search questions, topics or people..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[#151b26] border border-[#232c3f] text-xs text-[#f0f2f5] placeholder-[#64748b] focus:outline-none focus:border-[#e6af2e]/60 transition-colors"
            />
          </div>
        </div>

        {/* Right: Theme Toggle & Anonymous User Profile Pill */}
        <div className="flex items-center gap-3">
          {/* Subtle Night/Day Theme indicator */}
          <div className="p-2 text-[#94a3b8] hover:text-[#f0f2f5] rounded-full hover:bg-[#1a2130] transition-colors cursor-pointer">
            <Moon className="w-4 h-4" />
          </div>

          {/* Anonymous User Pill */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#151b26] border border-[#232c3f] hover:border-[#e6af2e]/50 transition-all text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e6af2e] to-amber-700 flex items-center justify-center text-[#0d111a] font-bold text-[10px] shrink-0">
                {account?.display_name ? account.display_name.charAt(0) : "A"}
              </div>
              <span className="font-medium text-[#f0f2f5] max-w-[110px] truncate">
                {account?.display_name || "Quiet River"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8]" />
            </button>

            {/* Dropdown Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#171c28] border border-[#232c3f] shadow-2xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-[#232c3f]/80">
                  <div className="text-[10px] uppercase text-[#64748b] font-semibold">
                    Anonymous Pseudonym
                  </div>
                  <div className="text-sm font-bold text-[#e6af2e]">
                    {account?.display_name || "Quiet River"}
                  </div>
                  <div className="text-[10px] text-[#94a3b8] mt-0.5">
                    100% Private • No Email Required
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleRotate();
                    setShowAccountMenu(false);
                  }}
                  disabled={isRotating}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[#94a3b8] hover:text-[#f0f2f5] hover:bg-[#202738] transition-colors text-left"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#e6af2e] ${isRotating ? "animate-spin" : ""}`}
                  />
                  <span>Generate New Pseudonym</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
