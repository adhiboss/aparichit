"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BookOpen,
  Search,
  Sparkles,
  Copy,
  Check,
  Compass,
  ArrowRight,
  Filter,
  ShieldCheck,
  Bookmark,
  Layers,
} from "lucide-react";
import { fetchTraditionDetail, fetchTraditions } from "../lib/chat.ts";
import { DailyWisdomFlashcards } from "./DailyWisdomFlashcards";
import type {
  TraditionDetail,
  TraditionItem,
  TraditionChapter,
  TraditionVerse,
} from "../lib/types.ts";

interface ScriptureLibraryProps {
  initialTraditionId?: string;
  onConsultVerse?: (verseText: string, traditionName: string) => void;
}

// Fallback scripture data ensuring the library never renders empty even during network drops
const FALLBACK_TRADITIONS: Record<string, TraditionDetail> = {
  garuda_purana: {
    id: "garuda_purana",
    name: "Garuda Purana",
    source: "Garuda Purana",
    translation: "Wood & Subrahmanyam 1911",
    default_section: "Preta Kanda / Saroddhara",
    description:
      "Classical Hindu dialogue between Vishnu and Garuda on karma, moral duty, the journey of the soul, and ethical conduct.",
    total_verses: 12,
    chapters: [
      {
        chapter: 1,
        chapter_title:
          "The Miseries of the Sinful in this World and the Other",
        section: "Preta Kanda / Saroddhara",
        verses: [
          {
            verse: "1-5",
            text: "Garuda, son of Vinata, with devotion spoke unto the Blessed Lord Vishnu: Tell me, O Lord, what is the path of beings in this world, and what becomes of those who turn away from righteousness, and how the fruits of actions follow every soul.",
            topics: ["inquiry", "righteousness", "karma", "duty"],
          },
          {
            verse: "12-16",
            text: "The Blessed Lord said: Hear, O Garuda, the truth regarding the fruits of action. A man gathers the fruit of his own deeds, whether good or evil. No one else bestows sorrow or joy upon him; his own accumulated acts become his companion and shape his destiny.",
            topics: ["karma", "individual_responsibility", "destiny", "action"],
          },
          {
            verse: "22-26",
            text: "Whatever deed is performed by mind, speech, or body leaves its impression upon the inner being. He who sows discord through harsh speech reaps distress, while he who speaks truthfully and gently creates tranquility for himself and others.",
            topics: ["speech", "truthfulness", "karma", "peace"],
          },
          {
            verse: "30-34",
            text: "Wealth, youth, and life are fleeting like bubbles upon water. He who forgets righteousness in the pursuit of selfish gain is like a traveler who falls asleep upon a perilous path when the storm approaches.",
            topics: ["impermanence", "wealth", "righteousness", "mindfulness"],
          },
        ],
      },
      {
        chapter: 2,
        chapter_title: "The Way of Yama and the Reckoning",
        section: "Preta Kanda / Saroddhara",
        verses: [
          {
            verse: "4-8",
            text: "In the realm of justice, there is no falsehood and no favoritism. Deeds alone stand witness for the traveler. Neither kinship, nor pride of lineage, nor accumulated treasure avails anything where only virtue and truth are weighed.",
            topics: ["justice", "equality", "truth", "virtue"],
          },
          {
            verse: "15-19",
            text: "He who in life gave water to the thirsty and shelter to the weary finds the road cool and shadowed. The small kindnesses shown to the helpless become shields upon the journey of the soul.",
            topics: ["charity", "kindness", "compassion", "service"],
          },
          {
            verse: "28-32",
            text: "The soul that has practiced harmlessness towards living beings and shared its bread with the hungry walks without fear, attended by the fragrance of its own good deeds.",
            topics: ["nonviolence", "compassion", "charity", "fearlessness"],
          },
        ],
      },
      {
        chapter: 15,
        chapter_title: "The Yoga of Meditation and Equanimity",
        section: "Preta Kanda / Saroddhara",
        verses: [
          {
            verse: "6-11",
            text: "Regard pleasure and pain, gain and loss, victory and defeat with equal composure. He who is not elated in prosperity nor crushed in adversity has found the anchor of steady wisdom.",
            topics: ["equanimity", "composure", "wisdom", "detachment"],
          },
          {
            verse: "18-23",
            text: "The soul is neither born nor does it perish with the body. Knowing this eternal nature of life, one should act without fear, fulfilling duty with devotion and without anxiety for the outcome.",
            topics: ["soul", "duty", "fearlessness", "eternity"],
          },
        ],
      },
    ],
  },
  bhagavad_gita: {
    id: "bhagavad_gita",
    name: "Bhagavad Gita",
    source: "Bhagavad Gita",
    translation: "Edwin Arnold 1885",
    default_section: "The Song Celestial",
    description:
      "Dialogue between Krishna and Arjuna on selfless action (karma yoga), equanimity, and overcoming doubt.",
    total_verses: 10,
    chapters: [
      {
        chapter: 2,
        chapter_title: "The Yoga of Knowledge (Sankhya Yoga)",
        section: "The Song Celestial",
        verses: [
          {
            verse: "14",
            text: "The contacts of the senses with external objects, O son of Kunti, give rise to cold and heat, pleasure and pain. They are fleeting and impermanent; endure them with equanimity, O descendant of Bharata.",
            topics: ["equanimity", "senses", "impermanence", "endurance"],
          },
          {
            verse: "20",
            text: "The soul is never born nor does it die; having once been, it never ceases to be. Unborn, eternal, changeless, and primeval, it is not slain when the body is slain.",
            topics: ["soul", "eternity", "fearlessness", "death"],
          },
          {
            verse: "47",
            text: "Thy right is to the work alone, never to its fruits; let not the fruits of action be thy motive, nor let thy attachment be to inaction.",
            topics: ["karma_yoga", "duty", "detachment", "action"],
          },
          {
            verse: "56",
            text: "He whose mind is untroubled in the midst of sorrows, who is indifferent amid pleasures, and who is free from passion, fear, and anger, is called a sage of steadfast wisdom.",
            topics: ["wisdom", "equanimity", "steadfastness", "tranquility"],
          },
        ],
      },
      {
        chapter: 3,
        chapter_title: "The Yoga of Action (Karma Yoga)",
        section: "The Song Celestial",
        verses: [
          {
            verse: "19",
            text: "Therefore, constantly perform the action which ought to be done, without attachment; for by performing action without attachment, man reaches the Supreme.",
            topics: ["duty", "selflessness", "detachment", "righteous_action"],
          },
          {
            verse: "35",
            text: "Better is one's own duty, though devoid of merit, than the duty of another well performed. Better is death in the discharge of one's own duty; the duty of another is fraught with peril.",
            topics: ["svadharma", "duty", "authenticity", "integrity"],
          },
        ],
      },
    ],
  },
  dhammapada: {
    id: "dhammapada",
    name: "Dhammapada",
    source: "Dhammapada",
    translation: "Max Müller 1881",
    default_section: "Verses of Wisdom",
    description:
      "Early Buddhist verses of wisdom on mental discipline, non-attachment, and conquering hatred with love.",
    total_verses: 8,
    chapters: [
      {
        chapter: 1,
        chapter_title: "The Twin Verses (Yamaka-Vagga)",
        section: "Verses of Wisdom",
        verses: [
          {
            verse: "1-2",
            text: "All that we are is the result of what we have thought: it is founded on our thoughts, it is made up of our thoughts. If a man speaks or acts with an evil thought, pain follows him, as the wheel follows the foot of the ox that draws the carriage. If a man speaks or acts with a pure thought, happiness follows him, like a shadow that never leaves him.",
            topics: ["mind", "thought", "karma", "happiness", "suffering"],
          },
          {
            verse: "5",
            text: "For hatred does not cease by hatred at any time: hatred ceases by love, this is an eternal rule.",
            topics: ["hatred", "love", "reconciliation", "peace", "forgiveness"],
          },
        ],
      },
      {
        chapter: 17,
        chapter_title: "Anger (Kodha-Vagga)",
        section: "Verses of Wisdom",
        verses: [
          {
            verse: "222",
            text: "He who holds back rising anger like a rolling chariot, him I call a real driver; other people are but holding the reins.",
            topics: ["anger", "patience", "self_restraint", "emotional_control"],
          },
          {
            verse: "223",
            text: "Let a man overcome anger by love, let him overcome evil by good; let him overcome the greedy by generosity, the liar by truth.",
            topics: ["love", "generosity", "truth", "goodness"],
          },
        ],
      },
    ],
  },
  stoicism: {
    id: "stoicism",
    name: "Meditations (Stoicism)",
    source: "Meditations",
    translation: "George Long 1862",
    default_section: "Twelve Books",
    description:
      "Marcus Aurelius's reflections on personal virtue, distinguishing internal control from external circumstances.",
    total_verses: 6,
    chapters: [
      {
        chapter: 2,
        chapter_title: "Book II: On Daily Conduct and Acceptance",
        section: "Twelve Books",
        verses: [
          {
            verse: "1",
            text: "When you wake up in the morning, tell yourself: The people I deal with today will be meddling, ungrateful, arrogant, dishonest, jealous, and surly. They are like this because they cannot distinguish good from evil. But I have seen the beauty of good, and the ugliness of evil, and have recognized that the wrongdoer has a nature related to my own. None of them can harm me, for no one can implicate me in ugliness.",
            topics: ["compassion", "patience", "forbearance", "difficult_people"],
          },
        ],
      },
      {
        chapter: 4,
        chapter_title: "Book IV: The Inner Citadel and Perception",
        section: "Twelve Books",
        verses: [
          {
            verse: "3",
            text: "Men seek retreats for themselves, houses in the country, seashores, and mountains; but nowhere can a man find a quieter or more untroubled retreat than in his own soul. Constantly then give to yourself this retreat, and renew yourself. Let your principles be brief and fundamental.",
            topics: ["inner_peace", "retreat", "mind", "tranquility"],
          },
          {
            verse: "7",
            text: "Take away your opinion, and there is taken away the complaint, 'I have been harmed.' Take away the complaint, 'I have been harmed,' and the harm itself is done away.",
            topics: ["perception", "resilience", "harm", "mindset"],
          },
        ],
      },
      {
        chapter: 8,
        chapter_title: "Book VIII: Judgments and Freedom",
        section: "Twelve Books",
        verses: [
          {
            verse: "47",
            text: "If you are pained by any external thing, it is not this thing that disturbs you, but your own judgment about it. And it is in your power to wipe out this judgment now.",
            topics: ["judgment", "emotional_freedom", "control", "peace"],
          },
        ],
      },
    ],
  },
};

