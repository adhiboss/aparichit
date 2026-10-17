"use client";

import React, { useState } from "react";
import { Citation } from "@/lib/types";
import { ChevronDown, ChevronUp, ScrollText, ExternalLink } from "lucide-react";

interface CitationAccordionProps {
  citations: Citation[];
}

export const CitationAccordion: React.FC<CitationAccordionProps> = ({
  citations,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!citations || citations.length === 0) return null;

  return (
    <div className="mt-3 border border-[#232c3f] rounded-lg bg-[#141924]/80 overflow-hidden text-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs font-medium text-[#d4af37] hover:bg-[#1a2130] transition-colors"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-[#e6af2e]" />
          <span>
            {citations.length === 1
              ? "1 Verified Scripture Citation"
              : `${citations.length} Verified Scripture Citations`}
          </span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#94a3b8]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#94a3b8]" />
        )}
      </button>

      {isOpen && (
        <div className="divide-y divide-[#232c3f]/70 border-t border-[#232c3f] bg-[#111622]/90">
          {citations.map((cite, idx) => (
            <div key={idx} className="p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs">
                <span className="font-semibold text-[#f0f2f5]">
                  {cite.source}
                </span>
                <span className="text-[#94a3b8] bg-[#171c28] px-2 py-0.5 rounded border border-[#232c3f]">
                  {cite.chapter}
                  {cite.verse ? `, Verse ${cite.verse}` : ""}
                </span>
              </div>

              {cite.excerpt && (
                <blockquote className="border-l-2 border-[#e6af2e]/60 pl-3 py-1 my-1 text-xs text-[#cbd5e1] font-scripture italic leading-relaxed bg-[#0c0f17]/40 rounded-r">
                  &ldquo;{cite.excerpt}&rdquo;
                </blockquote>
              )}

              {cite.translation && (
                <div className="text-[11px] text-[#64748b] flex items-center gap-1.5 pt-1">
                  <span>Translation / Edition:</span>
                  <span className="text-[#94a3b8] font-medium">
                    {cite.translation}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
