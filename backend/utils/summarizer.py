"""
Summarization utility to provide executive insights from query results.
"""

from __future__ import annotations

import json
from typing import Any

from .groq_client import get_groq_client, get_groq_model


def summarize_results(question: str, rows: list[dict[str, Any]], timeout: float = 30.0) -> str:
    """Generates a concise narrative summary of the data results using Groq."""
    if not rows:
        return "No relevant data found for this query."

    client = get_groq_client()
    model = get_groq_model()

    # Limit data context for the LLM
    data_sample = rows[:20]
    json_data = json.dumps(data_sample, default=str)

    prompt_system = (
        "You are a senior analyst for Taylor & Francis. "
        "Provide a 2-3 sentence executive summary based on the provided data and user question. "
        "Focus on trends, key findings, and specific outliers. "
        "Be professional and direct."
    )
    
    prompt_user = f"User Question: {question}\nData (JSON): {json_data}"

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": prompt_system},
                {"role": "user", "content": prompt_user},
            ],
            temperature=0.3,
            max_tokens=300,
            timeout=timeout
        )
        
        summary = (completion.choices[0].message.content or "").strip()
        return summary or "Summary unavailable."
    except Exception:
        return "Direct insight generation failed, but data is available below."
