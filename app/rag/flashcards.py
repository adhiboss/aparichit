"""Curated Daily Wisdom Flashcards grounded in the APARICHIT authentic scripture knowledge base."""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from app.rag.ingest import TRADITIONS, RAW_DIR

logger = logging.getLogger(__name__)

# Grounded contemporary interpretations and practical reflections for knowledge-base verses
VERSE_EXPLANATIONS: Dict[str, Dict[str, str]] = {
    # Bhagavad Gita
    "bhagavad_gita_2_14": {
        "meaning": "Physical and emotional sensations—pleasure, sorrow, comfort, and discomfort—are transient ripples produced by contact with the world. Neither pain nor pleasure lasts indefinitely.",
        "reflection": "When overwhelmed by difficult circumstances or transient distress, pause and remember that emotional storms pass. Practice observing sensations without immediately reacting."
    },
    "bhagavad_gita_2_20": {
        "meaning": "The essential core of human consciousness is eternal and untouched by worldly dissolution or physical changes.",
        "reflection": "Reflect on this truth when confronting anxiety about mortality or radical life transitions; your deeper witness remains unshaken."
    },
    "bhagavad_gita_2_47": {
        "meaning": "You have full ownership of your intentions and dedicated effort, but no control over the ultimate fruits, outcomes, or worldly rewards.",
        "reflection": "Pour full heart and discipline into your work today, and release anxious rumination about praise, blame, or future outcomes."
    },
    "bhagavad_gita_2_56": {
        "meaning": "Steadfast wisdom belongs to the person whose inner composure remains intact through hardship and who is not intoxicated by flattery or temporary wins.",
        "reflection": "Notice whether your mood swings with external conditions. Cultivate an inner stillness that remains steady regardless of external praise or setbacks."
    },
    "bhagavad_gita_2_62-63": {
        "meaning": "Fixating obsessively on external objects creates desire, unmet desire turns into anger, anger clouds clear discernment, and clouded discernment causes self-destruction.",
        "reflection": "Catch the subtle chain reaction early: when desire or frustration emerges, intervene with mindful awareness before it transforms into reactive anger."
    },
    "bhagavad_gita_3_19": {
        "meaning": "Perform your essential responsibilities selflessly, not for ego validation or personal gain, but because fulfilling duty serves the greater good.",
        "reflection": "Approach your everyday obligations with dedication, viewing work as service rather than a transaction for personal status."
    },
    "bhagavad_gita_3_35": {
        "meaning": "Living your authentic, natural calling—even imperfectly—is far healthier than striving to live out another person's borrowed path.",
        "reflection": "Avoid comparing your trajectory with external milestones. Focus on your unique responsibilities and truth rather than copying someone else's journey."
    },
    "bhagavad_gita_4_38": {
        "meaning": "There is no cleansing force in human experience equal to self-knowledge and philosophical insight.",
        "reflection": "Invest time in study and self-reflection; clarifying your core principles cleanses accumulated guilt, confusion, and doubt."
    },
    "bhagavad_gita_6_5": {
        "meaning": "Each person must elevate themselves through their own disciplined mind; for the mind is one's closest friend when mastered, but one's worst enemy when undisciplined.",
        "reflection": "Cultivate a supportive inner dialogue. Stop treating yourself as an adversary; become a compassionate and disciplined ally to your own growth."
    },
    "bhagavad_gita_16_1-3": {
        "meaning": "Fearlessness, purity of heart, compassion, gentleness, and generosity are the authentic marks of an elevated and liberated character.",
        "reflection": "Identify one opportunity today to respond with gentle courage and compassion rather than defensiveness or suspicion."
    },

    # Garuda Purana
    "garuda_purana_1_12-16": {
        "meaning": "Every individual is the architect of their own destiny through their choices. Neither joy nor suffering is arbitrarily imposed by outside forces; our own deeds shape our reality.",
        "reflection": "Take ownership of your responses to current dilemmas. Every ethical choice you make right now plants a peaceful seed for your future."
    },
    "garuda_purana_1_22-26": {
        "meaning": "Words spoken with harshness create ongoing inner turbulence, while truthful, gentle speech creates lasting tranquility for both speaker and listener.",
        "reflection": "Before speaking in tense conversations, ask yourself: Is it true? Is it gentle? Will it bring clarity or sow discord?"
    },
    "garuda_purana_1_30-34": {
        "meaning": "Youth, material status, and physical vitality are fleeting like morning mist; abandoning righteousness for temporary worldly gain leaves one vulnerable when life's trials arrive.",
        "reflection": "Anchor your life in timeless virtues rather than temporary possessions or superficial status that can dissolve overnight."
    },
    "garuda_purana_2_4-8": {
        "meaning": "Before eternal justice and conscience, worldly status, wealth, and family reputation count for nothing; virtue and truth alone remain as faithful witnesses.",
        "reflection": "Do what is right in secret when no one is watching. True character is what you carry inside when all external facades are stripped away."
    },
    "garuda_purana_2_15-19": {
        "meaning": "Acts of quiet generosity—giving water to the thirsty and shelter to the weary—become protective shields for the spirit throughout life's journey.",
        "reflection": "Look for small, uncelebrated ways to alleviate someone else's burden today. Small kindnesses heal both the receiver and the giver."
    },
    "garuda_purana_3_20-25": {
        "meaning": "Integrity demands that commitments made to friends and dependents be honored with fidelity.",
        "reflection": "Examine your commitments. If you have made a promise, protect your word as your highest treasure."
    },
    "garuda_purana_4_45-50": {
        "meaning": "Anger acts as a poison that slays rational discernment and blinds human wisdom.",
        "reflection": "When heated anger flares up, postpone decisions. Give your nervous system space to settle so wisdom can resume guidance."
    },
    "garuda_purana_11_3-8": {
        "meaning": "Through conscious choices, a person can be their own greatest refuge or their own severest tormentor.",
        "reflection": "Notice self-sabotaging habits with compassion. Choose one small constructive habit today that demonstrates friendship toward yourself."
    },
    "garuda_purana_12_16-20": {
        "meaning": "Patience and forgiveness (Kshama) are not signs of weakness; they are the supreme ornaments of inner power and self-mastery.",
        "reflection": "Forgiveness is freeing yourself from carrying a grudge. Practice forbearance with someone whose limitations currently irritate you."
    },
    "garuda_purana_15_6-11": {
        "meaning": "True equanimity treats victory and defeat, profit and loss, praise and blame with identical composure and emotional stability.",
        "reflection": "Do not let small setbacks define you, nor small victories make you arrogant. Cultivate an inner ground of steady balance."
    },
    "garuda_purana_16_15-20": {
        "meaning": "Realized wisdom recognizes the shared divine presence in all living beings, dissolving fear and animosity into universal compassion.",
        "reflection": "When meeting difficult people, look past their abrasive surface and recognize the shared human vulnerability beneath."
    },

    # Dhammapada
    "dhammapada_1_1-2": {
        "meaning": "Our entire experience of reality is formed by our habitual thoughts. Pure and disciplined thoughts bring happiness that follows like an unfailing shadow.",
        "reflection": "Observe what mental diet you feed your mind today. Choose thoughts that foster clarity, goodwill, and resilience."
    },
    "dhammapada_1_5": {
        "meaning": "Hatred is never extinguished by retaliatory hatred; it is dissolved solely through understanding, goodwill, and love. This is a timeless universal law.",
        "reflection": "Break cycles of mutual hostility. Where hostility is directed toward you, refuse to return it; respond with calm boundaries and goodwill."
    },
    "dhammapada_1_13": {
        "meaning": "Just as rain leaks through an unthatched roof, unrestrained desires and reactive passions penetrate an undisciplined mind.",
        "reflection": "Strengthen your mental roof through daily quiet contemplation, shielding your thoughts from distracting or inflammatory media."
    },
    "dhammapada_2_21": {
        "meaning": "Vigilant mindfulness leads to vitality and spiritual freedom, while heedless distraction is like walking sleep.",
        "reflection": "Bring full presence to ordinary tasks today—eating, walking, listening—without reaching constantly for distraction."
    },
    "dhammapada_8_103": {
        "meaning": "Conquering a thousand opponents on a battlefield is small compared to the supreme victory of mastering one's own impulses and mind.",
        "reflection": "Do not measure strength by domination over others; measure it by your ability to restrain impulse, temper, and anxiety."
    },
    "dhammapada_17_222": {
        "meaning": "He who reins in surging anger like a skilled driver steering a rolling chariot demonstrates authentic mastery.",
        "reflection": "Notice the physical onset of irritation. Take three slow breaths and steer your reaction toward constructive patience."
    },
    "dhammapada_17_223": {
        "meaning": "Conquer anger with love, overcome malice with generosity, and extinguish falsehood with steadfast truth.",
        "reflection": "When someone acts defensively or deceitfully, do not descend to their level. Stand firmly in truth and benevolence."
    },
    "dhammapada_18_252": {
        "meaning": "It is easy to spot the flaws of others, yet we conceal our own weaknesses like a dishonest gambler hides his cards.",
        "reflection": "Before judging someone else's misstep today, gently inquire into your own blind spots and practice humble self-awareness."
    },

    # Stoicism / Meditations
    "stoicism_2_1": {
        "meaning": "People who behave selfishly or rudely act out of ignorance of what is truly good. Because you share their common humanity, their behavior cannot stain your moral integrity.",
        "reflection": "Prepare your mindset in the morning: expect imperfect encounters, accept them without surprise, and maintain your own benevolence."
    },
    "stoicism_4_3": {
        "meaning": "You do not need to flee to distant seashores or mountains to find serenity; the quietest, most undisturbed sanctuary is within your own mind.",
        "reflection": "Whenever the world feels noisy, withdraw into your inner sanctuary for two minutes of silence and renewed principles."
    },
    "stoicism_4_7": {
        "meaning": "Dismiss the perception that you have been harmed, and the psychological sense of harm vanishes.",
        "reflection": "Events themselves are neutral; your interpretation determines whether you feel wounded. Change your narrative to regain peace."
    },
    "stoicism_7_22": {
        "meaning": "A hallmark of philosophical maturity is loving even those who falter, recognizing that both of you will soon depart this brief life.",
        "reflection": "View annoying interactions through the lens of human mortality. Life is too brief to squander on resentment."
    },
    "stoicism_8_47": {
        "meaning": "If external events cause you distress, it is not the event itself, but your judgment concerning it. You possess the inner authority to dissolve that judgment now.",
        "reflection": "Identify what is currently causing you friction: separate the objective facts from your anxious interpretation, and alter your judgment."
    },
    "stoicism_9_4": {
        "meaning": "Acts of injustice harm the soul of the perpetrator far more than the victim, for violating justice wounds our shared rational nature.",
        "reflection": "Act with fair integrity even when it costs you an immediate worldly advantage. Protecting your conscience is your greatest reward."
    }
}

