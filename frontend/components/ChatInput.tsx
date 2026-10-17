"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Paperclip, Loader2, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onClearHistory?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onClearHistory,
  isLoading,
  disabled,
  placeholder = "Ask anything about duty, conflict, grief, or purpose...",
  initialValue = "",
}) => {
  const [text, setText] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
    }
  }, [initialValue]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
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
    <div className="relative w-full">
      <div className="relative rounded-2xl bg-[#10131b] border border-[#232b3e] focus-within:border-[#d4af37] focus-within:ring-1 focus-within:ring-[#d4af37]/30 shadow-2xl transition-all flex items-center px-3.5 py-2">
        {/* Sparkles / Context icon */}
        <button
          type="button"
          className="p-1.5 text-[#99907c] hover:text-[#f2ca50] rounded-xl transition-colors cursor-pointer"
          title="Sanctuary Inquiry"
          aria-label="Sanctuary Inquiry"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent px-3 py-1.5 font-body text-xs sm:text-sm text-[#e0e2ee] placeholder-[#99907c] resize-none focus:outline-none disabled:opacity-50 max-h-36 leading-relaxed"
        />

        {/* Right Action: Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !text.trim() || disabled}
          className="w-9 h-9 rounded-xl bg-[#d4af37] hover:bg-[#f2ca50] text-[#0b0e16] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#d4af37]/25 shrink-0 cursor-pointer"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0b0e16]" />
          ) : (
            <ArrowRight className="w-4 h-4 text-[#0b0e16] stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
};
