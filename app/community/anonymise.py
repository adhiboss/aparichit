"""PII and personal information scrubber for community posts."""

import re

EMAIL_PATTERN = re.compile(
    r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    re.IGNORECASE,
)

PHONE_PATTERN = re.compile(
    r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{10}\b",
)

URL_PATTERN = re.compile(
    r"https?://(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*)",
    re.IGNORECASE,
)

WORKPLACE_PATTERN = re.compile(
    r"\b(?:work(?:ing|ed)?\s+(?:at|for|in)|employed\s+(?:at|by)|job\s+at)\s+([A-Z][a-zA-Z0-9&.-]+(?:\s+[A-Z][a-zA-Z0-9&.-]+)*)\b",
)

SCHOOL_PATTERN = re.compile(
    r"\b(?:study(?:ing)?\s+(?:at|in)|student\s+at|college\s+at|university\s+of)\s+([A-Z][a-zA-Z0-9&.-]+(?:\s+[A-Z][a-zA-Z0-9&.-]+)*)\b",
)

NAME_INTRO_PATTERN = re.compile(
    r"\b(?:my name is|i am called|call me|myself)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b",
    re.IGNORECASE,
)


def anonymise_text(text: str) -> str:
    """Scrub Personally Identifiable Information (PII) from user text.

    Removes emails, phone numbers, links, names, schools, and workplaces
    prior to sharing with the community.
    """
    if not text:
        return ""

    scrubbed = text

    # 1. Scrub Emails
    scrubbed = EMAIL_PATTERN.sub("[email redacted]", scrubbed)

    # 2. Scrub Phone Numbers
    scrubbed = PHONE_PATTERN.sub("[phone redacted]", scrubbed)

    # 3. Scrub Web Links
    scrubbed = URL_PATTERN.sub("[link redacted]", scrubbed)

    # 4. Scrub Workplace references
    def _replace_workplace(match: re.Match) -> str:
        full_match = match.group(0)
        company_name = match.group(1)
        return full_match.replace(company_name, "[workplace redacted]")

    scrubbed = WORKPLACE_PATTERN.sub(_replace_workplace, scrubbed)

    # 5. Scrub School / College references
    def _replace_school(match: re.Match) -> str:
        full_match = match.group(0)
        school_name = match.group(1)
        return full_match.replace(school_name, "[school redacted]")

    scrubbed = SCHOOL_PATTERN.sub(_replace_school, scrubbed)

    # 6. Scrub Self-Introduced Names
    def _replace_name(match: re.Match) -> str:
        full_match = match.group(0)
        person_name = match.group(1)
        return full_match.replace(person_name, "[name redacted]")

    scrubbed = NAME_INTRO_PATTERN.sub(_replace_name, scrubbed)

    return scrubbed.strip()
