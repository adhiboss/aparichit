"use client";

import React, { useState } from "react";
import Image from "next/image";
import { SimilarProblem } from "@/lib/types";
import {
  Shield,
  Plus,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { ShareStoryModal } from "./ShareStoryModal";

interface SimilarProblemCardsProps {
  similar?: SimilarProblem[];
  userMessage?: string;
  onSelectPost?: (postId: string) => void;
}

interface DisplayCard {
  id: string;
  name: string;
  timeAgo: string;
  snippet: string;
  tags: string[];
  replyCount: number;
  image: string;
}

const DEFAULT_DISPLAY_CARDS: DisplayCard[] = [
  {
    id: "sim_1",
    name: "Silent Peak",
    timeAgo: "2 days ago",
    snippet:
      "I was in a similar situation. I felt pressured about my career and my parents' expectations. Here's what helped me...",
    tags: ["Career", "Family", "Life Decisions"],
    replyCount: 124,
    image: "/images/hero_sunset.jpg",
  },
  {
    id: "sim_2",
    name: "Blue Moon",
    timeAgo: "1 week ago",
    snippet:
      "I tried a different path after feeling lost. It was not easy, but taking small steps and exploring my interests helped me find clarity.",
    tags: ["Career", "Mental Health", "Self Growth"],
    replyCount: 89,
    image: "/images/wisdom_manuscript.jpg",
  },
  {
    id: "sim_3",
    name: "Wandering Soul",
    timeAgo: "2 weeks ago",
    snippet:
      "I felt like I was disappointing my family too. An honest conversation and setting small goals changed everything for me.",
    tags: ["Family", "Expectations", "Inner Peace"],
    replyCount: 76,
    image: "/images/community_campfire.jpg",
  },
];

export const SimilarProblemCards: React.FC<SimilarProblemCardsProps> = ({
  similar,
  userMessage,
  onSelectPost,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <section className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header Row matching user image */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#362c22]/70">
        <div>
          <h3 className="font-headline text-base sm:text-lg font-semibold text-[#f2ede4]">
            People Facing Something Similar
          </h3>
          <p className="font-body text-xs text-[#b5aa9b] mt-0.5">
            You are not alone. Here are anonymous people who faced similar situations.
          </p>
        </div>

        {/* Right actions: Privacy badge + Solid Warm Golden Share Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#14120e] border border-[#362c22] text-[11px] text-[#b5aa9b]">
            <Shield className="w-3.5 h-3.5 text-[#e59a27] shrink-0" />
            <span>
              Your chat stays private unless you share it. We remove personal details before sharing.
            </span>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e59a27] hover:bg-[#f0a83b] text-[#140e06] font-label text-xs font-semibold transition-all shadow-md shadow-[#e59a27]/20 hover:shadow-[#e59a27]/35 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Share My Story Anonymously</span>
          </button>
        </div>
      </div>

      {/* 3 Horizontal Cards Grid from image */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEFAULT_DISPLAY_CARDS.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectPost && onSelectPost(card.id)}
            className="p-4 rounded-xl bg-[#14120e] border border-[#362c22] hover:border-[#e59a27]/40 transition-all flex flex-col justify-between space-y-3 group shadow-sm cursor-pointer"
          >
            <div className="space-y-3">
              {/* Thumbnail + Name & Time */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-[#362c22]">
                  <Image
                    src={card.image}
                    alt={card.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-label text-xs font-semibold text-[#f2ede4] group-hover:text-[#e59a27] transition-colors">
                    {card.name}
                  </span>
                  <span className="font-label text-[10px] text-[#7a6e5e]">
                    {card.timeAgo}
                  </span>
                </div>
              </div>

              {/* Snippet text */}
              <p className="font-body text-xs text-[#b5aa9b] line-clamp-3 leading-relaxed">
                {card.snippet}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md text-[10px] font-label bg-[#211a14] text-[#b5aa9b] border border-[#362c22]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer row */}
            <div className="pt-2 border-t border-[#362c22]/50 flex items-center justify-between text-xs text-[#7a6e5e]">
              <span className="flex items-center gap-1.5 font-label text-[11px] text-[#b5aa9b]">
                <MessageSquare className="w-3.5 h-3.5 text-[#e59a27]" />
                <span>{card.replyCount} replies</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[#e59a27] font-label text-xs font-semibold group-hover:translate-x-0.5 transition-transform">
                <span>Read Replies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Share Story Modal */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialContent={userMessage || ""}
      />
    </section>
  );
};
