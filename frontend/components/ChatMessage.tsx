"use client";

import React from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { ModeBadge } from "./ModeBadge";
import { CrisisBanner } from "./CrisisBanner";
import { CheckCircle2, User, BookOpen, Compass } from "lucide-react";

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
        <div className="max-w-[88%] sm:max-w-[80%] flex flex-col items-end gap-1.5">
          <div className="bg-[#261f18] text-[#f2ede4] p-4 sm:p-5 rounded-2xl rounded-tr-sm shadow-md border border-[#3d3227]">
            <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
          <div className="flex items-center gap-2 pr-1 text-[#7a6e5e] font-label text-[11px]">
            <span>Delivered securely</span>
            <span>•</span>
            <span suppressHydrationWarning>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant response matching the user's reference image
  const primaryCite =
    message.citations && message.citations.length > 0 ? message.citations[0] : null;

  return (
    <div className="flex justify-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-full flex items-start gap-3.5">
        {/* Lotus Emblem in dark gold circle on left */}
        <div className="w-8 h-8 rounded-full bg-[#261f18] border border-[#e59a27]/50 flex items-center justify-center text-[#e59a27] shrink-0 mt-1 shadow-md">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M12 3c-1.5 2-3 4.5-3 7 0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-2.5-1.5-5-3-7z" />
            <path d="M8 9C6 10.5 4 13 4 15.5 4 17.5 5.5 19 8 19c1.5 0 2.8-.7 3.5-1.8" />
            <path d="M16 9c2 1.5 4 4 4 6.5 0 2-1.5 3.5-4 3.5-1.5 0-2.8-.7-3.5-1.8" />
            <path d="M12 21c-4 0-7-1.5-7-3.5 0-.5.5-1 1.5-1.5" />
            <path d="M12 21c4 0 7-1.5 7-3.5 0-.5-.5-1-1.5-1.5" />
          </svg>
        </div>

        {/* Bubble container */}
        <div className="flex-1 p-5 sm:p-6 rounded-2xl rounded-tl-sm bg-[#1c1712] border border-[#362c22] shadow-[0_4px_24px_rgba(0,0,0,0.5)] space-y-4">
          {/* Header row: APARICHIT label, Grounded badge, timestamp */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#362c22]/70">
            <div className="flex items-center gap-2.5">
              <span className="font-headline text-sm font-semibold tracking-wider text-[#f2ede4]">
                APARICHIT
              </span>
              <ModeBadge mode={message.mode || "grounded"} />
            </div>

            <span suppressHydrationWarning className="text-[11px] font-label text-[#7a6e5e]">
              {formatTime(message.timestamp)}
            </span>
          </div>

          {/* Crisis Safety Banner if triggered */}
          {message.safety_flag === "crisis" && <CrisisBanner />}

          {/* Main Answer Narrative */}
          <div className="text-sm font-body text-[#b5aa9b] leading-relaxed whitespace-pre-wrap">
            {message.content}
            {message.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1.5 align-middle bg-[#e59a27] animate-pulse rounded-sm" />
            )}
          </div>

          {/* Scripture Citation Quote Box from the image */}
          {primaryCite && (
            <div
              onClick={onOpenCitationDrawer}
              className="p-4 rounded-xl bg-[#231c15] border border-[#e59a27]/40 hover:border-[#f0a83b]/70 cursor-pointer transition-all duration-200 group shadow-sm"
            >
              <blockquote className="text-sm text-[#f2ede4] font-headline italic leading-relaxed">
                &ldquo;{primaryCite.excerpt}&rdquo;
              </blockquote>
              <div className="text-xs text-[#e59a27] mt-2.5 font-label font-medium flex items-center justify-between">
                <span>
                  — {primaryCite.source}, {primaryCite.chapter}
                  {primaryCite.verse ? `, Verse ${primaryCite.verse}` : ""}
                </span>
                <span className="text-[11px] text-[#7a6e5e] group-hover:text-[#e59a27] underline transition-colors">
                  View Full Scripture →
                </span>
              </div>
            </div>
          )}

          {/* Structured Guidance Grid (Finding Clarity + Next Steps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-[#14120e] border border-[#362c22] space-y-2">
              <div className="font-label font-semibold text-xs text-[#e59a27] tracking-wide uppercase">
                1. Finding Clarity
              </div>
              <p className="text-xs text-[#b5aa9b] font-body leading-relaxed">
                Confusion often arises when we focus only on the outcome. Ancient canons remind us to focus on our sincere duties, rather than being overwhelmed by external expectations.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#14120e] border border-[#362c22] space-y-2">
              <div className="font-label font-semibold text-xs text-emerald-400 tracking-wide uppercase">
                2. Next Steps
              </div>
              <ul className="space-y-1.5 text-xs text-[#b5aa9b] font-body">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Reflect on your innate strengths and authentic interests.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Have an honest, calm conversation with your parents without defensive anger.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
