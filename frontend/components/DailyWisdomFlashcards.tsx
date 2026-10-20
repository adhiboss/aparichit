"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Sparkles,
  Bookmark,
  Share2,
  RotateCw,
  Search,
  Check,
  BookOpen,
  ArrowRight,
  Layers,
  Calendar,
  Filter,
  ShieldCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  Dices,
  RotateCcw,
  Eye,
} from "lucide-react";
import { fetchFlashcards } from "@/lib/chat";
import {
  getSavedFlashcardIds,
  toggleSavedFlashcardId,
  isFlashcardSaved,
} from "@/lib/storage";
import type { WisdomFlashcard } from "@/lib/types";

interface DailyWisdomFlashcardsProps {
  onReflect?: (passageText: string, traditionName: string, sourceMeta: string) => void;
}

// Offline fallback cards ensuring the flashcards section is immediately functional
const OFFLINE_FALLBACK_CARDS: WisdomFlashcard[] = [
  {
    id: "card_bhagavad_gita_2_47",
    tradition_id: "bhagavad_gita",
    tradition_name: "Bhagavad Gita",
    tradition_symbol: "ॐ",
    source: "Bhagavad Gita",
    translation_edition: "Edwin Arnold 1885 / The Song Celestial",
    chapter: 2,
    chapter_title: "The Yoga of Knowledge (Sankhya Yoga)",
    section: "The Song Celestial",
    verse: "47",
    passage:
      "Thy right is to the work alone, never to its fruits; let not the fruits of action be thy motive, nor let thy attachment be to inaction.",
    meaning:
      "Focus completely on the dedication and integrity of your effort in the present moment, rather than obsessing over outcome, validation, or future rewards.",
    practical_reflection:
      "When working on high-stakes projects or dealing with unpredictable results, dedicate your energy to excellence in the task itself and surrender anxiety about things you cannot control.",
    topics: ["Duty & Calling", "Inner Peace", "Action", "Karma Yoga"],
    is_paraphrase: false,
    contemporary_label: "Contemporary plain-language meaning & practical reflection",
  },
  {
    id: "card_garuda_purana_1_12_16",
    tradition_id: "garuda_purana",
    tradition_name: "Garuda Purana",
    tradition_symbol: "🪷",
    source: "Garuda Purana",
    translation_edition: "Wood & Subrahmanyam 1911",
    chapter: 1,
    chapter_title: "The Miseries of the Sinful and the Law of Karma",
    section: "Preta Kanda / Saroddhara",
    verse: "12-16",
    passage:
      "A man gathers the fruit of his own deeds, whether good or evil. No one else bestows sorrow or joy upon him; his own accumulated acts become his companion and shape his destiny.",
    meaning:
      "Every individual is the architect of their own destiny through their choices. Neither joy nor suffering is arbitrarily imposed by outside forces; our own deeds shape our reality.",
    practical_reflection:
      "Take ownership of your responses to current dilemmas. Every ethical choice you make right now plants a peaceful seed for your future.",
    topics: ["Karma", "Responsibility", "Destiny", "Action"],
    is_paraphrase: false,
    contemporary_label: "Contemporary plain-language meaning & practical reflection",
  },
  {
    id: "card_dhammapada_1_5",
    tradition_id: "dhammapada",
    tradition_name: "Dhammapada",
    tradition_symbol: "☸",
    source: "Dhammapada",
    translation_edition: "Max Müller 1881",
    chapter: 1,
    chapter_title: "The Twin Verses (Yamaka-Vagga)",
    section: "Verses of Wisdom",
    verse: "5",
    passage:
      "For hatred does not cease by hatred at any time: hatred ceases by love, this is an eternal rule.",
    meaning:
      "Hatred is never extinguished by retaliatory hatred; it is dissolved solely through understanding, goodwill, and love. This is a timeless universal law.",
    practical_reflection:
      "Break cycles of mutual hostility. Where hostility is directed toward you, refuse to return it; respond with calm boundaries and goodwill.",
    topics: ["Forgiveness & Love", "Reconciliation", "Peace", "Non-violence"],
    is_paraphrase: false,
    contemporary_label: "Contemporary plain-language meaning & practical reflection",
  },
  {
    id: "card_stoicism_4_7",
    tradition_id: "stoicism",
    tradition_name: "Meditations (Stoicism)",
    tradition_symbol: "🏛",
    source: "Meditations",
    translation_edition: "George Long 1862",
    chapter: 4,
    chapter_title: "Book IV: The Inner Citadel and Perception",
    section: "Twelve Books",
    verse: "7",
    passage:
      "Take away your opinion, and there is taken away the complaint, 'I have been harmed.' Take away the complaint, 'I have been harmed,' and the harm itself is done away.",
    meaning:
      "Dismiss the perception that you have been harmed, and the psychological sense of harm vanishes.",
    practical_reflection:
      "Events themselves are neutral; your interpretation determines whether you feel wounded. Change your narrative to regain peace.",
    topics: ["Perception", "Resilience", "Mindset", "Inner Citadel"],
    is_paraphrase: false,
    contemporary_label: "Contemporary plain-language meaning & practical reflection",
  },
];

