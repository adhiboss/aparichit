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
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:flex flex-col rounded-2xl overflow-hidden border border-[#232c3f] relative shadow-2xl min-h-[640px]">
      {/* Background artwork: Sunset mountain and temple */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/hero_sunset.jpg')` }}
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d111a]/85 via-[#0d111a]/70 to-[#0d111a]/95 backdrop-blur-[2px]" />

      {/* Content */}
      <div className="relative z-10 p-4 flex flex-col justify-between h-full flex-1">
        {/* Navigation list */}
        <div className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => onTabChange && onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#171c28]/95 text-[#e6af2e] border border-[#e6af2e]/40 shadow-lg shadow-[#e6af2e]/10 backdrop-blur-md"
                    : "text-[#cbd5e1] hover:text-white hover:bg-[#171c28]/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#e6af2e]" : "text-[#94a3b8]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom Logo & Tagline */}
        <div className="p-3.5 rounded-xl bg-[#151b26]/90 border border-[#232c3f]/80 backdrop-blur-md space-y-2 mt-auto">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e6af2e] to-amber-700 flex items-center justify-center text-[#0d111a] font-serif font-black text-sm shadow-md">
            A
          </div>
          <div className="space-y-0.5">
            <div className="text-[11px] font-medium text-[#f0f2f5] leading-snug">
              Guided by wisdom.
            </div>
            <div className="text-[10px] text-[#94a3b8]">
              Powered by people.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
