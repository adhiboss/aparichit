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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#122920] text-[#34d399] border border-[#1f4e3b] shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
          Grounded
        </span>
      );
    case "inspired":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#2a1d36] text-[#c084fc] border border-[#432c59]">
          <Sparkles className="w-3 h-3 text-[#c084fc]" />
          Thematic Reflection
        </span>
      );
    case "playful":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#2b2413] text-[#f0a83b] border border-[#4d3c1c]">
          <Smile className="w-3 h-3 text-[#f0a83b]" />
          Playful Wisdom
        </span>
      );
    default:
      return null;
  }
};
