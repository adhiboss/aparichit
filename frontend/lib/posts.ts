/**
 * Community posts, replies, and similar-problem matching services.
 */

import { apiRequest } from "./api.ts";
import type { CommunityPost, PostReply, SimilarProblem } from "./types.ts";

/**
 * Fetch published community posts.
 */
export async function fetchCommunityPosts(
  limit: number = 20,
  offset: number = 0
): Promise<CommunityPost[]> {
  return apiRequest<CommunityPost[]>("/posts", {
    params: { limit, offset },
  });
}

/**
 * Fetch a single community post by ID including its replies.
 */
export async function fetchPostDetail(postId: string): Promise<CommunityPost> {
  return apiRequest<CommunityPost>(`/posts/${encodeURIComponent(postId)}`);
}

/**
 * Share a dilemma to the community feed.
 * PII is automatically scrubbed by the backend server.
 */
export async function createCommunityPost(
  content: string,
  token?: string
): Promise<CommunityPost> {
  return apiRequest<CommunityPost>("/posts", {
    method: "POST",
    token,
    body: JSON.stringify({
      content,
      session_token: token,
    }),
  });
}

/**
 * Submit a supportive reply to a community post.
 */
export async function createPostReply(
  postId: string,
  content: string,
  token?: string
): Promise<PostReply> {
  return apiRequest<PostReply>(`/posts/${encodeURIComponent(postId)}/replies`, {
    method: "POST",
    token,
    body: JSON.stringify({
      content,
      session_token: token,
    }),
  });
}

/**
 * Find semantically similar dilemmas by natural language query or existing post ID.
 */
export async function fetchSimilarPosts(params: {
  post_id?: string;
  query?: string;
  limit?: number;
}): Promise<SimilarProblem[]> {
  return apiRequest<SimilarProblem[]>("/similar", {
    params: {
      post_id: params.post_id,
      query: params.query,
      limit: params.limit || 3,
    },
  });
}
