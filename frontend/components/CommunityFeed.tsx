"use client";

import React, { useEffect, useState } from "react";
import { CommunityPost } from "@/lib/types";
import { fetchCommunityPosts } from "@/lib/posts";
import { DiscussionThread } from "./DiscussionThread";
import { ShareStoryModal } from "./ShareStoryModal";
import {
  Users,
  Search,
  Plus,
  Heart,
  MessageSquare,
  Clock,
  Loader2,
  BookOpen,
  Sparkles,
  Shield,
  ArrowRight,
  Flame,
} from "lucide-react";

interface CommunityFeedProps {
  initialPostId?: string;
}

const SAMPLE_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post_sample_1",
    user_id: "anon_1",
    display_name: "Anonymous Seeker #4092",
    content:
      "Struggling to reconcile inner calling with parental sacrifice: For nearly three decades, my parents worked exhausting shifts so I could become a consultant. Yet the quiet dissonance has grown deafening. I feel called to document disappearing cultural oral histories. How do I weigh the debt of filial gratitude against the silent erosion of my spirit?",
    reply_count: 18,
    created_at: "2026-10-18T18:00:00.000Z",
  },
  {
    id: "post_sample_2",
    user_id: "anon_2",
    display_name: "Anonymous Seeker #2819",
    content:
      "Learning to forgive after profound betrayal: Someone in my inner circle breached trust severely. Mentally I want to let go, but visceral resentment bubbles up whenever I think of them. How do ancient Stoic and Buddhist texts recommend dissolving this poison without being naive?",
    reply_count: 14,
    created_at: "2026-10-18T15:30:00.000Z",
  },
  {
    id: "post_sample_3",
    user_id: "anon_3",
    display_name: "Anonymous Seeker #1104",
    content:
      "Chronic loneliness in a hyperconnected world: I am surrounded by colleagues and family, yet an anchorless solitude persists. How do traditions view voluntary solitude (Kaivalya / Solitude) versus agonizing loneliness?",
    reply_count: 29,
    created_at: "2026-10-17T18:00:00.000Z",
  },
];

