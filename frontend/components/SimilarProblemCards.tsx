"use client";

import React, { useState } from "react";
import { SimilarProblem } from "@/lib/types";
import {
  Shield,
  Plus,
  Heart,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ShareStoryModal } from "./ShareStoryModal";

interface SimilarProblemCardsProps {
  similar?: SimilarProblem[];
  userMessage?: string;
  onSelectPost?: (postId: string) => void;
}

const DEFAULT_SIMILAR: SimilarProblem[] = [
  {
    post_id: "sim_1",
    display_name: "Silent Peak",
    snippet:
      "I was in a similar situation. I felt pressured about my career and my parents' expectations. Here's what helped me find peace...",
    reply_count: 37,
    similarity: 0.94,
  },
  {
    post_id: "sim_2",
    display_name: "Blue Moon",
    snippet:
      "I tried a different path after feeling lost. It was scary at first, but taking small daily steps helped me find clarity.",
    reply_count: 21,
    similarity: 0.89,
  },
  {
    post_id: "sim_3",
    display_name: "Wandering Soul",
    snippet:
      "I felt like I was disappointing my family too. An honest conversation without anger changed everything. Sharing my experience...",
    reply_count: 15,
    similarity: 0.82,
  },
];

export const SimilarProblemCards: React.FC<SimilarProblemCardsProps> = ({
  similar,
  userMessage,
  onSelectPost,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // If live backend returns matches, use them; otherwise show default community matching items
  const items = similar && similar.length > 0 ? similar : DEFAULT_SIMILAR;

  return (
    <section className="rounded-2xl bg-[#151b26] border border-[#232c3f] p-5 shadow-xl space-y-4">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#232c3f]/60">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#1e2536] border border-[#e6af2e]/50 flex items-center justify-center text-[#e6af2e] font-bold text-xs shrink-0 mt-0.5">
            2
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f0f2f5]">
              People Facing Something Similar
            </h3>
            <p className="text-xs text-[#94a3b8]">
              You are not alone. Here are anonymous people who faced similar situations.
            </p>
          </div>
        </div>

        {/* Right actions: Privacy badge + Share button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d111a] border border-[#232c3f] text-[11px] text-[#94a3b8]">
            <Shield className="w-3.5 h-3.5 text-[#e6af2e] shrink-0" />
            <span>
              Your chat stays private unless you share it. We remove personal details before sharing.
            </span>
          </div>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1e2536] hover:bg-[#283247] border border-[#e6af2e]/40 text-[#e6af2e] text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Share My Story Anonymously</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {items.map((item, idx) => (
          <div
            key={item.post_id || idx}
            className="p-4 rounded-xl bg-[#0d111a] border border-[#232c3f] hover:border-[#e6af2e]/40 transition-all flex flex-col justify-between space-y-3 group shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700/60 to-purple-800/60 border border-[#e6af2e]/30 flex items-center justify-center text-xs font-bold text-[#e6af2e] shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('/images/hero_sunset.jpg')` }} />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors">
                    {item.display_name}
                  </div>
                  <div className="text-[10px] text-[#64748b]">
                    {idx === 0 ? "3 days ago" : idx === 1 ? "1 week ago" : "2 weeks ago"}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#cbd5e1] line-clamp-3 leading-relaxed">
                {item.snippet}
              </p>
            </div>

            <div className="pt-2 border-t border-[#232c3f]/50 flex items-center justify-between text-[11px] text-[#94a3b8]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                  <Heart className="w-3.5 h-3.5 text-rose-500/70" />
                  <span>{idx === 0 ? 124 : idx === 1 ? 89 : 76}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-[#e6af2e]/70" />
                  <span>{item.reply_count || 12}</span>
                </span>
              </div>

              <button
                onClick={() => onSelectPost && onSelectPost(item.post_id)}
                className="inline-flex items-center gap-1 text-[#e6af2e] hover:text-[#fce28b] font-medium transition-colors cursor-pointer"
              >
                <span>Read Replies</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Share Modal */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialContent={userMessage || ""}
      />
    </section>
  );
};
