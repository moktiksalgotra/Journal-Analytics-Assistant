"""
Groq API client initialization and configuration.
"""

from __future__ import annotations

import os
from functools import lru_cache
from dotenv import load_dotenv

# Ensure environment variables are loaded
load_dotenv()


@lru_cache(maxsize=1)
def get_groq_api_key() -> str | None:
    """Retrieves and validates the Groq API key from environment variables."""
    key = os.getenv("GROQ_API_KEY", "").strip()
    # Check for placeholder or empty string
    if not key or "your" in key.lower():
        return None
    return key


def get_groq_model() -> str:
    """Returns the preferred Groq model name."""
    return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")


def get_groq_client():
    """Returns an initialized Groq client instance."""
    from groq import Groq

    api_key = get_groq_api_key()
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is missing. Please add it to your .env file."
        )
    return Groq(api_key=api_key)
