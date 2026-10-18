/**
 * TypeScript type definitions matching the APARICHIT FastAPI backend schemas.
 */

export type AdviceMode = "grounded" | "inspired" | "playful";

export type SafetyFlag = "crisis" | "harmful" | "medical" | "legal" | null;

export type SourceLabel =
  | "scripture"
  | "ai_suggestion"
  | "community_experience"
  | "crisis_support";

export interface Citation {
  source: string;
  translation: string;
  chapter: string;
  verse?: string | null;
  excerpt: string;
}

export interface SimilarProblem {
  post_id: string;
  display_name: string;
  snippet: string;
  reply_count?: number;
  similarity: number;
}

export interface TraditionVerse {
  verse: string;
  text: string;
  topics: string[];
}

export interface TraditionChapter {
  chapter: number;
  chapter_title: string;
  section: string;
  verses: TraditionVerse[];
}

export interface TraditionDetail {
  id: string;
  name: string;
  source: string;
  translation: string;
  default_section: string;
  description: string;
  chapters: TraditionChapter[];
  total_verses: number;
}

export interface TraditionItem {
  id: string;
  name: string;
  translation: string;
  description: string;
}

export interface ChatRequest {
  session_id: string;
  message: string;
  faith_on?: boolean;
  tradition?: string;
}

export interface ChatResponse {
  answer: string;
  mode: AdviceMode;
  citations: Citation[];
  source_labels: SourceLabel[];
  similar: SimilarProblem[];
  safety_flag: SafetyFlag;
}

export interface StreamMetaEvent {
  done: true;
  mode: AdviceMode;
  citations: Citation[];
  source_labels: SourceLabel[];
  similar: SimilarProblem[];
  safety_flag: SafetyFlag;
}

export interface AnonymousAccount {
  user_id: string;
  display_name: string;
  session_token: string;
  created_at: string;
}

export interface PostReply {
  id: string;
  post_id: string;
  user_id: string;
  display_name: string;
  content: string;
  is_crisis?: boolean;
  status?: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  display_name: string;
  content: string;
  reply_count: number;
  is_crisis?: boolean;
  status?: string;
  created_at: string;
  replies?: PostReply[] | null;
}

export interface CreatePostRequest {
  content: string;
  session_token?: string;
}

export interface CreateReplyRequest {
  content: string;
  session_token?: string;
}

export interface CreateReportRequest {
  target_type: "post" | "reply";
  target_id: string;
  reason: "harassment" | "spam" | "inappropriate" | "other" | string;
  session_token?: string;
}

export interface ReportResponse {
  id: string;
  target_type: string;
  target_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  mode?: AdviceMode;
  citations?: Citation[];
  source_labels?: SourceLabel[];
  similar?: SimilarProblem[];
  safety_flag?: SafetyFlag;
  isStreaming?: boolean;
}
