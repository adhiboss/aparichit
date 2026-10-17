"""Safety classifier and crisis detection for APARICHIT pipeline."""

from dataclasses import dataclass
import re
from typing import Optional


@dataclass
class SafetyClassification:
    """Result of a safety classification check."""

    flag: Optional[str]  # "crisis", "harmful", "medical", "legal", or None
    is_safe: bool
    reason: Optional[str] = None
    crisis_response: Optional[str] = None


CRISIS_PATTERNS = [
    r"\b(suicid\w*|kill\w* myself|want to die|wanna die|end\w* (my life|it all))\b",
    r"\b(hurt\w* myself|cut\w* myself|cutting myself|cut\w* (my )?wrist\w*|slit\w* (my )?wrist\w*|take\w* my own life)\b",
    r"\b(better off dead|wish i (was|were) dead|no reason to live|nothing to live for)\b",
    r"\b(overdos\w*|hang\w* myself|jump\w* off a (bridge|building|roof))\b",
]

HARMFUL_PATTERNS = [
    r"\b(how to (kill|murder|poison|assassinate) (someone|somebody|a person|people|my))\b",
    r"\b(how to (make|build|create) a (bomb|explosive|weapon))\b",
    r"\b(how to steal without getting caught|how to (launder money|rob a bank))\b",
    r"\b(beat up someone|attack my coworker|revenge by violence)\b",
]

MEDICAL_PATTERNS = [
    r"\b(diagnos\w* my|medical diagnosis|prescrib\w* (me|medicine|antibiotic|drugs))\b",
    r"\b(what medication should i take for|what medicine cures)\b",
    r"\b(am i having a (stroke|heart attack)|symptoms of (cancer|stroke|heart attack))\b",
]

LEGAL_PATTERNS = [
    r"\b(how to evade (taxes|the law|arrest)|legal defense for fraud)\b",
    r"\b(forge a signature|falsify documents for court|how to hide assets from court)\b",
]


CRISIS_FALLBACK_RESPONSE = (
    "I hear that you are going through immense pain right now, and I want you to know "
    "that you do not have to carry this alone. Your life has value, and there are people "
    "who genuinely care and want to support you through this difficult moment.\n\n"
    "Please reach out immediately to trusted professionals who can support you:\n\n"
    "- **Tele-MANAS (India)**: Call **14416** or **1-800-891-4416** (Toll-free, 24/7 confidential mental health support)\n"
    "- **KIRAN Helpline**: Call **1800-599-0019** (24/7 mental health rehabilitation)\n"
    "- **National Emergency Services**: Call **112** (India) or **988** (US/Canada Suicide & Crisis Lifeline)\n\n"
    "Please take a deep breath and connect with someone right now. Help is always available."
)

HARMFUL_REFUSAL_RESPONSE = (
    "I cannot assist with requests that involve physical harm, violence, or illegal acts. "
    "Ancient wisdom consistently reminds us that harm inflicted upon others creates lasting "
    "turmoil for oneself. True strength lies in peaceful de-escalation, restraint, and lawful resolution."
)


class SafetyClassifier:
    """Classifies user queries for crisis, self-harm, harmful content, and professional domain flags."""

    def __init__(self) -> None:
        self._compiled_crisis = [re.compile(p, re.IGNORECASE) for p in CRISIS_PATTERNS]
        self._compiled_harmful = [re.compile(p, re.IGNORECASE) for p in HARMFUL_PATTERNS]
        self._compiled_medical = [re.compile(p, re.IGNORECASE) for p in MEDICAL_PATTERNS]
        self._compiled_legal = [re.compile(p, re.IGNORECASE) for p in LEGAL_PATTERNS]

    def classify(self, message: str) -> SafetyClassification:
        """Classify a message into safety categories.

        Crisis takes absolute priority over all other checks.
        """
        text = message.strip()

        # 1. Crisis / Self-Harm (Highest Priority)
        for pattern in self._compiled_crisis:
            if pattern.search(text):
                return SafetyClassification(
                    flag="crisis",
                    is_safe=False,
                    reason="Self-harm or crisis indicators detected",
                    crisis_response=CRISIS_FALLBACK_RESPONSE,
                )

        # 2. Harmful / Violence / Illegal
        for pattern in self._compiled_harmful:
            if pattern.search(text):
                return SafetyClassification(
                    flag="harmful",
                    is_safe=False,
                    reason="Harmful, violent, or illegal intent detected",
                    crisis_response=HARMFUL_REFUSAL_RESPONSE,
                )

        # 3. Medical Advice
        for pattern in self._compiled_medical:
            if pattern.search(text):
                return SafetyClassification(
                    flag="medical",
                    is_safe=True,
                    reason="Medical diagnosis or prescription request",
                )

        # 4. Legal Advice
        for pattern in self._compiled_legal:
            if pattern.search(text):
                return SafetyClassification(
                    flag="legal",
                    is_safe=True,
                    reason="Legal counsel or evasion request",
                )

        return SafetyClassification(flag=None, is_safe=True)
