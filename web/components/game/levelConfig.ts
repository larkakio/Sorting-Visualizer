export type LevelSpec = {
  id: number;
  /** Number of bars */
  count: number;
  /** Maximum swaps before failure */
  maxMoves: number;
  /** Seconds allowed (0 = no limit) */
  timeLimitSec: number;
  /** Max value for bar height */
  valueCeil: number;
};

export const LEVELS: LevelSpec[] = [
  { id: 1, count: 5, maxMoves: 45, timeLimitSec: 120, valueCeil: 100 },
  { id: 2, count: 6, maxMoves: 60, timeLimitSec: 110, valueCeil: 100 },
  { id: 3, count: 7, maxMoves: 75, timeLimitSec: 100, valueCeil: 120 },
  { id: 4, count: 8, maxMoves: 95, timeLimitSec: 95, valueCeil: 120 },
  { id: 5, count: 9, maxMoves: 115, timeLimitSec: 90, valueCeil: 140 },
  { id: 6, count: 10, maxMoves: 135, timeLimitSec: 85, valueCeil: 140 },
  { id: 7, count: 11, maxMoves: 160, timeLimitSec: 80, valueCeil: 160 },
  { id: 8, count: 12, maxMoves: 185, timeLimitSec: 75, valueCeil: 160 },
];

export function specById(id: number): LevelSpec | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function isSorted(values: number[]): boolean {
  for (let i = 1; i < values.length; i++) {
    if (values[i]! < values[i - 1]!) return false;
  }
  return true;
}

/** Deterministic shuffle from seed so retries feel stable per attempt id */
export function shuffledValues(
  spec: LevelSpec,
  attempt: number,
): number[] {
  const baseArr = Array.from({ length: spec.count }, (_, i) => {
    const t = (i + 1) / spec.count;
    return (
      Math.floor(
        t * spec.valueCeil +
          (((spec.id * 9973 + attempt * 7919) % 97) / 97) * (spec.valueCeil * 0.2),
      ) || 1
    );
  });

  const arr = [...baseArr];
  let seed = spec.id * 1_000_000 + attempt * 31_337;
  function rnd() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }

  let guard = 0;
  while (isSorted(arr) && guard < 50) {
    const a = Math.floor(rnd() * arr.length);
    const b = (a + 1) % arr.length;
    [arr[a], arr[b]] = [arr[b]!, arr[a]!];
    guard++;
  }
  return arr;
}
