"use client";

import React, { useState } from "react";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { CrisisBanner } from "./CrisisBanner";
import { ChevronDown, ChevronUp, BookOpen } from "lucide-react";

interface ChatMessageProps {
  message: ChatMessageType;
  onSelectPost?: (postId: string) => void;
  previousUserMessage?: string;
  onOpenCitationDrawer?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onOpenCitationDrawer,
}) => {
  const isUser = message.role === "user";
  const [citationExpanded, setCitationExpanded] = useState(false);

  const formatTime = (ts?: string) => {
    if (!ts) return "";
    try {
      const d = new Date(ts);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-8">
        <div className="max-w-[85%] sm:max-w-[75%] space-y-1.5">
          <div className="bg-[#242830] text-[#E7E1D5] p-5 rounded-2xl text-[16px] leading-[1.65]">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="text-right pr-2 text-xs text-[#6C717D]">
            <span suppressHydrationWarning>{formatTime(message.timestamp)}</span>
          </div>
        </div>
      </div>
    );
  }

  // Assistant response
  const primaryCite =
    message.citations && message.citations.length > 0 ? message.citations[0] : null;

  // Render assistant content naturally with editorial typography
  const renderFormattedContent = (content: string) => {
    // Split by double newline to handle paragraphs
    const paragraphs = content.split(/\n\s*\n/);

    return (
      <div className="space-y-4 text-[16px] leading-[1.75] text-[#E7E1D5]">
        {paragraphs.map((p, idx) => {
          const trimmed = p.trim();
          if (!trimmed) return null;

          // Check if this looks like a numbered section header like "1. Finding Clarity"
          const headerMatch = trimmed.match(/^(\d+\.\s+[^\n]+)([\s\S]*)$/);
          if (headerMatch) {
            const headerTitle = headerMatch[1];
            const remainingBody = headerMatch[2].trim();

            return (
              <div key={idx} className="space-y-2 pt-2">
                <h3 className="font-headline text-[17px] font-medium text-[#E7E1D5]">
                  {headerTitle}
                </h3>
                {remainingBody && (
                  <p className="whitespace-pre-wrap text-[#E7E1D5]/90">
                    {remainingBody}
                  </p>
                )}
              </div>
            );
          }

          // Check if it's a bulleted list
          if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
            const lines = trimmed.split("\n");
            return (
              <ul key={idx} className="space-y-2 pl-4 text-[#E7E1D5]/90">
                {lines.map((line, lIdx) => (
                  <li key={lIdx} className="list-disc pl-1">
                    {line.replace(/^[•\-]\s*/, "")}
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p key={idx} className="whitespace-pre-wrap text-[#E7E1D5]/90">
              {trimmed}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="mb-10 animate-in fade-in duration-200">
      <div className="w-full space-y-4">
        {/* Author Byline */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2.5">
            {/* Subtle Muted Gold Lotus Mark */}
            <img
              src="/aparichit-favicon.svg"
              alt="APARICHIT"
              className="w-4 h-4 rounded-sm shrink-0"
            />
            <span className="font-headline text-sm font-medium tracking-wide text-[#E7E1D5]">
              APARICHIT
            </span>
          </div>

          <span suppressHydrationWarning className="text-xs text-[#6C717D]">
            {formatTime(message.timestamp)}
          </span>
        </div>

        {/* Crisis Safety Banner if triggered */}
        {message.safety_flag === "crisis" && <CrisisBanner />}

        {/* Natural Narrative Flow - No nested boxes */}
        <div className="space-y-4">
          {renderFormattedContent(message.content)}

          {message.isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-[#B69A61] animate-pulse" />
          )}
        </div>

        {/* Authentic Editorial Scripture Blockquote */}
        {primaryCite && primaryCite.excerpt && (
          <div className="my-6 space-y-3">
            <blockquote className="editorial-quote">
              &ldquo;{primaryCite.excerpt}&rdquo;
            </blockquote>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9E9CA3] pl-5">
              <span>
                — {primaryCite.source}
                {primaryCite.chapter ? `, ${primaryCite.chapter}` : ""}
                {primaryCite.verse ? `, Verse ${primaryCite.verse}` : ""}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCitationExpanded(!citationExpanded)}
                  className="flex items-center gap-1 text-[#B69A61] hover:underline cursor-pointer"
                >
                  <span>{citationExpanded ? "Hide Details" : "View Context"}</span>
                  {citationExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {onOpenCitationDrawer && (
                  <button
                    type="button"
                    onClick={onOpenCitationDrawer}
                    className="text-[#9E9CA3] hover:text-[#E7E1D5] cursor-pointer"
                  >
                    Drawer →
                  </button>
                )}
              </div>
            </div>

            {/* Collapsible In-Line Citation Context */}
            {citationExpanded && (
              <div className="mt-3 p-4 rounded-xl bg-[#242830] text-xs space-y-2 border-l-2 border-[#B69A61] animate-in fade-in duration-150">
                <div className="flex justify-between text-[#9E9CA3]">
                  <span>Source Text:</span>
                  <span className="text-[#E7E1D5] font-medium">
                    {primaryCite.source}
                  </span>
                </div>
                {primaryCite.translation && (
                  <div className="flex justify-between text-[#9E9CA3]">
                    <span>Translation / Provenance:</span>
                    <span className="text-[#E7E1D5]">
                      {primaryCite.translation}
                    </span>
                  </div>
                )}
                {primaryCite.context && (
                  <p className="text-[#E7E1D5]/80 pt-1 leading-relaxed border-t border-[#2E3440] mt-2">
                    {primaryCite.context}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
