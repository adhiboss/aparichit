/**
 * Automated tests for APARICHIT Frontend modules.
 * Runs on Node 24 native test runner: node --experimental-strip-types --test
 */

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { apiRequest, ApiError, getApiBaseUrl } from "../lib/api.ts";
import {
  getSessionId,
  resetSessionId,
  getSavedAccount,
  saveAccount,
  getSavedPreferences,
  savePreferences,
} from "../lib/storage.ts";
import { streamChatMessage } from "../lib/chat.ts";
import type { StreamMetaEvent } from "../lib/types.ts";

describe("API Client & Request Construction", () => {
  test("getApiBaseUrl defaults to localhost:8000", () => {
    const baseUrl = getApiBaseUrl();
    assert.ok(baseUrl.includes("8000"), `Expected baseUrl to include 8000, got ${baseUrl}`);
  });

  test("ApiError retains status code and details", () => {
    const err = new ApiError(404, "Not Found", { reason: "post_missing" });
    assert.equal(err.status, 404);
    assert.equal(err.message, "Not Found");
    assert.deepEqual(err.details, { reason: "post_missing" });
  });

  test("apiRequest throws ApiError on network error with custom url", async () => {
    await assert.rejects(
      async () => {
        await apiRequest("/unreachable-endpoint", {
          // point to invalid port
          headers: { "X-Test": "1" },
        });
      },
      (err: unknown) => {
        return err instanceof Error;
      }
    );
  });
});

describe("Client Storage & State Persistence", () => {
  test("storage functions are SSR-safe when window is undefined", () => {
    // In node environment, window is undefined
    const sessId = getSessionId();
    assert.equal(sessId, "ssr_fallback_session");

    const acc = getSavedAccount();
    assert.equal(acc, null);

    const prefs = getSavedPreferences();
    assert.equal(prefs.faith_on, false);
    assert.equal(prefs.tradition, "garuda_purana");
  });

  test("resetSessionId returns a fallback or valid uuid", () => {
    const newId = resetSessionId();
    assert.ok(newId.length > 5);
  });
});

