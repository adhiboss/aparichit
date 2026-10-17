"use client";

import React, { useEffect, useState } from "react";
import { CommunityPost, PostReply } from "@/lib/types";
import { fetchPostDetail } from "@/lib/posts";
import { ReplyComposer } from "./ReplyComposer";
import { ReportDialog } from "./ReportDialog";
import {
  ArrowLeft,
  MessageSquare,
  Flag,
  User,
  Clock,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DiscussionThreadProps {
  postId: string;
  onBack: () => void;
}

export const DiscussionThread: React.FC<DiscussionThreadProps> = ({
  postId,
  onBack,
}) => {
  const [post, setPost] = useState<CommunityPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reporting state
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "reply";
    id: string;
  } | null>(null);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPostDetail(postId);
      setPost(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load thread.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  const handleReplyAdded = (newReply: PostReply) => {
    if (!post) return;
    const existingReplies = post.replies || [];
    setPost({
      ...post,
      reply_count: post.reply_count + 1,
      replies: [...existingReplies, newReply],
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#e6af2e]" />
        <p className="text-xs text-[#94a3b8]">Loading discussion thread...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-[#f0f2f5]">Unable to Load Post</h3>
        <p className="text-xs text-[#94a3b8]">{error || "Post not found or removed."}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#232c3f] hover:bg-[#2f3b54] text-xs text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Community</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#e6af2e] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Discussions</span>
      </button>

      {/* Main Post Card */}
      <div className="p-6 rounded-2xl bg-[#171c28] border border-[#232c3f] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#e6af2e]/10 text-[#e6af2e] border border-[#e6af2e]/20">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#f0f2f5]">
                {post.display_name}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                <Clock className="w-3 h-3" />
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setReportTarget({ type: "post", id: post.id })}
            className="p-1.5 text-[#64748b] hover:text-red-400 hover:bg-[#232c3f] rounded-lg transition-colors"
            title="Report this post"
            aria-label="Report post"
          >
            <Flag className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        <div className="pt-3 border-t border-[#232c3f]/80 flex items-center justify-between text-xs text-[#94a3b8]">
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-[#e6af2e]" />
            <span>
              {post.reply_count} {post.reply_count === 1 ? "Peer Reply" : "Peer Replies"}
            </span>
          </span>

          <span className="flex items-center gap-1 text-[11px] text-[#64748b]">
            <Shield className="w-3 h-3 text-[#e6af2e]/60" />
            <span>PII Scrubbed</span>
          </span>
        </div>
      </div>

      {/* Community Replies Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] px-1">
          Supportive Replies ({post.replies?.length || 0})
        </h3>

        {(!post.replies || post.replies.length === 0) ? (
          <div className="p-6 rounded-xl bg-[#141924] border border-[#232c3f] text-center text-xs text-[#94a3b8]">
            No replies yet. Be the first to offer gentle wisdom or encouragement.
          </div>
        ) : (
          <div className="space-y-3">
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                className="p-4 rounded-xl bg-[#141924] border border-[#232c3f] space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#f0f2f5]">
                      {reply.display_name}
                    </span>
                    <span className="text-[11px] text-[#64748b]">
                      • {formatDate(reply.created_at)}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      setReportTarget({ type: "reply", id: reply.id })
                    }
                    className="p-1 text-[#64748b] hover:text-red-400 rounded transition-colors"
                    title="Report reply"
                    aria-label="Report reply"
                  >
                    <Flag className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Reply Composer */}
        <div className="p-4 rounded-xl bg-[#171c28] border border-[#232c3f]">
          <h4 className="text-xs font-semibold text-[#f0f2f5] mb-1">
            Write a Supportive Reply
          </h4>
          <ReplyComposer postId={post.id} onReplyAdded={handleReplyAdded} />
        </div>
      </div>

      {/* Report Modal */}
      {reportTarget && (
        <ReportDialog
          isOpen={true}
          onClose={() => setReportTarget(null)}
          targetType={reportTarget.type}
          targetId={reportTarget.id}
        />
      )}
    </div>
  );
};
