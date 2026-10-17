"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChatHeader } from "@/components/ChatHeader";
import { FaithControls } from "@/components/FaithControls";
import { ChatThread } from "@/components/ChatThread";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage, StreamMetaEvent } from "@/lib/types";
import {
  getSessionId,
  resetSessionId,
  getSavedPreferences,
  savePreferences,
} from "@/lib/storage";
import { streamChatMessage, sendChatMessage, clearSessionHistory } from "@/lib/chat";

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [faithOn, setFaithOn] = useState<boolean>(false);
  const [selectedTradition, setSelectedTradition] = useState<string>("garuda_purana");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const prefs = getSavedPreferences();
    setFaithOn(prefs.faith_on);
    setSelectedTradition(prefs.tradition);
  }, []);

  const handleFaithToggle = (enabled: boolean) => {
    setFaithOn(enabled);
    savePreferences({ faith_on: enabled });
  };

  const handleTraditionChange = (traditionId: string) => {
    setSelectedTradition(traditionId);
    savePreferences({ tradition: traditionId });
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessageId = `user_${Date.now()}`;
    const assistantMessageId = `assistant_${Date.now()}`;
    const sessionId = getSessionId();

    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const initialAssistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      isStreaming: true,
      mode: "inspired",
    };

    setMessages((prev) => [...prev, userMessage, initialAssistantMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedAnswer = "";

    try {
      await streamChatMessage(
        {
          session_id: sessionId,
          message: text,
          faith_on: faithOn,
          tradition: selectedTradition,
        },
        // onToken callback
        (token: string) => {
          accumulatedAnswer += token;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, content: accumulatedAnswer }
                : msg
            )
          );
        },
        // onMeta completion callback
        (meta: StreamMetaEvent) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    isStreaming: false,
                    mode: meta.mode,
                    citations: meta.citations,
                    source_labels: meta.source_labels,
                    similar: meta.similar,
                    safety_flag: meta.safety_flag,
                  }
                : msg
            )
          );
        },
        // onError callback
        async (streamErr: Error) => {
          console.warn("Streaming error, falling back to standard POST /chat", streamErr);
          try {
            // Fallback to standard /chat
            const fallbackResponse = await sendChatMessage({
              session_id: sessionId,
              message: text,
              faith_on: faithOn,
              tradition: selectedTradition,
            });

            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: fallbackResponse.answer,
                      isStreaming: false,
                      mode: fallbackResponse.mode,
                      citations: fallbackResponse.citations,
                      source_labels: fallbackResponse.source_labels,
                      similar: fallbackResponse.similar,
                      safety_flag: fallbackResponse.safety_flag,
                    }
                  : msg
              )
            );
          } catch (fallbackErr: unknown) {
            const errorMsg =
              fallbackErr instanceof Error
                ? fallbackErr.message
                : "Unable to reach APARICHIT counsel. Please check server connection.";
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: `Something went wrong. ${errorMsg}`,
                      isStreaming: false,
                    }
                  : msg
              )
            );
          }
        },
        controller.signal
      );
    } catch (err: unknown) {
      console.error("Top-level send error", err);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleClearHistory = async () => {
    const sessionId = getSessionId();
    try {
      await clearSessionHistory(sessionId);
    } catch (err) {
      console.warn("Could not clear server session memory", err);
    }
    resetSessionId();
    setMessages([]);
  };

  const handleSelectPost = (postId: string) => {
    router.push(`/community?post_id=${encodeURIComponent(postId)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0f17] text-[#f0f2f5]">
      {/* Top Header */}
      <ChatHeader />

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 py-4 space-y-4">
        {/* Faith Guidance Controls Accordion / Panel */}
        <FaithControls
          faithOn={faithOn}
          onFaithToggle={handleFaithToggle}
          selectedTradition={selectedTradition}
          onTraditionChange={handleTraditionChange}
        />

        {/* Message Thread */}
        <ChatThread
          messages={messages}
          isLoading={isLoading}
          onSelectPrompt={(prompt) => handleSendMessage(prompt)}
          onSelectPost={handleSelectPost}
        />

        {/* Chat Input Floating at Bottom */}
        <div className="sticky bottom-4 pt-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            onClearHistory={handleClearHistory}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
