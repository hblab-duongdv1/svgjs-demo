/**
 * Fixed-capacity ring buffer for (t, y) pairs with monotonically increasing `t`.
 * Oldest samples are overwritten once full — bounded memory for long-running streams.
 * Exposes logical index access (0 = oldest in buffer, count-1 = newest) for decimation.
 */
export class TimeSeriesRingBuffer {
  readonly capacity: number;
  private readonly t: Float64Array;
  private readonly y: Float64Array;
  /** Next write index [0, capacity). */
  private nextWrite = 0;
  /** Count of valid samples in [0, capacity]. */
  private count = 0;

  constructor(capacity: number) {
    this.capacity = Math.max(4, capacity | 0);
    this.t = new Float64Array(this.capacity);
    this.y = new Float64Array(this.capacity);
  }

  clear(): void {
    this.nextWrite = 0;
    this.count = 0;
  }

  get length(): number {
    return this.count;
  }

  /** Physical index for logical index `i` (0 = oldest). */
  private physical(i: number): number {
    const oldest = this.nextWrite - this.count + this.capacity;
    return (oldest + i) % this.capacity;
  }

  append(sampleT: number, sampleY: number): void {
    this.t[this.nextWrite] = sampleT;
    this.y[this.nextWrite] = sampleY;
    this.nextWrite = (this.nextWrite + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  getT(logicalIndex: number): number {
    return this.t[this.physical(logicalIndex)];
  }

  getY(logicalIndex: number): number {
    return this.y[this.physical(logicalIndex)];
  }

  /**
   * Largest logical index `i` with getT(i) <= targetT, or -1 if none.
   * Assumes `t` increases with `i` (streaming invariant).
   */
  upperBoundT(targetT: number): number {
    if (this.count === 0) return -1;
    let lo = 0;
    let hi = this.count - 1;
    let ans = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const tv = this.getT(mid);
      if (tv <= targetT) {
        ans = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return ans;
  }

  /**
   * Smallest logical index `i` with getT(i) >= targetT, or count if all below.
   */
  lowerBoundT(targetT: number): number {
    if (this.count === 0) return 0;
    let lo = 0;
    let hi = this.count - 1;
    let ans = this.count;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const tv = this.getT(mid);
      if (tv >= targetT) {
        ans = mid;
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    return ans;
  }

  newestT(): number | null {
    if (this.count === 0) return null;
    return this.getT(this.count - 1);
  }

  oldestT(): number | null {
    if (this.count === 0) return null;
    return this.getT(0);
  }

  /** Closest sample to `targetT` by absolute delta in `t` (for hover tooltips). */
  nearestByT(targetT: number): { logical: number; t: number; y: number } | null {
    if (this.count === 0) return null;
    const hi = this.upperBoundT(targetT);
    const candidates: number[] = [];
    if (hi >= 0) candidates.push(hi);
    if (hi + 1 < this.count) candidates.push(hi + 1);
    if (hi < 0 && this.count > 0) candidates.push(0);

    let best = candidates[0]!;
    let bestD = Math.abs(this.getT(best) - targetT);
    for (let i = 1; i < candidates.length; i++) {
      const c = candidates[i]!;
      const d = Math.abs(this.getT(c) - targetT);
      if (d < bestD) {
        best = c;
        bestD = d;
      }
    }
    return { logical: best, t: this.getT(best), y: this.getY(best) };
  }
}
