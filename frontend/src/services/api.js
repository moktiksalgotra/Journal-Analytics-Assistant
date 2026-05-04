/**
 * REST client for the FastAPI Journal Analytics Assistant backend.
 */
import axios from "axios";

/** Prefer VITE_API_URL; otherwise call the backend directly on port 8000. */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 120_000,
});

export async function askQuestion(question) {
  const { data } = await api.post("/ask", { question });
  return data;
}

export async function getHealth() {
  const { data } = await api.get("/health");
  return data;
}

export async function getSampleQuestions() {
  const { data } = await api.get("/sample-questions");
  return data;
}


