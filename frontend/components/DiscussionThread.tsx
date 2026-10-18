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
      <div className="flex justify-center items-center py-20 text-[#e59a27]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Back Navigation & Meta State */}
      <div className="flex items-center justify-between pb-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#b5aa9b] hover:text-[#e59a27] transition-colors group font-label text-sm font-medium cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Sanctuary Discourses</span>
        </button>

        <div className="flex items-center gap-2 text-[#7a6e5e] text-xs">
          <Lock className="w-3.5 h-3.5 text-[#e59a27]" />
          <span className="font-label uppercase tracking-widest text-[11px]">
            End-to-End Ephemeral Ledger
          </span>
        </div>
      </div>

      {/* Main Discourse Card */}
      <article className="bg-[#1c1712] rounded-xl p-6 sm:p-10 border border-[#362c22] shadow-2xl relative overflow-hidden">
        {/* Left Gold Gradient Hairline */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#e59a27] via-[#e59a27]/30 to-transparent" />

        {/* Header Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#362c22]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#261f18] border border-[#3d3227] flex items-center justify-center text-[#e59a27]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-body text-sm font-medium text-[#f2ede4]">
                  {post.display_name}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e59a27]/15 text-[#e59a27] font-label text-[10px] border border-[#e59a27]/25">
                  Verified Pseudonym
                </span>
              </div>
              <span className="font-label text-xs text-[#7a6e5e] mt-0.5">
                Offered 2 hours ago • Contemplative Inquiry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#261f18] text-[#b5aa9b] font-label text-xs border border-[#3d3227]">
              Duty & Family
            </span>
            <span className="px-3 py-1 rounded-full bg-[#e59a27]/15 text-[#e59a27] font-label text-xs font-semibold border border-[#e59a27]/25">
              Bhagavad Gita
            </span>
          </div>
        </div>

        {/* Discourse Narrative */}
        <div className="py-6 flex flex-col gap-4 text-[#b5aa9b] font-body text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>

        {/* AI Synthesis Collapsible Panel */}
        <div className="mt-4 rounded-xl bg-[#211a14] border border-[#362c22] p-5 transition-all">
          <button
            onClick={() => setIsSynthesisOpen(!isSynthesisOpen)}
            className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-[#e59a27]" />
              <span className="font-headline text-base text-[#f2ede4] tracking-wide">
                Sanctuary AI Hermeneutic Synthesis
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#7a6e5e] group-hover:text-[#e59a27] transition-colors">
              <span className="font-label text-xs uppercase tracking-wider">
                {isSynthesisOpen ? "Collapse" : "Expand"}
              </span>
              {isSynthesisOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </button>

          {isSynthesisOpen && (
            <div className="mt-4 pt-4 border-t border-[#362c22] flex flex-col gap-3.5">
              <div className="p-4 rounded-lg bg-[#14120e] border border-[#362c22]">
                <p className="font-headline text-sm sm:text-base text-[#e59a27] italic leading-relaxed">
                  “Better is one’s own natural duty, though imperfectly performed, than another’s duty performed to perfection. Conforming to another’s path brings fear and distortion.”
                </p>
                <div className="mt-3 flex items-center justify-between flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#e59a27]/15 text-[#e59a27] font-label text-xs tracking-widest uppercase border border-[#e59a27]/25 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    Bhagavad Gita 3.35 • Swadharma vs. Paradharma
                  </span>
                  <span className="font-body text-xs text-[#7a6e5e]">
                    Ethical Resolution Vector
                  </span>
                </div>
              </div>
              <p className="font-body text-sm text-[#b5aa9b] leading-relaxed">
                <strong className="text-[#f2ede4]">Philosophical Commentary:</strong> Ancient Vedic ethics draws a sacred distinction between loving reverence (<span className="text-[#e59a27]">Pitri Rna</span> / ancestral gratitude) and the subversion of one’s sacred innate nature (<span className="text-[#e59a27]">Swabhava</span>). Filial respect is sustained through integrity, not spiritual martyrdom. When the seed attempts to grow into a stone out of gratitude to the soil, both soil and seed are diminished.
              </p>
            </div>
          )}
        </div>

        {/* Post Action Bar */}
        <div className="mt-6 pt-5 border-t border-[#362c22] flex flex-wrap items-center justify-between gap-4 text-xs text-[#7a6e5e]">
          <div className="flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-2 font-label transition-colors cursor-pointer ${
                liked ? "text-rose-400 font-semibold" : "hover:text-[#f2ede4]"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{likesCount} Held Space</span>
            </button>

            <div className="inline-flex items-center gap-2 font-label text-[#b5aa9b]">
              <MessageSquare className="w-4 h-4 text-[#e59a27]" />
              <span>{post.reply_count} Contemplative Responses</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
              className="hover:text-[#e59a27] transition-colors flex items-center gap-1.5 cursor-pointer font-label"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Discreetly</span>
            </button>

            <button
              onClick={() => setReportTarget({ type: "post", id: post.id })}
              className="hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer font-label"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report Anonymously</span>
            </button>
          </div>
        </div>
      </article>

      {/* Contemplative Responses List */}
      <section className="mt-4 space-y-4">
        <h3 className="font-headline text-lg sm:text-xl text-[#f2ede4] tracking-wide">
          Fellow Seeker Contemplations ({post.replies?.length || 0})
        </h3>

        {post.replies && post.replies.length > 0 ? (
          <div className="space-y-3.5">
            {post.replies.map((reply) => (
              <div
                key={reply.id}
                className="p-5 rounded-xl bg-[#1c1712] border border-[#362c22] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-[#7a6e5e]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#261f18] text-[#e59a27] flex items-center justify-center text-[10px]">
                      ॐ
                    </div>
                    <span className="font-label font-medium text-[#f2ede4]">
                      {reply.display_name}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setReportTarget({ type: "reply", id: reply.id })
                    }
                    className="hover:text-rose-400 transition-colors text-[11px] font-label cursor-pointer"
                  >
                    Report
                  </button>
                </div>
                <p className="font-body text-sm text-[#b5aa9b] leading-relaxed whitespace-pre-wrap">
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 rounded-xl bg-[#1c1712] border border-[#362c22] text-[#7a6e5e] text-xs">
            No reflections yet. Be the first kindred pilgrim to offer solace.
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
