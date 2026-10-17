"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ModeBadge } from "./ModeBadge";
import { CrisisBanner } from "./CrisisBanner";
import { CheckCircle2, User, MoreHorizontal } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectPost?: (postId: string) => void;
  previousUserMessage?: string;
  onOpenCitationDrawer?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectPost,
  previousUserMessage,
  onOpenCitationDrawer,
}) => {
  const isUser = message.role === "user";

  const formatTime = (ts?: string) => {
    if (!ts) return "10:24 AM";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "10:24 AM";
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-1 duration-150">
        <div className="max-w-2xl flex items-start gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600/40 to-rose-500/40 border border-amber-500/30 flex items-center justify-center text-amber-200 shrink-0 text-xs font-bold">
            <User className="w-4 h-4" />
          </div>

          <div className="flex flex-col items-end space-y-1">
            <div className="p-4 rounded-2xl rounded-tr-sm bg-[#1a2130] border border-[#263147] text-xs text-[#f0f2f5] leading-relaxed shadow-sm">
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <span className="text-[10px] text-[#64748b] px-1">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant response matching Image 1
  const primaryCite = message.citations && message.citations.length > 0 ? message.citations[0] : null;

  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-full flex items-start gap-3">
        {/* APARICHIT Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e6af2e] to-amber-800 flex items-center justify-center text-[#0d111a] font-serif font-black text-sm shrink-0 shadow-md mt-1">
          A
        </div>

        <div className="flex-1 p-5 rounded-2xl rounded-tl-sm bg-[#151b26] border border-[#232c3f] shadow-lg space-y-3.5">
          {/* Header row: APARICHIT label, Mode badge, timestamp, more */}
          <div className="flex items-center justify-between pb-1 border-b border-[#232c3f]/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs tracking-wider text-[#f0f2f5]">
                APARICHIT
              </span>
              <ModeBadge mode={message.mode} />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#64748b]">
              <span>{formatTime(message.timestamp)}</span>
              <button
                className="hover:text-white transition-colors"
                title="Options"
                aria-label="Message options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Crisis Safety Banner */}
          {message.safety_flag === "crisis" && <CrisisBanner />}

          {/* Main Answer Text */}
          <div className="text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-[#e6af2e] animate-pulse rounded-sm" />
            )}
          </div>

          {/* Scripture Quote Box (Matching Image 1) */}
          {primaryCite && (
            <div
              onClick={onOpenCitationDrawer}
              className="p-4 rounded-xl scripture-box border border-[#e6af2e]/30 cursor-pointer hover:border-[#e6af2e]/60 transition-all group"
            >
              <blockquote className="text-xs text-[#f0f2f5] font-scripture italic leading-relaxed">
                &ldquo;{primaryCite.excerpt}&rdquo;
              </blockquote>
              <div className="text-[11px] text-[#e6af2e] mt-2 font-medium flex items-center justify-between">
                <span>
                  — {primaryCite.source}, {primaryCite.chapter}
                  {primaryCite.verse ? `, Verse ${primaryCite.verse}` : ""}
                </span>
                <span className="text-[10px] text-[#94a3b8] group-hover:text-[#e6af2e] underline transition-colors">
                  View Full Citation →
                </span>
              </div>
            </div>
          )}

          {/* Structured Guidance Grid (Options to consider + Next steps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            {/* Options to consider */}
            <div className="p-3.5 rounded-xl bg-[#0d111a] border border-[#232c3f] space-y-2.5">
              <div className="font-semibold text-xs text-[#e6af2e]">
                Options to consider
              </div>
              <ul className="space-y-2 text-[11px] text-[#cbd5e1]">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1a2130] border border-[#2a3449] flex items-center justify-center text-[10px] font-bold text-[#e6af2e] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Explore a path that aligns with your core duties and strengths.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1a2130] border border-[#2a3449] flex items-center justify-center text-[10px] font-bold text-[#e6af2e] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Have an honest, calm conversation about your true thoughts without defensive anger.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#1a2130] border border-[#2a3449] flex items-center justify-center text-[10px] font-bold text-[#e6af2e] shrink-0 mt-0.5">
                    3
                  </span>
                  <span>Take measured small steps to gain clarity instead of making an impulsive decision.</span>
                </li>
              </ul>
            </div>

            {/* Next steps */}
            <div className="p-3.5 rounded-xl bg-[#0d111a] border border-[#232c3f] space-y-2.5">
              <div className="font-semibold text-xs text-emerald-400">
                Next steps
              </div>
              <ul className="space-y-2 text-[11px] text-[#cbd5e1]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Reflect quietly on what truly matters to your conscience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Write down possible paths along with their natural consequences.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Seek guidance from trusted mentors who listen without judgment.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
