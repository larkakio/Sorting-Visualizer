"use client";

import { useCallback, useMemo, useState } from "react";
import { LEVELS, shuffledValues, specById } from "./levelConfig";
import { GameField } from "./GameField";
import { useGameProgress } from "./useGameProgress";

export function SortingGame() {
  const { progress, hydrated, recordLevelWin, resetProgress } =
    useGameProgress();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(null);
  const [attempt, setAttempt] = useState(0);

  const spec = activeLevelId != null ? specById(activeLevelId) : undefined;

  const onLevelWin = useCallback(() => {
    if (spec) recordLevelWin(spec.id);
  }, [spec, recordLevelWin]);

  const initialValues = useMemo(() => {
    if (!spec) return [];
    return shuffledValues(spec, attempt);
  }, [spec, attempt]);

  if (!hydrated) {
    return (
      <div className="font-ui py-12 text-center text-white/50">Loading…</div>
    );
  }

  if (spec && activeLevelId != null) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display text-xl text-white">
            Sector {spec.id}
          </h2>
          <button
            type="button"
            className="font-ui text-xs text-[var(--neon-magenta)] underline-offset-2 hover:underline"
            onClick={() => {
              setAttempt((a) => a + 1);
            }}
          >
            New shuffle
          </button>
        </div>
        <GameField
          spec={spec}
          initialValues={initialValues}
          onBack={() => setActiveLevelId(null)}
          onWin={onLevelWin}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-2 px-1">
        <div>
          <h2 className="font-display text-xl text-white">Select sector</h2>
          <p className="font-ui mt-1 text-sm text-white/55">
            Clear levels in order. Swipe on the lattice to swap neighbors.
          </p>
        </div>
        <button
          type="button"
          className="font-ui shrink-0 text-xs text-white/40 hover:text-white/70"
          onClick={() => {
            if (
              typeof window !== "undefined" &&
              window.confirm("Reset all level unlocks?")
            ) {
              resetProgress();
            }
          }}
        >
          Reset progress
        </button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LEVELS.map((L) => {
          const unlocked = L.id <= progress.maxUnlockedLevel;
          return (
            <li key={L.id}>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => {
                  if (!unlocked) return;
                  setActiveLevelId(L.id);
                  setAttempt(0);
                }}
                className={`font-ui flex w-full flex-col rounded-2xl border px-4 py-4 text-left transition ${
                  unlocked
                    ? "border-[var(--neon-cyan-dim)] bg-white/5 hover:border-[var(--neon-cyan)] hover:shadow-[0_0_20px_rgba(0,255,255,0.15)]"
                    : "cursor-not-allowed border-white/10 bg-black/30 opacity-40"
                }`}
              >
                <span className="font-display text-lg text-white">
                  Sector {L.id}
                </span>
                <span className="mt-1 text-xs text-white/50">
                  {L.count} nodes — {L.maxMoves} moves
                </span>
                {!unlocked ? (
                  <span className="mt-2 text-[10px] uppercase tracking-wider text-[var(--neon-magenta)]">
                    Locked
                  </span>
                ) : (
                  <span className="mt-2 text-[10px] uppercase tracking-wider text-[var(--neon-cyan)]">
                    Open
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
