"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatHeader } from "@/components/ChatHeader";
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
      "It is completely natural to feel unmoored when your own sense of vocation seems at odds with the hopes of those who raised you. The ancient tradition of the Bhagavad Gita addresses this exact threshold of paralysis: when we confuse who we are with the external outcome of our actions.\n\n1. Finding Clarity\nConfusion often arises when we fixate entirely on results that we cannot control. The Gita advises returning focus to what is within your hands: your authentic effort, sincerity of purpose, and inner duty (svadharma), rather than the fear of external judgment.\n\n2. A Balanced Approach\nTake quiet time to distinguish between what is expected of you and what you are uniquely built to offer. Honoring your parents does not require erasing your authenticity—it begins by expressing your dedication through sincere effort and calm communication.\n\n3. Next Steps\n• Reflect on your core strengths and honest interests.\n• Initiate a calm, non-defensive conversation with your family.\n• Take small, deliberate actions toward gaining clarity rather than trying to solve the entire horizon at once.",
    timestamp: "2026-10-18T10:24:08.000Z",
    mode: "grounded",
    citations: [
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
        {/* VIEW: CHAT STAGE (One Wide, Centered Column) */}
        {activeTab === "chat" && (
          <main className="max-w-3xl w-full mx-auto px-5 sm:px-8 py-8 flex flex-col flex-1">
            {/* Top Toolbar: Guidance Mode & Tradition Dropdown */}
            <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#242830]">
              <div className="flex items-center gap-4">
                {/* Spiritual Guidance Toggle */}
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
                  <span className="text-xs text-[#9E9CA3]">
                    Spiritual guidance:{" "}
                    <span className="text-[#E7E1D5]">
                      {faithOn ? "On (ॐ)" : "Off"}
                    </span>
                  </span>
                </div>

                <div className="h-3.5 w-[1px] bg-[#282D37]" />

                {/* Tradition Dropdown */}
                <TraditionDropdown
                  traditions={traditions}
                  selectedId={selectedTradition}
                  onSelect={handleTraditionChange}
                />
              </div>

              {/* Clear / New Conversation Action */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs text-[#6C717D] hover:text-[#E7E1D5] transition-colors cursor-pointer"
                >
                  New Conversation
                </button>
              )}
            </div>

            {/* Conversation Messages */}
            <div className="space-y-6 flex-1">
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

            {/* Chat Input Section */}
            <div className="sticky bottom-4 z-20 pt-6 mt-4 bg-gradient-to-t from-[#171A1F] via-[#171A1F]/95 to-transparent">
              <ChatInput
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                placeholder="Ask for guidance, share a dilemma, or explore a philosophical principle..."
                initialValue={initialInputPrompt}
              />
            </div>

            {/* People Facing Similar Dilemmas */}
            <SimilarProblemCards onSelectPost={() => setActiveTab("community")} />
          </main>
        )}

        {/* VIEW: HOME VIEW */}
        {activeTab === "home" && (
          <main className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-8">
            <HeroLanding
              onStartChat={(prompt) => {
                if (prompt) setInitialInputPrompt(prompt);
                setActiveTab("chat");
              }}
              onExploreCommunity={() => setActiveTab("community")}
            />
          </main>
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
