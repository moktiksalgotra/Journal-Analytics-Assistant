/**
 * Utility functions for chat and date handling.
 */

/**
 * Returns current ISO string for timestamps.
 */
export function getNowIso() {
  return new Date().toISOString();
}

/**
 * Maps raw API response payload to a UI-friendly message bundle.
 * Ensures the frontend data model aligns perfectly with the backend AskResponse.
 */
export function mapApiToBundle(payload) {
  const results = Array.isArray(payload.results) ? payload.results : [];
  const rowCount = typeof payload.row_count === "number" ? payload.row_count : results.length;

  if (payload.error) {
    return {
      intro: payload.sql
        ? "The assistant generated SQL, but execution or validation encountered an issue."
        : null,
      sql: payload.sql ?? null,
      results,
      chart: payload.chart ?? null,
      summary: payload.summary ?? null,
      error: payload.error,
      execution_time_ms: payload.execution_time_ms ?? null,
      row_count: rowCount,
    };
  }

  return {
    intro: null,
    sql: payload.sql ?? null,
    results,
    chart: payload.chart ?? null,
    summary: payload.summary ?? null,
    error: null,
    execution_time_ms: payload.execution_time_ms ?? null,
    row_count: rowCount,
  };
}
