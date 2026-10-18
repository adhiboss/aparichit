"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Loader2 } from "lucide-react";

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
  placeholder = "Tell us what's on your mind...",
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
      <div className="relative rounded-2xl bg-[#201913] border border-[#362c22] focus-within:border-[#e59a27] focus-within:ring-1 focus-within:ring-[#e59a27]/30 shadow-2xl transition-all flex items-center px-3.5 py-2">
        {/* Attachment icon */}
        <button
          type="button"
          className="p-1.5 text-[#7a6e5e] hover:text-[#e59a27] rounded-xl transition-colors cursor-pointer"
          title="Attach context (optional)"
          aria-label="Attach context"
        >
          <Paperclip className="w-4 h-4" />
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
          className="flex-1 bg-transparent px-3 py-1.5 font-body text-xs sm:text-sm text-[#f2ede4] placeholder-[#7a6e5e] resize-none focus:outline-none disabled:opacity-50 max-h-36 leading-relaxed"
        />

        {/* Right Action: Warm Golden Send Button from image */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !text.trim() || disabled}
          className="w-9 h-9 rounded-xl bg-[#e59a27] hover:bg-[#f0a83b] text-[#140e06] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#e59a27]/25 shrink-0 cursor-pointer"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#140e06]" />
          ) : (
            <Send className="w-4 h-4 text-[#140e06] fill-current" />
          )}
        </button>
      </div>
    </div>
  );
};
