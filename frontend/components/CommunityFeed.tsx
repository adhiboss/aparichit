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
    <div className="w-full flex flex-col gap-8">
      {/* Editorial Header Section */}
      <header className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#2E333D]">
          <div className="flex flex-col gap-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-[#9EA3AF]">
              <span className="uppercase tracking-widest text-[#B69A61] font-semibold">
                Anonymous Sanctuary
              </span>
              <span>•</span>
              <span className="uppercase tracking-wider">
                Confidential Peer Reflections
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#E7E1D5] tracking-tight">
                Collective Contemplations
              </h1>
              <span className="text-sm font-serif italic text-[#9EA3AF]">
                (अपारिचित संवाद)
              </span>
            </div>

            <p className="text-base text-[#9EA3AF] max-w-xl leading-relaxed">
              Read, offer solace, and reflect upon ethical dilemmas with peers and philosophical mentors under complete anonymity.
            </p>
          </div>

          {/* + New Post Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-[#B69A61] text-[#171A1F] text-sm font-semibold hover:bg-[#c4a96e] transition-colors shrink-0 cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Reflection</span>
          </button>
        </div>

        {/* Controls & Filter Toolbar */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 rounded-xl bg-[#242830] border border-[#2E333D]">
          {/* Row 1: Search & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EA3AF]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search inquiries, traditions, or keywords..."
                className="w-full pl-10 pr-4 py-2 bg-[#1E222A] border border-[#2E333D] rounded-lg text-sm text-[#E7E1D5] placeholder:text-[#6F7684] focus:outline-none focus:border-[#B69A61] transition-colors"
              />
              {searchFilter && (
                <button
                  onClick={() => setSearchFilter("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9EA3AF] hover:text-[#E7E1D5]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sorting Tab Group */}
            <div className="flex items-center gap-1 p-1 bg-[#1E222A] rounded-lg border border-[#2E333D] shrink-0">
              <button
                onClick={() => setSortOption("latest")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortOption === "latest"
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                Latest
              </button>
              <button
                onClick={() => setSortOption("replies")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortOption === "replies"
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                Most Replies
              </button>
              <button
                onClick={() => setSortOption("reflections")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortOption === "reflections"
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                Deep Inquiries
              </button>
            </div>
          </div>

          {/* Row 2: Tradition Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
            <span className="text-xs uppercase tracking-wider text-[#9EA3AF] mr-1 shrink-0">
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
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTradition === t.id
                    ? "bg-[#B69A61]/20 border border-[#B69A61] text-[#B69A61] font-semibold"
                    : "bg-[#1E222A] hover:bg-[#2A2F3A] text-[#9EA3AF] hover:text-[#E7E1D5] border border-[#2E333D]"
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
        <div className="flex justify-center items-center py-20 text-[#B69A61]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-[#9EA3AF] bg-[#242830] rounded-xl border border-[#2E333D]">
          <p className="font-serif text-lg text-[#E7E1D5]">No reflections found matching this inquiry.</p>
          <p className="text-xs mt-1">Try relaxing filters or share the first reflection.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredPosts.map((post) => {
            const callout = SCRIPTURE_CALLOUTS[post.id];

            return (
              <article
                key={post.id}
                onClick={() => setSelectedPostId(post.id)}
                className="group flex flex-col rounded-xl bg-[#242830] hover:bg-[#282D37] border border-[#2E333D] hover:border-[#3D4452] transition-colors p-6 sm:p-7 cursor-pointer border-l-2 border-l-[#B69A61]"
              >
                {/* Card Meta Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-[#9EA3AF]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#E7E1D5]">
                      {post.display_name}
                    </span>
                    <span>•</span>
                    <span suppressHydrationWarning>
                      {new Date(post.created_at).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {callout && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] bg-[#1E222A] text-[#9EA3AF] border border-[#2E333D]">
                        {callout.tag}
                      </span>
                      <span className="text-[11px] text-[#B69A61] font-medium">
                        {callout.tradition}
                      </span>
                    </div>
                  )}
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-base text-[#E7E1D5] leading-relaxed line-clamp-3">
                    {post.content}
                  </p>
                </div>

                {/* Scripture Insight Callout */}
                {callout && (
                  <div className="mb-4 p-3.5 rounded-lg bg-[#1E222A] border-l-2 border-[#B69A61] flex items-start gap-3">
                    <BookOpen className="w-4 h-4 text-[#B69A61] shrink-0 mt-0.5" />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-serif italic text-sm text-[#E7E1D5]">
                        “{callout.quote}”
                      </span>
                      <span className="text-[11px] text-[#B69A61] uppercase tracking-wider">
                        — {callout.source}
                      </span>
                    </div>
                  </div>
                )}

                {/* Bottom Action Row */}
                <div className="pt-2 flex items-center justify-between text-xs text-[#9EA3AF]">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[#E7E1D5]">
                      <MessageSquare className="w-3.5 h-3.5 text-[#B69A61]" />
                      <span>{post.reply_count || 0} reflections</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-[#9EA3AF]">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <span>Held space</span>
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[#B69A61] font-medium group-hover:translate-x-0.5 transition-transform">
                    <span>Read Discussion</span>
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
