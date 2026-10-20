"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Users, BookOpen, User } from "lucide-react";

interface MobileBottomNavProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { id: "chat", label: "Chat", icon: MessageSquare, href: "/" },
    { id: "community", label: "Community", icon: Users, href: "/community" },
    { id: "library", label: "Library", icon: BookOpen, href: "/library" },
    { id: "profile", label: "Profile", icon: User, href: "/profile" },
  ];

  const handleClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (onTabChange) {
      e.preventDefault();
      onTabChange(item.id);
    } else {
      router.push(item.href);
    }
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#171A1F]/95 backdrop-blur-md border-t border-[#242830] px-3 py-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-2xl"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab
            ? activeTab === item.id || (item.id === "chat" && activeTab === "chat")
            : item.href === "/"
            ? pathname === "/"
            : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={(e) => handleClick(e, item)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-[#B69A61]"
                  : "text-[#9EA3AF] hover:text-[#E7E1D5]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.2]" : "stroke-[1.8]"}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#B69A61]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-[#E7E1D5]" : "text-[#9EA3AF]"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
