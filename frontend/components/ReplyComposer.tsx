"use client";

import React, { useState } from "react";
import { Send, Loader2, AlertCircle } from "lucide-react";
import { createPostReply } from "@/lib/posts";
import { getSavedAccount } from "@/lib/storage";
import { PostReply } from "@/lib/types";

interface ReplyComposerProps {
  postId: string;
  onReplyAdded: (reply: PostReply) => void;
}

export const ReplyComposer: React.FC<ReplyComposerProps> = ({
  postId,
  onReplyAdded,
}) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const account = getSavedAccount();
      const token = account?.session_token;
      const newReply = await createPostReply(postId, trimmed, token);
      setContent("");
      onReplyAdded(newReply);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to post your reply.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3">
      <div className="relative rounded-xl bg-[#0c0f17] border border-[#232c3f] focus-within:border-[#e6af2e] transition-colors p-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Offer compassionate reflection or share your experience..."
          rows={3}
          disabled={isSubmitting}
          className="w-full bg-transparent text-xs text-[#f0f2f5] placeholder-[#64748b] resize-none focus:outline-none leading-relaxed disabled:opacity-50"
        />

        <div className="flex items-center justify-between pt-2 border-t border-[#232c3f]/50">
          <span className="text-[11px] text-[#64748b]">
            Replies are reviewed for community safety and mutual kindness.
          </span>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e6af2e] hover:bg-[#d4af37] text-[#0c0f17] text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Post Reply</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}
    </form>
  );
};
