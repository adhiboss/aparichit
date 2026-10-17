"use client";

import React from "react";
import { AdviceMode } from "@/lib/types";
import { BookOpen, Sparkles, Smile } from "lucide-react";

interface ModeBadgeProps {
  mode?: AdviceMode;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode }) => {
  if (!mode) return null;

  switch (mode) {
    case "grounded":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6af2e]/15 text-[#e6af2e] border border-[#e6af2e]/30 shadow-sm">
          <BookOpen className="w-3.5 h-3.5 text-[#e6af2e]" />
          Grounded Scripture
        </span>
      );
    case "inspired":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
          Thematic Reflection
        </span>
      );
    case "playful":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <Smile className="w-3.5 h-3.5 text-emerald-300" />
          Playful Wisdom
        </span>
      );
    default:
      return null;
  }
};
