"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ModeBadge } from "./ModeBadge";
import { CrisisBanner } from "./CrisisBanner";
import { CheckCircle2, User, MoreHorizontal, BookOpen, Sparkles, Shield } from "lucide-react";

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
    if (!ts) return "11:42 AM";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "11:42 AM";
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-1 duration-150">
        <div className="max-w-[85%] sm:max-w-[78%] flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 pr-1">
            <span className="font-label text-[11px] text-[#99907c]">
              You (Anonymous Seeker)
            </span>
          </div>
          <div className="bg-[#272a33] text-[#e0e2ee] p-4 sm:p-5 rounded-2xl rounded-tr-sm shadow-md border border-[#32353e]">
            <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className="flex items-center gap-2 pr-1 text-[#99907c] font-label text-[11px]">
            <span>Delivered securely</span>
            <span>•</span>
            <span>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant response matching Google Stitch wisdom_chat_aparichit
  const primaryCite =
    message.citations && message.citations.length > 0 ? message.citations[0] : null;

  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-full flex flex-col gap-3">
        {/* Guide Header & Mode Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#d4af37] flex items-center justify-center text-[#0b0e16] font-semibold text-xs shadow-sm">
              ॐ
            </div>
            <div className="flex items-center gap-2">
              <span className="font-headline text-sm font-semibold tracking-wider text-[#e0e2ee]">
                APARICHIT
              </span>
              <span className="font-label text-[11px] text-[#99907c]">
                Sanctuary Oracle
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ModeBadge mode={message.mode} />
            <span className="text-[11px] font-label text-[#99907c]">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </div>

        {/* Bubble container */}
        <div className="p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#181b24] border border-[#232b3e] shadow-[0_4px_20px_rgba(0,0,0,0.4)] space-y-4">
          {/* Crisis Safety Banner if triggered */}
          {message.safety_flag === "crisis" && <CrisisBanner />}

          {/* Main Answer Narrative */}
          <div className="text-sm font-body text-[#d0c5af] leading-relaxed whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1.5 align-middle bg-[#f2ca50] animate-pulse rounded-sm" />
            )}
          </div>

          {/* Scripture Citation Quote Box from Stitch */}
          {primaryCite && (
            <div
              onClick={onOpenCitationDrawer}
              className="p-4 rounded-xl scripture-box border border-[#d4af37]/30 hover:border-[#f2ca50]/60 cursor-pointer transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-2 text-[#f2ca50]">
                <BookOpen className="w-4 h-4 text-[#f2ca50]" />
                <span className="font-label text-[11px] uppercase tracking-widest font-semibold">
                  Canonical Verse
                </span>
              </div>
              <blockquote className="text-sm text-[#e0e2ee] font-headline italic leading-relaxed">
                &ldquo;{primaryCite.excerpt}&rdquo;
              </blockquote>
              <div className="text-xs text-[#d4af37] mt-3 font-label font-medium flex items-center justify-between">
                <span>
                  — {primaryCite.source}, {primaryCite.chapter}
                  {primaryCite.verse ? `, Verse ${primaryCite.verse}` : ""}
                </span>
                <span className="text-[11px] text-[#99907c] group-hover:text-[#f2ca50] underline transition-colors">
                  Open Scripture Drawer →
                </span>
              </div>
            </div>
          )}

          {/* Structured Guidance Grid (Options to consider + Next steps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-[#10131b] border border-[#232b3e] space-y-2">
              <div className="font-label font-semibold text-xs text-[#f2ca50] tracking-wide uppercase">
                Ethical Perspectives
              </div>
              <ul className="space-y-2 text-xs text-[#d0c5af] font-body">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#181b24] border border-[#32353e] flex items-center justify-center text-[10px] font-bold text-[#f2ca50] shrink-0 mt-0.5">
                    1
                  </span>
                  <span>Align choices with your natural strengths rather than fear of failure.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#181b24] border border-[#32353e] flex items-center justify-center text-[10px] font-bold text-[#f2ca50] shrink-0 mt-0.5">
                    2
                  </span>
                  <span>Honor ancestral sacrifices through honesty rather than self-negation.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-[#10131b] border border-[#232b3e] space-y-2">
              <div className="font-label font-semibold text-xs text-emerald-400 tracking-wide uppercase">
                Sanctuary Next Steps
              </div>
              <ul className="space-y-2 text-xs text-[#d0c5af] font-body">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Reflect quietly on what duties belong truly to your conscience.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Browse similar community reflections to see how others navigated this.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
