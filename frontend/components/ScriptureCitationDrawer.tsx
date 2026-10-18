"use client";

import React from "react";
import { Citation } from "@/lib/types";
import { X, BookOpen, ExternalLink } from "lucide-react";

interface ScriptureCitationDrawerProps {
  citations: Citation[];
  onClose?: () => void;
  isOpen?: boolean;
  onViewInLibrary?: (traditionId?: string) => void;
}

export const ScriptureCitationDrawer: React.FC<ScriptureCitationDrawerProps> = ({
  citations,
  onClose,
  isOpen = false,
  onViewInLibrary,
}) => {
  if (!isOpen || !citations || citations.length === 0) return null;

  const primary = citations[0];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#242830] border-l border-[#2E333D] shadow-2xl z-50 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#2E333D]">
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#B69A61]">
                Scriptural Citation
              </span>
              <h2 className="font-headline text-lg font-medium text-[#E7E1D5] mt-0.5">
                {primary.source}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#9E9CA3] hover:text-[#E7E1D5] rounded-lg hover:bg-[#2A303A] transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chapter & Location */}
          <div className="text-xs text-[#9E9CA3]">
            <span>{primary.chapter}</span>
            {primary.verse && <span> • Verse {primary.verse}</span>}
          </div>

          {/* Authentic Scripture Excerpt */}
          <blockquote className="editorial-quote">
            &ldquo;{primary.excerpt}&rdquo;
          </blockquote>

          {/* Canonical Context */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-medium uppercase tracking-wider text-[#9E9CA3]">
              Context & Hermeneutics
            </h4>
            <p className="text-sm leading-relaxed text-[#E7E1D5]/90">
              {primary.context ||
                "In this passage, the canon addresses the resolution of doubt, prioritizing authentic duty and inner detachment from fluctuating outcomes."}
            </p>
          </div>

          {/* Metadata Overview */}
          <div className="p-4 rounded-xl bg-[#1D2128] border border-[#2E333D] space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#282D37]">
              <span className="text-[#9E9CA3]">Tradition</span>
              <span className="text-[#E7E1D5] font-medium">{primary.source}</span>
            </div>
            {primary.translation && (
              <div className="flex justify-between py-1 border-b border-[#282D37]">
                <span className="text-[#9E9CA3]">Translation</span>
                <span className="text-[#E7E1D5]">{primary.translation}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-[#9E9CA3]">License</span>
              <span className="text-[#E7E1D5]">Public Domain Canonical Text</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-[#2E333D] mt-6">
          <button
            type="button"
            onClick={() => {
              const srcLower = (primary.source || "").toLowerCase();
              let matchedId = "bhagavad_gita";
              if (srcLower.includes("garuda")) matchedId = "garuda_purana";
              else if (srcLower.includes("dhamma")) matchedId = "dhammapada";
              else if (
                srcLower.includes("meditation") ||
                srcLower.includes("stoic")
              )
                matchedId = "stoicism";
              else if (srcLower.includes("gita")) matchedId = "bhagavad_gita";
              if (onViewInLibrary) onViewInLibrary(matchedId);
              if (onClose) onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#2A303A] hover:bg-[#323946] border border-[#2E333D] text-[#E7E1D5] text-xs font-medium transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#B69A61]" />
            <span>Open in Scripture Library →</span>
          </button>
        </div>
      </div>
    </>
  );
};
