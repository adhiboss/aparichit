"use client";

import React, { useState } from "react";
import { Citation } from "@/lib/types";
import {
  BookOpen,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ScriptureCitationDrawerProps {
  citations: Citation[];
  onClose?: () => void;
  isOpen?: boolean;
}

export const ScriptureCitationDrawer: React.FC<ScriptureCitationDrawerProps> = ({
  citations,
  onClose,
  isOpen = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isOpen || !citations || citations.length === 0) return null;

  const primary = citations[0];

  return (
    <aside className="w-80 shrink-0 flex flex-col rounded-2xl bg-[#1c1712] border border-[#362c22] shadow-2xl p-5 text-[#f2ede4] space-y-4 max-h-[720px] overflow-y-auto animate-in fade-in duration-200">
      {/* Header matching image */}
      <div className="flex items-center justify-between pb-3 border-b border-[#362c22]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#e59a27]" />
          <h3 className="font-label text-xs font-semibold tracking-wider text-[#f2ede4]">
            Verified Scripture Citation
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-lg text-[#7a6e5e] hover:text-[#f2ede4] transition-colors cursor-pointer"
          aria-label="Toggle citation details"
        >
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-3.5">
          {/* Source pill + Primary source badge */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-serif text-[#e59a27] text-sm">ॐ</span>
              <span className="font-headline text-sm font-semibold text-[#f2ede4]">
                {primary.source}
              </span>
            </div>
            <span className="text-[10px] font-label px-2 py-0.5 rounded-full bg-[#122920] text-[#34d399] border border-[#1f4e3b]">
              Primary source
            </span>
          </div>

          <div className="font-label text-xs text-[#b5aa9b]">
            {primary.chapter}
            {primary.verse ? `, Verse ${primary.verse}` : ""}
          </div>

          {/* Quoted Verse in Warm Golden Scripture Box */}
          <div className="p-3.5 rounded-xl bg-[#231c15] border border-[#e59a27]/40 shadow-inner">
            <p className="font-headline text-xs sm:text-sm text-[#f2ede4] italic leading-relaxed">
              “{primary.excerpt}”
            </p>
          </div>

          {/* Full Context */}
          <div className="space-y-1">
            <div className="font-label text-xs font-semibold text-[#f2ede4]">
              Full context
            </div>
            <p className="font-body text-xs text-[#b5aa9b] leading-relaxed">
              In this verse, the wisdom explains the importance of focusing on one&apos;s sincere duty (karma) without attachment to the results. It encourages effort and inner steadiness, even in uncertain times.
            </p>
          </div>

          {/* Metadata Table */}
          <div className="p-3.5 rounded-xl bg-[#14120e] border border-[#362c22] space-y-2 text-xs">
            <div className="flex justify-between py-0.5 border-b border-[#362c22]/50">
              <span className="text-[#7a6e5e]">Source</span>
              <span className="text-[#f2ede4] font-medium">{primary.source}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#362c22]/50">
              <span className="text-[#7a6e5e]">Chapter</span>
              <span className="text-[#f2ede4] font-medium">{primary.chapter}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#362c22]/50">
              <span className="text-[#7a6e5e]">Verse</span>
              <span className="text-[#f2ede4] font-medium">{primary.verse || "47"}</span>
            </div>
            <div className="flex justify-between py-0.5 border-b border-[#362c22]/50">
              <span className="text-[#7a6e5e]">Translation</span>
              <span className="text-[#f2ede4] font-medium text-right max-w-[150px] truncate">
                {primary.translation || "Swami Sivananda"}
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="text-[#7a6e5e]">Language</span>
              <span className="text-[#f2ede4] font-medium">Sanskrit (with English translation)</span>
            </div>
          </div>

          {/* View in Library Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#211a14] hover:bg-[#29211a] border border-[#362c22] hover:border-[#e59a27]/50 text-[#f2ede4] text-xs font-label font-semibold transition-all cursor-pointer shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#e59a27]" />
            <span>View in Library →</span>
          </button>
        </div>
      )}
    </aside>
  );
};
