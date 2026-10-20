"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { ScriptureLibrary } from "@/components/ScriptureLibrary";
import { MobileBottomNav } from "@/components/MobileBottomNav";

export default function LibraryPage() {
  const router = useRouter();
  const [selectedTradition, setSelectedTradition] =
    useState<string>("garuda_purana");

  const handleTabChange = (tab: string) => {
    if (tab === "chat" || tab === "home") {
      router.push("/");
    } else if (tab === "community") {
      router.push("/community");
    }
  };

  const handleConsultVerse = (verseText: string, traditionName: string) => {
    const prompt = `I am contemplating this passage from ${traditionName}: "${verseText}". How can I apply its core principle to my personal dilemmas?`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("aparichit_initial_prompt", prompt);
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#171A1F] text-[#E7E1D5] flex flex-col font-body pb-16 md:pb-0">
      {/* Top Header */}
      <ChatHeader activeTab="library" onTabChange={handleTabChange} />

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-6">
        <div className="flex items-start gap-6 w-full">
          {/* Left Column: Navigation Sidebar */}
          <AppSidebar
            activeTab="library"
            onTabChange={handleTabChange}
          />

          {/* Center Main Stage Column */}
          <main className="flex-1 min-w-0 space-y-6">
            <ScriptureLibrary
              initialTraditionId={selectedTradition}
              onConsultVerse={handleConsultVerse}
            />
          </main>
        </div>
      </div>

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab="library" onTabChange={handleTabChange} />
    </div>
  );
}
