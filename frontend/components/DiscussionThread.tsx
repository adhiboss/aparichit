"use client";

import React, { useEffect, useState } from "react";
import { CommunityPost, PostReply } from "@/lib/types";
import { fetchPostDetail } from "@/lib/posts";
import { ReplyComposer } from "./ReplyComposer";
import { ReportDialog } from "./ReportDialog";
import {
  ArrowLeft,
  Heart,
  MessageSquare,
  Flag,
  User,
  Clock,
  MoreHorizontal,
  HeartHandshake,
  Loader2,
  AlertCircle,
  PhoneCall,
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
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);

  // Reporting modal state
  const [reportTarget, setReportTarget] = useState<{
    type: "post" | "reply";
    id: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchPostDetail(postId);
        setPost(data);
      } catch (err: unknown) {
        // Fallback to sample data for display
        setPost({
          id: postId,
          user_id: "anon_quiet",
          display_name: "Quiet River",
          content:
            "Feeling guilty for moving abroad: I want to move abroad for better career opportunities but I feel guilty leaving my parents behind. Am I being selfish? Any advice or similar experiences from those who have faced this dilemma?",
          reply_count: 3,
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          replies: [
            {
              id: "rep_1",
              post_id: postId,
              user_id: "anon_golden",
              display_name: "Golden Leaf",
              content:
                "I went through the exact same feeling 4 years ago. Your parents want your growth. Call them regularly, involve them in your plans, and make them feel cherished. You are expanding, not abandoning.",
              created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            },
            {
              id: "rep_2",
              post_id: postId,
              user_id: "anon_silent",
              display_name: "Silent Peak",
              content:
                "The Garuda Purana reminds us that duty (dharma) includes fulfilling one's potential honestly while maintaining reverence for one's roots. Honest conversation removes the shadow of unsaid guilt.",
              created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            },
          ],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  const handleReplyAdded = (newReply: PostReply) => {
    if (!post) return;
    const existing = post.replies || [];
    setPost({
      ...post,
      reply_count: post.reply_count + 1,
      replies: [...existing, newReply],
    });
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#e6af2e]" />
        <p className="text-xs text-[#94a3b8]">Loading discussion...</p>
      </div>
    );
  }

  if (!post) return null;

  const hasColon = post.content.includes(":");
  const title = hasColon
    ? post.content.split(":")[0]
    : "Community Discussion";
  const body = hasColon
    ? post.content.slice(post.content.indexOf(":") + 1).trim()
    : post.content;

  return (
    <div className="rounded-2xl bg-[#151b26] border border-[#232c3f] p-5 shadow-2xl space-y-5 animate-in fade-in duration-150">
      {/* Top Header: Back button & Discussion title */}
      <div className="flex items-center justify-between pb-3 border-b border-[#232c3f]/70">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[#94a3b8] hover:text-[#e6af2e] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h3 className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
          Discussion
        </h3>

        <button className="text-[#64748b] hover:text-white transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Main Post Header & Body */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {post.display_name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-[#f0f2f5]">
                {post.display_name}
              </div>
              <div className="text-[10px] text-[#64748b]">2 hours ago</div>
            </div>
          </div>

          <button
            onClick={() => setReportTarget({ type: "post", id: post.id })}
            className="inline-flex items-center gap-1 text-[11px] text-[#64748b] hover:text-red-400 transition-colors"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Report</span>
          </button>
        </div>

        {/* Title */}
        <h2 className="text-sm font-bold text-[#f0f2f5]">{title}</h2>

        {/* Post Text */}
        <p className="text-xs text-[#cbd5e1] leading-relaxed whitespace-pre-wrap">
          {body}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {["Family", "Life Decisions", "Career"].map((tag, i) => (
            <span
              key={i}
              className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#0d111a] text-[#94a3b8] border border-[#232c3f]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Likes and stats */}
        <div className="pt-3 border-t border-[#232c3f]/50 flex items-center gap-4 text-xs text-[#94a3b8]">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              liked ? "text-rose-400" : "hover:text-rose-400"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likesCount}</span>
          </button>

          <span className="inline-flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-[#e6af2e]" />
            <span>{post.reply_count} replies</span>
          </span>
        </div>
      </div>

      {/* Community Replies List */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
          Supportive Replies ({post.replies?.length || 0})
        </h4>

        {post.replies && post.replies.length > 0 ? (
          <div className="space-y-2.5">
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                className="p-3.5 rounded-xl bg-[#0d111a] border border-[#232c3f] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#f0f2f5]">
                      {reply.display_name}
                    </span>
                    <span className="text-[10px] text-[#64748b]">• 1 hour ago</span>
                  </div>

                  <button
                    onClick={() =>
                      setReportTarget({ type: "reply", id: reply.id })
                    }
                    className="text-[#64748b] hover:text-red-400 text-[10px] transition-colors"
                  >
                    Report
                  </button>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#64748b] py-2">
            No replies yet. Be the first to share compassionate insight.
          </p>
        )}
      </div>

      {/* Inline Reply Composer */}
      <div className="p-3.5 rounded-xl bg-[#0d111a] border border-[#232c3f]">
        <ReplyComposer postId={post.id} onReplyAdded={handleReplyAdded} />
      </div>

      {/* Crisis Safety Banner at Bottom of Discussion (Matching Image 1) */}
      <div className="p-3.5 rounded-xl bg-red-950/25 border border-red-500/30 flex items-start gap-3 text-xs text-red-200">
        <HeartHandshake className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-red-200">Need Immediate Help?</div>
          <p className="text-[11px] text-red-300/90 leading-relaxed">
            If you&apos;re feeling overwhelmed or having thoughts of self-harm, please reach out to someone you trust or contact{" "}
            <a href="tel:14416" className="font-semibold text-white underline hover:text-red-200">
              Tele-MANAS 14416 (24/7 Toll-Free)
            </a>.
          </p>
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
