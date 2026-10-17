"use client";

import React, { useState } from "react";
import { Citation } from "@/lib/types";
import {
  BookOpen,
  X,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Info,
  ScrollText,
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
  const [showRelated, setShowRelated] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  if (!isOpen || !citations || citations.length === 0) return null;

  const primary = citations[0];

  return (
    <aside className="w-80 shrink-0 flex flex-col rounded-2xl bg-[#151b26] border border-[#232c3f] shadow-2xl p-4 text-[#f0f2f5] space-y-4 max-h-[720px] overflow-y-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232c3f]">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#e6af2e]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
            Verified Scripture Citations
          </h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#64748b] hover:text-white hover:bg-[#202738] transition-colors"
            aria-label="Close citations"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Primary Citation Card */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#e6af2e]/20 border border-[#e6af2e]/40 flex items-center justify-center text-[#e6af2e] text-[10px] font-bold">
            GP
          </div>
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs font-bold text-[#f0f2f5]">
              {primary.source}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Primary source
            </span>
          </div>
        </div>

        <div className="text-[11px] text-[#94a3b8] font-medium">
          {primary.chapter}
          {primary.verse ? `, Verse ${primary.verse}` : ""}
        </div>

        {/* Quoted Verse */}
        <blockquote className="p-3 rounded-xl scripture-box text-xs text-[#cbd5e1] font-scripture italic leading-relaxed">
          &ldquo;{primary.excerpt}&rdquo;
        </blockquote>

        {/* Full Context */}
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-[#cbd5e1]">
            Full context
          </div>
          <p className="text-[11px] text-[#94a3b8] leading-relaxed">
            In this section, the text emphasizes righteous conduct, calm equanimity in moral duty, and liberation from excessive attachment and anxiety over immediate outcomes.
          </p>
        </div>

        {/* Metadata Table */}
        <div className="p-3 rounded-xl bg-[#0d111a] border border-[#232c3f] space-y-1.5 text-[11px]">
          <div className="flex justify-between py-0.5">
            <span className="text-[#64748b]">Source</span>
            <span className="text-[#cbd5e1] font-medium">{primary.source}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-[#64748b]">Translation</span>
            <span className="text-[#cbd5e1] font-medium text-right max-w-[150px] truncate">
              {primary.translation}
            </span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-[#64748b]">Chapter</span>
            <span className="text-[#cbd5e1] font-medium">{primary.chapter}</span>
          </div>
          {primary.verse && (
            <div className="flex justify-between py-0.5">
              <span className="text-[#64748b]">Verse</span>
              <span className="text-[#cbd5e1] font-medium">{primary.verse}</span>
            </div>
          )}
          <div className="flex justify-between py-0.5">
            <span className="text-[#64748b]">Language</span>
            <span className="text-[#cbd5e1] font-medium">English (from Sanskrit)</span>
          </div>
        </div>
      </div>

      {/* Accordions */}
      <div className="pt-2 border-t border-[#232c3f] space-y-2 text-xs">
        {/* Related Passages Accordion */}
        <div className="rounded-xl border border-[#232c3f] bg-[#0d111a] overflow-hidden">
          <button
            onClick={() => setShowRelated(!showRelated)}
            className="w-full flex items-center justify-between p-2.5 text-left text-xs text-[#cbd5e1] hover:text-[#e6af2e] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <ScrollText className="w-3.5 h-3.5 text-[#e6af2e]" />
              <span>Related passages ({citations.length})</span>
            </span>
            {showRelated ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
            )}
          </button>
          {showRelated && (
            <div className="p-3 border-t border-[#232c3f] space-y-2 text-[11px] text-[#94a3b8]">
              {citations.slice(1).map((c, i) => (
                <div key={i} className="p-2 rounded bg-[#151b26] border border-[#232c3f] space-y-1">
                  <div className="font-semibold text-[#f0f2f5]">{c.chapter}</div>
                  <p className="italic font-scripture text-[#cbd5e1]">&ldquo;{c.excerpt}&rdquo;</p>
                </div>
              ))}
              {citations.length <= 1 && (
                <p>This is the most direct classical passage matching this dilemma.</p>
              )}
            </div>
          )}
        </div>

        {/* About This Source Accordion */}
        <div className="rounded-xl border border-[#232c3f] bg-[#0d111a] overflow-hidden">
          <button
            onClick={() => setShowAbout(!showAbout)}
            className="w-full flex items-center justify-between p-2.5 text-left text-xs text-[#cbd5e1] hover:text-[#e6af2e] transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#e6af2e]" />
              <span>About this source</span>
            </span>
            {showAbout ? (
              <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-[#64748b]" />
            )}
          </button>
          {showAbout && (
            <div className="p-3 border-t border-[#232c3f] text-[11px] text-[#94a3b8] leading-relaxed">
              Public domain edition preserved in APARICHIT's verified vector knowledge base. Fabricated citations are strictly rejected by the backend verification engine.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
