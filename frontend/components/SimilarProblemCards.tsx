"use client";

import React, { useState } from "react";
import { SimilarProblem } from "@/lib/types";
import { ArrowRight, Lock, Plus } from "lucide-react";
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
}

const DEFAULT_DISPLAY_CARDS: DisplayCard[] = [
  {
    id: "sim_1",
    name: "Silent Peak",
    timeAgo: "2 days ago",
    snippet:
      "I was in a similar situation. I felt paralyzed by my family's expectations versus what I knew was right for my path. What helped was separating my duty from their emotional reactions.",
    tags: ["Career", "Family", "Duty"],
    replyCount: 24,
  },
  {
    id: "sim_2",
    name: "Blue Moon",
    timeAgo: "1 week ago",
    snippet:
      "I took a different path after feeling lost for months. Taking small steps and focusing purely on the effort rather than the guaranteed outcome gave me my peace back.",
    tags: ["Clarity", "Inner Peace", "Doubt"],
    replyCount: 19,
  },
  {
    id: "sim_3",
    name: "Wandering Soul",
    timeAgo: "2 weeks ago",
    snippet:
      "An honest, calm conversation changed everything. I stopped assuming what they wanted and explained my principles clearly without defensive anger.",
    tags: ["Family", "Dialogue", "Courage"],
    replyCount: 16,
  },
];

export const SimilarProblemCards: React.FC<SimilarProblemCardsProps> = ({
  userMessage,
  onSelectPost,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <section className="mt-12 pt-8 border-t border-[#242830] space-y-6">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h3 className="font-headline text-lg font-medium text-[#E7E1D5]">
            People Facing Similar Dilemmas
          </h3>
          <p className="text-xs text-[#9E9CA3] mt-0.5">
            Reflections shared by others walking through similar moments.
          </p>
        </div>

        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242830] hover:bg-[#2A303A] border border-[#2E333D] text-[#E7E1D5] text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 text-[#B69A61]" />
          <span>Share Your Story</span>
        </button>
      </div>

      {/* 3 Clean Editorial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DEFAULT_DISPLAY_CARDS.map((card) => (
          <div
            key={card.id}
            onClick={() => onSelectPost && onSelectPost(card.id)}
            className="p-5 rounded-xl bg-[#242830] hover:bg-[#2A303A] border border-[#282D37] transition-colors flex flex-col justify-between space-y-4 cursor-pointer group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-[#E7E1D5] group-hover:text-[#B69A61] transition-colors">
                  {card.name}
                </span>
                <span className="text-[#6C717D] text-[11px]">{card.timeAgo}</span>
              </div>

              <p className="text-[14px] leading-relaxed text-[#E7E1D5]/85 line-clamp-3">
                {card.snippet}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {card.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[10px] text-[#9E9CA3] bg-[#1D2128]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#2E333D] flex items-center justify-between text-xs">
              <span className="text-[#6C717D] text-[11px]">
                {card.replyCount} community reflections
              </span>
              <span className="inline-flex items-center gap-1 text-[#B69A61] font-medium text-xs group-hover:translate-x-0.5 transition-transform">
                <span>Read</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Discreet Privacy Note */}
      <div className="flex items-center gap-2 text-[11px] text-[#6C717D] pt-1">
        <Lock className="w-3 h-3 text-[#B69A61]" />
        <span>
          Your conversations remain strictly private. Stories appear in community reflections only when explicitly shared.
        </span>
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
