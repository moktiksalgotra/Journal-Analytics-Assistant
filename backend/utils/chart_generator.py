"""
Heuristic-based chart configuration builder for frontend visualization.
"""

from __future__ import annotations

from typing import Any


def _is_numeric(value: Any) -> bool:
    """Checks if a value can be treated as a number in a chart."""
    if value is None or isinstance(value, bool):
        return False
    if isinstance(value, (int, float)):
        return True
    if isinstance(value, str):
        try:
            float(value)
            return True
        except ValueError:
            return False
    return False


def _to_number(value: Any) -> float | int | None:
    """Safely converts a value to a numeric type."""
    if value is None or isinstance(value, bool):
        return None
    try:
        f_val = float(value)
        return int(f_val) if f_val.is_integer() else f_val
    except (ValueError, TypeError):
        return None


def build_chart(rows: list[dict[str, Any]], question: str = "") -> dict[str, Any]:
    """
    Determines the best chart type and data structure for a given set of rows.
    Returns a dictionary compatible with the frontend chart component.
    """
    if not rows:
        return {"type": None, "data": [], "title": "", "meta": {}}

    keys = list(rows[0].keys())
    q_lower = question.lower()

    # Identify numeric and categorical columns
    numeric_cols = [k for k in keys if _is_numeric(rows[0].get(k))]
    category_cols = [k for k in keys if not _is_numeric(rows[0].get(k))]

    if not numeric_cols:
        return {"type": None, "data": [], "title": "", "meta": {}}

    # Priority metrics for the Y-axis
    metric_ranks = ["submissions", "accepted", "rejected", "acceptance_rate", "rejection_rate", "avg_review_days"]
    y_key = next((m for m in metric_ranks if m in numeric_cols), numeric_cols[0])
    
    # Priority labels for the X-axis
    label_ranks = ["quarter", "year", "category", "journal_name", "country", "editor_name"]
    x_key = next((l for l in label_ranks if l in category_cols or l in numeric_cols), keys[0])

    # 1. Trend detection (Line or Area)
    time_related = any(k in keys for k in ["year", "quarter"])
    trend_keywords = ["trend", "over time", "growth", "history", "monthly", "quarterly"]
    is_trend = time_related or any(w in q_lower for w in trend_keywords)
    
    if is_trend:
        if "year" in keys or "quarter" in keys:
            def sort_fn(r):
                y = int(r.get("year", 0))
                q = str(r.get("quarter", "Q1")).replace("Q", "")
                q_val = int(q) if q.isdigit() else 0
                return (y, q_val)
            sorted_rows = sorted(rows, key=sort_fn)
            chart_data = [
                {
                    "name": f"{r.get('year', '')} {r.get('quarter', '')}".strip(),
                    "value": _to_number(r.get(y_key))
                }
                for r in sorted_rows
            ]
        else:
            chart_data = [{"name": str(r.get(x_key)), "value": _to_number(r.get(y_key))} for r in rows]

        chart_type = "area" if "total" in q_lower or "cumulative" in q_lower else "line"
        return {
            "type": chart_type,
            "data": chart_data,
            "title": f"{y_key.replace('_', ' ').title()} Over Time",
            "meta": {"xKey": "name", "yKey": "value"}
        }

    # 2. Composition detection (Pie)
    composition_keywords = ["share", "proportion", "breakdown", "ratio", "percentage", "distribution"]
    is_composition = any(w in q_lower for w in composition_keywords)
    if (is_composition or 1 < len(rows) <= 8):
        chart_data = [{"name": str(r.get(x_key)), "value": _to_number(r.get(y_key))} for r in rows]
        return {
            "type": "pie",
            "data": chart_data,
            "title": f"{y_key.replace('_', ' ').title()} Distribution",
            "meta": {"nameKey": "name", "valueKey": "value"}
        }

    # 3. Default: Comparison (Bar)
    chart_data = [{"name": str(r.get(x_key)), "value": _to_number(r.get(y_key))} for r in rows]
    if len(chart_data) > 12:
        chart_data = chart_data[:12]  # Cap for readability

    return {
        "type": "bar",
        "data": chart_data,
        "title": f"{y_key.replace('_', ' ').title()} by {x_key.replace('_', ' ').title()}",
        "meta": {"xKey": "name", "yKey": "value"}
    }
