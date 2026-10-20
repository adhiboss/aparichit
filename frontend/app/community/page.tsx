"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { CommunityFeed } from "@/components/CommunityFeed";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { Loader2 } from "lucide-react";

function CommunityContent() {
  const searchParams = useSearchParams();
  const initialPostId = searchParams.get("post_id") || undefined;

  return (
    <main className="flex-1 w-full">
      <CommunityFeed initialPostId={initialPostId} />
    </main>
  );
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#171A1F] text-[#E7E1D5] pb-16 md:pb-0">
      <ChatHeader activeTab="community" />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#B69A61]" />
          </div>
        }
      >
        <CommunityContent />
      </Suspense>
      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab="community" />
    </div>
  );
}