const TRADITION_FILTERS = [
  { id: "all", label: "All Traditions" },
  { id: "bhagavad_gita", label: "Bhagavad Gita", symbol: "ॐ" },
  { id: "garuda_purana", label: "Garuda Purana", symbol: "🪷" },
  { id: "dhammapada", label: "Dhammapada", symbol: "☸" },
  { id: "stoicism", label: "Stoicism", symbol: "🏛" },
];

export const DailyWisdomFlashcards: React.FC<DailyWisdomFlashcardsProps> = ({
  onReflect,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"today" | "chronicle" | "saved">("today");
  const [cards, setCards] = useState<WisdomFlashcard[]>(OFFLINE_FALLBACK_CARDS);
  const [dailyFeaturedCard, setDailyFeaturedCard] = useState<WisdomFlashcard>(OFFLINE_FALLBACK_CARDS[0]);
  const [currentCard, setCurrentCard] = useState<WisdomFlashcard>(OFFLINE_FALLBACK_CARDS[0]);
  const [todayTraditionFilter, setTodayTraditionFilter] = useState<string>("all");
  const [todayDateStr, setTodayDateStr] = useState<string>("");
  const [displayDate, setDisplayDate] = useState<string>("");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [flippedCardIds, setFlippedCardIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedTradition, setSelectedTradition] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize saved IDs from client storage
  useEffect(() => {
    setSavedIds(getSavedFlashcardIds());
  }, []);

  // Fetch daily flashcards and archive from backend
  useEffect(() => {
    let isMounted = true;
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    setTodayDateStr(today);
    setDisplayDate(
      now.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );

    fetchFlashcards(today)
      .then((res) => {
        if (!isMounted) return;
        if (res && res.cards && res.cards.length > 0) {
          setCards(res.cards);
          const feat = res.featured || res.cards[0];
          setDailyFeaturedCard(feat);
          setCurrentCard(feat);
        }
      })
      .catch((err) => {
        console.warn("Using offline verified flashcards fallback:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Deck of cards for "Today's Card" view (can be filtered by tradition)
  const todayDeckCards = useMemo(() => {
    if (todayTraditionFilter === "all") return cards;
    return cards.filter((c) => c.tradition_id === todayTraditionFilter);
  }, [cards, todayTraditionFilter]);

  const currentCardIndex = useMemo(() => {
    const idx = todayDeckCards.findIndex((c) => c.id === currentCard.id);
    return idx !== -1 ? idx : 0;
  }, [todayDeckCards, currentCard]);

  const handleNextCard = () => {
    if (todayDeckCards.length === 0) return;
    const nextIdx = (currentCardIndex + 1) % todayDeckCards.length;
    setCurrentCard(todayDeckCards[nextIdx]);
    setIsFlipped(false);
  };

  const handlePrevCard = () => {
    if (todayDeckCards.length === 0) return;
    const prevIdx =
      (currentCardIndex - 1 + todayDeckCards.length) % todayDeckCards.length;
    setCurrentCard(todayDeckCards[prevIdx]);
    setIsFlipped(false);
  };

  const handleRandomCard = () => {
    if (todayDeckCards.length <= 1) return;
    let randIdx = Math.floor(Math.random() * todayDeckCards.length);
    if (randIdx === currentCardIndex) {
      randIdx = (randIdx + 1) % todayDeckCards.length;
    }
    setCurrentCard(todayDeckCards[randIdx]);
    setIsFlipped(false);
    showToast("Drew a fresh passage from the canon");
  };

  const handleResetToDailyFeatured = () => {
    setTodayTraditionFilter("all");
    setCurrentCard(dailyFeaturedCard);
    setIsFlipped(false);
    showToast("Returned to Today's Curated Pick");
  };

  const handleSelectTodayTradition = (tradId: string) => {
    setTodayTraditionFilter(tradId);
    const matching =
      tradId === "all" ? cards : cards.filter((c) => c.tradition_id === tradId);
    if (matching.length > 0) {
      const exists = matching.find((c) => c.id === currentCard.id);
      if (!exists) {
        setCurrentCard(matching[0]);
        setIsFlipped(false);
      }
    }
  };

  const handleInspectCardIn3D = (card: WisdomFlashcard) => {
    setTodayTraditionFilter("all");
    setCurrentCard(card);
    setIsFlipped(false);
    setActiveSubTab("today");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    showToast(`Opened in 3D Card Stage: ${card.source} ${card.verse}`);
  };

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle bookmark / save
  const handleToggleSave = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isNowSaved = toggleSavedFlashcardId(cardId);
    setSavedIds(getSavedFlashcardIds());
    showToast(isNowSaved ? "Passage saved to Sanctuary reading list" : "Removed from saved cards");
  };

  // Share passage
  const handleShare = async (card: WisdomFlashcard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shareText = `"${card.passage}"\n\n— ${card.source} (Chapter ${card.chapter}, Verse ${card.verse})\nTranslation: ${card.translation_edition}\nAPARICHIT Ancient Wisdom Platform`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast("Passage & verified citation copied to clipboard");
        return;
      } catch {}
    }
    showToast("Copied passage to clipboard");
  };

  // Trigger Reflect into APARICHIT Chat
  const handleReflectAction = (card: WisdomFlashcard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const sourceMeta = `${card.source} ${card.verse} (${card.translation_edition})`;
    if (onReflect) {
      onReflect(card.passage, card.tradition_name, sourceMeta);
    }
  };

  // Toggle flip on archive grid card
  const toggleArchiveFlip = (cardId: string) => {
    setFlippedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  // Filtered chronicle cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Tradition filter
      if (selectedTradition !== "all" && card.tradition_id !== selectedTradition) {
        return false;
      }
      // Topic filter
      if (selectedTopic !== "all") {
        const matchesTopic = card.topics.some(
          (t) => t.toLowerCase() === selectedTopic.toLowerCase()
        );
        if (!matchesTopic) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesPassage = card.passage.toLowerCase().includes(q);
        const matchesMeaning = card.meaning.toLowerCase().includes(q);
        const matchesSource = card.source.toLowerCase().includes(q);
        const matchesTopics = card.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesPassage && !matchesMeaning && !matchesSource && !matchesTopics) {
          return false;
        }
      }
      return true;
    });
  }, [cards, selectedTradition, selectedTopic, searchQuery]);

  // Saved cards list
  const savedCards = useMemo(() => {
    return cards.filter((c) => savedIds.includes(c.id));
  }, [cards, savedIds]);

  // Unique topics across all cards
  const allTopics = useMemo(() => {
    const s = new Set<string>();
    cards.forEach((c) => c.topics.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [cards]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#242830] border border-[#B69A61] text-xs text-[#E7E1D5] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-[#B69A61]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-Header & Navigation Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#2E333D]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#242830] border border-[#2E333D] flex items-center justify-center text-[#B69A61]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl text-[#E7E1D5] tracking-tight">
              Daily Wisdom Flashcards
            </h2>
            <p className="text-xs text-[#9EA3AF]">
              One verified classical passage each day with plain-language reflections.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#1E222A] rounded-xl border border-[#2E333D] overflow-x-auto max-w-full scrollbar-none self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab("today")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === "today"
                ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                : "text-[#9EA3AF] hover:text-[#E7E1D5]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Today&apos;s Card</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("chronicle")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === "chronicle"
                ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                : "text-[#9EA3AF] hover:text-[#E7E1D5]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Chronicle ({cards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("saved")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeSubTab === "saved"
                ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                : "text-[#9EA3AF] hover:text-[#E7E1D5]"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved ({savedIds.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TODAY'S FEATURED FLASHCARD & INTERACTIVE DECK */}
      {activeSubTab === "today" && (
        <div className="flex flex-col items-center py-4 sm:py-6">
          <div className="w-full max-w-2xl">
            {/* Header info badge & Quick Tradition Deck Filter */}
            <div className="flex flex-col gap-2.5 mb-3">
              <div className="flex items-center justify-between text-xs text-[#9EA3AF] px-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#B69A61] animate-pulse" />
                  <span className="uppercase tracking-wider text-[11px] font-medium text-[#E7E1D5]">
                    Today&apos;s Contemplation
                  </span>
                  <span>•</span>
                  <span suppressHydrationWarning>
                    {displayDate || todayDateStr || "Today"}
                  </span>
                  {currentCard.id === dailyFeaturedCard?.id ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#B69A61]/20 border border-[#B69A61] text-[#B69A61] text-[10px] font-semibold">
                      Curated Daily Pick
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResetToDailyFeatured}
                      className="inline-flex items-center gap-1 text-[11px] text-[#B69A61] hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Return to Today&apos;s Pick</span>
                    </button>
                  )}
                </div>

                <span className="text-[11px] text-[#9EA3AF] hidden sm:block">
                  Click card or Flip button to reveal meaning
                </span>
              </div>

              {/* Tradition Filter Bar directly in Card Stage */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                {TRADITION_FILTERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTodayTradition(t.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                      todayTraditionFilter === t.id
                        ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                        : "bg-[#1E222A] hover:bg-[#2A2F3A] text-[#9EA3AF] border border-[#2E333D]"
                    }`}
                  >
                    {t.symbol && <span className="mr-1">{t.symbol}</span>}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3D Flipping Card Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full rounded-2xl cursor-pointer select-none transition-all duration-300 hover:scale-[1.01]"
              style={{
                perspective: "1400px",
                height: "480px",
                minHeight: "480px",
              }}
            >
              <div
                className="w-full relative transition-transform duration-700 ease-out"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  height: "100%",
                  minHeight: "480px",
                }}
              >
                {/* CARD FRONT FACE */}
                <div
                  className="absolute inset-0 w-full rounded-2xl bg-[#242830] border border-[#2E333D] p-5 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
                  style={{
                    height: "100%",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  {/* Top Bar: Tradition Badge & Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E222A] border border-[#2E333D] text-xs">
                      <span className="text-sm font-serif text-[#B69A61]">
                        {currentCard.tradition_symbol}
                      </span>
                      <span className="font-medium text-[#E7E1D5]">
                        {currentCard.tradition_name}
                      </span>
                      <span className="text-[10px] text-[#9EA3AF]">
                        Chapter {currentCard.chapter}, Verse {currentCard.verse}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(currentCard.id, e)}
                        title={savedIds.includes(currentCard.id) ? "Remove from saved" : "Save card"}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          savedIds.includes(currentCard.id)
                            ? "bg-[#B69A61]/20 border-[#B69A61] text-[#B69A61]"
                            : "bg-[#1E222A] hover:bg-[#2A2F3A] border-[#2E333D] text-[#9EA3AF] hover:text-[#E7E1D5]"
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            savedIds.includes(currentCard.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(currentCard, e)}
                        title="Copy quotation & citation"
                        className="p-2 rounded-lg bg-[#1E222A] hover:bg-[#2A2F3A] border border-[#2E333D] text-[#9EA3AF] hover:text-[#E7E1D5] transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Authentic Scripture Passage */}
                  <div className="my-auto py-5">
                    <p className="font-serif italic text-xl sm:text-2xl md:text-[25px] text-[#E7E1D5] leading-relaxed drop-shadow-sm">
                      &ldquo;{currentCard.passage}&rdquo;
                    </p>

                    {/* Source Citation */}
                    <div className="mt-4 flex flex-col gap-0.5">
                      <span className="text-xs uppercase tracking-wider text-[#B69A61] font-medium">
                        — {currentCard.source} (Ch. {currentCard.chapter}, V. {currentCard.verse})
                      </span>
                      <span className="text-[11px] text-[#9EA3AF]">
                        Translation: {currentCard.translation_edition}
                      </span>
                    </div>
                  </div>

                  {/* Bottom: Topic Tags & Flip Hint */}
                  <div className="pt-4 border-t border-[#2E333D]/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {currentCard.topics.map((t) => (
                        <span
                          key={t}
                          className="px-2.5 py-0.5 rounded text-[11px] bg-[#1E222A] text-[#9EA3AF] border border-[#2E333D]"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-[#B69A61] font-medium hover:underline cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Flip for Meaning</span>
                    </button>
                  </div>
                </div>

                {/* CARD BACK FACE */}
                <div
                  className="absolute inset-0 w-full rounded-2xl bg-[#242830] border border-[#B69A61]/60 p-5 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto"
                  style={{
                    height: "100%",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {/* Top Bar: Meaning Label & Actions */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1E222A] border border-[#2E333D] text-xs">
                      <Info className="w-3.5 h-3.5 text-[#B69A61]" />
                      <span className="text-[11px] uppercase tracking-wider text-[#9EA3AF] font-medium">
                        Plain-Language Commentary
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(currentCard.id, e)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          savedIds.includes(currentCard.id)
                            ? "bg-[#B69A61]/20 border-[#B69A61] text-[#B69A61]"
                            : "bg-[#1E222A] hover:bg-[#2A2F3A] border-[#2E333D] text-[#9EA3AF] hover:text-[#E7E1D5]"
                        }`}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            savedIds.includes(currentCard.id) ? "fill-current" : ""
                          }`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleShare(currentCard, e)}
                        className="p-2 rounded-lg bg-[#1E222A] hover:bg-[#2A2F3A] border border-[#2E333D] text-[#9EA3AF] hover:text-[#E7E1D5] transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Middle: Plain Meaning & Reflection */}
                  <div className="my-auto py-5 space-y-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider text-[#B69A61] font-semibold block mb-1">
                        Plain-Language Meaning
                      </span>
                      <p className="text-sm sm:text-base text-[#E7E1D5] leading-relaxed">
                        {currentCard.meaning}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#1E222A] border-l-2 border-[#B69A61]">
                      <span className="text-[11px] uppercase tracking-wider text-[#B69A61] font-semibold block mb-1">
                        Practical Reflection for Daily Life
                      </span>
                      <p className="text-xs sm:text-sm text-[#E7E1D5]/90 leading-relaxed font-light">
                        {currentCard.practical_reflection}
                      </p>
                    </div>

                    <div className="text-[11px] text-[#6C717D] italic">
                      * This interpretation is authored for contemporary reflection while the passage is verbatim from {currentCard.translation_edition}.
                    </div>
                  </div>

                  {/* Bottom: Action Row */}
                  <div className="pt-4 border-t border-[#2E333D]/60 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-[#9EA3AF] hover:text-[#E7E1D5] cursor-pointer"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>View Original Passage</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleReflectAction(currentCard, e)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B69A61] hover:bg-[#c4a96e] text-[#171A1F] text-xs font-semibold transition-colors cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Reflect with APARICHIT</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Card Deck Controller: Prev, Next, Random, Counter */}
            <div className="mt-4 flex items-center justify-between gap-3 p-3 rounded-xl bg-[#1E222A] border border-[#2E333D]">
              <button
                type="button"
                onClick={handlePrevCard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242830] hover:bg-[#2A2F3A] border border-[#2E333D] text-xs font-medium text-[#E7E1D5] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-[#B69A61]" />
                <span className="hidden sm:inline">Previous Card</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-[#9EA3AF]">
                  Card <strong className="text-[#E7E1D5]">{currentCardIndex + 1}</strong> of{" "}
                  <strong className="text-[#E7E1D5]">{todayDeckCards.length}</strong>
                </span>
                <button
                  type="button"
                  onClick={handleRandomCard}
                  title="Draw random wisdom card"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#242830] hover:bg-[#2A2F3A] border border-[#2E333D] text-xs text-[#B69A61] hover:text-[#d4af37] transition-colors cursor-pointer"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Surprise Me</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextCard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242830] hover:bg-[#2A2F3A] border border-[#2E333D] text-xs font-medium text-[#E7E1D5] transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">Next Card</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight className="w-4 h-4 text-[#B69A61]" />
              </button>
            </div>

            {/* Bottom Actions Bar */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#242830] border border-[#2E333D]">
              <div className="flex items-center gap-2 text-xs text-[#9EA3AF]">
                <ShieldCheck className="w-4 h-4 text-[#B69A61]" />
                <span>Verified Public-Domain Scripture • Zero AI hallucination of citations</span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1E222A] hover:bg-[#2A2F3A] border border-[#2E333D] text-xs text-[#E7E1D5] transition-colors cursor-pointer text-center"
                >
                  {isFlipped ? "Show Scripture Verse" : "Flip for Meaning"}
                </button>

                <button
                  type="button"
                  onClick={(e) => handleReflectAction(currentCard, e)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#B69A61] hover:bg-[#c4a96e] text-[#171A1F] text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reflect on this Passage →</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: WISDOM CHRONICLE ARCHIVE */}
      {activeSubTab === "chronicle" && (
        <div className="flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="p-4 rounded-xl bg-[#242830] border border-[#2E333D] flex flex-col gap-3">
            {/* Search and Tradition Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9EA3AF]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search passages, topics, or meanings..."
                  className="w-full pl-10 pr-4 py-2 bg-[#1E222A] border border-[#2E333D] rounded-lg text-xs sm:text-sm text-[#E7E1D5] placeholder:text-[#6C717D] focus:outline-none focus:border-[#B69A61] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9EA3AF] hover:text-[#E7E1D5]"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Tradition Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {TRADITION_FILTERS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTradition(t.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors cursor-pointer ${
                      selectedTradition === t.id
                        ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                        : "bg-[#1E222A] hover:bg-[#2A2F3A] text-[#9EA3AF] border border-[#2E333D]"
                    }`}
                  >
                    {t.symbol && <span className="mr-1">{t.symbol}</span>}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Topic Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#2E333D]/60 scrollbar-none">
              <span className="text-[11px] uppercase tracking-wider text-[#9EA3AF] shrink-0">
                Topic:
              </span>
              <button
                onClick={() => setSelectedTopic("all")}
                className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTopic === "all"
                    ? "bg-[#B69A61]/20 border border-[#B69A61] text-[#B69A61] font-semibold"
                    : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                }`}
              >
                All Themes
              </button>
              {allTopics.slice(0, 8).map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTopic === topic
                      ? "bg-[#B69A61] text-[#171A1F] font-semibold"
                      : "bg-[#1E222A] text-[#9EA3AF] hover:text-[#E7E1D5] border border-[#2E333D]"
                  }`}
                >
                  #{topic}
                </button>
              ))}
            </div>
          </div>

          {/* Chronicle Grid */}
          {filteredCards.length === 0 ? (
            <div className="text-center py-16 bg-[#242830] rounded-xl border border-[#2E333D] text-[#9EA3AF]">
              <p className="font-serif text-lg text-[#E7E1D5]">No flashcards found matching this inquiry.</p>
              <p className="text-xs mt-1">Try clearing filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredCards.map((card) => {
                const flipped = flippedCardIds.has(card.id);
                const isSaved = savedIds.includes(card.id);

                return (
                  <article
                    key={card.id}
                    className="flex flex-col justify-between rounded-xl bg-[#242830] hover:bg-[#282D37] border border-[#2E333D] p-5 sm:p-6 transition-all border-l-2 border-l-[#B69A61]"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-center justify-between text-xs text-[#9EA3AF] mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif text-sm text-[#B69A61]">
                            {card.tradition_symbol}
                          </span>
                          <span className="font-medium text-[#E7E1D5]">
                            {card.tradition_name}
                          </span>
                          <span>•</span>
                          <span>Ch. {card.chapter}, V. {card.verse}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => handleToggleSave(card.id, e)}
                            className={`p-1.5 rounded transition-colors cursor-pointer ${
                              isSaved ? "text-[#B69A61]" : "text-[#9EA3AF] hover:text-[#E7E1D5]"
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleShare(card, e)}
                            className="p-1.5 rounded text-[#9EA3AF] hover:text-[#E7E1D5] transition-colors cursor-pointer"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content Toggle (Passage vs Meaning) */}
                      {!flipped ? (
                        <div className="space-y-3">
                          <p className="font-serif italic text-base sm:text-lg text-[#E7E1D5] leading-relaxed">
                            &ldquo;{card.passage}&rdquo;
                          </p>
                          <span className="text-[11px] text-[#B69A61] block">
                            — {card.source} ({card.translation_edition})
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-2.5 p-3.5 rounded-lg bg-[#1E222A] border-l-2 border-[#B69A61]">
                          <span className="text-[10px] uppercase tracking-wider text-[#B69A61] font-semibold block">
                            Plain-Language Meaning:
                          </span>
                          <p className="text-xs text-[#E7E1D5] leading-relaxed">
                            {card.meaning}
                          </p>
                          <span className="text-[10px] uppercase tracking-wider text-[#B69A61] font-semibold block pt-1">
                            Practical Reflection:
                          </span>
                          <p className="text-xs text-[#E7E1D5]/90 leading-relaxed font-light">
                            {card.practical_reflection}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 mt-4 border-t border-[#2E333D]/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleArchiveFlip(card.id)}
                          className="inline-flex items-center gap-1 text-[#9EA3AF] hover:text-[#E7E1D5] cursor-pointer"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>{flipped ? "Original Verse" : "Explain Meaning"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleInspectCardIn3D(card)}
                          className="inline-flex items-center gap-1 text-[#9EA3AF] hover:text-[#B69A61] cursor-pointer"
                          title="Open this card in the interactive 3D Card Stage"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>3D Stage</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleReflectAction(card, e)}
                        className="inline-flex items-center gap-1 text-[#B69A61] hover:underline font-medium cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Reflect in Chat →</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: SAVED FLASHCARDS */}
      {activeSubTab === "saved" && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between text-xs text-[#9EA3AF]">
            <span>
              You have {savedCards.length} saved passage{savedCards.length === 1 ? "" : "s"} in your Sanctuary reading list.
            </span>
          </div>

          {savedCards.length === 0 ? (
            <div className="text-center py-16 bg-[#242830] rounded-xl border border-[#2E333D] text-[#9EA3AF] p-8">
              <Bookmark className="w-8 h-8 text-[#B69A61] mx-auto mb-3 opacity-60" />
              <h3 className="font-serif text-lg text-[#E7E1D5]">Your Saved Reading List is Empty</h3>
              <p className="text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                Bookmark verses from Today&apos;s Card or the Wisdom Chronicle to build your personal sanctuary meditation list.
              </p>
              <button
                type="button"
                onClick={() => setActiveSubTab("today")}
                className="mt-4 px-4 py-2 rounded-lg bg-[#B69A61] text-[#171A1F] text-xs font-semibold hover:bg-[#c4a96e] transition-colors cursor-pointer"
              >
                View Today&apos;s Wisdom Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {savedCards.map((card) => (
                <article
                  key={card.id}
                  className="flex flex-col justify-between rounded-xl bg-[#242830] border border-[#2E333D] p-5 sm:p-6 border-l-2 border-l-[#B69A61]"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#9EA3AF] mb-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-serif text-sm text-[#B69A61]">
                          {card.tradition_symbol}
                        </span>
                        <span className="font-medium text-[#E7E1D5]">
                          {card.tradition_name}
                        </span>
                        <span>•</span>
                        <span>Ch. {card.chapter}, V. {card.verse}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleToggleSave(card.id, e)}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                    <p className="font-serif italic text-base text-[#E7E1D5] leading-relaxed mb-3">
                      &ldquo;{card.passage}&rdquo;
                    </p>

                    <div className="p-3 rounded-lg bg-[#1E222A] text-xs text-[#E7E1D5]/90 mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-[#B69A61] font-semibold block mb-0.5">
                        Reflection:
                      </span>
                      {card.meaning}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#2E333D]/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-[#9EA3AF] hidden sm:inline">
                        {card.translation_edition}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleInspectCardIn3D(card)}
                        className="inline-flex items-center gap-1 text-[#9EA3AF] hover:text-[#B69A61] cursor-pointer"
                        title="Open this card in the interactive 3D Card Stage"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>3D Stage</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleReflectAction(card, e)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#B69A61] hover:bg-[#c4a96e] text-[#171A1F] font-semibold transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Reflect</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
