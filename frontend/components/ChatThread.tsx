"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { Compass, Sparkles, Shield, HeartHandshake, BookOpen } from "lucide-react";

interface ChatThreadProps {
  messages: ChatMessageType[];
  isLoading: boolean;
  onSelectPrompt?: (prompt: string) => void;
  onSelectPost?: (postId: string) => void;
}

const STARTER_PROMPTS = [
  {
    title: "Anxiety About Results",
    text: "I am feeling overwhelmed and anxious about whether my hard work will pay off.",
  },
  {
    title: "Guilt & Forgiveness",
    text: "I made a serious mistake and hurt someone close to me. How do I atone and find peace?",
  },
  {
    title: "Envy & Comparison",
    text: "I find myself feeling envious of my friends' achievements even when I want to be happy for them.",
  },
  {
    title: "Duty & Conflict",
    text: "I am torn between what my family expects of me and what my conscience says is right.",
  },
];

export const ChatThread: React.FC<ChatThreadProps> = ({
  messages,
  isLoading,
  onSelectPrompt,
  onSelectPost,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages only if user is near bottom
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
        <div className="space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-[#171c28] border border-[#232c3f] text-[#e6af2e] shadow-xl">
            <Compass className="w-8 h-8 text-[#e6af2e]" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#f0f2f5]">
            Welcome to APARICHIT
          </h2>
          <p className="text-sm text-[#94a3b8] max-w-md mx-auto leading-relaxed">
            A sanctuary for confidential guidance. Describe what weighs on your mind
            and receive counsel through classical wisdom, practical reflection, and shared human journeys.
          </p>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#94a3b8]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171c28] border border-[#232c3f]">
            <Shield className="w-3.5 h-3.5 text-[#e6af2e]" />
            100% Anonymous & Private
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171c28] border border-[#232c3f]">
            <BookOpen className="w-3.5 h-3.5 text-[#e6af2e]" />
            Verified Scripture Passages
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171c28] border border-[#232c3f]">
            <HeartHandshake className="w-3.5 h-3.5 text-[#e6af2e]" />
            Empathetic Peer Community
          </span>
        </div>

        {/* Starter Prompts Grid */}
        <div className="w-full space-y-2 text-left">
          <div className="text-xs font-semibold text-[#64748b] uppercase tracking-wider px-1">
            Or begin with a reflection:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {STARTER_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt && onSelectPrompt(item.text)}
                className="p-3.5 rounded-xl bg-[#171c28] border border-[#232c3f] hover:border-[#e6af2e]/40 hover:bg-[#1c2232] text-left transition-all group shadow-sm"
              >
                <div className="text-xs font-semibold text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  <Sparkles className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 text-[#e6af2e] transition-opacity" />
                </div>
                <p className="text-xs text-[#94a3b8] mt-1 line-clamp-2 leading-relaxed">
                  {item.text}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl w-full mx-auto"
    >
      {messages.map((msg, idx) => {
        const prevUserMsg =
          msg.role === "assistant" && idx > 0 && messages[idx - 1].role === "user"
            ? messages[idx - 1].content
            : undefined;

        return (
          <ChatMessage
            key={msg.id}
            message={msg}
            previousUserMessage={prevUserMsg}
            onSelectPost={onSelectPost}
          />
        );
      })}

      {isLoading && (
        <div className="flex items-center gap-3 text-xs text-[#94a3b8] p-4 rounded-xl bg-[#171c28]/60 border border-[#232c3f] animate-pulse">
          <div className="w-2 h-2 rounded-full bg-[#e6af2e] animate-ping" />
          <span>APARICHIT is contemplating classical passages and preparing counsel...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};
