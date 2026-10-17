"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Trash2, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearHistory,
  isLoading,
  disabled,
}) => {
  const [text, setText] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || disabled) return;
    onSendMessage(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto space-y-2">
      {/* Clear History Confirmation Drawer */}
      {showClearConfirm && (
        <div className="p-3 rounded-xl bg-[#171c28] border border-[#232c3f] flex items-center justify-between text-xs text-[#cbd5e1] animate-in fade-in duration-150">
          <span>Are you sure you want to clear your current conversation history?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-2.5 py-1 rounded bg-[#232c3f] hover:bg-[#2e394f] text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setShowClearConfirm(false);
                onClearHistory();
              }}
              className="px-2.5 py-1 rounded bg-red-600/80 hover:bg-red-600 text-white font-medium transition-colors"
            >
              Confirm Clear
            </button>
          </div>
        </div>
      )}

      {/* Main Input Box */}
      <div className="relative rounded-2xl bg-[#171c28] border border-[#232c3f] focus-within:border-[#e6af2e] focus-within:ring-1 focus-within:ring-[#e6af2e] shadow-xl transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Tell us what's on your mind"
          rows={1}
          className="w-full pl-4 pr-24 py-3.5 bg-transparent text-sm text-[#f0f2f5] placeholder-[#64748b] resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed max-h-48"
        />

        {/* Action Controls */}
        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            disabled={isLoading || disabled}
            title="Clear conversation"
            className="p-2 text-[#64748b] hover:text-[#94a3b8] hover:bg-[#232c3f] rounded-xl transition-colors disabled:opacity-30"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !text.trim() || disabled}
            className="p-2 rounded-xl bg-[#e6af2e] hover:bg-[#d4af37] text-[#0c0f17] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#e6af2e]/10"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#0c0f17]" />
            ) : (
              <Send className="w-4 h-4 text-[#0c0f17]" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 text-[11px] text-[#64748b]">
        <span>Press Enter to send, Shift + Enter for a new line</span>
        <span className="flex items-center gap-1 text-[#e6af2e]/70">
          <Sparkles className="w-3 h-3" />
          <span>APARICHIT AI Advisor</span>
        </span>
      </div>
    </div>
  );
};
