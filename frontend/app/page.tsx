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
import {
  streamChatMessage,
  sendChatMessage,
  clearSessionHistory,
  fetchTraditions,
} from "@/lib/chat";
import {
  Sparkles,
  RefreshCw,
  Lock,
  ChevronDown,
  BookOpen,
  Compass,
} from "lucide-react";

const INITIAL_DEMO_MESSAGES: ChatMessage[] = [
  {
    id: "msg_user_demo",
    role: "user",
    content:
      "I have been carrying deep anxiety about failing my family's expectations while trying to pursue an authentic path. How do I navigate this duty without losing myself?",
    timestamp: "2026-10-18T11:44:00.000Z",
  },
  {
    id: "msg_asst_demo",
    role: "assistant",
    content:
      "It is natural to feel torn between honoring the sacrifices of those who raised you and staying true to your inner calling. Ancient traditions remind us that true duty (dharma) is not passive martyrdom. When you conform to an external role out of fear or guilt, you diminish both yourself and the lineage you seek to honor.",
    timestamp: "2026-10-18T11:44:08.000Z",
    mode: "grounded",
    citations: [
      {
        source: "Bhagavad Gita",
        translation: "Swami Gambhirananda",
        chapter: "Chapter 3",
        verse: "35",
        excerpt:
          "Better is one’s own duty, though devoid of merit, than the duty of another well performed. The duty of another brings fear and distortion.",
      },
    ],
    source_labels: ["scripture", "ai_suggestion"],
  },
];

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_DEMO_MESSAGES);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [faithOn, setFaithOn] = useState<boolean>(true);
  const [selectedTradition, setSelectedTradition] = useState<string>("bhagavad_gita");
  const [traditions, setTraditions] = useState<Array<{ id: string; name: string }>>([
    { id: "bhagavad_gita", name: "Bhagavad Gita" },
    { id: "dhammapada", name: "Dhammapada" },
    { id: "stoicism", name: "Stoicism" },
    { id: "garuda_purana", name: "Garuda Purana" },
  ]);
  const [showCitationDrawer, setShowCitationDrawer] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [initialInputPrompt, setInitialInputPrompt] = useState<string>("");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize preferences & traditions
  useEffect(() => {
    const prefs = getSavedPreferences();
    setFaithOn(prefs.faith_on);
    if (prefs.tradition) setSelectedTradition(prefs.tradition);

    async function load() {
      try {
        const list = await fetchTraditions();
        if (list && list.length > 0) setTraditions(list);
      } catch {
        // Keep initial fallback traditions
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

  const latestCitations: Citation[] =
    messages
      .slice()
      .reverse()
      .find((m) => m.role === "assistant" && m.citations && m.citations.length > 0)
      ?.citations || [
      {
        source: "Bhagavad Gita",
        translation: "Swami Gambhirananda",
        chapter: "Chapter 3",
        verse: "35",
        excerpt:
          "Better is one’s own duty, though devoid of merit, than the duty of another well performed.",
      },
    ];

  return (
    <div className="min-h-screen bg-[#10131b] text-[#e0e2ee] flex flex-col font-body">
      {/* Stitch Navigation Header */}
      <ChatHeader />

      {/* Top In-Page Controls & Session Ribbon from Stitch wisdom_chat_aparichit */}
      <div className="w-full bg-[#181b24]/80 backdrop-blur-md border-b border-[#232b3e] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Tradition Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto py-0.5 scrollbar-none">
            <span className="font-label text-xs text-[#99907c] uppercase tracking-wider hidden lg:inline mr-1">
              Tradition:
            </span>
            {traditions.map((t) => {
              const active = selectedTradition === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => handleTraditionChange(t.id)}
                  className={`px-3.5 py-1.5 rounded-full font-label text-xs whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-[#272a33] text-[#f2ca50] shadow-sm font-semibold border border-[#d4af37]/40"
                      : "bg-[#181b24] hover:bg-[#1d1f28] text-[#d0c5af] hover:text-[#e0e2ee] border border-[#232b3e]"
                  }`}
                >
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] animate-pulse" />
                  )}
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Right Meta Controls: Spiritual Guidance, Ephemeral State, New Inquest */}
          <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-3.5">
            {/* Spiritual Guidance Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={faithOn}
                  onChange={(e) => handleFaithToggle(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#32353e] rounded-full peer peer-checked:bg-[#d4af37] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#e0e2ee] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full peer-checked:after:bg-[#0b0e16]" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-label text-xs text-[#e0e2ee] font-medium group-hover:text-[#f2ca50] transition-colors">
                  Spiritual Hermeneutics
                </span>
                <span className="font-label text-[10px] text-[#99907c] leading-none">
                  {faithOn ? "Rich Context On" : "Direct Context Off"}
                </span>
              </div>
            </label>

            {/* Ephemeral Seeker Badge */}
            <div className="hidden sm:flex items-center gap-1.5 py-1 px-3 rounded-full bg-[#1d1f28] border border-[#232b3e] text-[#d0c5af]">
              <Lock className="w-3.5 h-3.5 text-[#f2ca50]" />
              <span className="font-label text-xs text-[#99907c] tracking-wider">
                #seeker-842
              </span>
            </div>

            {/* New Inquest */}
            <button
              onClick={handleClearHistory}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-[#181b24] hover:bg-[#272a33] border border-[#232b3e] text-[#e0e2ee] transition-all flex items-center gap-1.5 shadow-sm group cursor-pointer text-xs"
              title="Start a fresh anonymous session"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#f2ca50] group-hover:rotate-90 transition-transform" />
              <span className="hidden sm:inline font-label">New Inquest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backend Sync Indicator (Subtle Connection Pulse from Stitch) */}
      <div className="w-full flex justify-center py-2 bg-[#10131b]">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181b24]/70 border border-[#232b3e] text-[#99907c] font-label text-[11px]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f2ca50] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f2ca50]" />
          </span>
          <span>Oracle Sync Active • Zero-Knowledge Telemetry</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col space-y-6">
        {/* Navigation Sidebar & Stage Layout */}
        <div className="flex items-start gap-6 w-full">
          {/* Left Column: Artwork & Navigation Sidebar */}
          <AppSidebar
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab)}
          />

          {/* Center Main Stage Column */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* View Tab Switcher: HOME / HERO VIEW */}
            {activeTab === "home" && (
              <HeroLanding
                onStartChat={(prompt) => {
                  if (prompt) setInitialInputPrompt(prompt);
                  setActiveTab("chat");
                }}
                onExploreCommunity={() => setActiveTab("community")}
              />
            )}

            {/* View Tab Switcher: CHAT STAGE */}
            {activeTab === "chat" && (
              <section className="rounded-2xl bg-[#181b24] border border-[#232b3e] p-5 sm:p-6 shadow-xl space-y-5">
                {/* Stage Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#232b3e]/70">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[#272a33] border border-[#d4af37]/40 flex items-center justify-center text-[#f2ca50] font-headline font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <h2 className="font-headline text-base sm:text-lg font-semibold text-[#e0e2ee]">
                        Wisdom Chat &amp; Faith Guidance
                      </h2>
                      <p className="font-body text-xs text-[#99907c]">
                        Inquire into life dilemmas with classical scripture citations and philosophical synthesis.
                      </p>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-xs font-label text-[#f2ca50]">
                    <Sparkles className="w-4 h-4" />
                    <span>Hermeneutic Oracle</span>
                  </div>
                </div>

                {/* Session Start Ornament from Stitch wisdom_chat_aparichit */}
                <div className="flex flex-col items-center justify-center gap-1.5 text-center py-2 opacity-75">
                  <div className="w-7 h-7 rounded-full bg-[#272a33] border border-[#32353e] flex items-center justify-center text-[#f2ca50] shadow-sm">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <p className="font-label text-[11px] text-[#99907c] uppercase tracking-widest">
                    Sanctuary Opened • Today
                  </p>
                  <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#f2ca50]/30 to-transparent" />
                </div>

                {/* Chat Message Stream */}
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {messages.map((msg, idx) => (
                    <ChatMessageComponent
                      key={msg.id || idx}
                      message={msg}
                      previousUserMessage={
                        idx > 0 && messages[idx - 1].role === "user"
                          ? messages[idx - 1].content
                          : undefined
                      }
                      onOpenCitationDrawer={() => setShowCitationDrawer(true)}
                    />
                  ))}
                </div>

                {/* Bottom Input Field */}
                <ChatInput
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="Ask a question about duty, conflict, grief, or purpose..."
                />
              </section>
            )}

            {/* View Tab Switcher: COMMUNITY FEED */}
            {activeTab === "community" && <CommunityFeed />}

            {/* STAGE 2: People Facing Something Similar */}
            <SimilarProblemCards onSelectPost={() => setActiveTab("community")} />
          </main>

          {/* Right Column: Scripture Citations Drawer */}
          {showCitationDrawer && (
            <aside className="w-80 shrink-0 hidden xl:block">
              <ScriptureCitationDrawer
                citations={latestCitations}
                onClose={() => setShowCitationDrawer(false)}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Google Stitch Contemplative Sanctuary Footer */}
      <footer className="w-full bg-[#0b0e16] border-t border-[#232b3e] mt-auto">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-headline text-sm font-semibold text-[#f2ca50] tracking-wide">
                APARICHIT
              </span>
              <span className="font-body text-xs text-[#99907c]">
                — Ethical Sanctuary
              </span>
            </div>
            <p className="font-headline text-xs text-[#d0c5af] italic text-center md:text-left">
              “Bridging timeless insight and human solace”
            </p>
            <p className="font-label text-[11px] text-[#99907c]">
              © 2026 APARICHIT. All queries remain strictly ephemeral and private.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("chat")}
              className="font-label text-xs text-[#d0c5af] hover:text-[#f2ca50] transition-colors cursor-pointer"
            >
              Ethical AI
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="font-label text-xs text-[#d0c5af] hover:text-[#f2ca50] transition-colors cursor-pointer"
            >
              Traditions
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className="font-label text-xs text-[#d0c5af] hover:text-[#f2ca50] transition-colors cursor-pointer"
            >
              Privacy First
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
