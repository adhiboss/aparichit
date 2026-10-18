"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  User,
} from "lucide-react";
import { getOrInitAccount, createAnonymousAccount } from "../lib/auth.ts";
import type { AnonymousAccount } from "../lib/types.ts";

interface ChatHeaderProps {
  onSearch?: (query: string) => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  activeTab,
  onTabChange,
}) => {
  const pathname = usePathname();
  const [account, setAccount] = useState<AnonymousAccount | null>(null);
  const [isRotating, setIsRotating] = useState(false);
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
    { id: "chat", label: "Chat", href: "/" },
    { id: "community", label: "Community", href: "/community" },
    { id: "library", label: "Library", href: "/library" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#171A1F] border-b border-[#242830]/80">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <Link
          href="/"
          onClick={(e) => {
            if (onTabChange) {
              e.preventDefault();
              onTabChange("chat");
            }
          }}
          className="flex items-center gap-3 group"
        >
          {/* Subtle Muted Gold Lotus */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 text-[#B69A61]"
          >
            <path d="M12 3c-1.5 2-3 4.5-3 7 0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-2.5-1.5-5-3-7z" />
            <path d="M8 9C6 10.5 4 13 4 15.5 4 17.5 5.5 19 8 19c1.5 0 2.8-.7 3.5-1.8" />
            <path d="M16 9c2 1.5 4 4 4 6.5 0 2-1.5 3.5-4 3.5-1.5 0-2.8-.7-3.5-1.8" />
            <path d="M12 21c-4 0-7-1.5-7-3.5 0-.5.5-1 1.5-1.5" />
            <path d="M12 21c4 0 7-1.5 7-3.5 0-.5-.5-1-1.5-1.5" />
          </svg>

          <div className="flex flex-col">
            <span className="font-headline text-base sm:text-lg font-medium tracking-wider text-[#E7E1D5]">
              APARICHIT
            </span>
            <span className="text-[10px] tracking-wide text-[#9E9CA3] hidden sm:block">
              Ancient Wisdom for Modern Dilemmas
            </span>
          </div>
        </Link>

        {/* Center/Right: Simple Editorial Navigation */}
        <div className="flex items-center gap-8">
          <nav className="flex items-center gap-6 sm:gap-8">
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
                  className={`text-sm tracking-wide transition-colors relative py-1 ${
                    active
                      ? "text-[#B69A61] font-medium after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[1px] after:bg-[#B69A61]"
                      : "text-[#9E9CA3] hover:text-[#E7E1D5]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Pill */}
          <div className="relative">
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 py-1 px-3 rounded-full bg-[#242830] hover:bg-[#2A303A] border border-[#282D37] text-xs text-[#E7E1D5] transition-colors cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#B69A61]" />
              <span className="font-medium max-w-[110px] truncate">
                {account?.display_name || "Anonymous"}
              </span>
              <ChevronDown className="w-3 h-3 text-[#9E9CA3]" />
            </button>

            {/* Account Menu */}
            {showAccountMenu && (
              <div className="absolute right-0 mt-2 w-60 rounded-xl bg-[#242830] border border-[#2E333D] shadow-xl p-3 z-50 text-xs space-y-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1 border-b border-[#2E333D] pb-2">
                  <div className="text-[10px] uppercase text-[#9E9CA3] tracking-wider font-medium flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#B69A61]" />
                    Anonymous Identity
                  </div>
                  <div className="text-sm font-semibold text-[#E7E1D5] mt-1">
                    {account?.display_name || "Quiet River"}
                  </div>
                  <div className="text-[11px] text-[#9E9CA3] mt-0.5">
                    No email or phone required
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (onTabChange) onTabChange("profile");
                    setShowAccountMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9E9CA3] hover:text-[#E7E1D5] hover:bg-[#2A303A] transition-colors text-left cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#B69A61]" />
                  <span>Profile & Privacy</span>
                </button>

                <button
                  onClick={() => {
                    handleRotate();
                    setShowAccountMenu(false);
                  }}
                  disabled={isRotating}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9E9CA3] hover:text-[#E7E1D5] hover:bg-[#2A303A] transition-colors text-left cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#B69A61] ${isRotating ? "animate-spin" : ""}`}
                  />
                  <span>Rotate Pseudonym</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
