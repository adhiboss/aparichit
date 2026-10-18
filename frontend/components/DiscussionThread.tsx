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
  Lock,
  Sparkles,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Loader2,
  ShieldCheck,
  Share2,
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
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(42);
  const [isSynthesisOpen, setIsSynthesisOpen] = useState(true);

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
        // Fallback to rich sample data for preview
        setPost({
          id: postId,
          user_id: "anon_4092",
          display_name: "Anonymous Seeker #4092",
          content:
            "For nearly three decades, my parents surrendered virtually every personal aspiration to establish a safe harbor for me. They view my current role in corporate actuarial consulting not just as a job, but as the sanctified culmination of their generational prayers.\n\nYet inside, the quiet dissonance has grown deafening. I have spent the last three seasons secretly recording oral histories, preserving forgotten folk languages and indigenous architectural rituals along the lower valleys. It feeds something profound in my soul—a quiet calling to document that which is vanishing.\n\nIf I pivot away toward cultural ethnography, my father will interpret it as an active rejection of their sacrifice, an act of ungrateful self-indulgence. How do I weigh the debt of filial gratitude against the silent erosion of my own spirit? Does honoring lineage require the voluntary sacrifice of who one truly is?",
          reply_count: 2,
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          replies: [
            {
              id: "rep_1",
              post_id: postId,
              user_id: "anon_elder",
              display_name: "Anonymous Pilgrim #108",
              content:
                "Filial reverence does not demand spiritual self-extinction. Ancient traditions taught that parents are revered because they give birth to your journey, but they cannot live your dharma for you. Speak gently to them of your calling; over time, authenticity radiates more honor than bitter obedience.",
              created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
            },
            {
              id: "rep_2",
              post_id: postId,
              user_id: "anon_scholar",
              display_name: "Anonymous Seeker #77",
              content:
                "Consider a measured transition instead of an abrupt fracture. Can you continue your documentation on weekends and sabbaticals until your path is stable? Prudence (Viveka) is as much a virtue as courage.",
              created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
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

  if (loading || !post) {
    return (
      <div className="flex justify-center items-center py-20 text-[#B69A61]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full flex flex-col gap-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#9EA3AF] hover:text-[#E7E1D5] transition-colors text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reflections</span>
        </button>

        <span className="text-xs text-[#9EA3AF] uppercase tracking-wider">
          Confidential Discussion
        </span>
      </div>

      {/* Main Discourse Card */}
      <article className="bg-[#242830] rounded-xl p-6 sm:p-8 border border-[#2E333D] border-l-2 border-l-[#B69A61]">
        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#2E333D]">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-[#E7E1D5]">
              {post.display_name}
            </span>
            <span className="text-xs text-[#9EA3AF] mt-0.5">
              Anonymous Inquiry • Shared with community
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded text-xs bg-[#1E222A] text-[#9EA3AF] border border-[#2E333D]">
              Duty & Family
            </span>
            <span className="text-xs text-[#B69A61] font-medium">
              Bhagavad Gita
            </span>
          </div>
        </div>

        {/* Discourse Narrative */}
        <div className="py-6 text-[#E7E1D5] text-base sm:text-[17px] leading-[1.75] whitespace-pre-wrap">
          {post.content}
        </div>

        {/* AI Synthesis Collapsible Panel */}
        <div className="mt-2 rounded-lg bg-[#1E222A] border border-[#2E333D] p-5">
          <button
            onClick={() => setIsSynthesisOpen(!isSynthesisOpen)}
            className="w-full flex items-center justify-between text-left cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#B69A61]" />
              <span className="font-serif text-base text-[#E7E1D5]">
                Scriptural Hermeneutic Synthesis
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#9EA3AF]">
              <span className="uppercase tracking-wider">
                {isSynthesisOpen ? "Hide" : "Show"}
              </span>
              {isSynthesisOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isSynthesisOpen && (
            <div className="mt-4 pt-4 border-t border-[#2E333D] flex flex-col gap-4">
              <blockquote className="border-l-2 border-[#B69A61] pl-4 py-1">
                <p className="font-serif italic text-base text-[#E7E1D5] leading-relaxed">
                  “Better is one’s own natural duty, though imperfectly performed, than another’s duty performed to perfection. Conforming to another’s path brings fear and distortion.”
                </p>
                <div className="mt-2 text-xs text-[#B69A61]">
                  Bhagavad Gita 3.35 • Swadharma vs. Paradharma
                </div>
              </blockquote>

              <p className="text-sm text-[#9EA3AF] leading-relaxed">
                <strong className="text-[#E7E1D5]">Philosophical Reflection:</strong> Ancient Vedic ethics distinguishes between filial reverence (<span className="text-[#B69A61]">Pitri Rna</span> / ancestral gratitude) and the suppression of one’s innate calling (<span className="text-[#B69A61]">Swabhava</span>). Reverence is fulfilled through truthful living, not inward martyrdom. When a seed attempts to become stone out of gratitude to the soil, both soil and seed are diminished.
              </p>
            </div>
          )}
        </div>

        {/* Post Action Bar */}
        <div className="mt-6 pt-4 border-t border-[#2E333D] flex flex-wrap items-center justify-between gap-4 text-xs text-[#9EA3AF]">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                liked ? "text-rose-400 font-semibold" : "hover:text-[#E7E1D5]"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount} Held Space</span>
            </button>

            <div className="inline-flex items-center gap-1.5 text-[#E7E1D5]">
              <MessageSquare className="w-4 h-4 text-[#B69A61]" />
              <span>{post.reply_count} Responses</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="hover:text-[#E7E1D5] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share link</span>
            </button>

            <button
              onClick={() => setReportTarget({ type: "post", id: post.id })}
              className="hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </article>

      {/* Contemplative Responses List */}
      <section className="mt-2 space-y-3">
        <h3 className="font-serif text-lg text-[#E7E1D5]">
          Seeker Contemplations ({post.replies?.length || 0})
        </h3>

        {post.replies && post.replies.length > 0 ? (
          <div className="space-y-3">
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                className="p-5 rounded-xl bg-[#242830] border border-[#2E333D] space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[#9EA3AF]">
                  <span className="font-medium text-[#E7E1D5]">
                    {reply.display_name}
                  </span>
                  <button
                    onClick={() =>
                      setReportTarget({ type: "reply", id: reply.id })
                    }
                    className="hover:text-rose-400 transition-colors text-[11px] cursor-pointer"
                  >
                    Report
                  </button>
                </div>
                <p className="text-sm text-[#E7E1D5] leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl bg-[#242830] border border-[#2E333D] text-[#9EA3AF] text-xs">
            No reflections yet. Be the first kindred seeker to offer solace.
          </div>
        )}

        {/* Reply Composer */}
        <div className="mt-4">
          <ReplyComposer postId={post.id} onReplyAdded={handleReplyAdded} />
        </div>
      </section>

      {/* Anonymous Report Dialog */}
      {reportTarget && (
        <ReportDialog
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          isOpen={true}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
};