const SCRIPTURE_CALLOUTS: Record<string, { quote: string; source: string; tag: string; tradition: string }> = {
  post_sample_1: {
    quote: "Better is one’s own duty, though devoid of merit, than the duty of another well performed.",
    source: "Bhagavad Gita 3.35",
    tag: "Duty & Family",
    tradition: "Bhagavad Gita",
  },
  post_sample_2: {
    quote: "Hatred does not cease by hatred, but only by love; this is the eternal rule.",
    source: "Dhammapada 1.5",
    tag: "Forgiveness",
    tradition: "Dhammapada",
  },
  post_sample_3: {
    quote: "The soul is never alone when it discovers communion with the eternal witness within.",
    source: "Garuda Purana 2.14",
    tag: "Solitude & Purpose",
    tradition: "Garuda Purana",
  },
};

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  initialPostId,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(SAMPLE_COMMUNITY_POSTS);
  const [loading, setLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    initialPostId || null
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedTradition, setSelectedTradition] = useState("all");
  const [sortOption, setSortOption] = useState<"latest" | "replies" | "reflections">("latest");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    async function loadBackendPosts() {
      try {
        setLoading(true);
        const backendPosts = await fetchCommunityPosts(30, 0);
        if (backendPosts && backendPosts.length > 0) {
          setPosts(backendPosts);
        }
      } catch (err) {
        console.warn("Using default community posts", err);
      } finally {
        setLoading(false);
      }
    }
    loadBackendPosts();
  }, []);

  if (selectedPostId) {
    return (
      <DiscussionThread
        postId={selectedPostId}
        onBack={() => setSelectedPostId(null)}
      />
    );
  }

  // Filter & Search
  const filteredPosts = posts.filter((post) => {
    const textMatch =
      post.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      post.display_name.toLowerCase().includes(searchFilter.toLowerCase());

    if (!textMatch) return false;

    if (selectedTradition === "all") return true;
    const callout = SCRIPTURE_CALLOUTS[post.id];
    if (callout) {
      return callout.tradition.toLowerCase().includes(selectedTradition.toLowerCase());
    }
    return true;
  });

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-300">
      {/* Header Section */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#362c22]/70">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 text-[#7a6e5e] text-xs">
              <span className="w-2 h-2 rounded-full bg-[#e59a27] animate-ping" />
              <span className="font-label uppercase tracking-widest text-[#e59a27] font-semibold">
                Confidential Collective Stream
              </span>
              <span>•</span>
              <span className="font-label uppercase tracking-wider text-[#7a6e5e]">
                284 Seekers Present
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="font-headline text-2xl sm:text-4xl text-[#f2ede4] tracking-tight">
                Anonymous Sanctuary Feed
              </h1>
              <span className="font-headline text-lg sm:text-xl text-[#b5aa9b] font-light opacity-60">
                (अपारिचित संवाद)
              </span>
            </div>

            <p className="font-body text-sm text-[#b5aa9b] max-w-xl leading-relaxed">
              A confidential haven to read, share, and reflect upon real dilemmas with peers and philosophical mentors under the cloak of complete anonymity.
            </p>
          </div>

          {/* + New Post Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#e59a27] text-[#140e06] font-label text-sm font-semibold hover:bg-[#f0a83b] transition-all duration-300 shadow-[0_4px_20px_rgba(229,154,39,0.25)] hover:shadow-[0_4px_28px_rgba(229,154,39,0.4)] shrink-0 cursor-pointer active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ New Post</span>
          </button>
        </div>

        {/* Controls & Filter Toolbar */}
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-[#1c1712] border border-[#362c22] shadow-[0_2px_12px_rgba(0,0,0,0.45)]">
          {/* Row 1: Search & Sorting */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7a6e5e]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search topics, traditions, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#261f18] border border-[#3d3227] rounded-lg text-sm text-[#f2ede4] placeholder:text-[#7a6e5e] focus:outline-none focus:border-[#e59a27] transition-all"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7a6e5e] hover:text-[#f2ede4]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sorting Tab Group */}
            <div className="flex items-center gap-1 p-1 bg-[#261f18] rounded-lg border border-[#3d3227] shrink-0 self-start lg:self-center">
              <button
                onClick={() => setSortOption("latest")}
                className={`px-3 py-1.5 rounded-md font-label text-xs font-medium transition-all cursor-pointer ${
                  sortOption === "latest"
                    ? "bg-[#e59a27] text-[#140e06] shadow-sm font-semibold"
                    : "text-[#b5aa9b] hover:text-[#f2ede4]"
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortOption("replies")}
                className={`px-3 py-1.5 rounded-md font-label text-xs font-medium transition-all cursor-pointer ${
                  sortOption === "replies"
                    ? "bg-[#e59a27] text-[#140e06] shadow-sm font-semibold"
                    : "text-[#b5aa9b] hover:text-[#f2ede4]"
                }`}
              >
                Most Replies
              </button>
              <button
                onClick={() => setSortOption("reflections")}
                className={`px-3 py-1.5 rounded-md font-label text-xs font-medium transition-all cursor-pointer ${
                  sortOption === "reflections"
                    ? "bg-[#e59a27] text-[#140e06] shadow-sm font-semibold"
                    : "text-[#b5aa9b] hover:text-[#f2ede4]"
                }`}
              >
                Deep Reflections
              </button>
            </div>
          </div>

          {/* Row 2: Tradition Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="font-label text-xs uppercase tracking-wider text-[#7a6e5e] mr-1 shrink-0 flex items-center gap-1">
              Tradition:
            </span>
            {[
              { id: "all", label: "All Traditions" },
              { id: "gita", label: "Bhagavad Gita" },
              { id: "stoicism", label: "Stoicism" },
              { id: "dhammapada", label: "Dhammapada" },
              { id: "garuda", label: "Garuda Purana" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTradition(t.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-label whitespace-nowrap transition-all cursor-pointer ${
                  selectedTradition === t.id
                    ? "bg-[#e59a27]/20 border border-[#e59a27] text-[#e59a27] font-semibold"
                    : "bg-[#261f18] hover:bg-[#2e251e] text-[#b5aa9b] hover:text-[#f2ede4] border border-[#3d3227]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Feed Stream */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-[#e59a27]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-[#7a6e5e] bg-[#1c1712] rounded-xl border border-[#362c22]">
          <p className="font-headline text-lg text-[#f2ede4]">No discourses found matching this inquiry.</p>
          <p className="font-body text-xs mt-1">Try relaxing filters or share the first reflection.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {filteredPosts.map((post) => {
            const callout = SCRIPTURE_CALLOUTS[post.id];

            return (
              <article
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="group relative flex flex-col rounded-xl bg-[#1c1712] hover:bg-[#231c15] border border-[#362c22] hover:border-[#e59a27]/40 transition-all duration-300 p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer"
              >
                {/* Subtle Left Accent Hairline */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#e59a27] via-[#e59a27]/30 to-transparent" />

                {/* Card Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-[#7a6e5e]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#261f18] border border-[#3d3227] flex items-center justify-center text-[#e59a27] text-xs">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-label text-xs sm:text-sm font-medium text-[#f2ede4]">
                      {post.display_name}
                    </span>
                    <span>•</span>
                    <span suppressHydrationWarning className="font-body text-xs text-[#7a6e5e]">
                      {new Date(post.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {callout && (
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label tracking-wider bg-[#261f18] text-[#b5aa9b]">
                        {callout.tag}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-label tracking-wider bg-[#e59a27]/15 text-[#e59a27] font-semibold border border-[#e59a27]/25">
                        {callout.tradition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="flex flex-col gap-2 mb-4">
                  <p className="font-body text-sm sm:text-base text-[#b5aa9b] group-hover:text-[#f2ede4] transition-colors leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Scripture Insight Callout Accent */}
                {callout && (
                  <div className="mb-4 p-3.5 rounded-lg bg-[#14120e] border border-[#362c22] flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-[#e59a27] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-headline text-xs italic text-[#f2ede4]">
                        “{callout.quote}”
                      </span>
                      <span className="font-label text-[10px] text-[#e59a27] uppercase tracking-wider font-medium">
                        — {callout.source}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Row */}
                <div className="pt-2 flex items-center justify-between text-xs text-[#7a6e5e]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[#b5aa9b]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#e59a27]" />
                      <span>{post.reply_count || 0} Contemplations</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#7a6e5e]">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Held Space</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[#e59a27] font-label font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Read Replies</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Share Story Modal */}
      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onPostCreated={async (newPostId: string) => {
          setIsShareModalOpen(false);
          try {
            const updated = await fetchCommunityPosts(30, 0);
            if (updated && updated.length > 0) setPosts(updated);
          } catch {}
        }}
      />
    </div>
  );
};
