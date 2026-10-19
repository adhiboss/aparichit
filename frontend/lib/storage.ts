/**
 * Client storage utility for anonymous account, session, and user preferences.
 * Fully SSR-safe (checks typeof window !== 'undefined').
 */

import type { AnonymousAccount } from "./types.ts";

const SESSION_ID_KEY = "aparichit_session_id";
const ACCOUNT_KEY = "aparichit_anonymous_account";
const PREFS_KEY = "aparichit_preferences";

export interface UserPreferences {
  faith_on: boolean;
  tradition: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  faith_on: false,
  tradition: "garuda_purana",
};

/**
 * Retrieve or generate a conversation session ID from sessionStorage.
 * Survives page reloads within the same browser tab.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") {
    return "ssr_fallback_session";
  }
  try {
    let sessionId = window.sessionStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      window.sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/**
 * Clear the current conversational session ID and generate a fresh one.
 */
export function resetSessionId(): string {
  if (typeof window === "undefined") return "ssr_fallback_session";
  try {
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    window.sessionStorage.setItem(SESSION_ID_KEY, newId);
    return newId;
  } catch {
    return `sess_${Date.now()}`;
  }
}

/**
 * Retrieve the saved anonymous account from localStorage.
 */
export function getSavedAccount(): AnonymousAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACCOUNT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AnonymousAccount;
  } catch {
    return null;
  }
}

/**
 * Persist the anonymous account in localStorage.
 */
export function saveAccount(account: AnonymousAccount): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch (err) {
    console.error("Failed to save account to localStorage", err);
  }
}

/**
 * Clear the saved anonymous account.
 */
export function clearSavedAccount(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(ACCOUNT_KEY);
  } catch {}
}

/**
 * Retrieve user preferences (faith_on toggle and selected tradition).
 */
export function getSavedPreferences(): UserPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);
    return {
      faith_on: typeof parsed.faith_on === "boolean" ? parsed.faith_on : false,
      tradition: parsed.tradition || "garuda_purana",
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Persist user preferences in localStorage.
 */
export function savePreferences(prefs: Partial<UserPreferences>): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedPreferences();
    const updated = { ...current, ...prefs };
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save preferences to localStorage", err);
  }
}

const SAVED_FLASHCARDS_KEY = "aparichit_saved_flashcards";

/**
 * Retrieve the list of saved flashcard IDs.
 */
export function getSavedFlashcardIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SAVED_FLASHCARDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Toggle bookmark state for a flashcard ID.
 * Returns true if now saved, false if removed.
 */
export function toggleSavedFlashcardId(id: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const current = getSavedFlashcardIds();
    const index = current.indexOf(id);
    let updated: string[];
    let isNowSaved = false;
    if (index >= 0) {
      updated = current.filter((item) => item !== id);
      isNowSaved = false;
    } else {
      updated = [...current, id];
      isNowSaved = true;
    }
    window.localStorage.setItem(SAVED_FLASHCARDS_KEY, JSON.stringify(updated));
    return isNowSaved;
  } catch {
    return false;
  }
}

/**
 * Check if a flashcard is currently saved.
 */
export function isFlashcardSaved(id: string): boolean {
  return getSavedFlashcardIds().includes(id);
}
