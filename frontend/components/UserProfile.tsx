"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Trash2,
  Sparkles,
  BookOpen,
  Lock,
  Compass,
  ArrowRight,
  EyeOff,
  Flame,
  Settings,
  Info,
} from "lucide-react";
import {
  getSavedAccount,
  saveAccount,
  clearSavedAccount,
  getSessionId,
  resetSessionId,
  getSavedPreferences,
  savePreferences,
  UserPreferences,
} from "../lib/storage.ts";
import { createAnonymousAccount, getOrInitAccount } from "../lib/auth.ts";
import { clearSessionHistory } from "../lib/chat.ts";
import type { AnonymousAccount } from "../lib/types.ts";

interface UserProfileProps {
  onStartChat?: (initialPrompt?: string) => void;
  onExploreLibrary?: () => void;
  onExploreCommunity?: () => void;
  onPreferencesUpdated?: (prefs: UserPreferences) => void;
}

const TRADITIONS_LIST = [
  {
    id: "garuda_purana",
    name: "Garuda Purana",
    symbol: "ॐ",
    translator: "Wood & Subrahmanyam 1911",
    desc: "Classical discourse on karma, moral duty, and ethical reckoning.",
  },
  {
    id: "bhagavad_gita",
    name: "Bhagavad Gita",
    symbol: "ॐ",
    translator: "Edwin Arnold 1885",
    desc: "Selfless action (karma yoga), equanimity, and overcoming dilemma.",
  },
  {
    id: "dhammapada",
    name: "Dhammapada",
    symbol: "☸",
    translator: "Max Müller 1881",
    desc: "Mindful awareness, overcoming anger, and mental self-mastery.",
  },
  {
    id: "stoicism",
    name: "Meditations (Stoicism)",
    symbol: "🏛",
    translator: "George Long 1862",
    desc: "Marcus Aurelius on internal control and emotional serenity.",
  },
];

