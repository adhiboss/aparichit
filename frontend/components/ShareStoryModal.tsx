"use client";

import React, { useState } from "react";
import { X, ShieldCheck, AlertCircle, Share2, Loader2 } from "lucide-react";
import { createCommunityPost } from "@/lib/posts";
import { getSavedAccount } from "@/lib/storage";

interface ShareStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialContent?: string;
  onPostCreated?: (postId: string) => void;
}

export const ShareStoryModal: React.FC<ShareStoryModalProps> = ({
  isOpen,
  onClose,
  initialContent = "",
  onPostCreated,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedPrivacy, setConfirmedPrivacy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError("Please write your dilemma or story before sharing.");
      return;
    }
    if (!confirmedPrivacy) {
      setError("Please confirm you understand this story will be published to the community.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const account = getSavedAccount();
      const token = account?.session_token;
      const created = await createCommunityPost(content.trim(), token);

      if (onPostCreated) {
        onPostCreated(created.id);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish post.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-[#171c28] border border-[#232c3f] shadow-2xl p-6 relative text-[#f0f2f5] space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#232c3f] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#e6af2e]/15 text-[#e6af2e] border border-[#e6af2e]/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Share Your Story Anonymously</h3>
            <p className="text-xs text-[#94a3b8]">
              Your experience can help someone walking a similar path.
            </p>
          </div>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="p-3.5 rounded-xl bg-[#0c0f17] border border-[#232c3f] flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-[#e6af2e] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-[#e6af2e]">
              Privacy Notice: Your chat stays private unless you share it.
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              When submitted, the server automatically strips personal identifiers (phone numbers, emails, addresses, real names, schools, and workplaces) before publishing under your anonymous pseudonym.
            </p>
          </div>
        </div>

        {/* Story Editor */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#cbd5e1]">
            Review & Edit Your Story Before Sharing
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full p-3.5 text-sm rounded-xl bg-[#0c0f17] border border-[#232c3f] text-[#f0f2f5] placeholder-[#64748b] focus:outline-none focus:border-[#e6af2e] focus:ring-1 focus:ring-[#e6af2e] transition-colors"
            placeholder="Describe your situation or dilemma..."
          />
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#cbd5e1] select-none">
          <input
            type="checkbox"
            checked={confirmedPrivacy}
            onChange={(e) => setConfirmedPrivacy(e.target.checked)}
            className="mt-0.5 rounded border-[#232c3f] bg-[#0c0f17] text-[#e6af2e] focus:ring-0 cursor-pointer"
          />
          <span>
            I understand that clicking Publish will make this story visible to the anonymous peer community.
          </span>
        </label>

        {/* Error message */}
        {error && (
          <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-[#94a3b8] hover:text-white rounded-lg hover:bg-[#232c3f] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || !confirmedPrivacy}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#e6af2e] hover:bg-[#d4af37] text-[#0c0f17] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#e6af2e]/10"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Sanitizing & Publishing...</span>
              </>
            ) : (
              <span>Publish Anonymously</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
