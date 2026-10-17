"use client";

import React from "react";
import { HeartHandshake, PhoneCall, ShieldAlert } from "lucide-react";

export const CrisisBanner: React.FC = () => {
  return (
    <div
      role="alert"
      className="my-3 p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-100 shadow-lg shadow-red-950/20"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-red-500/20 text-red-400 shrink-0">
          <HeartHandshake className="w-5 h-5" />
        </div>
        <div className="space-y-2 text-sm leading-relaxed">
          <div className="font-semibold text-red-200 flex items-center gap-2">
            <span>You are not alone. Support is available right now.</span>
          </div>
          <p className="text-red-200/90 text-xs">
            If you or someone you know is going through a deeply painful time or
            having thoughts of self-harm, please connect with a compassionate
            listener immediately. Ancient philosophy is a lens for reflection,
            never a replacement for professional human support.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            <a
              href="tel:14416"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Tele-MANAS: 14416 (Toll-Free, 24/7)</span>
            </a>
            <a
              href="tel:18008914416"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900/90 text-red-200 border border-red-500/30 transition-colors"
            >
              <span>1800-891-4416</span>
            </a>
            <a
              href="tel:9999666555"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-900/90 text-red-200 border border-red-500/30 transition-colors"
            >
              <span>Vandrevala Foundation: +91 9999 666 555</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