export const UserProfile: React.FC<UserProfileProps> = ({
  onStartChat,
  onExploreLibrary,
  onExploreCommunity,
  onPreferencesUpdated,
}) => {
  const [account, setAccount] = useState<AnonymousAccount | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({
    faith_on: true,
    tradition: "garuda_purana",
  });
  const [sessionId, setSessionId] = useState<string>("");
  const [isRotating, setIsRotating] = useState(false);
  const [isClearingHistory, setIsClearingHistory] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize account, session, and preferences on mount
  useEffect(() => {
    let mounted = true;
    const currentSession = getSessionId();
    const currentPrefs = getSavedPreferences();

    if (mounted) {
      setSessionId(currentSession);
      setPreferences(currentPrefs);
    }

    getOrInitAccount()
      .then((acc) => {
        if (mounted && acc) {
          setAccount(acc);
        }
      })
      .catch((err) => {
        console.error("Failed to load account in UserProfile", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleRotateIdentity = async () => {
    if (isRotating) return;
    setIsRotating(true);
    try {
      const newAcc = await createAnonymousAccount();
      setAccount(newAcc);
      showToast(`Identity rotated: Welcome, ${newAcc.display_name}!`);
    } catch (err) {
      console.error("Identity rotation failed:", err);
      showToast("Could not rotate identity. Please verify connection.");
    } finally {
      setIsRotating(false);
    }
  };

  const handleToggleFaith = (enabled: boolean) => {
    const updated = { ...preferences, faith_on: enabled };
    setPreferences(updated);
    savePreferences(updated);
    if (onPreferencesUpdated) onPreferencesUpdated(updated);
    showToast(
      enabled
        ? "Spiritual guidance enabled by default (On ॐ)"
        : "Spiritual guidance disabled by default"
    );
  };

  const handleSelectTradition = (tradId: string) => {
    const updated = { ...preferences, tradition: tradId };
    setPreferences(updated);
    savePreferences(updated);
    if (onPreferencesUpdated) onPreferencesUpdated(updated);
    const trad = TRADITIONS_LIST.find((t) => t.id === tradId);
    showToast(`Default tradition set to ${trad?.name || tradId}`);
  };

  const handleClearServerHistory = async () => {
    if (isClearingHistory) return;
    setIsClearingHistory(true);
    try {
      await clearSessionHistory(sessionId);
      const newId = resetSessionId();
      setSessionId(newId);
      showToast("Server conversation memory cleared & fresh session started.");
    } catch {
      // In case server session was already empty
      const newId = resetSessionId();
      setSessionId(newId);
      showToast("Session reset successfully.");
    } finally {
      setIsClearingHistory(false);
    }
  };

  const handleResetAllData = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all anonymous local data? This will clear your current pseudonym and session tokens."
      )
    ) {
      return;
    }

    clearSavedAccount();
    const newId = resetSessionId();
    setSessionId(newId);
    const newAcc = await createAnonymousAccount();
    setAccount(newAcc);
    showToast("All local records purged. Fresh anonymous persona initialized.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#e59a27] text-[#140e06] font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-4 h-4 text-[#140e06]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Profile Header Banner */}
      <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-6 shadow-2xl relative overflow-hidden">
        {/* Background ambient warm gold aura */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#e59a27]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#e59a27] text-xs font-semibold uppercase tracking-widest mb-1.5">
              <ShieldCheck className="w-4 h-4 text-[#e59a27]" />
              <span>Sanctuary of Sovereign Privacy</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-medium text-[#f2ede4] tracking-wide">
              Anonymous Profile & Identity
            </h1>
            <p className="font-body text-xs sm:text-sm text-[#b5aa9b] mt-1 max-w-2xl leading-relaxed">
              APARICHIT never collects your name, email, or telephone number. Your
              presence is identified purely by an ephemeral poetic pseudonym that
              you can regenerate anytime.
            </p>
          </div>

          {/* Privacy Guarantee Pill */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-xl bg-[#211a14] border border-[#362c22] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#122920] border border-[#1f4e3b] flex items-center justify-center text-[#34d399]">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-xs font-semibold text-[#f2ede4]">
                  Zero Tracking / No PII
                </span>
                <span className="block text-[10px] text-[#34d399]">
                  Cryptographically Anonymous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Identity Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Current Identity Details */}
        <div className="lg:col-span-2 rounded-2xl bg-[#1c1712] border border-[#362c22] p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#362c22]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#e59a27] to-amber-700 flex items-center justify-center text-[#140e06] font-bold text-xl shadow-lg shadow-[#e59a27]/20">
                {account?.display_name ? account.display_name.charAt(0) : "Q"}
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#e59a27] font-semibold">
                  Active Pseudonym
                </span>
                <h2 className="font-headline text-xl text-[#f2ede4] font-medium">
                  {account?.display_name || "Quiet River"}
                </h2>
              </div>
            </div>

            {/* Rotate Identity Button */}
            <button
              onClick={handleRotateIdentity}
              disabled={isRotating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#261f18] hover:bg-[#2e251d] border border-[#362c22] hover:border-[#e59a27]/50 text-xs font-semibold text-[#f2ede4] transition-all cursor-pointer shadow-sm group"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[#e59a27] group-hover:rotate-180 transition-transform ${
                  isRotating ? "animate-spin" : ""
                }`}
              />
              <span>Rotate Pseudonym</span>
            </button>
          </div>

          {/* Account Credentials / Anonymous Identifiers */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#211a14] border border-[#362c22] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="block text-[11px] text-[#7a6e5e]">
                  Anonymous Seeker ID
                </span>
                <span className="font-mono text-xs text-[#f2ede4]">
                  {account?.user_id || "anon_loading..."}
                </span>
              </div>
              <button
                onClick={() =>
                  handleCopy(account?.user_id || "", "uid", "User ID")
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#261f18] hover:bg-[#2b221a] border border-[#362c22] text-[11px] text-[#b5aa9b] hover:text-[#f2ede4] transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedKey === "uid" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34d399]" />
                    <span className="text-[#34d399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy ID</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#211a14] border border-[#362c22] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="block text-[11px] text-[#7a6e5e]">
                  Active Conversation Session ID
                </span>
                <span className="font-mono text-xs text-[#b5aa9b] truncate max-w-xs block">
                  {sessionId || "Active Session"}
                </span>
              </div>
              <button
                onClick={() =>
                  handleCopy(sessionId, "sess", "Session Token")
                }
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#261f18] hover:bg-[#2b221a] border border-[#362c22] text-[11px] text-[#b5aa9b] hover:text-[#f2ede4] transition-colors self-start sm:self-auto cursor-pointer"
              >
                {copiedKey === "sess" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#34d399]" />
                    <span className="text-[#34d399]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Session</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#17130f] border border-[#362c22]/70 space-y-1">
              <span className="text-xs font-semibold text-[#f2ede4] flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-[#e59a27]" />
                Zero Surveillance
              </span>
              <p className="text-[11px] text-[#7a6e5e] leading-relaxed">
                Queries are not trained upon, profiled, or correlated to your
                physical location or personal devices.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#17130f] border border-[#362c22]/70 space-y-1">
              <span className="text-xs font-semibold text-[#f2ede4] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#e59a27]" />
                Ephemeral Lifecycle
              </span>
              <p className="text-[11px] text-[#7a6e5e] leading-relaxed">
                You can flush your server session history or rotate your identity
                with a single click at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Quick Navigation & Activity */}
        <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e59a27] uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Sanctuary Navigation</span>
            </div>
            <h3 className="font-headline text-lg text-[#f2ede4] font-medium">
              Explore Wisdom Streams
            </h3>
            <p className="text-xs text-[#b5aa9b] mt-1 leading-relaxed">
              Continue your journey of self-reflection, ancient scripture study,
              or anonymous community discourse.
            </p>

            <div className="space-y-2.5 mt-5">
              {onStartChat && (
                <button
                  onClick={() => onStartChat()}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#211a14] hover:bg-[#29211a] border border-[#362c22] hover:border-[#e59a27]/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-[#e59a27]" />
                    <span className="text-xs font-medium text-[#f2ede4]">
                      Open Wisdom Chat
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7a6e5e] group-hover:text-[#e59a27] group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {onExploreLibrary && (
                <button
                  onClick={() => onExploreLibrary()}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#211a14] hover:bg-[#29211a] border border-[#362c22] hover:border-[#e59a27]/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-[#e59a27]" />
                    <span className="text-xs font-medium text-[#f2ede4]">
                      Scripture Wisdom Library
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7a6e5e] group-hover:text-[#e59a27] group-hover:translate-x-0.5 transition-all" />
                </button>
              )}

              {onExploreCommunity && (
                <button
                  onClick={() => onExploreCommunity()}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-[#211a14] hover:bg-[#29211a] border border-[#362c22] hover:border-[#e59a27]/40 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#e59a27]" />
                    <span className="text-xs font-medium text-[#f2ede4]">
                      Anonymous Community
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#7a6e5e] group-hover:text-[#e59a27] group-hover:translate-x-0.5 transition-all" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#17130f] border border-[#362c22]/80 text-[11px] text-[#7a6e5e]">
            Member since:{" "}
            <span className="text-[#b5aa9b]" suppressHydrationWarning>
              {account?.created_at
                ? new Date(account.created_at).toLocaleDateString()
                : "Active Today"}
            </span>
          </div>
        </div>
      </div>

      {/* Spiritual Guidance & Philosophical Preferences */}
      <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#e59a27] uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>Spiritual & Philosophical Defaults</span>
        </div>

        {/* Guidance Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#211a14] border border-[#362c22]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[#f2ede4]">
                Default Spiritual Guidance
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#261f18] border border-[#362c22] text-[#e59a27]">
                {preferences.faith_on ? "Enabled (On ॐ)" : "Secular (Off)"}
              </span>
            </div>
            <p className="text-xs text-[#b5aa9b] mt-1 leading-relaxed">
              When enabled, APARICHIT incorporates authentic sacred verses and
              philosophical reflections. When disabled, advice focuses on
              secular practical psychology.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.faith_on}
            onClick={() => handleToggleFaith(!preferences.faith_on)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              preferences.faith_on ? "bg-[#e59a27]" : "bg-[#29211a]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#140e06] shadow ring-0 transition duration-200 ease-in-out ${
                preferences.faith_on ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Scripture Tradition Radio Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-[#f2ede4]">
            Default Scripture Tradition:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TRADITIONS_LIST.map((t) => {
              const isSelected = preferences.tradition === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTradition(t.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? "bg-[#282018] border-[#e59a27] shadow-lg shadow-[#e59a27]/10"
                      : "bg-[#211a14] border-[#362c22] hover:border-[#e59a27]/40"
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base font-serif border ${
                      isSelected
                        ? "bg-[#e59a27]/20 border-[#e59a27] text-[#e59a27]"
                        : "bg-[#261f18] border-[#362c22] text-[#b5aa9b]"
                    }`}
                  >
                    {t.symbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[#f2ede4]">
                        {t.name}
                      </h4>
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#e59a27] shrink-0" />
                      )}
                    </div>
                    <span className="block text-[10px] text-[#7a6e5e] mt-0.5">
                      {t.translator}
                    </span>
                    <p className="text-[11px] text-[#b5aa9b] mt-1 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Danger Zone & Data Sovereignty */}
      <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#f87171] uppercase tracking-wider">
          <Trash2 className="w-4 h-4 text-[#f87171]" />
          <span>Data Sovereignty & Session Actions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Flush Session Memory */}
          <div className="p-4 rounded-xl bg-[#211a14] border border-[#362c22] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-[#f2ede4]">
                Clear Conversation Memory
              </h4>
              <p className="text-[11px] text-[#7a6e5e] mt-1 leading-relaxed">
                Removes the server-side conversational context for this session
                and issues a fresh session identifier.
              </p>
            </div>
            <button
              onClick={handleClearServerHistory}
              disabled={isClearingHistory}
              className="px-3.5 py-2 rounded-xl bg-[#261f18] hover:bg-[#2b221a] border border-[#362c22] hover:border-[#e59a27]/40 text-xs font-semibold text-[#f2ede4] transition-all cursor-pointer self-start"
            >
              {isClearingHistory ? "Clearing..." : "Clear Session Memory"}
            </button>
          </div>

          {/* Reset Identity Completely */}
          <div className="p-4 rounded-xl bg-[#211a14] border border-[#362c22] flex flex-col justify-between space-y-3">
            <div>
              <h4 className="text-xs font-semibold text-[#f87171]">
                Purge All Local Data
              </h4>
              <p className="text-[11px] text-[#7a6e5e] mt-1 leading-relaxed">
                Wipes all cached tokens, resets anonymous credentials in your
                browser, and initializes an entirely fresh anonymous account.
              </p>
            </div>
            <button
              onClick={handleResetAllData}
              className="px-3.5 py-2 rounded-xl bg-[#2e1515] hover:bg-[#3b1c1c] border border-red-900/40 text-xs font-semibold text-red-300 transition-all cursor-pointer self-start"
            >
              Purge & Reset All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
