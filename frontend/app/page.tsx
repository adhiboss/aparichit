"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { AppSidebar } from "@/components/AppSidebar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage as ChatMessageComponent } from "@/components/ChatMessage";
import { ScriptureCitationDrawer } from "@/components/ScriptureCitationDrawer";
import { SimilarProblemCards } from "@/components/SimilarProblemCards";
import { CommunityFeed } from "@/components/CommunityFeed";
import { HeroLanding } from "@/components/HeroLanding";
import { ChatMessage, Citation, StreamMetaEvent } from "@/lib/types";
import {
  getSessionId,
  resetSessionId,
  getSavedPreferences,
  savePreferences,
} from "@/lib/storage";
import { streamChatMessage, sendChatMessage, clearSessionHistory, fetchTraditions } from "@/lib/chat";
import { Compass, BookOpen, ChevronDown, Sparkles, X } from "lucide-react";

const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "msg_user_demo",
    role: "user",
    content: "I feel lost in life. I don't know what to do with my career. I feel like I'm disappointing my parents. What should I do?",
    timestamp: "2026-10-17T18:24:00.000Z",
  },
  {
    id: "msg_asst_demo",
    role: "assistant",
    content:
      "It's understandable to feel confused about your path, especially when you care deeply about your family's expectations. Ancient wisdom reminds us that confusion is a natural part of growth, and clarity unfolds through honest self-reflection, right actions, and patience rather than sudden panic.",
    timestamp: "2026-10-17T18:24:05.000Z",
    mode: "grounded",
    citations: [
      {
        source: "Garuda Purana",
        translation: "Wood & Subrahmanyam (1911)",
        chapter: "Achara Kanda, Chapter 2",
        verse: "15",
        excerpt:
          "One should perform their duties with sincerity, without being driven only by desire or fear.",
      },
    ],
    source_labels: ["scripture", "ai_suggestion"],
  },
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_DEMO_MESSAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [faithOn, setFaithOn] = useState<boolean>(true);
  const [selectedTradition, setSelectedTradition] = useState<string>("garuda_purana");
  const [traditions, setTraditions] = useState<Array<{ id: string; name: string }>>([]);
  const [showCitationDrawer, setShowCitationDrawer] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [showHero, setShowHero] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize preferences & traditions
  useEffect(() => {
    const prefs = getSavedPreferences();
    setFaithOn(prefs.faith_on);
    setSelectedTradition(prefs.tradition);

    async function load() {
      try {
        const list = await fetchTraditions();
        if (list && list.length > 0) setTraditions(list);
      } catch {
        setTraditions([
          { id: "garuda_purana", name: "Garuda Purana" },
          { id: "bhagavad_gita", name: "Bhagavad Gita" },
          { id: "dhammapada", name: "Dhammapada" },
          { id: "stoicism", name: "Stoicism" },
        ]);
      }
    }
    load();
  }, []);

  const handleFaithToggle = (enabled: boolean) => {
    setFaithOn(enabled);
    savePreferences({ faith_on: enabled });
  };

  const handleTraditionChange = (id: string) => {
    setSelectedTradition(id);
    savePreferences({ tradition: id });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `assistant_${Date.now()}`;
    const sessionId = getSessionId();

    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const initialAsstMsg: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
      mode: "inspired",
    };

    setMessages((prev) => [...prev, userMsg, initialAsstMsg]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulated = "";

    try {
      await streamChatMessage(
        {
          session_id: sessionId,
          message: text,
          faith_on: faithOn,
          tradition: selectedTradition,
        },
        // onToken
        (token: string) => {
          accumulated += token;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId ? { ...m, content: accumulated } : m
            )
          );
        },
        // onMeta
        (meta: StreamMetaEvent) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    isStreaming: false,
                    mode: meta.mode,
                    citations: meta.citations,
                    source_labels: meta.source_labels,
                    similar: meta.similar,
                    safety_flag: meta.safety_flag,
                  }
                : m
            )
          );
          if (meta.citations && meta.citations.length > 0) {
            setShowCitationDrawer(true);
          }
        },
        // onError fallback
        async (streamErr: Error) => {
          console.warn("Falling back to POST /chat", streamErr);
          try {
            const resp = await sendChatMessage({
              session_id: sessionId,
              message: text,
              faith_on: faithOn,
              tradition: selectedTradition,
            });
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: resp.answer,
                      isStreaming: false,
                      mode: resp.mode,
                      citations: resp.citations,
                      source_labels: resp.source_labels,
                      similar: resp.similar,
                      safety_flag: resp.safety_flag,
                    }
                  : m
              )
            );
            if (resp.citations && resp.citations.length > 0) {
              setShowCitationDrawer(true);
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Service error";
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: `Something went wrong. ${msg}`,
                      isStreaming: false,
                    }
                  : m
              )
            );
          }
        },
        controller.signal
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = async () => {
    const sessionId = getSessionId();
    try {
      await clearSessionHistory(sessionId);
    } catch {}
    resetSessionId();
    setMessages([]);
  };

  // Find latest citations to show in right drawer
  const latestCitations: Citation[] =
    messages
      .slice()
      .reverse()
      .find((m) => m.role === "assistant" && m.citations && m.citations.length > 0)
      ?.citations || [
      {
        source: "Garuda Purana",
        translation: "Wood & Subrahmanyam (1911)",
        chapter: "Achara Kanda, Chapter 2",
        verse: "15",
        excerpt:
          "One should perform their duties with sincerity, without being driven only by desire or fear.",
      },
    ];

  return (
    <div className="min-h-screen bg-[#0d111a] text-[#f0f2f5] flex flex-col font-sans">
      {/* Top Header matching Image 1 */}
      <ChatHeader />

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col space-y-6">
        {/* Toggleable Hero Showcase */}
        {showHero && (
          <div className="relative">
            <button
              onClick={() => setShowHero(false)}
              className="absolute top-4 right-4 z-20 p-2 text-white bg-black/40 hover:bg-black/70 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <HeroLanding
              onStartChat={() => {
                setShowHero(false);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              onExploreCommunity={() => {
                setShowHero(false);
                setActiveTab("community");
              }}
            />
          </div>
        )}

        {/* 3-Tier Dashboard Grid Layout matching Image 1 */}
        <div className="flex items-start gap-5 w-full">
          {/* Left Column: Artwork & Navigation Sidebar */}
          <AppSidebar
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />

          {/* Center Main Stage Column */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* ========================================================
                STAGE 1: Wisdom Chat & Faith Guidance (Matching Image 1)
               ======================================================== */}
            <section className="rounded-2xl bg-[#151b26] border border-[#232c3f] p-5 shadow-xl space-y-4">
              {/* Header row: Badge 1, Title, Subtitle, Faith Toggle & Tradition Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232c3f]/70">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1e2536] border border-[#e6af2e]/50 flex items-center justify-center text-[#e6af2e] font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#f0f2f5]">
                      Wisdom Chat &amp; Faith Guidance
                    </h2>
                    <p className="text-xs text-[#94a3b8]">
                      Ask anything. Get thoughtful advice through the lens of ancient wisdom.
                    </p>
                  </div>
                </div>

                {/* Right controls: Faith toggle & Tradition dropdown */}
                <div className="flex items-center gap-3">
                  {/* Spiritual guidance toggle */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={faithOn}
                      onClick={() => handleFaithToggle(!faithOn)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        faithOn ? "bg-emerald-500" : "bg-[#232c3f]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          faithOn ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="text-[#cbd5e1] text-[11px] font-medium">
                      Spiritual guidance {faithOn ? "On" : "Off"}
                    </span>
                  </div>

                  {/* Tradition Selector Dropdown */}
                  {faithOn && (
                    <div className="relative">
                      <select
                        value={selectedTradition}
                        onChange={(e) => handleTraditionChange(e.target.value)}
                        className="appearance-none pl-7 pr-7 py-1 rounded-xl bg-[#0d111a] border border-[#232c3f] text-xs font-semibold text-[#f0f2f5] focus:outline-none focus:border-[#e6af2e]/60 cursor-pointer"
                      >
                        {traditions.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-serif text-[#e6af2e]">
                        ॐ
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94a3b8] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {messages.map((msg, idx) => (
                  <ChatMessageComponent
                    key={msg.id}
                    message={msg}
                    onOpenCitationDrawer={() => setShowCitationDrawer(true)}
                  />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 p-3 text-xs text-[#94a3b8] rounded-xl bg-[#0d111a] border border-[#232c3f] animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-[#e6af2e] animate-ping" />
                    <span>Contemplating ancient passages and preparing counsel...</span>
                  </div>
                )}
              </div>

              {/* Chat Input Floating in Stage 1 Panel */}
              <div className="pt-2">
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onClearHistory={handleClearHistory}
                  isLoading={isLoading}
                />
              </div>
            </section>

            {/* ========================================================
                STAGE 2: People Facing Something Similar (Matching Image 1)
               ======================================================== */}
            <SimilarProblemCards
              similar={messages[messages.length - 1]?.similar}
              userMessage={messages.find((m) => m.role === "user")?.content}
              onSelectPost={(postId) => {
                // Focus on community stage
                window.scrollTo({ top: 900, behavior: "smooth" });
              }}
            />

            {/* ========================================================
                STAGE 3: Anonymous Community (Matching Image 1)
               ======================================================== */}
            <CommunityFeed />
          </main>

          {/* Right Column: Verified Scripture Citations Drawer (Matching Image 1) */}
          {showCitationDrawer && (
            <div className="hidden xl:block">
              <ScriptureCitationDrawer
                citations={latestCitations}
                isOpen={showCitationDrawer}
                onClose={() => setShowCitationDrawer(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
