"use client";

import React, { useState } from "react";
import { SimilarProblem } from "@/lib/types";
import { Users, MessageSquare, ArrowRight, Share2, Sparkles, Shield } from "lucide-react";
import { ShareStoryModal } from "./ShareStoryModal";

interface SimilarProblemCardsProps {
  similar: SimilarProblem[];
  userMessage?: string;
  onSelectPost?: (postId: string) => void;
}

export const SimilarProblemCards: React.FC<SimilarProblemCardsProps> = ({
  similar,
  userMessage,
  onSelectPost,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!similar || similar.length === 0) return null;

  return (
    <div className="mt-5 pt-4 border-t border-[#232c3f]/80 space-y-3">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-[#e6af2e]/10 text-[#e6af2e]">
            <Users className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37]">
            {similar.length} {similar.length === 1 ? "person" : "people"} facing something similar
          </h4>
        </div>
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#e6af2e] transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share my story anonymously</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {similar.map((card) => {
          const matchPercent =
            card.similarity !== undefined
              ? Math.round(card.similarity * 100)
              : null;

          return (
            <div
              key={card.post_id}
              className="flex flex-col justify-between p-3.5 rounded-xl bg-[#141924] border border-[#232c3f] hover:border-[#e6af2e]/40 transition-all group shadow-sm"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors">
                    {card.display_name}
                  </span>
                  {matchPercent !== null && (
                    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[#1e2536] text-[#94a3b8] border border-[#2a3449]">
                      <Sparkles className="w-2.5 h-2.5 text-[#e6af2e]" />
                      {matchPercent}% match
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#94a3b8] line-clamp-3 leading-relaxed">
                  {card.snippet}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#232c3f]/60 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-[11px] text-[#64748b]">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {card.reply_count !== undefined
                    ? `${card.reply_count} ${card.reply_count === 1 ? "reply" : "replies"}`
                    : "Replies"}
                </span>

                <button
                  onClick={() => onSelectPost && onSelectPost(card.post_id)}
                  className="inline-flex items-center gap-1 font-medium text-[#e6af2e] hover:text-[#d4af37] text-xs transition-colors"
                >
                  <span>Read their replies</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Privacy Guarantee Note */}
      <div className="flex items-center gap-2 pt-1 text-[11px] text-[#64748b]">
        <Shield className="w-3.5 h-3.5 text-[#e6af2e]/70 shrink-0" />
        <span>Your chat stays private unless you choose to share it.</span>
      </div>

      {/* Sharing Workflow Modal */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialContent={userMessage || ""}
      />
    </div>
  );
};
