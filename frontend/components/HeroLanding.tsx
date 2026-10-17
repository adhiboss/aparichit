"use client";

import React from "react";
import Image from "next/image";
import { Shield, BookOpen, Users, ArrowRight, Sparkles, Lock, Heart } from "lucide-react";

interface HeroLandingProps {
  onStartChat: () => void;
  onExploreCommunity: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartChat,
  onExploreCommunity,
}) => {
  return (
    <div className="w-full space-y-12 animate-in fade-in duration-300">
      {/* Cinematic Hero Banner (Matching Image 2) */}
      <div className="relative rounded-3xl overflow-hidden border border-[#232c3f] shadow-2xl min-h-[460px] flex items-center justify-center text-center p-6 sm:p-12">
        {/* Background artwork */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/images/hero_sunset.jpg')` }}
        />

        {/* Deep atmospheric overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-[#0d111a]/70 to-[#0d111a]/60 backdrop-blur-[1px]" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Golden Lotus Icon */}
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-b from-[#e6af2e]/25 to-transparent border border-[#e6af2e]/40 text-[#e6af2e] shadow-xl shadow-[#e6af2e]/10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-8 h-8"
            >
              <path d="M12 3c-1.5 2-3 4.5-3 7 0 2 1.5 3.5 3 3.5s3-1.5 3-3.5c0-2.5-1.5-5-3-7z" />
              <path d="M8 9C6 10.5 4 13 4 15.5 4 17.5 5.5 19 8 19c1.5 0 2.8-.7 3.5-1.8" />
              <path d="M16 9c2 1.5 4 4 4 6.5 0 2-1.5 3.5-4 3.5-1.5 0-2.8-.7-3.5-1.8" />
              <path d="M12 21c-4 0-7-1.5-7-3.5 0-.5.5-1 1.5-1.5" />
              <path d="M12 21c4 0 7-1.5 7-3.5 0-.5-.5-1-1.5-1.5" />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-widest text-[#f0f2f5]">
              APARICHIT
            </h1>
            <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-[#e6af2e]">
              Ancient Wisdom for Modern Dilemmas
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#cbd5e1] max-w-xl mx-auto leading-relaxed">
            Share your questions. Explore timeless wisdom. Connect with people who understand. All anonymously.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onStartChat}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#e6af2e] to-amber-500 hover:from-[#fce28b] hover:to-[#e6af2e] text-[#0d111a] font-bold text-xs shadow-lg shadow-[#e6af2e]/25 transition-all cursor-pointer"
            >
              <span>Start Chatting</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreCommunity}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#151b26]/90 hover:bg-[#1f2738] border border-[#232c3f] hover:border-[#e6af2e]/50 text-[#f0f2f5] font-semibold text-xs backdrop-blur-md transition-all cursor-pointer shadow-md"
            >
              <span>Explore Community</span>
            </button>
          </div>

          {/* Three Feature Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-[#94a3b8]">
            <div className="flex flex-col items-center gap-1.5">
              <div className="p-2 rounded-xl bg-[#151b26] border border-[#232c3f] text-[#e6af2e]">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-medium text-[#f0f2f5]">Anonymous & Safe</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="p-2 rounded-xl bg-[#151b26] border border-[#232c3f] text-[#e6af2e]">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-medium text-[#f0f2f5]">AI Advice with Verified Sources</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="p-2 rounded-xl bg-[#151b26] border border-[#232c3f] text-[#e6af2e]">
                <Users className="w-4 h-4" />
              </div>
              <span className="font-medium text-[#f0f2f5]">Real People, Real Stories</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Showcase Grid (Matching bottom half of Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Timeless Wisdom */}
        <div className="relative rounded-2xl overflow-hidden border border-[#232c3f] group min-h-[220px] shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('/images/wisdom_manuscript.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-[#0d111a]/70 to-transparent" />
          <div className="relative z-10 p-5 flex flex-col justify-end h-full">
            <h3 className="text-base font-bold text-[#f0f2f5] font-serif">
              Timeless Wisdom
            </h3>
            <p className="text-xs text-[#94a3b8] mt-1">
              Ancient texts. Modern answers. Verified citations from public-domain editions.
            </p>
          </div>
        </div>

        {/* Card 2: A Supportive Community */}
        <div className="relative rounded-2xl overflow-hidden border border-[#232c3f] group min-h-[220px] shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('/images/community_campfire.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d111a] via-[#0d111a]/70 to-transparent" />
          <div className="relative z-10 p-5 flex flex-col justify-end h-full">
            <h3 className="text-base font-bold text-[#f0f2f5] font-serif">
              A Supportive Community
            </h3>
            <p className="text-xs text-[#94a3b8] mt-1">
              Share. Learn. Grow. Anonymously with peers walking similar journeys.
            </p>
          </div>
        </div>

        {/* Card 3: Your Privacy Matters */}
        <div className="relative rounded-2xl overflow-hidden border border-[#232c3f] bg-gradient-to-br from-[#171c28] to-[#0d111a] p-5 flex flex-col justify-between shadow-xl group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#e6af2e]/25 to-transparent border border-[#e6af2e]/40 flex items-center justify-center text-[#e6af2e]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#f0f2f5] font-serif">
              Your Privacy Matters
            </h3>
            <p className="text-xs text-[#94a3b8] mt-1">
              Your chat stays private unless you explicitly choose to share it. Automatic PII sanitization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
