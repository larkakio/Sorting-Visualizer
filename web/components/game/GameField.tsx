"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { LevelSpec } from "./levelConfig";
import { isSorted } from "./levelConfig";

const SWIPE_MIN = 28;

type Props = {
  spec: LevelSpec;
  initialValues: number[];
  onWin: () => void;
  onBack: () => void;
};

export function GameField({ spec, initialValues, onWin, onBack }: Props) {
  const [values, setValues] = useState<number[]>(() => [...initialValues]);
  const [selected, setSelected] = useState(0);
  const [movesLeft, setMovesLeft] = useState(spec.maxMoves);
  const [status, setStatus] = useState<"playing" | "won" | "lost">("playing");
  const [deadline, setDeadline] = useState<number | null>(() =>
    spec.timeLimitSec > 0 ? Date.now() + spec.timeLimitSec * 1000 : null,
  );
  const [tick, setTick] = useState(0);
  const [bump, setBump] = useState(false);
  const winAnnounced = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const ptr = useRef<{ x: number; y: number; id: number } | null>(null);

  useEffect(() => {
    winAnnounced.current = false;
    setValues([...initialValues]);
    setSelected(0);
    setMovesLeft(spec.maxMoves);
    setStatus("playing");
    setDeadline(
      spec.timeLimitSec > 0 ? Date.now() + spec.timeLimitSec * 1000 : null,
    );
  }, [spec, initialValues]);

  useEffect(() => {
    if (status !== "playing" || !deadline) return;
    const t = window.setInterval(() => setTick((x) => x + 1), 250);
    return () => window.clearInterval(t);
  }, [status, deadline]);

  useEffect(() => {
    if (status !== "playing" || !deadline) return;
    if (Date.now() > deadline) setStatus("lost");
  }, [status, deadline, tick]);

  useEffect(() => {
    if (status !== "won" || winAnnounced.current) return;
    winAnnounced.current = true;
    onWin();
  }, [status, onWin]);

  const timeLeftSec =
    deadline != null
      ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      : null;

  const maxH = useMemo(
    () => Math.max(1, ...values.map((v) => v)),
    [values],
  );

  const prefixStable = useMemo(() => {
    const s = new Array(values.length).fill(false);
    let ok = true;
    for (let i = 0; i < values.length; i++) {
      if (i > 0 && values[i]! < values[i - 1]!) ok = false;
      s[i] = ok;
    }
    return s;
  }, [values]);

  const attemptSwap = useCallback(
    (dir: -1 | 1) => {
      if (status !== "playing") return;
      const i = selected;
      const j = i + dir;
      if (j < 0 || j >= values.length) {
        setBump(true);
        window.setTimeout(() => setBump(false), 220);
        return;
      }
      if (movesLeft <= 0) {
        setStatus("lost");
        return;
      }
      setValues((prev) => {
        const next = [...prev];
        [next[i], next[j]] = [next[j]!, next[i]!];
        return next;
      });
      setMovesLeft((m) => m - 1);
      setSelected(j);
    },
    [status, selected, values.length, movesLeft],
  );

  useEffect(() => {
    if (status !== "playing") return;
    if (isSorted(values)) {
      setStatus("won");
    } else if (movesLeft <= 0) {
      setStatus("lost");
    }
  }, [values, status, movesLeft]);

  function indexFromClientX(clientX: number): number {
    const el = containerRef.current;
    if (!el) return 0;
    const r = el.getBoundingClientRect();
    const x = clientX - r.left;
    const n = values.length;
    const w = r.width / n;
    return Math.max(0, Math.min(n - 1, Math.floor(x / w)));
  }

  function onPointerDown(e: React.PointerEvent) {
    if (status !== "playing") return;
    const node = e.currentTarget as HTMLElement;
    node.setPointerCapture?.(e.pointerId);
    ptr.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  }

  function onPointerUp(e: React.PointerEvent) {
    if (status !== "playing" || !ptr.current || ptr.current.id !== e.pointerId) {
      ptr.current = null;
      return;
    }
    const dx = e.clientX - ptr.current.x;
    const dy = e.clientY - ptr.current.y;
    ptr.current = null;

    if (Math.abs(dx) < SWIPE_MIN && Math.abs(dy) < SWIPE_MIN) {
      setSelected(indexFromClientX(e.clientX));
      return;
    }
    if (Math.abs(dx) >= Math.abs(dy)) {
      attemptSwap(dx < 0 ? -1 : 1);
    } else {
      setSelected(indexFromClientX(e.clientX));
    }
  }

  function onPointerCancel() {
    ptr.current = null;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          className="font-ui rounded-xl border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          onClick={onBack}
        >
          Levels
        </button>
        <div className="font-ui flex gap-4 text-sm text-white/70">
          <span>
            Moves:{" "}
            <span className="text-[var(--neon-cyan)]">{movesLeft}</span>
          </span>
          {timeLeftSec != null ? (
            <span>
              Time:{" "}
              <span className="text-[var(--neon-magenta)]">{timeLeftSec}s</span>
            </span>
          ) : null}
        </div>
      </div>

      <p className="font-ui text-center text-sm text-white/55">
        Tap a column to focus. Swipe horizontally on the field to swap with a
        neighbor in that direction.
      </p>

      <div
        ref={containerRef}
        className={`relative min-h-[220px] touch-none select-none rounded-2xl border border-[var(--neon-cyan-dim)] bg-[linear-gradient(180deg,rgba(0,255,255,0.06),transparent)] p-3 backdrop-blur-sm ${
          bump ? "animate-neon-bump" : ""
        }`}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        role="application"
        aria-label="Sorting grid — swipe to swap bars"
      >
        <div
          className="grid h-[200px] items-end gap-1 sm:h-[260px] sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${values.length}, minmax(0, 1fr))`,
          }}
        >
          {values.map((v, i) => {
            const h = `${Math.max(8, (v / maxH) * 100)}%`;
            const isSel = i === selected;
            const stableGlow = prefixStable[i];
            return (
              <div
                key={i}
                className="relative flex h-full flex-col justify-end"
              >
                <div
                  className={`relative mx-auto w-[70%] max-w-[44px] rounded-t-xl transition-all duration-200 ${
                    isSel
                      ? "shadow-[0_0_22px_rgba(0,255,255,0.85)] ring-2 ring-[var(--neon-cyan)]"
                      : "ring-1 ring-white/10"
                  } ${
                    stableGlow
                      ? "opacity-95 [animation:bar-lock-pulse_3s_ease-in-out_infinite]"
                      : ""
                  }`}
                  style={{
                    height: h,
                    background: isSel
                      ? "linear-gradient(180deg,#ff2fd8,var(--neon-cyan))"
                      : "linear-gradient(180deg,var(--neon-violet),#00d4ff)",
                  }}
                >
                  <span className="font-ui pointer-events-none absolute inset-x-0 -top-6 text-center text-[10px] text-white/70 sm:text-xs">
                    {v}
                  </span>
                  <span className="animate-bar-sheen pointer-events-none absolute inset-0 rounded-t-xl opacity-40" />
                </div>
              </div>
            );
          })}
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-2xl [background:repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.03)_3px)]" />
      </div>

      {status === "lost" ? (
        <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-center">
          <p className="font-display text-white">Out of moves or time.</p>
          <button
            type="button"
            className="font-ui mt-3 rounded-xl border border-white/30 px-4 py-2 text-sm text-white"
            onClick={() => {
              winAnnounced.current = false;
              setValues([...initialValues]);
              setSelected(0);
              setMovesLeft(spec.maxMoves);
              setStatus("playing");
              setDeadline(
                spec.timeLimitSec > 0
                  ? Date.now() + spec.timeLimitSec * 1000
                  : null,
              );
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {status === "won" ? (
        <div className="rounded-xl border border-[var(--neon-cyan)] bg-cyan-500/10 px-4 py-3 text-center shadow-[0_0_30px_rgba(0,255,255,0.2)]">
          <p className="font-display text-lg text-white">Lattice stabilized.</p>
          <p className="font-ui mt-1 text-sm text-white/70">
            Next difficulty unlocked.
          </p>
        </div>
      ) : null}
    </div>
  );
}
