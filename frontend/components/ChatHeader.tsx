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
  Sun,
  ShieldCheck,
  User,
} from "lucide-react";

interface ChatHeaderProps {
  onSearch?: (query: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onSearch,
  activeTab,
  onTabChange,
}) => {
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
    { id: "home", label: "Home", href: "/" },
    { id: "chat", label: "Chat", href: "/" },
    { id: "community", label: "Community", href: "/community" },
    { id: "library", label: "Library", href: "/library" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#14120e]/95 backdrop-blur-xl border-b border-[#362c22] shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
      <div className="h-18 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 py-3">
        {/* Left: Brand Logo & Title from image */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* Golden Lotus Icon */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e59a27]/20 to-[#e59a27]/5 border border-[#e59a27]/40 flex items-center justify-center text-[#e59a27] shadow-[0_0_14px_rgba(229,154,39,0.2)] group-hover:scale-105 transition-all">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-[#e59a27]"
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
                <span className="font-headline text-lg sm:text-xl font-medium tracking-wider text-[#f2ede4]">
                  APARICHIT
                </span>
                <span className="font-headline text-base sm:text-lg text-[#b5aa9b] font-light">
                  (अपारिचित)
                </span>
              </div>
              <span className="font-label text-[9px] uppercase tracking-widest text-[#e59a27] font-semibold">
                Ancient Wisdom for Modern Dilemmas
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((item) => {
              const active = activeTab
                ? activeTab === item.id || (item.id === "chat" && activeTab === "chat")
                : item.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    if (onTabChange) {
                      e.preventDefault();
                      onTabChange(item.id);
                    }
                  }}
                  className={`font-label text-sm tracking-wide transition-colors relative py-1 ${
                    active
                      ? "text-[#e59a27] font-semibold after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-[2px] after:bg-[#e59a27]"
                      : "text-[#b5aa9b] hover:text-[#f2ede4]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-sm mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#7a6e5e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search questions, topics or people..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-[#1b1612] border border-[#362c22] text-xs text-[#f2ede4] placeholder-[#7a6e5e] focus:outline-none focus:border-[#e59a27] transition-all"
            />
          </div>
        </div>

        {/* Right: Theme Toggle & Anonymous Profile Pill */}
        <div className="flex items-center gap-3">
          {/* Sun / Theme icon */}
          <button
            type="button"
            className="p-2 text-[#b5aa9b] hover:text-[#e59a27] rounded-full hover:bg-[#211a14] transition-colors cursor-pointer"
            title="Theme Toggle"
            aria-label="Theme Toggle"
          >
            <Sun className="w-4 h-4 text-[#e59a27]" />
          </button>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2.5 py-1.5 px-3.5 rounded-full bg-[#1b1612] border border-[#362c22] hover:border-[#e59a27]/50 shadow-[0_1px_6px_rgba(0,0,0,0.4)] transition-all cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#e59a27] to-amber-700 flex items-center justify-center text-[#140e06] font-bold text-xs shrink-0">
                {account?.display_name ? account.display_name.charAt(0) : "Q"}
              </div>
              <span className="font-label text-xs sm:text-sm text-[#f2ede4] font-medium max-w-[120px] truncate">
                {account?.display_name || "Quiet River"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#b5aa9b] ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#211a14] border border-[#362c22] shadow-[0_20px_48px_-12px_rgba(0,0,0,0.8)] p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 border-b border-[#362c22] pb-2">
                  <div className="font-label text-[10px] uppercase text-[#7a6e5e] tracking-widest font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#e59a27]" />
                    Anonymous Seeker
                  </div>
                  <div className="text-sm font-semibold text-[#e59a27] mt-1">
                    {account?.display_name || "Quiet River"}
                  </div>
                  <div className="text-[11px] text-[#b5aa9b] mt-0.5">
                    100% Anonymous • Ephemeral identity
                  </div>
                </div>

                <button
                  onClick={() => {
                    handleRotate();
                    setShowAccountMenu(false);
                  }}
                  disabled={isRotating}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#b5aa9b] hover:text-[#f2ede4] hover:bg-[#29211a] transition-colors text-left cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#e59a27] ${isRotating ? "animate-spin" : ""}`}
                  />
                  <span className="font-label">Generate New Pseudonym</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
