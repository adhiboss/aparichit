"use client";

import React from "react";
import Image from "next/image";
import {
  Shield,
  BookOpen,
  Users,
  ArrowRight,
  Sparkles,
  Lock,
  Heart,
  EyeOff,
  Compass,
  CheckCircle,
} from "lucide-react";

interface HeroLandingProps {
  onStartChat: (initialPrompt?: string) => void;
  onExploreCommunity: () => void;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({
  onStartChat,
  onExploreCommunity,
}) => {
  const sanctuaryInquiries = [
    "How do I handle burnout without losing purpose?",
    "Finding detachment in high-stakes decisions",
    "Processing unexpressed grief",
  ];

  return (
    <div className="w-full flex flex-col gap-12 sm:gap-16 animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-4 pb-8 sm:py-6">
        <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-[#e59a27]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 rounded-full bg-[#e59a27]/5 blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column (7 Columns) */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e59a27]/15 border border-[#e59a27]/30 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e59a27] animate-pulse" />
              <span className="font-label text-xs uppercase tracking-widest text-[#e59a27] font-semibold">
                Sacred Philosophy × Ethical AI
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h1 className="font-headline text-3xl sm:text-5xl text-[#f2ede4] tracking-tight max-w-xl leading-tight">
                Ancient Wisdom for{" "}
                <span className="italic text-[#e59a27] font-serif">
                  Modern Dilemmas
                </span>
                .
              </h1>
              <p className="font-body text-base sm:text-lg text-[#b5aa9b] max-w-xl font-light leading-relaxed">
                A private space to explore your questions, discover new perspectives, and connect with people who understand.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onStartChat()}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#e59a27] hover:bg-[#f0a83b] text-[#140e06] font-label text-sm font-semibold transition-all duration-300 shadow-[0_0_24px_rgba(229,154,39,0.3)] hover:shadow-[0_0_32px_rgba(229,154,39,0.45)] hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start Chatting</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCommunity}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#1c1712] hover:bg-[#261f18] text-[#f2ede4] border border-[#362c22] font-label text-sm transition-all duration-300 shadow-sm hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Explore Community</span>
                <Users className="w-4 h-4 text-[#7a6e5e]" />
              </button>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center gap-2 text-[#7a6e5e] text-xs">
              <Shield className="w-4 h-4 text-[#e59a27] shrink-0" />
              <span className="font-label tracking-wider uppercase">
                100% Anonymous • No account required • Zero telemetry
              </span>
            </div>

            {/* Sanctuary Inquiries Quick Prompt Chips */}
            <div className="w-full pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#e59a27]" />
                <span className="font-label text-xs uppercase tracking-wider text-[#7a6e5e] font-medium">
                  Sanctuary Inquiries
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sanctuaryInquiries.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => onStartChat(prompt)}
                    className="group px-4 py-2 rounded-full bg-[#1c1712] hover:bg-[#261f18] border border-[#362c22] hover:border-[#e59a27]/40 text-[#b5aa9b] hover:text-[#e59a27] font-body text-xs sm:text-sm transition-all duration-200 text-left flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#7a6e5e] group-hover:text-[#e59a27] transition-colors" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 Columns) Temple Artwork Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] bg-[#1c1712] border border-[#362c22]">
              <Image
                src="/images/hero_sunset.jpg"
                alt="Ancient temple sanctuary at golden sunset"
                fill
                priority
                className="object-cover object-center filter brightness-[0.92] contrast-[1.08] transition-transform duration-700 hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-transparent to-transparent opacity-85" />
              
              <div className="absolute bottom-5 left-5 right-5 p-4 rounded-lg bg-[#1c1712]/90 backdrop-blur-md border border-[#362c22] shadow-lg flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label text-[11px] text-[#e59a27] uppercase tracking-widest font-semibold">
                    Tattva • Realization
                  </span>
                  <span className="font-headline text-sm text-[#f2ede4] italic mt-0.5">
                    “Silence is the altar of deep discernment.”
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-[#e59a27]/15 border border-[#e59a27]/30 flex items-center justify-center flex-shrink-0 text-[#e59a27]">
                  <Compass className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of Sanctuary Section */}
      <section className="w-full py-8 sm:py-12 border-t border-[#362c22]/70">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-label text-xs uppercase tracking-widest text-[#e59a27] font-semibold">
              Pillars of Sanctuary
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl text-[#f2ede4]">
              Designed for Contemplation
            </h2>
          </div>
          <p className="font-body text-sm text-[#7a6e5e] max-w-md">
            A disciplined digital hermitage engineered to illuminate complexity through enduring classical canons.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="relative group bg-[#1c1712] hover:bg-[#261f18] p-7 rounded-xl border border-[#362c22] hover:border-[#e59a27]/30 shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[280px]">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#29211a] flex items-center justify-center text-[#e59a27] group-hover:scale-105 transition-transform duration-200">
                <EyeOff className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label text-[11px] text-[#7a6e5e] uppercase tracking-wider font-medium">
                  Core Principle 01
                </span>
                <h3 className="font-headline text-lg sm:text-xl text-[#f2ede4]">
                  Private, Anonymous Guidance
                </h3>
              </div>
              <p className="font-body text-sm text-[#b5aa9b] font-light leading-relaxed">
                An uncompromised safe space to share vulnerabilities without judgment or identity exposure.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-[#e59a27] font-label text-xs tracking-wider uppercase font-semibold">
              <span>Absolute Ephemerality</span>
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="relative group bg-[#1c1712] hover:bg-[#261f18] p-7 rounded-xl border border-[#362c22] hover:border-[#e59a27]/30 shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[280px]">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#29211a] flex items-center justify-center text-[#e59a27] group-hover:scale-105 transition-transform duration-200">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label text-[11px] text-[#7a6e5e] uppercase tracking-wider font-medium">
                  Core Principle 02
                </span>
                <h3 className="font-headline text-lg sm:text-xl text-[#f2ede4]">
                  Wisdom with Verifiable Sources
                </h3>
              </div>
              <p className="font-body text-sm text-[#b5aa9b] font-light leading-relaxed">
                Grounded responses drawing directly from Gita, Dhammapada, Stoicism, and Garuda Purana with chapter and verse citations.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-[#e59a27] font-label text-xs tracking-wider uppercase font-semibold">
              <span>Verified Canons</span>
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="relative group bg-[#1c1712] hover:bg-[#261f18] p-7 rounded-xl border border-[#362c22] hover:border-[#e59a27]/30 shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between min-h-[280px]">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#29211a] flex items-center justify-center text-[#e59a27] group-hover:scale-105 transition-transform duration-200">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-label text-[11px] text-[#7a6e5e] uppercase tracking-wider font-medium">
                  Core Principle 03
                </span>
                <h3 className="font-headline text-lg sm:text-xl text-[#f2ede4]">
                  Shared Experiences & Community
                </h3>
              </div>
              <p className="font-body text-sm text-[#b5aa9b] font-light leading-relaxed">
                Discover authentic anonymized dilemmas and compassionate peer reflections without performative social metrics.
              </p>
            </div>
            <div className="pt-4 flex items-center gap-1.5 text-[#e59a27] font-label text-xs tracking-wider uppercase font-semibold">
              <span>Kindred Pilgrims</span>
              <Heart className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
