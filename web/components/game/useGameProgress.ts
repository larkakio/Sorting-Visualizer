"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "neon-lattice-sort-progress-v1";

export type Progress = {
  maxUnlockedLevel: number;
};

const defaultProgress: Progress = { maxUnlockedLevel: 1 };

function read(): Progress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    const p = JSON.parse(raw) as Partial<Progress>;
    const max = Math.max(1, Math.min(99, Number(p.maxUnlockedLevel) || 1));
    return { maxUnlockedLevel: max };
  } catch {
    return defaultProgress;
  }
}

function write(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function useGameProgress() {
  const [progress, setProgress] = useState<Progress>(defaultProgress);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(read());
    setHydrated(true);
  }, []);

  const recordLevelWin = useCallback((completedLevelId: number) => {
    setProgress((prev) => {
      const next: Progress = {
        maxUnlockedLevel: Math.max(
          prev.maxUnlockedLevel,
          completedLevelId + 1,
        ),
      };
      write(next);
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const next = { ...defaultProgress };
    write(next);
    setProgress(next);
  }, []);

  return { progress, hydrated, recordLevelWin, resetProgress };
}