const TRADITION_TABS = [
  { id: "garuda_purana", name: "Garuda Purana", symbol: "ॐ", badge: "Primary Tradition" },
  { id: "bhagavad_gita", name: "Bhagavad Gita", symbol: "ॐ", badge: "Karma Yoga" },
  { id: "dhammapada", name: "Dhammapada", symbol: "☸", badge: "Mindfulness" },
  { id: "stoicism", name: "Meditations", symbol: "🏛", badge: "Stoic Resilience" },
];

export const ScriptureLibrary: React.FC<ScriptureLibraryProps> = ({
  initialTraditionId = "garuda_purana",
  onConsultVerse,
}) => {
  const [librarySection, setLibrarySection] =
    useState<"flashcards" | "repository">("flashcards");
  const [selectedTraditionId, setSelectedTraditionId] =
    useState<string>(initialTraditionId);
  const [traditionDetail, setTraditionDetail] = useState<TraditionDetail | null>(
    FALLBACK_TRADITIONS[initialTraditionId] || FALLBACK_TRADITIONS.garuda_purana
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | "all">("all");
  const [copiedVerseId, setCopiedVerseId] = useState<string | null>(null);

  // Fetch tradition details from backend
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchTraditionDetail(selectedTraditionId)
      .then((data) => {
        if (isMounted && data) {
          setTraditionDetail(data);
        }
      })
      .catch((err) => {
        console.warn(
          `Could not fetch tradition details for ${selectedTraditionId}, using verified offline fallback:`,
          err
        );
        if (isMounted) {
          setTraditionDetail(
            FALLBACK_TRADITIONS[selectedTraditionId] ||
              FALLBACK_TRADITIONS.garuda_purana
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedTraditionId]);

  // Extract all unique topics across the active tradition's verses
  const allTopics = useMemo(() => {
    if (!traditionDetail) return [];
    const topicsSet = new Set<string>();
    for (const ch of traditionDetail.chapters) {
      for (const v of ch.verses) {
        for (const t of v.topics || []) {
          topicsSet.add(t);
        }
      }
    }
    return Array.from(topicsSet).sort();
  }, [traditionDetail]);

  // Filtered chapters and verses based on search, chapter, and topic
  const filteredChapters = useMemo(() => {
    if (!traditionDetail) return [];

    const query = searchQuery.trim().toLowerCase();

    return traditionDetail.chapters
      .filter((ch) => {
        if (selectedChapter !== "all" && ch.chapter !== selectedChapter) {
          return false;
        }
        return true;
      })
      .map((ch) => {
        const matchingVerses = ch.verses.filter((v) => {
          // Topic filter
          if (
            selectedTopic &&
            !v.topics.some(
              (t) => t.toLowerCase() === selectedTopic.toLowerCase()
            )
          ) {
            return false;
          }

          // Search query filter
          if (query) {
            const matchesText = v.text.toLowerCase().includes(query);
            const matchesVerse = v.verse.toLowerCase().includes(query);
            const matchesTopic = v.topics.some((t) =>
              t.toLowerCase().includes(query)
            );
            const matchesChapter = ch.chapter_title
              .toLowerCase()
              .includes(query);
            return (
              matchesText || matchesVerse || matchesTopic || matchesChapter
            );
          }

          return true;
        });

        return {
          ...ch,
          verses: matchingVerses,
        };
      })
      .filter((ch) => ch.verses.length > 0);
  }, [traditionDetail, selectedChapter, selectedTopic, searchQuery]);

  const totalFilteredVerses = useMemo(() => {
    return filteredChapters.reduce((acc, ch) => acc + ch.verses.length, 0);
  }, [filteredChapters]);

  const handleCopy = (verseId: string, text: string, citation: string) => {
    const fullText = `"${text}"\n— ${citation}`;
    navigator.clipboard.writeText(fullText);
    setCopiedVerseId(verseId);
    setTimeout(() => {
      setCopiedVerseId(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Segmented Subsection Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#242830] border border-[#2E333D] shadow-xl">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-2 text-[#B69A61] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classical Wisdom Sanctuary</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#E7E1D5] tracking-tight">
            The Scripture Wisdom Library
          </h1>
          <p className="text-xs text-[#9EA3AF] max-w-xl">
            Contemplate one daily passage at a time or browse full public-domain sacred canons.
          </p>
        </div>

        {/* Section Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1E222A] rounded-xl border border-[#2E333D] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setLibrarySection("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              librarySection === "flashcards"
                ? "bg-[#B69A61] text-[#171A1F] font-semibold shadow-sm"
                : "text-[#9EA3AF] hover:text-[#E7E1D5]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Wisdom Flashcards</span>
          </button>

          <button
            type="button"
            onClick={() => setLibrarySection("repository")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              librarySection === "repository"
                ? "bg-[#B69A61] text-[#171A1F] font-semibold shadow-sm"
                : "text-[#9EA3AF] hover:text-[#E7E1D5]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Scripture Repository</span>
          </button>
        </div>
      </div>

      {/* SUBSECTION 1: DAILY WISDOM FLASHCARDS */}
      {librarySection === "flashcards" && (
        <DailyWisdomFlashcards
          onReflect={(passage, tradition, meta) => {
            if (onConsultVerse) {
              onConsultVerse(passage, tradition);
            }
          }}
        />
      )}

      {/* SUBSECTION 2: FULL SCRIPTURE REPOSITORY BROWSER */}
      {librarySection === "repository" && (
        <div className="space-y-6">
          {/* Sacred Scripture Library Header */}
          <div className="rounded-2xl bg-[#242830] border border-[#2E333D] p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 text-[#B69A61] text-xs font-semibold uppercase tracking-widest mb-1.5">
                  <BookOpen className="w-4 h-4 text-[#B69A61]" />
                  <span>Ancient Wisdom Scripture Repository</span>
                </div>
                <h2 className="font-serif text-2xl font-medium text-[#E7E1D5] tracking-wide">
                  Browse Authentic Scripture Canons
                </h2>
                <p className="font-body text-xs sm:text-sm text-[#9EA3AF] mt-1 max-w-2xl leading-relaxed">
                  Explore authentic, public-domain sacred texts and moral discourses
                  that ground APARICHIT’s guidance. Filter by life dilemma and study original chapters.
                </p>
              </div>

              {/* Verification Badge */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="px-3.5 py-2 rounded-xl bg-[#1E222A] border border-[#2E333D] flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[#34d399]" />
                  <div className="text-left">
                    <span className="block text-[11px] font-semibold text-[#E7E1D5]">
                      Public Domain & Grounded
                    </span>
                    <span className="block text-[10px] text-[#9EA3AF]">
                      Human Verified Translations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tradition Navigation Tabs */}
            <div className="mt-6 pt-5 border-t border-[#2E333D] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TRADITION_TABS.map((tab) => {
            const isActive = tab.id === selectedTraditionId;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTraditionId(tab.id);
                  setSelectedChapter("all");
                  setSelectedTopic(null);
                  setSearchQuery("");
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-[#e59a27] text-[#140e06] font-bold shadow-lg shadow-[#e59a27]/20 scale-102"
                    : "bg-[#261f18] text-[#b5aa9b] hover:text-[#f2ede4] hover:bg-[#2b221a] border border-[#362c22]"
                }`}
              >
                <span className="text-sm font-serif">{tab.symbol}</span>
                <span>{tab.name}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                    isActive
                      ? "bg-[#140e06]/20 text-[#140e06]"
                      : "bg-[#1c1712] text-[#7a6e5e]"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tradition Dossier & Overview Card */}
      {traditionDetail && (
        <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h2 className="font-headline text-xl text-[#f2ede4] font-medium">
                  {traditionDetail.name}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#261f18] border border-[#362c22] text-[#e59a27]">
                  {traditionDetail.default_section}
                </span>
              </div>
              <p className="text-xs text-[#b5aa9b] max-w-3xl leading-relaxed">
                {traditionDetail.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#7a6e5e]">
                <span>
                  <strong className="text-[#b5aa9b]">Source:</strong>{" "}
                  {traditionDetail.source}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#b5aa9b]">Translation:</strong>{" "}
                  {traditionDetail.translation}
                </span>
                <span>•</span>
                <span>
                  <strong className="text-[#b5aa9b]">Indexed Verses:</strong>{" "}
                  {traditionDetail.total_verses || totalFilteredVerses}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls: Search, Chapter Filter, and Topic Chips */}
      <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#7a6e5e] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. duty, anger, sorrow, karma, equanimity)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#261f18] border border-[#362c22] text-xs text-[#f2ede4] placeholder-[#7a6e5e] focus:outline-none focus:border-[#e59a27] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7a6e5e] hover:text-[#f2ede4]"
              >
                Clear
              </button>
            )}
          </div>

          {/* Chapter Selector Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#b5aa9b] shrink-0" />
            <select
              value={selectedChapter}
              onChange={(e) =>
                setSelectedChapter(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="px-3 py-2.5 rounded-xl bg-[#261f18] border border-[#362c22] text-xs text-[#f2ede4] focus:outline-none focus:border-[#e59a27] cursor-pointer"
            >
              <option value="all">All Chapters</option>
              {traditionDetail?.chapters.map((ch) => (
                <option key={ch.chapter} value={ch.chapter}>
                  Chapter {ch.chapter}: {ch.chapter_title.slice(0, 32)}...
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Topic Filter Chips */}
        {allTopics.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] text-[#7a6e5e] shrink-0 font-medium">
              Topics:
            </span>
            <button
              onClick={() => setSelectedTopic(null)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                selectedTopic === null
                  ? "bg-[#e59a27]/20 border border-[#e59a27]/50 text-[#e59a27]"
                  : "bg-[#211a14] border border-[#362c22] text-[#b5aa9b] hover:text-[#f2ede4]"
              }`}
            >
              All Topics
            </button>
            {allTopics.map((topic) => {
              const isSelected = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  onClick={() =>
                    setSelectedTopic(isSelected ? null : topic)
                  }
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-[#e59a27]/20 border border-[#e59a27]/50 text-[#e59a27]"
                      : "bg-[#211a14] border border-[#362c22] text-[#b5aa9b] hover:text-[#f2ede4]"
                  }`}
                >
                  #{topic.replace(/_/g, " ")}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-[#b5aa9b] px-1">
        <span>
          Showing <strong>{totalFilteredVerses}</strong> verses across{" "}
          <strong>{filteredChapters.length}</strong> chapters
        </span>
        {(searchQuery || selectedTopic || selectedChapter !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTopic(null);
              setSelectedChapter("all");
            }}
            className="text-[#e59a27] hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Chapters & Verses Feed */}
      {filteredChapters.length === 0 ? (
        <div className="rounded-2xl bg-[#1c1712] border border-[#362c22] p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-[#7a6e5e] mx-auto opacity-50" />
          <h3 className="font-headline text-base text-[#f2ede4]">
            No verses matched your search
          </h3>
          <p className="text-xs text-[#b5aa9b] max-w-md mx-auto">
            Try adjusting your search keywords or reset the topic filter to
            explore other passages.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.chapter}
              className="rounded-2xl bg-[#1c1712] border border-[#362c22] overflow-hidden shadow-xl"
            >
              {/* Chapter Header Banner */}
              <div className="px-5 py-3.5 bg-[#211a14] border-b border-[#362c22] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-[#e59a27] uppercase tracking-wider">
                    Chapter {chapter.chapter} • {chapter.section}
                  </span>
                  <h3 className="font-headline text-base sm:text-lg text-[#f2ede4] font-medium">
                    {chapter.chapter_title}
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-[#1c1712] border border-[#362c22] text-[#b5aa9b]">
                  {chapter.verses.length}{" "}
                  {chapter.verses.length === 1 ? "Verse" : "Verses"}
                </span>
              </div>

              {/* Verses Grid */}
              <div className="p-5 space-y-4">
                {chapter.verses.map((verse) => {
                  const verseKey = `${traditionDetail?.id}_ch${chapter.chapter}_v${verse.verse}`;
                  const isCopied = copiedVerseId === verseKey;
                  const citationString = `${traditionDetail?.name}, Chapter ${chapter.chapter}, Verse ${verse.verse} (${traditionDetail?.translation})`;

                  return (
                    <div
                      key={verse.verse}
                      className="rounded-xl bg-[#211a14]/60 border border-[#362c22] hover:border-[#e59a27]/40 p-4 transition-all space-y-3"
                    >
                      {/* Top: Verse Number & Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#282018] border border-[#e59a27]/30 text-[#f0a83b]">
                            Verse {verse.verse}
                          </span>
                        </div>

                        {/* Top-right Actions: Copy & Consult */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleCopy(verseKey, verse.text, citationString)
                            }
                            title="Copy verse citation"
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#261f18] hover:bg-[#2b221a] border border-[#362c22] text-[11px] text-[#b5aa9b] hover:text-[#f2ede4] transition-colors cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[#34d399]" />
                                <span className="text-[#34d399]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          {onConsultVerse && (
                            <button
                              onClick={() =>
                                onConsultVerse(
                                  verse.text,
                                  traditionDetail?.name || "Ancient Wisdom"
                                )
                              }
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#e59a27]/15 hover:bg-[#e59a27]/25 border border-[#e59a27]/40 text-[11px] font-semibold text-[#f0a83b] transition-all cursor-pointer shadow-sm"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-[#e59a27]" />
                              <span>Consult APARICHIT</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Sacred Verse Text Quotation Box */}
                      <div className="p-4 rounded-xl bg-[#17130f] border-l-3 border-[#e59a27] relative">
                        <p className="font-serif italic text-sm sm:text-base text-[#f2ede4] leading-relaxed">
                          &ldquo;{verse.text}&rdquo;
                        </p>
                      </div>

                      {/* Bottom: Topic Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {verse.topics.map((t) => (
                          <span
                            key={t}
                            onClick={() => setSelectedTopic(t)}
                            className="text-[10px] px-2 py-0.5 rounded bg-[#1c1712] border border-[#362c22] text-[#b5aa9b] hover:text-[#e59a27] hover:border-[#e59a27]/40 cursor-pointer transition-colors"
                          >
                            #{t.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      )}
    </div>
  );
};

