"use client";

import React, { useEffect, useState } from "react";
import { AnonymousAccount } from "@/lib/types";
import { getOrInitAccount, createAnonymousAccount } from "@/lib/auth";
import { UserCheck, RefreshCw, Shield, Sparkles } from "lucide-react";

export const AnonymousIdentity: React.FC = () => {
  const [account, setAccount] = useState<AnonymousAccount | null>(null);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const acc = await getOrInitAccount();
        if (mounted) setAccount(acc);
      } catch (err) {
        console.error("Failed to initialize anonymous identity", err);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  const handleRotateIdentity = async () => {
    if (isRotating) return;
    setIsRotating(true);
    try {
      const newAcc = await createAnonymousAccount();
      setAccount(newAcc);
    } catch (err) {
      console.error("Failed to generate new identity", err);
    } finally {
      setIsRotating(false);
    }
  };

  if (!account) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171c28] border border-[#232c3f] text-xs text-[#94a3b8]">
        <div className="w-2 h-2 rounded-full bg-[#e6af2e] animate-pulse" />
        <span>Generating pseudonym...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#171c28] border border-[#232c3f] text-xs text-[#f0f2f5] shadow-sm">
      <div className="p-1 rounded-full bg-[#e6af2e]/15 text-[#e6af2e]">
        <Shield className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-[#94a3b8] text-[11px] hidden sm:inline">
          Anonymous:
        </span>
        <span className="font-semibold text-[#f0f2f5]">
          {account.display_name}
        </span>
      </div>

      <button
        onClick={handleRotateIdentity}
        disabled={isRotating}
        title="Generate a new anonymous poetic display name"
        className="p-1 text-[#64748b] hover:text-[#e6af2e] rounded-full hover:bg-[#232c3f] transition-colors ml-1 disabled:opacity-50"
        aria-label="New pseudonym"
      >
        <RefreshCw
          className={`w-3 h-3 ${isRotating ? "animate-spin text-[#e6af2e]" : ""}`}
        />
      </button>
    </div>
  );
};
