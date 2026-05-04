"""
SQLite database management, synthetic data generation, and safe query execution.
"""

from __future__ import annotations

import csv
import random
import sqlite3
from pathlib import Path
from typing import Any

import pandas as pd


BACKEND_ROOT = Path(__file__).resolve().parent.parent
DB_DIR = BACKEND_ROOT / "database"
DB_PATH = DB_DIR / "journals.db"
CSV_PATH = DB_DIR / "journal_data.csv"

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS journals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    journal_name TEXT NOT NULL,
    category TEXT NOT NULL,
    submissions INTEGER NOT NULL,
    accepted INTEGER NOT NULL,
    rejected INTEGER NOT NULL,
    acceptance_rate FLOAT NOT NULL,
    rejection_rate FLOAT NOT NULL,
    quarter TEXT NOT NULL,
    year INTEGER NOT NULL,
    editor_name TEXT NOT NULL,
    avg_review_days INTEGER NOT NULL,
    country TEXT NOT NULL
);
"""


def _generate_synthetic_data(count: int = 150) -> list[dict[str, Any]]:
    """Produce realistic synthetic journal operations data."""

    rnd = random.Random(42)

    prefixes = ["International Journal of", "Journal of", "Advances in", "Review of"]
    topics = [
        "Clinical Medicine", "Materials Science", "Environmental Chemistry",
        "Educational Psychology", "Structural Engineering", "Neuroinformatics",
        "Social Policy", "Marine Ecology", "Digital Humanities", "Operations Research",
        "Public Health Ethics", "Energy Systems", "Sustainable Agriculture",
        "Machine Learning Theory", "Organizational Psychology", "Spectroscopic Methods",
        "Urban Geography", "Microbial Biotechnology", "Philosophical Studies",
        "Financial Economics", "Climate Dynamics", "Biomedical Imaging",
        "Polymer Chemistry", "Library & Information Studies", "Tourism Economics",
        "Hydrology Research", "Archaeometry", "Cognitive Neuroscience"
    ]
    categories = [
        "STEM", "Medicine", "Humanities", "Social Sciences", "Environmental", "Business"
    ]
    countries = ["UK", "USA", "Germany", "India", "Australia", "Canada", "Netherlands", "Singapore"]
    first_names = ["Priya", "James", "Aisha", "Oliver", "Nina", "Marco", "Sofia", "Ken", "Elena"]
    last_names = ["Nguyen", "Okafor", "Patel", "Bennett", "Rossi", "Liu", "Müller", "Choudhury", "Carvalho"]

    rows: list[dict[str, Any]] = []
    journal_names_used: set[str] = set()
    quarters = ["Q1", "Q2", "Q3", "Q4"]

    while len(rows) < count:
        base_name = f"{rnd.choice(prefixes)} {rnd.choice(topics)}"
        journal_name = base_name
        
        # Ensure uniqueness if needed
        if journal_name in journal_names_used:
            journal_name = f"{base_name} ({rnd.randint(2, 99)})"
        
        journal_names_used.add(journal_name)

        submissions = rnd.randint(40, 1200)
        accepted = rnd.randint(0, submissions)
        rejected = submissions - accepted
        
        acc_rate = (accepted / submissions * 100) if submissions > 0 else 0.0
        rej_rate = (rejected / submissions * 100) if submissions > 0 else 0.0
        
        row = {
            "journal_name": journal_name,
            "category": rnd.choice(categories),
            "submissions": submissions,
            "accepted": accepted,
            "rejected": rejected,
            "acceptance_rate": round(acc_rate, 2),
            "rejection_rate": round(rej_rate, 2),
            "quarter": rnd.choice(quarters),
            "year": rnd.choice([2023, 2024, 2025]),
            "editor_name": f"{rnd.choice(first_names)} {rnd.choice(last_names)}",
            "avg_review_days": rnd.randint(18, 120),
            "country": rnd.choice(countries),
        }
        rows.append(row)

    return rows


def ensure_data_source() -> None:
    """Ensures the CSV data file exists, generating it if necessary."""
    DB_DIR.mkdir(parents=True, exist_ok=True)
    if CSV_PATH.exists():
        return

    rows = _generate_synthetic_data(150)
    if not rows:
        return

    fieldnames = list(rows[0].keys())
    with CSV_PATH.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def get_connection(db_path: Path | str | None = None) -> sqlite3.Connection:
    """Returns a thread-safe SQLite connection with row_factory set to Row."""
    path = db_path if db_path else DB_PATH
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database(force_reload: bool = False) -> None:
    """Bootstraps the database, creates schema, and loads data from CSV."""
    ensure_data_source()

    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        conn.executescript(SCHEMA_SQL)
        
        # Check if table has data
        cursor = conn.execute("SELECT COUNT(1) AS count FROM journals")
        row = cursor.fetchone()
        has_data = row and row["count"] > 0

        if not has_data or force_reload:
            conn.execute("DELETE FROM journals")
            df = pd.read_csv(CSV_PATH)
            df.to_sql("journals", conn, if_exists="append", index=False)
            conn.commit()
    finally:
        conn.close()


def run_query(conn: sqlite3.Connection, sql: str) -> list[dict[str, Any]]:
    """Executes a SELECT query and returns results as a list of dictionaries."""
    cur = conn.execute(sql)
    return [dict(row) for row in cur.fetchall()]
