/**
 * Chat and streaming service for APARICHIT.
 */

import { apiRequest, getApiBaseUrl } from "./api.ts";
import type {
  ChatRequest,
  ChatResponse,
  StreamMetaEvent,
  TraditionDetail,
  TraditionItem,
} from "./types.ts";

/**
 * Fetch supported traditions from the backend.
 */
export async function fetchTraditions(): Promise<TraditionItem[]> {
  return apiRequest<TraditionItem[]>("/traditions");
}

/**
 * Fetch complete scripture chapters, verses, and historical metadata for a tradition.
 */
export async function fetchTraditionDetail(
  traditionId: string
): Promise<TraditionDetail> {
  return apiRequest<TraditionDetail>(`/traditions/${encodeURIComponent(traditionId)}`);
}

/**
 * Standard non-streaming chat fallback.
 */
export async function sendChatMessage(
  payload: ChatRequest
): Promise<ChatResponse> {
  return apiRequest<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Stream advice tokens and metadata via Server-Sent Events (POST /chat/stream).
 */
export async function streamChatMessage(
  payload: ChatRequest,
  onToken: (token: string) => void,
  onMeta: (meta: StreamMetaEvent) => void,
  onError: (error: Error) => void,
  signal?: AbortSignal
): Promise<void> {
  const url = `${getApiBaseUrl()}/chat/stream`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      let message = `Stream connection failed: HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) message = errorJson.detail;
      } catch {
        // fallback to status text
      }
      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("Response body is not readable for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      // Keep unfinished line in buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue; // ignore empty or keep-alive comments

        if (trimmed.startsWith("data:")) {
          const jsonStr = trimmed.slice(5).trim();
          try {
            const data = JSON.parse(jsonStr);

            if (data.token !== undefined) {
              onToken(data.token);
            } else if (data.done === true) {
              onMeta(data as StreamMetaEvent);
            } else if (data.error) {
              onError(new Error(data.error));
            }
          } catch (parseErr) {
            console.warn("Failed to parse SSE line:", trimmed, parseErr);
          }
        }
      }
    }

    // Process any trailing line in buffer
    if (buffer.trim().startsWith("data:")) {
      try {
        const data = JSON.parse(buffer.trim().slice(5).trim());
        if (data.token !== undefined) onToken(data.token);
        if (data.done === true) onMeta(data as StreamMetaEvent);
      } catch {}
    }
  } catch (err: unknown) {
    if (signal?.aborted) {
      return; // Handled cancel
    }
    const error = err instanceof Error ? err : new Error(String(err));
    onError(error);
  }
}

/**
 * Fetch conversational history stored on the server for this session.
 */
export async function fetchSessionHistory(
  sessionId: string
): Promise<{ session_id: string; messages: Array<{ role: string; content: string }> }> {
  return apiRequest(`/sessions/${encodeURIComponent(sessionId)}`);
}

/**
 * Clear server-side session memory for this session ID.
 */
export async function clearSessionHistory(
  sessionId: string
): Promise<{ session_id: string; cleared: boolean }> {
  return apiRequest(`/sessions/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}
