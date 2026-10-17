"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ModeBadge } from "./ModeBadge";
import { CitationAccordion } from "./CitationAccordion";
import { CrisisBanner } from "./CrisisBanner";
import { SimilarProblemCards } from "./SimilarProblemCards";
import { Bot, User, ShieldAlert, Sparkles, HeartHandshake } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectPost?: (postId: string) => void;
  previousUserMessage?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectPost,
  previousUserMessage,
}) => {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <div className="max-w-2xl flex items-start gap-3 flex-row-reverse">
          <div className="p-2 rounded-xl bg-[#232c3f] text-[#f0f2f5] shrink-0 border border-[#2e3a52]">
            <User className="w-4 h-4" />
          </div>
          <div className="p-4 rounded-2xl rounded-tr-sm bg-[#1e2536] border border-[#2a3449] text-sm text-[#f0f2f5] leading-relaxed shadow-md">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>
      </div>
    );
  }

  // Assistant response panel
  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-full max-w-3xl flex items-start gap-3">
        <div className="p-2 rounded-xl bg-[#e6af2e]/15 text-[#e6af2e] shrink-0 border border-[#e6af2e]/30 mt-1">
          <Bot className="w-4 h-4" />
        </div>

        <div className="flex-1 p-5 rounded-2xl rounded-tl-sm bg-[#171c28] border border-[#232c3f] shadow-lg space-y-3">
          {/* Top Metadata Row: Mode Badge & Source Labels */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#232c3f]/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs tracking-wider text-[#d4af37]">
                APARICHIT
              </span>
              <ModeBadge mode={message.mode} />
            </div>

            {/* Source Labels */}
            {message.source_labels && message.source_labels.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {message.source_labels.map((label, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-[#0c0f17] text-[#94a3b8] border border-[#232c3f]"
                  >
                    {label === "scripture"
                      ? "Scripture Grounded"
                      : label === "community_experience"
                      ? "Peer Experience"
                      : label === "crisis_support"
                      ? "Crisis Support"
                      : "AI Suggestion"}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Crisis Safety Banner (if safety_flag === 'crisis') */}
          {message.safety_flag === "crisis" && <CrisisBanner />}

          {/* Advice Text Content */}
          <div className="text-sm text-[#f0f2f5] leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-[#e6af2e] animate-pulse rounded-sm" />
            )}
          </div>

          {/* Scripture Citations Accordion */}
          {message.citations && message.citations.length > 0 && (
            <CitationAccordion citations={message.citations} />
          )}

          {/* Similar Problem Cards */}
          {message.similar && message.similar.length > 0 && (
            <SimilarProblemCards
              similar={message.similar}
              userMessage={previousUserMessage}
              onSelectPost={onSelectPost}
            />
          )}
        </div>
      </div>
    </div>
  );
};
