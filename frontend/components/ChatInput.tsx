"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowRight, Paperclip, Loader2, Trash2 } from "lucide-react";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      <div className="relative rounded-2xl bg-[#151b26] border border-[#232c3f] focus-within:border-[#e6af2e]/60 focus-within:ring-1 focus-within:ring-[#e6af2e]/30 shadow-2xl transition-all flex items-center px-3 py-1.5">
        {/* Paperclip attachment icon */}
        <button
          type="button"
          className="p-2 text-[#64748b] hover:text-[#94a3b8] rounded-xl transition-colors cursor-pointer"
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
          placeholder="Ask anything..."
          rows={1}
          className="flex-1 bg-transparent px-3 py-2 text-xs text-[#f0f2f5] placeholder-[#64748b] resize-none focus:outline-none disabled:opacity-50 max-h-36 leading-relaxed"
        />

        {/* Right Action: Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !text.trim() || disabled}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e6af2e] to-amber-600 hover:from-[#f5be42] hover:to-amber-500 text-[#0d111a] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-[#e6af2e]/20 shrink-0 cursor-pointer"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0d111a]" />
          ) : (
            <ArrowRight className="w-4 h-4 text-[#0d111a] stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
};
