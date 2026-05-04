"""
Natural language to SQL generation using Groq LLM.
"""

from __future__ import annotations

import re
from typing import Any

from .groq_client import get_groq_client, get_groq_model


SCHEMA_CONTEXT = """
You are an expert SQLite analyst for Taylor & Francis journal operations.

TABLE: journals
COLUMNS:
- id: INTEGER (Primary Key)
- journal_name: TEXT (Full name of the journal)
- category: TEXT (Journal subject category like STEM, Medicine, etc.)
- submissions: INTEGER (Number of manuscripts submitted)
- accepted: INTEGER (Number of manuscripts accepted)
- rejected: INTEGER (Number of manuscripts rejected)
- acceptance_rate: FLOAT (Percentage 0-100)
- rejection_rate: FLOAT (Percentage 0-100)
- quarter: TEXT (Values: Q1, Q2, Q3, Q4)
- year: INTEGER (Year of operation)
- editor_name: TEXT (Name of the handling editor)
- avg_review_days: INTEGER (Average days for review process)
- country: TEXT (Region/Country of the journal operations)

RULES:
1. Return ONLY valid SQLite SQL code.
2. NO markdown formatting, NO explanations, NO comments.
3. Only perform SELECT operations.
4. When filtering by time (e.g., "Q1 2025"), use: quarter = 'Q1' AND year = 2025.
5. Use clear column aliases where appropriate.
""".strip()

# Keywords that are strictly forbidden for security reasons
_FORBIDDEN_KEYWORDS = re.compile(
    r"\b(DELETE|DROP|INSERT|UPDATE|ALTER|ATTACH|DETACH|PRAGMA|CREATE|TRIGGER|VACUUM|REPLACE|GRANT|REVOKE)\b",
    re.IGNORECASE,
)


def _clean_model_output(raw_text: str) -> str:
    """Extracts SQL from potential markdown blocks or extra commentary."""
    text = raw_text.strip()
    
    # Handle markdown code blocks
    match = re.search(r"```(?:sql)?\s*([\s\S]*?)```", text, re.IGNORECASE)
    if match:
        text = match.group(1).strip()
    
    # Filter out single-line SQL comments starting with --
    lines = [line for line in text.splitlines() if not line.strip().startswith("--")]
    return "\n".join(lines).strip()


def validate_sql(sql: str) -> str:
    """Validates the generated SQL for safety and correctness."""
    clean_sql = sql.strip().rstrip(";")
    
    # Check for multiple statements
    if ";" in clean_sql:
        raise ValueError("Multiple SQL statements are not permitted.")
    
    # Check for forbidden keywords
    if _FORBIDDEN_KEYWORDS.search(clean_sql):
        raise ValueError("Generated query contains restricted keywords.")
    
    # Ensure it starts with SELECT or WITH
    upper_sql = clean_sql.lstrip().upper()
    if not (upper_sql.startswith("SELECT") or upper_sql.startswith("WITH")):
        raise ValueError("Only read-only queries (SELECT) are allowed.")
    
    return clean_sql


def generate_sql_from_question(question: str, timeout: float = 30.0) -> str:
    """Uses Groq to translate a natural language question into a safe SQL query."""
    client = get_groq_client()
    model = get_groq_model()

    messages = [
        {"role": "system", "content": SCHEMA_CONTEXT},
        {"role": "user", "content": f"Question: {question}\nSQL:"}
    ]

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0,
            max_tokens=512,
            timeout=timeout
        )
        
        raw_output = completion.choices[0].message.content or ""
        if not raw_output:
            raise RuntimeError("LLM returned an empty response.")

        extracted_sql = _clean_model_output(raw_output)
        return validate_sql(extracted_sql)

    except Exception as e:
        if isinstance(e, ValueError):
            raise
        raise RuntimeError(f"Failed to generate SQL: {str(e)}") from e
