/**
 * Real-time thread persistence: only user-created conversations.
 */
import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "journal_ai_threads_v2";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function getRelativeBucket(iso) {
  const t = new Date(iso).getTime();
  const today = startOfDay(Date.now());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = startOfDay(y);
  const weekAgo = today - 6 * 86400000;

  if (t >= today) return "today";
  if (t >= yesterday && t < today) return "yesterday";
  if (t >= weekAgo && t < yesterday) return "last7";
  return "older";
}

function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveRaw(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useConversations() {
  const [byId, setById] = useState({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadRaw();
    setById(loaded);
    setHydrated(true);
  }, []);

  const persist = useCallback((updater) => {
    setById((prev) => {
      const next = updater(prev);
      saveRaw(next);
      return next;
    });
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      persist((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    },
    [persist],
  );

  const listSorted = useMemo(
    () =>
      Object.values(byId).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [byId],
  );

  const groupedSidebar = useMemo(() => {
    const buckets = { today: [], yesterday: [], last7: [], older: [] };
    for (const c of listSorted) {
      const b = getRelativeBucket(c.updatedAt);
      if (b === "today") buckets.today.push(c);
      else if (b === "yesterday") buckets.yesterday.push(c);
      else if (b === "last7") buckets.last7.push(c);
      else buckets.older.push(c);
    }
    return buckets;
  }, [listSorted]);

  return {
    byId,
    listSorted,
    groupedSidebar,
    hydrated,
    deleteConversation,
    persist,
  };
}
