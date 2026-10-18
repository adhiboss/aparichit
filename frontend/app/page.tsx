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
import { TraditionDropdown } from "@/components/TraditionDropdown";
import { ScriptureLibrary } from "@/components/ScriptureLibrary";
import { UserProfile } from "@/components/UserProfile";
import { ChatMessage, Citation, StreamMetaEvent, TraditionItem } from "@/lib/types";
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
      "I feel lost in my career. I don't know what to do. I feel like I'm disappointing my parents. What should I do?",
    timestamp: "2026-10-18T10:24:00.000Z",
  },
  {
    id: "msg_asst_demo",
    role: "assistant",
    content:
      "It's completely understandable to feel lost in your career, especially when you care deeply about your parents' expectations. The Bhagavad Gita offers a perspective that can bring clarity in such moments.\n\n1. Finding Clarity\nConfusion often arises when we focus only on the outcome. The Gita reminds us to focus on our duties, our abilities, and sincere effort, rather than being overwhelmed by others' expectations.\n\n2. A Balanced Approach\nTake time to reflect on what truly interests you and what you are naturally good at. It is possible to respect your parents' wishes while also choosing a path that aligns with your values.\n\n3. Next Steps\n• Reflect on your strengths and interests.\n• Have an honest conversation with your parents.\n• Take small steps towards gaining clarity (explore, learn, and seek guidance).",
    timestamp: "2026-10-18T10:24:08.000Z",
    mode: "grounded",
    citations: [
      {
        source: "Bhagavad Gita",
        translation: "Swami Sivananda",
        chapter: "Chapter 2",
        verse: "47",
        excerpt:
          "You have the right to perform your prescribed duty, but you are not entitled to the fruits of your actions.",
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
  const [traditions, setTraditions] = useState<TraditionItem[]>([
    {
      id: "garuda_purana",
      name: "Garuda Purana",
      translation: "Wood & Subrahmanyam 1911",
      description: "Classical Hindu dialogue on karma and moral duty.",
    },
    {
      id: "bhagavad_gita",
      name: "Bhagavad Gita",
      translation: "Edwin Arnold 1885",
      description: "Dialogue between Krishna and Arjuna on selfless action.",
    },
    {
      id: "dhammapada",
      name: "Dhammapada",
      translation: "Max Müller 1881",
      description: "Early Buddhist verses of wisdom on mental discipline.",
    },
    {
      id: "stoicism",
      name: "Meditations (Stoicism)",
      translation: "George Long 1862",
      description: "Marcus Aurelius's reflections on personal virtue.",
    },
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

    if (typeof window !== "undefined") {
      const storedPrompt = sessionStorage.getItem("aparichit_initial_prompt");
      if (storedPrompt) {
        setInitialInputPrompt(storedPrompt);
        sessionStorage.removeItem("aparichit_initial_prompt");
      }
    }

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
      mode: "grounded",
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
        translation: "Swami Sivananda",
        chapter: "Chapter 2",
        verse: "47",
        excerpt:
          "You have the right to perform your prescribed duty, but you are not entitled to the fruits of your actions.",
      },
    ];

  return (
    <div className="min-h-screen bg-[#14120e] text-[#f2ede4] flex flex-col font-body">
      {/* Top Navigation Header */}
      <ChatHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Container */}
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-6">
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
              <section className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-5 sm:p-6 shadow-2xl space-y-5">
                {/* Header Controls inside Chat Box from image: Spiritual guidance toggle + Tradition dropdown */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#362c22]/70">
                  {/* Left: Spiritual Guidance Toggle */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={faithOn}
                      onClick={() => handleFaithToggle(!faithOn)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        faithOn ? "bg-[#e59a27]" : "bg-[#29211a]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#140e06] shadow ring-0 transition duration-200 ease-in-out ${
                          faithOn ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col text-left">
                      <span className="font-label text-xs sm:text-sm text-[#f2ede4] font-medium">
                        Spiritual guidance
                      </span>
                      <span className="font-label text-[11px] text-[#e59a27]">
                        {faithOn ? "On ॐ" : "Off"}
                      </span>
                    </div>
                  </div>

                  {/* Right: Custom Designed Tradition Dropdown (Replacing native OS select) */}
                  <div className="flex items-center gap-2.5">
                    <span className="font-label text-xs text-[#b5aa9b] hidden sm:inline">
                      Choose a tradition
                    </span>
                    <TraditionDropdown
                      traditions={traditions}
                      selectedId={selectedTradition}
                      onSelect={handleTraditionChange}
                    />
                  </div>
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
                  placeholder="Tell us what's on your mind..."
                  initialValue={initialInputPrompt}
                />
              </section>
            )}

            {/* View Tab Switcher: COMMUNITY FEED */}
            {activeTab === "community" && <CommunityFeed />}

            {/* View Tab Switcher: SACRED SCRIPTURE WISDOM LIBRARY */}
            {activeTab === "library" && (
              <ScriptureLibrary
                initialTraditionId={selectedTradition}
                onConsultVerse={(verseText, tradName) => {
                  setInitialInputPrompt(
                    `How can I apply the wisdom of ${tradName} to my situation regarding this verse: "${verseText}"?`
                  );
                  setActiveTab("chat");
                }}
              />
            )}

            {/* View Tab Switcher: ANONYMOUS PROFILE & PRIVACY SANCTUARY */}
            {activeTab === "profile" && (
              <UserProfile
                onStartChat={(prompt) => {
                  if (prompt) setInitialInputPrompt(prompt);
                  setActiveTab("chat");
                }}
                onExploreLibrary={() => setActiveTab("library")}
                onExploreCommunity={() => setActiveTab("community")}
                onPreferencesUpdated={(p) => {
                  setFaithOn(p.faith_on);
                  setSelectedTradition(p.tradition);
                }}
              />
            )}

            {/* People Facing Something Similar */}
            <SimilarProblemCards onSelectPost={() => setActiveTab("community")} />
          </main>

          {/* Right Column: Verified Scripture Citation Drawer */}
          {showCitationDrawer && (
            <aside className="w-80 shrink-0 hidden xl:block">
              <ScriptureCitationDrawer
                citations={latestCitations}
                onClose={() => setShowCitationDrawer(false)}
                onViewInLibrary={(tradId) => {
                  if (tradId) setSelectedTradition(tradId);
                  setActiveTab("library");
                }}
              />
            </aside>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full bg-[#0e0c0a] border-t border-[#362c22] mt-auto">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <span className="font-headline text-sm font-semibold text-[#e59a27] tracking-wide">
                APARICHIT
              </span>
              <span className="font-body text-xs text-[#7a6e5e]">
                — Ethical Sanctuary
              </span>
            </div>
            <p className="font-headline text-xs text-[#b5aa9b] italic text-center md:text-left">
              “Bridging timeless insight and human solace”
            </p>
            <p className="font-label text-[11px] text-[#7a6e5e]">
              © 2026 APARICHIT. All queries remain strictly ephemeral and private.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab("chat")}
              className="font-label text-xs text-[#b5aa9b] hover:text-[#e59a27] transition-colors cursor-pointer"
            >
              Ethical AI
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className="font-label text-xs text-[#b5aa9b] hover:text-[#e59a27] transition-colors cursor-pointer"
            >
              Traditions
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className="font-label text-xs text-[#b5aa9b] hover:text-[#e59a27] transition-colors cursor-pointer"
            >
              Privacy First
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
