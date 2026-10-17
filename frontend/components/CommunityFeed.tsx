"use client";

import React, { useEffect, useState } from "react";
import { CommunityPost } from "@/lib/types";
import { fetchCommunityPosts } from "@/lib/posts";
import { DiscussionThread } from "./DiscussionThread";
import { ShareStoryModal } from "./ShareStoryModal";
import {
  Users,
  Search,
  Filter,
  Plus,
  Heart,
  MessageSquare,
  Clock,
  Loader2,
  AlertCircle,
  MoreHorizontal,
} from "lucide-react";

interface CommunityFeedProps {
  initialPostId?: string;
}

const SAMPLE_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "post_sample_1",
    user_id: "anon_1",
    display_name: "Quiet River",
    content:
      "Feeling guilty for moving abroad: I want to move abroad for better career opportunities, but I feel guilty leaving my aging parents. Am I being selfish? Any advice or similar experiences?",
    reply_count: 18,
    created_at: "2026-10-17T20:00:00.000Z",
  },
  {
    id: "post_sample_2",
    user_id: "anon_2",
    display_name: "Golden Leaf",
    content:
      "How to forgive someone? Someone close to me hurt me deeply. I still feel angry even though I want to let go. How do I genuinely forgive and move on without resentment?",
    reply_count: 12,
    created_at: "2026-10-17T17:00:00.000Z",
  },
  {
    id: "post_sample_3",
    user_id: "anon_3",
    display_name: "Silent Peak",
    content:
      "Dealing with loneliness: I feel lonely even when I'm surrounded by friends and family. How do I find peace within myself instead of constantly seeking validation outside?",
    reply_count: 29,
    created_at: "2026-10-16T18:00:00.000Z",
  },
  {
    id: "post_sample_4",
    user_id: "anon_4",
    display_name: "Moon Child",
    content:
      "Funny question: Do pets have karma? Just a lighthearted question. Do animals have karma too? What does ancient wisdom say about our companion dogs and cats?",
    reply_count: 26,
    created_at: "2026-10-15T18:00:00.000Z",
  },
];

const TOPIC_TAGS: Record<string, string[]> = {
  post_sample_1: ["Family", "Life Decisions", "Career"],
  post_sample_2: ["Relationships", "Forgiveness"],
  post_sample_3: ["Mental Health", "Inner Peace"],
  post_sample_4: ["Funny", "Spiritual", "Animals"],
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
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    async function loadBackendPosts() {
      try {
        setLoading(true);
        const backendPosts = await fetchCommunityPosts(30, 0);
        if (backendPosts && backendPosts.length > 0) {
          // Merge backend posts with sample posts if needed
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

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  if (selectedPostId) {
    return (
      <DiscussionThread
        postId={selectedPostId}
        onBack={() => setSelectedPostId(null)}
      />
    );
  }

  const filteredPosts = posts.filter((p) => {
    if (!searchFilter) return true;
    return (
      p.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.display_name.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  return (
    <section className="rounded-2xl bg-[#151b26] border border-[#232c3f] p-5 shadow-xl space-y-4">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#232c3f]/60">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-[#1e2536] border border-[#e6af2e]/50 flex items-center justify-center text-[#e6af2e] font-bold text-xs shrink-0 mt-0.5">
            3
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f0f2f5]">
              Anonymous Community
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Real people, real stories. Share your own, read others and support each other.
            </p>
          </div>
        </div>

        {/* Search, Filter, Sort and New Post Button (Matching Image 1) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#64748b] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search posts..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-[#0d111a] border border-[#232c3f] text-xs text-[#f0f2f5] placeholder-[#64748b] focus:outline-none focus:border-[#e6af2e]/50 w-36 sm:w-44"
            />
          </div>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl bg-[#0d111a] border border-[#232c3f] text-xs text-[#cbd5e1] focus:outline-none cursor-pointer"
          >
            <option value="All Topics">Filter: All Topics</option>
            <option value="Family">Family & Relationships</option>
            <option value="Career">Career & Purpose</option>
            <option value="Mental Health">Mental Peace & Anxiety</option>
            <option value="Spiritual">Spiritual & Ethics</option>
          </select>

          {/* Sort */}
          <select className="px-2.5 py-1.5 rounded-xl bg-[#0d111a] border border-[#232c3f] text-xs text-[#cbd5e1] focus:outline-none cursor-pointer">
            <option>Latest</option>
            <option>Most Replied</option>
            <option>Most Liked</option>
          </select>

          {/* + New Post Button */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1e2536] hover:bg-[#283247] border border-[#e6af2e]/40 text-[#e6af2e] text-xs font-semibold transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Posts Cards Grid (Matching Image 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredPosts.map((post, idx) => {
          const tags = TOPIC_TAGS[post.id] || ["Life Decisions", "Reflection"];
          const likes = [42, 31, 67, 98][idx % 4] || 25;

          // Split title and body if starts with title:
          const hasColon = post.content.includes(":");
          const title = hasColon
            ? post.content.split(":")[0]
            : post.content.slice(0, 40) + "...";
          const snippet = hasColon
            ? post.content.slice(post.content.indexOf(":") + 1).trim()
            : post.content;

          return (
            <div
              key={post.id}
              onClick={() => setSelectedPostId(post.id)}
              className="p-4 rounded-xl bg-[#0d111a] border border-[#232c3f] hover:border-[#e6af2e]/50 hover:bg-[#131924] transition-all cursor-pointer flex flex-col justify-between group shadow-sm space-y-3"
            >
              <div className="space-y-2">
                {/* Author Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 to-rose-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {post.display_name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#f0f2f5] group-hover:text-[#e6af2e] transition-colors">
                        {post.display_name}
                      </div>
                      <div className="text-[10px] text-[#64748b]">
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  <MoreHorizontal className="w-3.5 h-3.5 text-[#64748b] group-hover:text-[#94a3b8]" />
                </div>

                {/* Title */}
                <h4 className="text-xs font-semibold text-[#f0f2f5] line-clamp-1 group-hover:text-[#e6af2e] transition-colors">
                  {title}
                </h4>

                {/* Content */}
                <p className="text-[11px] text-[#94a3b8] line-clamp-3 leading-relaxed">
                  {snippet}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-[#171c28] text-[#94a3b8] border border-[#232c3f]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer: Likes & Replies */}
              <div className="pt-2.5 border-t border-[#232c3f]/50 flex items-center justify-between text-[11px] text-[#94a3b8]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 hover:text-rose-400 transition-colors">
                    <Heart className="w-3 h-3 text-rose-500/80" />
                    <span>{likes}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[#e6af2e]/80" />
                    <span>{post.reply_count}</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#e6af2e] group-hover:underline">
                  Read →
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <ShareStoryModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        initialContent=""
        onPostCreated={(newId) => setSelectedPostId(newId)}
      />
    </section>
  );
};
