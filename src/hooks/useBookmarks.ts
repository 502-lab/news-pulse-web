import { useState, useEffect } from "react";

const STORAGE_KEY = "newsift:bookmarks:v1";

function loadFromStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set<string>(arr);
  } catch {
    return new Set();
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Set<string>>(loadFromStorage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
    } catch {
      // quota exceeded or private mode — ignore, toggle still works in memory
    }
  }, [bookmarks]);

  const isBookmarked = (id: string) => bookmarks.has(id);

  const toggle = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return { bookmarks, isBookmarked, toggle };
}
