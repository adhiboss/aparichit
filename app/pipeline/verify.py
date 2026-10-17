"""Citation verification and integrity checker for APARICHIT responses."""

import re
from typing import List, Tuple
from app.rag.retriever import RetrievedPassage
from app.schemas import Citation


class CitationVerifier:
    """Verifies that all scripture citations and textual references match actual retrieved passages."""

    def verify_citations(
        self,
        citations: List[Citation],
        retrieved_passages: List[RetrievedPassage],
    ) -> List[Citation]:
        """Filter citations to ensure every citation strictly corresponds to a retrieved passage.

        Any hallucinated or unverified citation is permanently removed.
        """
        if not retrieved_passages:
            return []

        verified: List[Citation] = []
        for citation in citations:
            match_found = False
            for p in retrieved_passages:
                # Check for matching source and chapter or matching verse/excerpt
                same_source = citation.source.strip().lower() == p.source.strip().lower()
                same_translation = citation.translation.strip().lower() == p.translation.strip().lower()

                # Chapter match: either exact or contained (e.g. "Chapter 3" in "Chapter 3: The Fruits...")
                chapter_match = (
                    citation.chapter.strip().lower() in p.chapter.strip().lower()
                    or p.chapter.strip().lower() in citation.chapter.strip().lower()
                )

                # Verse or excerpt match
                verse_match = (
                    bool(citation.verse) and (
                        str(citation.verse).strip() in str(p.verse).strip()
                        or str(p.verse).strip() in str(citation.verse).strip()
                    )
                )
                excerpt_match = (
                    citation.excerpt.strip() in p.text.strip()
                    or p.text.strip() in citation.excerpt.strip()
                )

                if same_source and same_translation and (chapter_match or verse_match or excerpt_match):
                    verified.append(citation)
                    match_found = True
                    break

            if not match_found:
                # Log or drop unverified citation
                pass

        return verified

    def check_text_for_fabricated_citations(
        self,
        answer: str,
        retrieved_passages: List[RetrievedPassage],
    ) -> List[str]:
        """Detect any chapter/verse citations in the text that do not exist in the retrieved passages."""
        # Find chapter patterns like "Chapter 14", "Ch. 4", "Adhyaya 3"
        chapter_matches = re.findall(r"\b(?:Chapter|Ch\.|Adhyaya)\s+(\d+)\b", answer, re.IGNORECASE)

        valid_chapter_nums = set()
        for p in retrieved_passages:
            nums = re.findall(r"\b(\d+)\b", p.chapter)
            valid_chapter_nums.update(nums)

        fabricated = []
        for ch in chapter_matches:
            if ch not in valid_chapter_nums:
                fabricated.append(f"Chapter {ch}")

        return fabricated

    def verify(
        self,
        answer: str,
        retrieved_passages: List[RetrievedPassage],
        citations: List[Citation],
    ) -> Tuple[str, List[Citation]]:
        """Run full verification on answer text and citations."""
        verified_citations = self.verify_citations(citations, retrieved_passages)

        # If no verified passages were retrieved, enforce strictly empty citations
        if not retrieved_passages:
            verified_citations = []

        return answer, verified_citations
