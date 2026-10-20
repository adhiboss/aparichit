"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled,
  placeholder = "Reflect on a dilemma, ask for guidance, or explore a philosophical principle...",
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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
    <div className="w-full">
      <div className="relative rounded-xl bg-[#242830] border border-[#2E333D] focus-within:border-[#B69A61]/60 transition-colors flex items-end p-2.5 sm:p-3 gap-2">
        {/* Input Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent px-2 py-1 text-base text-[#E7E1D5] placeholder-[#6C717D] resize-none focus:outline-none disabled:opacity-50 max-h-40 leading-relaxed"
        />

        {/* Send Action Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={isLoading || !text.trim() || disabled}
          className="h-9 w-9 rounded-lg bg-[#B69A61] hover:bg-[#C7AC72] text-[#171A1F] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#171A1F]" />
          ) : (
            <Send className="w-4 h-4 text-[#171A1F] fill-current" />
          )}
        </button>
      </div>
    </div>
  );
};
