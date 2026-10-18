"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { ScriptureLibrary } from "@/components/ScriptureLibrary";

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
    const prompt = `How can I apply the wisdom of ${traditionName} to my situation regarding this verse: "${verseText}"?`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("aparichit_initial_prompt", prompt);
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#14120e] text-[#f2ede4] flex flex-col font-body">
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
    </div>
  );
}
