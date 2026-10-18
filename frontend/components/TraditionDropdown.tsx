"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { TraditionItem } from "../lib/types.ts";

interface TraditionDropdownProps {
  traditions: TraditionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

const TRADITION_METADATA: Record<
  string,
  { symbol: string; subtitle: string }
> = {
  garuda_purana: {
    symbol: "ॐ",
    subtitle: "Wood & Subrahmanyam 1911",
  },
  bhagavad_gita: {
    symbol: "ॐ",
    subtitle: "Edwin Arnold 1885",
  },
  dhammapada: {
    symbol: "☸",
    subtitle: "Max Müller 1881",
  },
  stoicism: {
    symbol: "🏛",
    subtitle: "George Long 1862",
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
    subtitle: selectedTradition.translation || "Classical Canon",
  };

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
    <div ref={dropdownRef} className={`relative inline-block z-40 ${className}`}>
      {/* Editorial Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#242830] hover:bg-[#2A303A] border border-[#2E333D] text-xs font-medium text-[#E7E1D5] transition-colors cursor-pointer"
      >
        <span className="text-xs font-serif text-[#B69A61]">
          {selectedMeta.symbol}
        </span>
        <span className="tracking-wide">
          {selectedTradition.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#9E9CA3] transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[#B69A61]" : ""
          }`}
        />
      </button>

      {/* Editorial Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-[#242830] border border-[#2E333D] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="space-y-0.5 px-1 max-h-64 overflow-y-auto">
            {traditions.map((tradition) => {
              const isSelected = tradition.id === selectedTradition.id;
              const meta = TRADITION_METADATA[tradition.id] || {
                symbol: "ॐ",
                subtitle: tradition.translation || "",
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
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[#2A303A] text-[#E7E1D5]"
                      : "text-[#9E9CA3] hover:bg-[#2A303A]/60 hover:text-[#E7E1D5]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs font-serif text-[#B69A61] w-4 text-center shrink-0">
                      {meta.symbol}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="block text-xs font-medium truncate text-[#E7E1D5]">
                        {tradition.name}
                      </span>
                      <span className="block text-[11px] text-[#6C717D] truncate">
                        {meta.subtitle}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#B69A61] shrink-0" />
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
