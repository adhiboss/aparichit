/**
 * Anonymous account management service.
 */

import { apiRequest } from "./api.ts";
import { getSavedAccount, saveAccount } from "./storage.ts";
import type { AnonymousAccount } from "./types.ts";

/**
 * Register a new anonymous identity from the backend.
 */
export async function createAnonymousAccount(): Promise<AnonymousAccount> {
  const account = await apiRequest<AnonymousAccount>("/auth/anonymous", {
    method: "POST",
  });
  saveAccount(account);
  return account;
}

/**
 * Get the current anonymous account from localStorage or initialize one immediately.
 */
export async function getOrInitAccount(): Promise<AnonymousAccount> {
  const existing = getSavedAccount();
  if (existing && existing.session_token) {
    return existing;
  }
  return createAnonymousAccount();
}
