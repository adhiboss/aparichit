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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-[#242830] border border-[#2E333D] shadow-2xl p-6 relative text-[#E7E1D5] space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#9EA3AF] hover:text-[#E7E1D5] rounded-lg hover:bg-[#1E222A] transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-[#1E222A] text-[#B69A61] border border-[#2E333D]">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif text-[#E7E1D5]">Share Your Dilemma Anonymously</h3>
            <p className="text-xs text-[#9EA3AF]">
              Your experience offers guidance to seekers navigating similar paths.
            </p>
          </div>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="p-3.5 rounded-xl bg-[#1E222A] border border-[#2E333D] flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-[#B69A61] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-[#B69A61]">
              Privacy Notice: Your dialogue remains private unless intentionally shared.
            </div>
            <p className="text-[#9EA3AF] leading-relaxed">
              When submitted, the server automatically strips personal identifiers (phone numbers, emails, addresses, real names, schools, and workplaces) before publishing under your anonymous pseudonym.
            </p>
          </div>
        </div>

        {/* Story Editor */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-[#9EA3AF]">
            Review & Edit Your Story Before Sharing
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            className="w-full p-3.5 text-sm rounded-xl bg-[#1E222A] border border-[#2E333D] text-[#E7E1D5] placeholder-[#6F7684] focus:outline-none focus:border-[#B69A61] transition-colors"
            placeholder="Describe your inquiry, dilemma, or reflections..."
          />
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#9EA3AF] select-none">
          <input
            type="checkbox"
            checked={confirmedPrivacy}
            onChange={(e) => setConfirmedPrivacy(e.target.checked)}
            className="mt-0.5 rounded border-[#2E333D] bg-[#1E222A] text-[#B69A61] focus:ring-0 cursor-pointer"
          />
          <span>
            I understand that clicking Publish will make this reflection visible to the anonymous peer community.
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
            className="px-4 py-2 text-xs font-medium text-[#9EA3AF] hover:text-[#E7E1D5] rounded-lg hover:bg-[#1E222A] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !content.trim() || !confirmedPrivacy}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-[#B69A61] hover:bg-[#c4a96e] text-[#171A1F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
