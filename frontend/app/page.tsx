"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage as ChatMessageComponent } from "@/components/ChatMessage";
import { ScriptureCitationDrawer } from "@/components/ScriptureCitationDrawer";
import { SimilarProblemCards } from "@/components/SimilarProblemCards";
import { CommunityFeed } from "@/components/CommunityFeed";
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

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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
  const [showCitationDrawer, setShowCitationDrawer] = useState<boolean>(false);
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
        translation: "Edwin Arnold 1885 / The Song Celestial",
        chapter: "Chapter 2",
        verse: "47",
        excerpt:
          "Thy right is to the work alone, never to its fruits; let not the fruits of action be thy motive, nor let thy attachment be to inaction.",
        context:
          "Krishna explains to Arjuna the doctrine of Nishkama Karma: acting without anxious obsession over praise, blame, or future rewards.",
      },
    ];

  return (
    <div className="min-h-screen bg-[#171A1F] text-[#E7E1D5] flex flex-col font-body">
      {/* Refined Top Navigation Header */}
      <ChatHeader
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Main Content Area */}
      <div className="flex-1 w-full flex flex-col">
        {/* VIEW: HOMEPAGE / CHAT STAGE */}
        {(activeTab === "chat" || activeTab === "home") && (
          <div className="w-full flex flex-col flex-1">
            {/* Cinematic Hero Section with Sunset Landscape Background */}
            <section className="relative w-full overflow-hidden bg-[#171A1F]">
              {/* Background Image Container */}
              <div className="absolute inset-0 -z-10">
                <Image
                  src="/images/hero_sunset.jpg"
                  alt="Ancient temple sanctuary at golden sunset"
                  fill
                  priority
                  className="object-cover object-center"
                />
                {/* Subtle dark charcoal overlay with gradients for text contrast */}
                <div className="absolute inset-0 bg-[#171A1F]/65" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#171A1F]/85 via-[#171A1F]/45 to-[#171A1F]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(23,26,31,0.75)_0%,_rgba(23,26,31,0.25)_60%,_rgba(23,26,31,0.85)_100%)] pointer-events-none" />
              </div>

              {/* Centered Hero Content */}
              <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 flex flex-col items-center text-center relative z-10">
                {/* Main Headline */}
                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#E7E1D5] tracking-tight leading-[1.15] max-w-2xl font-normal drop-shadow-sm">
                  Find perspective in life&apos;s difficult moments.
                </h1>

                {/* Supporting Text */}
                <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#E7E1D5]/90 max-w-xl font-light leading-relaxed">
                  Ask your questions, explore philosophical wisdom, or learn from real experiences — anonymously.
                </p>

                {/* Spiritual Guidance Toggle & Tradition Selector */}
                <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 bg-[#171A1F]/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#2E333D]/70 shadow-lg">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={faithOn}
                      onClick={() => handleFaithToggle(!faithOn)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150 ease-in-out focus:outline-none ${
                        faithOn ? "bg-[#B69A61]" : "bg-[#242830] border border-[#2E333D]"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-[#171A1F] transition duration-150 ease-in-out ${
                          faithOn ? "translate-x-4.5" : "translate-x-0.5"
                        } mt-[2px]`}
                      />
                    </button>
                    <span className="text-xs text-[#9EA3AF]">
                      Spiritual guidance:{" "}
                      <span className="text-[#E7E1D5] font-medium">
                        {faithOn ? "On (ॐ)" : "Off"}
                      </span>
                    </span>
                  </div>

                  <div className="h-3.5 w-[1px] bg-[#2E333D]" />

                  <TraditionDropdown
                    traditions={traditions}
                    selectedId={selectedTradition}
                    onSelect={handleTraditionChange}
                  />
                </div>

                {/* Main Chat Input */}
                <div className="mt-6 w-full max-w-2xl sm:max-w-3xl">
                  <ChatInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    placeholder="Ask for guidance, share a dilemma, or explore a philosophical principle..."
                    initialValue={initialInputPrompt}
                  />
                </div>

                {/* Three Suggested Prompts */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-2xl">
                  {[
                    "How do I handle burnout without losing purpose?",
                    "Finding detachment in high-stakes decisions",
                    "How to navigate guilt and duty?",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="px-3.5 py-1.5 rounded-full bg-[#171A1F]/80 hover:bg-[#242830] border border-[#2E333D] hover:border-[#B69A61]/50 text-xs text-[#9EA3AF] hover:text-[#E7E1D5] transition-colors cursor-pointer text-left backdrop-blur-sm"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Conversation Messages Section (Rendered when messages exist) */}
            {messages.length > 0 && (
              <section className="w-full bg-[#171A1F] py-8 border-t border-[#242830]">
                <div className="max-w-3xl w-full mx-auto px-5 sm:px-8 flex flex-col">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#242830]">
                    <span className="text-xs uppercase tracking-wider text-[#9EA3AF]">
                      Active Reflection
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-xs text-[#9EA3AF] hover:text-[#E7E1D5] transition-colors cursor-pointer"
                    >
                      New Conversation
                    </button>
                  </div>

                  <div className="space-y-6">
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
                </div>
              </section>
            )}

            {/* Community Section: People Facing Similar Dilemmas */}
            <section className="w-full bg-[#171A1F] py-12 sm:py-16 border-t border-[#242830]">
              <div className="max-w-3xl mx-auto px-5 sm:px-8">
                <SimilarProblemCards onSelectPost={() => setActiveTab("community")} />
              </div>
            </section>
          </div>
        )}

        {/* VIEW: COMMUNITY FEED */}
        {activeTab === "community" && (
          <main className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-8">
            <CommunityFeed />
          </main>
        )}

        {/* VIEW: SACRED SCRIPTURE WISDOM LIBRARY */}
        {activeTab === "library" && (
          <main className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-8">
            <ScriptureLibrary
              initialTraditionId={selectedTradition}
              onConsultVerse={(verseText, tradName) => {
                setInitialInputPrompt(
                  `How can I apply the wisdom of ${tradName} to my situation regarding this verse: "${verseText}"?`
                );
                setActiveTab("chat");
              }}
            />
          </main>
        )}

        {/* VIEW: ANONYMOUS PROFILE & PRIVACY SANCTUARY */}
        {activeTab === "profile" && (
          <main className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-8">
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
          </main>
        )}
      </div>

      {/* Collapsible Scripture Citation Slide-over Drawer */}
      <ScriptureCitationDrawer
        citations={latestCitations}
        isOpen={showCitationDrawer}
        onClose={() => setShowCitationDrawer(false)}
        onViewInLibrary={(tradId) => {
          if (tradId) setSelectedTradition(tradId);
          setActiveTab("library");
        }}
      />

      {/* Refined Editorial Footer */}
      <footer className="w-full bg-[#171A1F] border-t border-[#242830] mt-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6C717D]">
          <div className="flex items-center gap-2">
            <span className="font-headline font-medium text-[#E7E1D5]">
              APARICHIT
            </span>
            <span>—</span>
            <span>Ancient Wisdom for Modern Dilemmas</span>
          </div>
          <div>All queries are processed anonymously with complete privacy.</div>
        </div>
      </footer>
    </div>
  );
}