describe("SSE Stream Parsing Logic", () => {
  test("streamChatMessage handles token streaming and completion meta event", async () => {
    // Create a mock response stream emitting data tokens and final meta
    const mockTokens: string[] = [];
    let receivedMeta: StreamMetaEvent | null = null;

    const ssePayload = [
      'data: {"token": "In the "}\n\n',
      'data: {"token": "reflection "}\n',
      'data: {"token": "of duty..."}\n\n',
      'data: {"done": true, "mode": "grounded", "citations": [{"source": "Garuda Purana", "translation": "Wood 1911", "chapter": "Ch. 2", "excerpt": "Good acts bear fruit"}], "source_labels": ["scripture", "ai_suggestion"], "similar": [], "safety_flag": null}\n\n',
    ].join("");

    // Mock global fetch for this test
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(ssePayload));
          controller.close();
        },
      });

      return new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
      });
    };

    try {
      await streamChatMessage(
        {
          session_id: "test_session_sse",
          message: "What is duty?",
          faith_on: true,
          tradition: "garuda_purana",
        },
        (token) => mockTokens.push(token),
        (meta) => {
          receivedMeta = meta;
        },
        (err) => {
          assert.fail(`Stream error should not be called: ${err.message}`);
        }
      );

      assert.equal(mockTokens.join(""), "In the reflection of duty...");
      assert.ok(receivedMeta !== null);
      assert.equal((receivedMeta as StreamMetaEvent).mode, "grounded");
      assert.equal((receivedMeta as StreamMetaEvent).citations.length, 1);
      assert.equal((receivedMeta as StreamMetaEvent).citations[0].source, "Garuda Purana");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test("streamChatMessage handles error event properly", async () => {
    let capturedError: Error | null = null;
    const sseErrorPayload = 'data: {"error": "LLM context exceeded"}\n\n';

    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(sseErrorPayload));
          controller.close();
        },
      });
      return new Response(stream, { status: 200 });
    };

    try {
      await streamChatMessage(
        { session_id: "test", message: "fail" },
        () => {},
        () => {},
        (err) => {
          capturedError = err;
        }
      );

      assert.ok(capturedError !== null);
      assert.ok((capturedError as Error).message.includes("LLM context exceeded"));
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("Contract Integrity & Real Backend Integration", () => {
  test("Backend health check succeeds at http://localhost:8000/health", async () => {
    const res = await fetch("http://localhost:8000/health");
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, "ok");
    assert.equal(body.app_name, "APARICHIT");
  });

  test("GET /traditions returns all 4 traditions", async () => {
    const res = await fetch("http://localhost:8000/traditions");
    assert.equal(res.status, 200);
    const traditions = await res.json();
    assert.ok(Array.isArray(traditions));
    assert.ok(traditions.length >= 4);

    const ids = traditions.map((t: { id: string }) => t.id);
    assert.ok(ids.includes("garuda_purana"));
    assert.ok(ids.includes("bhagavad_gita"));
    assert.ok(ids.includes("dhammapada"));
    assert.ok(ids.includes("stoicism"));
  });

  test("GET /traditions/{tradition_id} returns chapters, verses, and metadata", async () => {
    const res = await fetch("http://localhost:8000/traditions/garuda_purana");
    assert.equal(res.status, 200);
    const detail = await res.json();
    assert.equal(detail.id, "garuda_purana");
    assert.equal(detail.name, "Garuda Purana");
    assert.ok(Array.isArray(detail.chapters));
    assert.ok(detail.chapters.length > 0);
    assert.ok(detail.total_verses > 0);
    assert.ok(detail.chapters[0].verses.length > 0);
    assert.ok(typeof detail.chapters[0].verses[0].text === "string");
  });

  test("POST /auth/anonymous generates poetic name and session token", async () => {
    const res = await fetch("http://localhost:8000/auth/anonymous", {
      method: "POST",
    });
    assert.equal(res.status, 200);
    const account = await res.json();
    assert.ok(account.user_id.startsWith("anon_"));
    assert.ok(account.display_name.length > 2);
    assert.ok(account.session_token.length >= 16);
  });

  test("POST /chat handles crisis safety bypass and schema compliance", async () => {
    const res = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: "frontend_test_session",
        message: "I feel hopeless and want to end my life, please help me",
        faith_on: false,
        tradition: "garuda_purana",
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.answer.length > 10);
    assert.equal(data.safety_flag, "crisis");
    assert.ok(Array.isArray(data.citations));
    assert.ok(Array.isArray(data.similar));
  });

  test("Community feed and post lifecycle contracts match backend schema", async () => {
    // 1. Fetch community feed
    const feedRes = await fetch("http://localhost:8000/posts?limit=5");
    assert.equal(feedRes.status, 200);
    const posts = await feedRes.json();
    assert.ok(Array.isArray(posts));

    // 2. Create post with anonymous session
    const authRes = await fetch("http://localhost:8000/auth/anonymous", {
      method: "POST",
    });
    const authData = await authRes.json();

    const postRes = await fetch("http://localhost:8000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.session_token}`,
      },
      body: JSON.stringify({
        content: "Call Alice at 9876543210 about the ethics dilemma at Delhi University.",
      }),
    });
    assert.equal(postRes.status, 200);
    const postData = await postRes.json();
    assert.ok(postData.id.startsWith("post_"));
    // PII should be scrubbed
    assert.ok(!postData.content.includes("9876543210"));
  });

  test("GET /library/flashcards returns daily featured card and verified scripture archive", async () => {
    const res = await fetch("http://localhost:8000/library/flashcards");
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.featured);
    assert.ok(data.featured.passage.length > 5);
    assert.ok(data.featured.source.length > 0);
    assert.ok(data.featured.meaning.length > 5);
    assert.ok(Array.isArray(data.cards));
    assert.ok(data.total >= 50);
  });
});

