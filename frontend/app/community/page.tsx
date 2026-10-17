"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { CommunityFeed } from "@/components/CommunityFeed";
import { Loader2 } from "lucide-react";

function CommunityContent() {
  const searchParams = useSearchParams();
  const initialPostId = searchParams.get("post_id") || undefined;

  return (
    <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
      <CommunityFeed initialPostId={initialPostId} />
    </main>
  );
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0c0f17] text-[#f0f2f5]">
      <ChatHeader />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#e6af2e]" />
          </div>
        }
      >
        <CommunityContent />
      </Suspense>
    </div>
  );
}
