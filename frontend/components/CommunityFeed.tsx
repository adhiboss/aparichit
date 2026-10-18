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
  Loader2,
  BookOpen,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Flame,
  Compass,
} from "lucide-react";

interface CommunityFeedProps {
  initialPostId?: string;
}

interface DilemmaMetadata {
  title: string;
  category: "duty" | "career" | "forgiveness" | "solitude" | "ambition";
  tags: string[];
  quote: string;
  source: string;
  tradition: string;
  likes: number;
}

const DILEMMA_METADATA: Record<string, DilemmaMetadata> = {
  post_sample_1: {
    title: "Balancing filial debt against the silent erosion of my spirit",
    category: "duty",
    tags: ["Family", "Duty", "Life Crossroads"],
    quote: "Better is one’s own natural duty, though devoid of merit, than the duty of another well performed.",
    source: "Bhagavad Gita 3.35",
    tradition: "Bhagavad Gita",
    likes: 142,
  },
  post_sample_2: {
    title: "Dissolving resentment after profound betrayal in an inner circle",
    category: "forgiveness",
    tags: ["Forgiveness", "Inner Peace", "Letting Go"],
    quote: "Hatred does not cease by hatred, but only by love; this is the eternal rule.",
    source: "Dhammapada 1.5",
    tradition: "Dhammapada",
    likes: 98,
  },
  post_sample_3: {
    title: "Chronic loneliness and the distinction between isolation and sacred solitude",
    category: "solitude",
    tags: ["Solitude", "Kaivalya", "Presence"],
    quote: "The soul is never truly alone when it discovers communion with the eternal witness within.",
    source: "Garuda Purana 2.14",
    tradition: "Garuda Purana",
    likes: 215,
  },
  post_sample_4: {
    title: "Reconciling ambitious pursuit with the discipline of inner surrender",
    category: "ambition",
    tags: ["Ambition", "Surrender", "Stoic Virtue"],
    quote: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    source: "Meditations 4.3",
    tradition: "Stoicism",
    likes: 87,
  },
};

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post_sample_1",
    user_id: "anon_quiet_river",
    display_name: "Quiet River",
    content:
      "For nearly three decades, my parents worked exhausting shifts so I could become a corporate consultant. Yet the quiet dissonance has grown deafening. I feel called to document disappearing cultural oral histories. How do I weigh the debt of filial gratitude against the silent erosion of my spirit? Am I being ungrateful for honoring who I truly am?",
    reply_count: 24,
    created_at: "2026-10-18T18:00:00.000Z",
  },
  {
    id: "post_sample_2",
    user_id: "anon_silent_peak",
    display_name: "Silent Peak",
    content:
      "Someone I trusted completely in my creative partnership breached confidentiality and claimed shared work as their own. Mentally I want to let go and move forward, but visceral resentment bubbles up whenever I see their updates. How do classical Stoic and Buddhist masters recommend dissolving this poison without being passive or naive?",
    reply_count: 19,
    created_at: "2026-10-18T15:30:00.000Z",
  },
  {
    id: "post_sample_3",
    user_id: "anon_wandering_soul",
    display_name: "Wandering Soul",
    content:
      "Surrounded by colleagues, notifications, and social dinners, yet an anchorless solitude persists at night. How do ancient traditions view the difference between agonizing social loneliness and voluntary sacred solitude (Kaivalya)? How does one build an inner temple that never feels empty?",
    reply_count: 31,
    created_at: "2026-10-17T18:00:00.000Z",
  },
  {
    id: "post_sample_4",
    user_id: "anon_golden_leaf",
    display_name: "Golden Leaf",
    content:
      "Leading an engineering initiative on climate resilience. The urgency is immense, but external delays and bureaucratic politics trigger constant anxiety. Marcus Aurelius spoke of acting wholeheartedly while accepting what lies outside our control. How do you hold vigorous action in one hand and complete outcome-detachment in the other?",
    reply_count: 16,
    created_at: "2026-10-17T11:00:00.000Z",
  },
];

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  initialPostId,
}) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [loading, setLoading] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    initialPostId || null
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedTradition, setSelectedTradition] = useState<string>("all");
  const [sortOption, setSortOption] = useState<"latest" | "replies" | "held_space">("latest");
  const [searchFilter, setSearchFilter] = useState("");
  const [heldSpaceIds, setHeldSpaceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadBackendPosts() {
      try {
        setLoading(true);
        const backendPosts = await fetchCommunityPosts(30, 0);
        if (backendPosts && backendPosts.length > 0) {
          // Merge with sample metadata for rich editorial display
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

  const toggleHeldSpace = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    setHeldSpaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  if (selectedPostId) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-8">
        <DiscussionThread
          postId={selectedPostId}
          onBack={() => setSelectedPostId(null)}
        />
      </div>
    );
  }

  // Filter & Search Logic
  const filteredPosts = posts.filter((post) => {
    const meta = DILEMMA_METADATA[post.id];
    const textMatch =
      post.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      post.display_name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (meta && meta.title.toLowerCase().includes(searchFilter.toLowerCase()));

    if (!textMatch) return false;

    // Filter by Dilemma Theme
    if (selectedCategory !== "all") {
      if (!meta || meta.category !== selectedCategory) return false;
    }

    // Filter by Tradition
    if (selectedTradition !== "all") {
      if (!meta) return true;
      if (!meta.tradition.toLowerCase().includes(selectedTradition.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  // Sort Logic
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortOption === "replies") {
      return (b.reply_count || 0) - (a.reply_count || 0);
    }
    if (sortOption === "held_space") {
      const likesA = (DILEMMA_METADATA[a.id]?.likes || 0) + (heldSpaceIds.has(a.id) ? 1 : 0);
      const likesB = (DILEMMA_METADATA[b.id]?.likes || 0) + (heldSpaceIds.has(b.id) ? 1 : 0);
      return likesB - likesA;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="w-full flex flex-col">
      {/* 1. Cinematic Campfire Sanctuary Banner */}
      <section
        className="relative w-full bg-cover bg-center bg-no-repeat border-b border-[#242830]"
        style={{
          backgroundImage: "url('/images/community_campfire.jpg')",
        }}
      >
        {/* Calibrated dark charcoal overlay */}
        <div className="absolute inset-0 bg-[#171A1F]/60 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#171A1F]/80 via-[#171A1F]/40 to-[#171A1F] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 pt-16 pb-20 sm:pt-20 sm:pb-24 flex flex-col items-center text-center">
          {/* Subtle Sanctuary Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#171A1F]/80 backdrop-blur-md border border-[#2E333D] text-xs text-[#E7E1D5] mb-5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#B69A61] animate-pulse" />
            <span className="text-[11px] uppercase tracking-wider text-[#9EA3AF]">
              Sanctuary Campfire • Anonymous & Ephemeral
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-[#E7E1D5] tracking-tight leading-[1.15] max-w-3xl drop-shadow-md">
            Real People. Real Stories. You are not alone.
          </h1>

          {/* Subtitle */}
          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#E7E1D5]/90 max-w-2xl font-light leading-relaxed drop-shadow">
            A confidential haven to read authentic ethical dilemmas, discover how ancient canons illuminate modern life, and offer solace under complete anonymity.
          </p>

          {/* Action Button & Sanctuary Stats */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-[#B69A61] hover:bg-[#c4a96e] text-[#171A1F] font-semibold text-sm transition-colors shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Share Your Story Anonymously</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-[#9EA3AF] bg-[#171A1F]/80 backdrop-blur-md px-3.5 py-2 rounded-lg border border-[#2E333D]">
              <ShieldCheck className="w-4 h-4 text-[#B69A61]" />
              <span>Auto-scrubbed PII • Zero telemetry</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Community Feed Stage */}
      <div className="max-w-4xl w-full mx-auto px-5 sm:px-8 py-10 flex flex-col gap-8">
        {/* Filter & Search Toolbar */}
        <div className="flex flex-col gap-4 p-4 rounded-xl bg-[#242830] border border-[#2E333D]">
          {/* Row 1: Search & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EA3AF]" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search inquiries, dilemma keywords, or authors..."
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

            {/* Sorting Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#1E222A] rounded-lg border border-[#2E333D] shrink-0">
              <button
                onClick={() => setSortOption("latest")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortOption === "latest"
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                Latest Solace
              </button>
              <button
                onClick={() => setSortOption("replies")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortOption === "replies"
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                Most Contemplated
              </button>
              <button
                onClick={() => setSortOption("held_space")}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                  sortOption === "held_space"
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                Deep Resonances
              </button>
            </div>
          </div>

          {/* Row 2: Theme / Life Crossroads Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 scrollbar-none">
            <span className="text-xs uppercase tracking-wider text-[#9EA3AF] mr-1 shrink-0">
              Theme:
            </span>
            {[
              { id: "all", label: "All Crossroads" },
              { id: "duty", label: "Duty & Family" },
              { id: "career", label: "Career & Calling" },
              { id: "forgiveness", label: "Forgiveness & Healing" },
              { id: "solitude", label: "Solitude & Peace" },
              { id: "ambition", label: "Ambition & Surrender" },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedCategory(theme.id)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === theme.id
                    ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                    : "bg-[#1E222A] hover:bg-[#2A2F3A] text-[#9EA3AF] hover:text-[#E7E1D5] border border-[#2E333D]"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>

          {/* Row 3: Scripture Canon Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-[#2E333D]/60 scrollbar-none">
            <span className="text-xs uppercase tracking-wider text-[#9EA3AF] mr-1 shrink-0">
              Canon:
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
                className={`px-2.5 py-0.5 rounded text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTradition === t.id
                    ? "bg-[#B69A61]/20 border border-[#B69A61] text-[#B69A61] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Feed Cards Stream */}
        {loading ? (
          <div className="flex justify-center items-center py-20 text-[#B69A61]">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="text-center py-16 text-[#9EA3AF] bg-[#242830] rounded-xl border border-[#2E333D]">
            <p className="font-serif text-lg text-[#E7E1D5]">No reflections found matching this inquiry.</p>
            <p className="text-xs mt-1">Try clearing filters or be the first to share an inquiry.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {sortedPosts.map((post) => {
              const meta = DILEMMA_METADATA[post.id];
              const isHeld = heldSpaceIds.has(post.id);
              const likeCount = (meta?.likes || 42) + (isHeld ? 1 : 0);

              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className="group flex flex-col rounded-xl bg-[#242830] hover:bg-[#282D37] border border-[#2E333D] hover:border-[#3D4452] transition-colors p-6 sm:p-7 cursor-pointer border-l-2 border-l-[#B69A61]"
                >
                  {/* Card Header: Author, Time & Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs text-[#9EA3AF]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1E222A] border border-[#2E333D] flex items-center justify-center text-[#B69A61] font-serif text-xs">
                        ॐ
                      </div>
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

                    {meta && (
                      <div className="flex items-center gap-2">
                        {meta.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded text-[11px] bg-[#1E222A] text-[#9EA3AF] border border-[#2E333D]"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="text-[11px] text-[#B69A61] font-medium">
                          {meta.tradition}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Headline Title */}
                  {meta && (
                    <h2 className="font-serif text-lg sm:text-xl text-[#E7E1D5] mb-2 group-hover:text-[#B69A61] transition-colors">
                      {meta.title}
                    </h2>
                  )}

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-base text-[#E7E1D5]/90 leading-relaxed line-clamp-3">
                      {post.content}
                    </p>
                  </div>

                  {/* Scripture Insight Callout Accent */}
                  {meta && (
                    <div className="mb-4 p-3.5 rounded-lg bg-[#1E222A] border-l-2 border-[#B69A61] flex items-start gap-3">
                      <BookOpen className="w-4 h-4 text-[#B69A61] shrink-0 mt-0.5" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-serif italic text-sm text-[#E7E1D5]">
                          “{meta.quote}”
                        </span>
                        <span className="text-[11px] text-[#B69A61] uppercase tracking-wider font-medium">
                          — {meta.source}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Bottom Action Row */}
                  <div className="pt-2 flex items-center justify-between text-xs text-[#9EA3AF]">
                    <div className="flex items-center gap-5">
                      <button
                        type="button"
                        onClick={(e) => toggleHeldSpace(e, post.id)}
                        className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isHeld ? "text-rose-400 font-semibold" : "hover:text-[#E7E1D5]"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isHeld ? "fill-current" : ""}`} />
                        <span>{likeCount} Held space</span>
                      </button>

                      <span className="flex items-center gap-1.5 text-[#E7E1D5]">
                        <MessageSquare className="w-3.5 h-3.5 text-[#B69A61]" />
                        <span>{post.reply_count || 0} reflections</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[#B69A61] font-medium group-hover:translate-x-0.5 transition-transform">
                      <span>Enter Reflection</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

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
          if (newPostId) setSelectedPostId(newPostId);
        }}
      />
    </div>
  );
};
