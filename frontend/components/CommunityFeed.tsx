"use client";

import React, { useEffect, useState } from "react";
import { CommunityPost } from "@/lib/types";
import { fetchCommunityPosts } from "@/lib/posts";
import { DiscussionThread } from "./DiscussionThread";
import { ShareStoryModal } from "./ShareStoryModal";
import {
  Users,
  MessageSquare,
  Share2,
  RefreshCw,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface CommunityFeedProps {
  initialPostId?: string;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  initialPostId,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    initialPostId || null
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const loadFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCommunityPosts(30, 0);
      setPosts(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load feed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // If a post is selected, show discussion thread view
  if (selectedPostId) {
    return (
      <DiscussionThread
        postId={selectedPostId}
        onBack={() => setSelectedPostId(null)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Community Feed Header Banner */}
      <div className="p-6 rounded-2xl bg-[#171c28] border border-[#232c3f] shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#e6af2e]" />
            <h2 className="text-lg font-bold text-[#f0f2f5]">
              Anonymous Community Hub
            </h2>
          </div>
          <p className="text-xs text-[#94a3b8] max-w-lg leading-relaxed">
            Real dilemmas shared anonymously by peers. Read thoughtful community replies or share your own situation with automatic privacy scrubbing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadFeed}
            disabled={loading}
            title="Refresh feed"
            className="p-2 text-[#94a3b8] hover:text-[#f0f2f5] hover:bg-[#232c3f] rounded-xl border border-[#232c3f] transition-colors disabled:opacity-50"
            aria-label="Refresh feed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#e6af2e]" : ""}`} />
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e6af2e] hover:bg-[#d4af37] text-[#0c0f17] text-xs font-semibold transition-all shadow-md shadow-[#e6af2e]/10"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share My Dilemma</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#e6af2e]" />
          <p className="text-xs text-[#94a3b8]">Loading community reflections...</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="p-8 rounded-2xl bg-[#171c28] border border-red-500/30 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-sm font-medium text-red-200">{error}</p>
          <button
            onClick={loadFeed}
            className="px-4 py-2 rounded-lg bg-[#232c3f] hover:bg-[#2f3c55] text-xs text-white transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && posts.length === 0 && (
        <div className="py-16 text-center space-y-4 rounded-2xl bg-[#171c28] border border-[#232c3f] p-8">
          <Sparkles className="w-10 h-10 text-[#e6af2e] mx-auto opacity-70" />
          <h3 className="text-sm font-semibold text-[#f0f2f5]">No Dilemmas Shared Yet</h3>
          <p className="text-xs text-[#94a3b8] max-w-md mx-auto">
            Be the first to share an anonymous story. All identifying details will be automatically scrubbed by our backend before publication.
          </p>
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#e6af2e] text-[#0c0f17] text-xs font-semibold"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share First Dilemma</span>
          </button>
        </div>
      )}

      {/* Posts Grid / List */}
      {!loading && !error && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="p-5 rounded-2xl bg-[#171c28] border border-[#232c3f] hover:border-[#e6af2e]/50 hover:bg-[#1a2130] transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors">
                    {post.display_name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>

                <p className="text-xs text-[#94a3b8] line-clamp-4 leading-relaxed group-hover:text-[#cbd5e1] transition-colors">
                  {post.content}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#232c3f]/80 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 text-[#94a3b8]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#e6af2e]" />
                  <span>
                    {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
                  </span>
                </span>

                <span className="font-medium text-[#e6af2e] text-xs group-hover:underline">
                  Read discussion →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Dilemma Modal */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialContent=""
        onPostCreated={(newId) => {
          setSelectedPostId(newId);
          loadFeed();
        }}
      />
    </div>
  );
};
