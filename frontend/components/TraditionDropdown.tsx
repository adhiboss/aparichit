"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, BookOpen } from "lucide-react";
import type { TraditionItem } from "../lib/types.ts";

interface TraditionDropdownProps {
  traditions: TraditionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

const TRADITION_METADATA: Record<
  string,
  { symbol: string; subtitle: string; tag: string }
> = {
  garuda_purana: {
    symbol: "ॐ",
    subtitle: "Wood & Subrahmanyam 1911",
    tag: "Karma & Dharma",
  },
  bhagavad_gita: {
    symbol: "ॐ",
    subtitle: "Edwin Arnold 1885",
    tag: "Selfless Action",
  },
  dhammapada: {
    symbol: "☸",
    subtitle: "Max Müller 1881",
    tag: "Mindfulness & Peace",
  },
  stoicism: {
    symbol: "🏛",
    subtitle: "George Long 1862",
    tag: "Inner Fortitude",
  },
};

export const TraditionDropdown: React.FC<TraditionDropdownProps> = ({
  traditions,
  selectedId,
  onSelect,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTradition =
    traditions.find((t) => t.id === selectedId) ||
    traditions[0] || {
      id: "garuda_purana",
      name: "Garuda Purana",
      translation: "Wood & Subrahmanyam 1911",
      description: "",
    };

  const selectedMeta = TRADITION_METADATA[selectedTradition.id] || {
    symbol: "ॐ",
    subtitle: selectedTradition.translation || "Classical Text",
    tag: "Wisdom",
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      {/* Trigger Button - Matching the reference image aesthetic */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#261f18] border border-[#362c22] hover:border-[#e59a27]/60 text-xs font-semibold text-[#f2ede4] shadow-sm transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e59a27]"
      >
        <span className="text-sm font-serif text-[#e59a27] leading-none select-none">
          {selectedMeta.symbol}
        </span>
        <span className="tracking-wide text-xs text-[#f2ede4]">
          {selectedTradition.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#b5aa9b] transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#e59a27]" : ""
          }`}
        />
      </button>

      {/* Custom Dropdown Menu (No default OS blue popup) */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#1c1712] border border-[#362c22] shadow-[0_16px_40px_rgba(0,0,0,0.85)] py-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="px-3.5 py-1.5 border-b border-[#362c22]/70 flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider text-[#b5aa9b] font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-[#e59a27]" />
              Sacred Traditions
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#e59a27]/10 text-[#e59a27] font-medium">
              Verified
            </span>
          </div>

          {/* Options List */}
          <div className="space-y-0.5 px-1 max-h-72 overflow-y-auto">
            {traditions.map((tradition) => {
              const isSelected = tradition.id === selectedTradition.id;
              const meta = TRADITION_METADATA[tradition.id] || {
                symbol: "ॐ",
                subtitle: tradition.translation || "",
                tag: "Wisdom",
              };

              return (
                <button
                  key={tradition.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onSelect(tradition.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-[#282018] text-[#f2ede4] border-l-2 border-[#e59a27]"
                      : "text-[#b5aa9b] hover:bg-[#241c15] hover:text-[#f2ede4]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Symbol Emblem */}
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? "bg-[#e59a27]/20 border-[#e59a27]/50 text-[#e59a27]"
                          : "bg-[#211a14] border-[#362c22] text-[#b5aa9b] group-hover:border-[#e59a27]/40 group-hover:text-[#e59a27]"
                      }`}
                    >
                      <span className="text-sm font-serif select-none">
                        {meta.symbol}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium truncate ${
                            isSelected ? "text-[#f2ede4] font-semibold" : ""
                          }`}
                        >
                          {tradition.name}
                        </span>
                      </div>
                      <span className="block text-[10px] text-[#7a6e5e] truncate group-hover:text-[#b5aa9b] transition-colors">
                        {meta.subtitle || meta.tag}
                      </span>
                    </div>
                  </div>

                  {/* Active Checkmark */}
                  {isSelected && (
                    <Check className="w-4 h-4 text-[#e59a27] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
