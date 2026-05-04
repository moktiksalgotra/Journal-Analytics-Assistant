"""
FastAPI service for the Journal Analytics Assistant.
"""

from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from utils.chart_generator import build_chart
from utils.db_manager import get_connection, initialize_database
from utils.groq_client import get_groq_api_key, get_groq_client
from utils.sql_generator import generate_sql_from_question
from utils.summarizer import summarize_results

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

_db_conn = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connection."""
    global _db_conn
    try:
        initialize_database()
        _db_conn = get_connection()
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}", exc_info=True)
        raise
    yield
    if _db_conn:
        _db_conn.close()
        _db_conn = None
        logger.info("Database connection closed.")


app = FastAPI(
    title="Journal Analytics Assistant",
    description="AI-powered analytics for journal operations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://journal-ai-frontend.onrender.com",
        "https://journal-analytics-assistant.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000)


class AskResponse(BaseModel):
    sql: str | None = None
    results: list[dict] = Field(default_factory=list)
    chart: dict = Field(default_factory=dict)
    summary: str | None = None
    execution_time_ms: float | None = None
    row_count: int = 0
    error: str | None = None


def _require_db():
    if _db_conn is None:
        raise HTTPException(status_code=503, detail="Database not ready.")


@app.get("/health")
def health_check():
    """Service health status."""
    return {
        "status": "ok",
        "database_connected": _db_conn is not None,
        "groq_configured": get_groq_api_key() is not None,
    }


@app.get("/")
def root():
    """Basic root endpoint for platform and browser checks."""
    return {"service": "Journal Analytics Assistant API", "status": "ok"}


@app.get("/sample-questions")
def get_sample_questions():
    """Return a list of suggested analytical questions."""
    return {
        "questions": [
            "Show the top 5 journals by submission volume in Q1 2025",
            "Rank editors by the total number of manuscripts handled in 2024",
            "Show total submissions by category for 2025",
            "Which journals had the fastest average review time in 2024?",
            "Compare the average acceptance rate of journals in USA and UK for 2024",
            "List journals in the 'STEM' category with an acceptance rate above 60% in 2024",
            "Which editors handled more than 100 papers in 2024 and had an average review time under 50 days?",
            "Rank journals in the 'Medicine' category by the number of accepted manuscripts in 2025",
            "Which journals had a rejection rate above 70% in Q1 2025?",
        ]
    }


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    """Transcribe audio file to text using Groq Whisper."""
    if not get_groq_api_key():
        raise HTTPException(status_code=500, detail="GROQ_API_KEY is missing.")

    try:
        client = get_groq_client()
        
        import io
        content = await file.read()
        audio_file = io.BytesIO(content)
        audio_file.name = file.filename or "audio.webm"
        
        transcription = client.audio.transcriptions.create(
            file=audio_file,
            model="whisper-large-v3",
            response_format="json",
        )
        
        return {"text": transcription.text}
    except Exception as e:
        logger.error(f"Transcription failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/ask", response_model=AskResponse)
def handle_ask(payload: AskRequest):
    """Main entry point for natural language queries."""
    _require_db()
    
    if not get_groq_api_key():
        return AskResponse(error="GROQ_API_KEY is missing. Please check your configuration.")

    start_time = time.perf_counter()
    sql = None

    try:
        # 1. Generate SQL
        sql = generate_sql_from_question(payload.question)
        
        # 2. Execute Query
        rows = _db_conn.execute(sql).fetchall()
        results = [dict(r) for r in rows]
        
        # 3. Build Artifacts
        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        try:
            summary = summarize_results(payload.question, results)
        except Exception as e:
            logger.warning(f"Summary generation failed: {e}")
            summary = "Direct insights unavailable, but results are shown below."

        chart = build_chart(results, payload.question)

        return AskResponse(
            sql=sql,
            results=results,
            chart=chart,
            summary=summary,
            execution_time_ms=elapsed_ms,
            row_count=len(results),
        )

    except ValueError as ve:
        logger.error(f"Validation error: {ve}")
        return AskResponse(
            error=str(ve),
            execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2)
        )
    except Exception as e:
        logger.exception("Unexpected error in ask pipeline")
        return AskResponse(
            error=f"An unexpected error occurred: {str(e)}",
            sql=sql,
            execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2)
        )
