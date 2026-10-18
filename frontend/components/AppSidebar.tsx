"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Users, BookOpen, User } from "lucide-react";

interface AppSidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab = "chat",
  onTabChange,
}) => {
  const pathname = usePathname();

  const navItems = [
    { id: "chat", label: "Chat", icon: MessageSquare, href: "/" },
    { id: "community", label: "Community", icon: Users, href: "/community" },
    { id: "library", label: "Library", icon: BookOpen, href: "/library" },
    { id: "profile", label: "My Profile", icon: User, href: "/chat" },
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col rounded-2xl overflow-hidden border border-[#362c22] relative shadow-2xl min-h-[640px]">
      {/* Background artwork: Sunset mountain and temple */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/hero_sunset.jpg')` }}
      />

      {/* Warm espresso gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#14120e]/90 via-[#14120e]/75 to-[#14120e]/95 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col justify-between h-full flex-1">
        {/* Navigation list */}
        <div className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "chat" && activeTab === "chat" && (pathname === "/" || pathname === "/chat")) ||
              (item.id === "library" && (activeTab === "library" || pathname === "/library")) ||
              (item.id === "community" && (activeTab === "community" || pathname === "/community"));

            return (
              <button
                key={item.id}
                onClick={() => onTabChange && onTabChange(item.id === "profile" ? "chat" : item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#211a14]/95 text-[#f0a83b] border border-[#e59a27]/40 shadow-lg shadow-[#e59a27]/10 backdrop-blur-md"
                    : "text-[#b5aa9b] hover:text-[#f2ede4] hover:bg-[#211a14]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#e59a27]" : "text-[#7a6e5e]"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Contemplative Quote on Artwork from the image */}
        <div className="p-4 rounded-xl bg-[#1c1712]/90 border border-[#362c22]/80 backdrop-blur-md space-y-1.5 mt-auto">
          <p className="font-headline text-xs sm:text-sm text-[#f2ede4] italic leading-snug">
            “Every question is a step towards understanding.”
          </p>
          <div className="text-[10px] uppercase tracking-wider text-[#e59a27] font-semibold">
            — APARICHIT
          </div>
        </div>
      </div>
    </aside>
  );
};
