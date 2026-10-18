"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { UserProfile } from "@/components/UserProfile";

export default function ProfilePage() {
  const router = useRouter();

  const handleTabChange = (tab: string) => {
    if (tab === "chat" || tab === "home") {
      router.push("/");
    } else if (tab === "community") {
      router.push("/community");
    } else if (tab === "library") {
      router.push("/library");
    }
  };

  return (
    <div className="min-h-screen bg-[#14120e] text-[#f2ede4] flex flex-col font-body">
      {/* Top Header */}
      <ChatHeader activeTab="profile" onTabChange={handleTabChange} />

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-6">
        <div className="flex items-start gap-6 w-full">
          {/* Left Column: Navigation Sidebar */}
          <AppSidebar
            activeTab="profile"
            onTabChange={handleTabChange}
          />

          {/* Center Main Stage Column */}
          <main className="flex-1 min-w-0 space-y-6">
            <UserProfile
              onStartChat={() => router.push("/")}
              onExploreLibrary={() => router.push("/library")}
              onExploreCommunity={() => router.push("/community")}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
