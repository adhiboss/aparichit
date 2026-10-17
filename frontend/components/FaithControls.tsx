"use client";

import React, { useEffect, useState } from "react";
import { TraditionItem } from "@/lib/types";
import { fetchTraditions } from "@/lib/chat";
import { BookOpen, Sparkles, Compass, AlertCircle, Loader2 } from "lucide-react";

interface FaithControlsProps {
  faithOn: boolean;
  onFaithToggle: (enabled: boolean) => void;
  selectedTradition: string;
  onTraditionChange: (traditionId: string) => void;
}

export const FaithControls: React.FC<FaithControlsProps> = ({
  faithOn,
  onFaithToggle,
  selectedTradition,
  onTraditionChange,
}) => {
  const [traditions, setTraditions] = useState<TraditionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadTraditions() {
      try {
        setLoading(true);
        const data = await fetchTraditions();
        if (mounted) {
          setTraditions(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (mounted) {
          setError("Failed to load scripture traditions");
          // Fallback to primary tradition if API call fails
          setTraditions([
            {
              id: "garuda_purana",
              name: "Garuda Purana",
              translation: "Wood & Subrahmanyam 1911",
              description: "Classical Hindu dialogue on karma and ethical conduct.",
            },
          ]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadTraditions();
    return () => {
      mounted = false;
    };
  }, []);

  const activeTradition = traditions.find((t) => t.id === selectedTradition);

  return (
    <div className="p-3.5 rounded-xl bg-[#171c28] border border-[#232c3f] space-y-3 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Faith Guidance Switch */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={faithOn}
            onClick={() => onFaithToggle(!faithOn)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#e6af2e] focus:ring-offset-2 focus:ring-offset-[#171c28] ${
              faithOn ? "bg-[#e6af2e]" : "bg-[#232c3f]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                faithOn ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>

          <div>
            <div className="text-xs font-semibold text-[#f0f2f5] flex items-center gap-1.5">
              <span>Spiritual Guidance</span>
              {faithOn ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e6af2e]/20 text-[#e6af2e] font-medium">
                  Active
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#232c3f] text-[#94a3b8]">
                  Practical Only
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#94a3b8]">
              {faithOn
                ? "Answers grounded in classical texts & philosophical passages"
                : "Secular, practical wisdom without scripture quotes"}
            </p>
          </div>
        </div>

        {/* Tradition Dropdown (Visible only when faith guidance is enabled) */}
        {faithOn && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#94a3b8] flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-[#e6af2e]" />
              Tradition:
            </span>

            {loading ? (
              <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] px-2 py-1 bg-[#0c0f17] rounded-lg border border-[#232c3f]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#e6af2e]" />
                <span>Loading...</span>
              </div>
            ) : (
              <select
                value={selectedTradition}
                onChange={(e) => onTraditionChange(e.target.value)}
                className="text-xs bg-[#0c0f17] border border-[#232c3f] text-[#f0f2f5] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#e6af2e] focus:ring-1 focus:ring-[#e6af2e] cursor-pointer"
              >
                {traditions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* Selected Tradition Detail Banner */}
      {faithOn && activeTradition && (
        <div className="pt-2 border-t border-[#232c3f]/60 flex items-start gap-2 text-[11px] text-[#94a3b8]">
          <BookOpen className="w-3.5 h-3.5 text-[#e6af2e] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#cbd5e1] font-medium">{activeTradition.name}</span>
            <span className="mx-1.5 text-[#64748b]">•</span>
            <span>{activeTradition.translation}</span>
            <p className="text-[#64748b] mt-0.5">{activeTradition.description}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="text-[11px] text-amber-400 flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