TRADITION_SYMBOLS: Dict[str, str] = {
    "garuda_purana": "🪷",
    "bhagavad_gita": "ॐ",
    "dhammapada": "☸",
    "stoicism": "🏛",
}


def build_all_flashcards() -> List[Dict[str, Any]]:
    """Construct all verified flashcards from raw scripture data with verified metadata."""
    cards: List[Dict[str, Any]] = []

    for tradition_id, config in TRADITIONS.items():
        raw_file = RAW_DIR / config["raw_file"]
        if not raw_file.exists():
            continue

        try:
            with open(raw_file, "r", encoding="utf-8") as f:
                chapters = json.load(f)
        except Exception as e:
            logger.warning(f"Error loading {raw_file}: {e}")
            continue

        for ch in chapters:
            ch_num = ch.get("chapter", 1)
            ch_title = ch.get("chapter_title", f"Chapter {ch_num}")
            section = ch.get("section", config.get("default_section", ""))

            for v in ch.get("verses", []):
                verse_num = str(v.get("verse", "1"))
                passage_text = v.get("text", "").strip()
                topics = v.get("topics", [])
                card_key = f"{tradition_id}_{ch_num}_{verse_num}"

                # Look up curated explanation or generate grounded fallback
                explanation = VERSE_EXPLANATIONS.get(card_key)
                if explanation:
                    meaning = explanation["meaning"]
                    reflection = explanation["reflection"]
                else:
                    topic_str = ", ".join(topics[:3]) if topics else "virtue and duty"
                    meaning = f"This passage illuminates classical perspectives on {topic_str}, emphasizing disciplined action and inner clarity."
                    reflection = f"Reflect on how cultivating {topic_str} in small choices today fosters long-term emotional freedom."

                cards.append({
                    "id": f"card_{tradition_id}_{ch_num}_{verse_num.replace('-', '_')}",
                    "tradition_id": tradition_id,
                    "tradition_name": config["name"],
                    "tradition_symbol": TRADITION_SYMBOLS.get(tradition_id, "📖"),
                    "source": config.get("source", config["name"]),
                    "translation_edition": config.get("translation", ""),
                    "chapter": ch_num,
                    "chapter_title": ch_title,
                    "section": section,
                    "verse": verse_num,
                    "passage": passage_text,
                    "meaning": meaning,
                    "practical_reflection": reflection,
                    "topics": topics,
                    "is_paraphrase": False,
                    "contemporary_label": "Contemporary plain-language meaning & practical reflection"
                })

    # Interleave cards across traditions to ensure varied daily rotation
    by_tradition: Dict[str, List[Dict[str, Any]]] = {}
    for c in cards:
        by_tradition.setdefault(c["tradition_id"], []).append(c)

    interleaved: List[Dict[str, Any]] = []
    trad_keys = list(TRADITIONS.keys())
    max_len = max(len(lst) for lst in by_tradition.values()) if by_tradition else 0

    for i in range(max_len):
        for k in trad_keys:
            if k in by_tradition and i < len(by_tradition[k]):
                interleaved.append(by_tradition[k][i])

    return interleaved


_CACHED_CARDS: Optional[List[Dict[str, Any]]] = None


def get_cached_flashcards() -> List[Dict[str, Any]]:
    global _CACHED_CARDS
    if _CACHED_CARDS is None:
        _CACHED_CARDS = build_all_flashcards()
    return _CACHED_CARDS


def get_daily_wisdom_payload(date_str: Optional[str] = None) -> Dict[str, Any]:
    """Retrieve the daily featured card deterministically for the given calendar date string."""
    cards = get_cached_flashcards()
    if not cards:
        return {"date": date_str or "", "featured": None, "cards": [], "total": 0}

    # Deterministic date policy using UTC calendar date
    if not date_str:
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    try:
        dt = datetime.strptime(date_str, "%Y-%m-%d")
        day_ordinal = dt.toordinal()
    except Exception:
        day_ordinal = datetime.now(timezone.utc).toordinal()

    card_idx = day_ordinal % len(cards)
    featured = dict(cards[card_idx])
    featured["date_for"] = date_str

    return {
        "date": date_str,
        "featured": featured,
        "cards": cards,
        "total": len(cards),
    }
