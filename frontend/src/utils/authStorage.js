const SESSION_KEY = "journal_ai_session_v1";
const PROFILE_KEY = "journal_ai_profile_v1";

const DEFAULT_PROFILE = {
  fullName: "",
  email: "",
  company: "Taylor & Francis",
  role: "Analyst",
  timezone: "Asia/Kolkata",
  bio: "",
};

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...parsed };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function setProfile(profile) {
  const next = { ...DEFAULT_PROFILE, ...profile };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
}

export function getInitials(name) {
  if (!name) return "U";
  const tokens = name.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "U";
  if (tokens.length === 1) return tokens[0][0]?.toUpperCase() ?? "U";
  return `${tokens[0][0] ?? ""}${tokens[tokens.length - 1][0] ?? ""}`.toUpperCase();
}
