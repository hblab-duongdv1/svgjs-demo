/**
 * Min–max bucket decimation: preserves spikes when downsampling dense series to
 * ~O(plot width) segments. Used instead of naive striding so extrema survive
 * high-frequency streaming (common requirement for monitoring dashboards).
 *
 * Writes interleaved (px, py) in **pixel space** into `out`, returns point pair count.
 */
export function decimateToPixelPairs(
  buf: {
    getT: (i: number) => number;
    getY: (i: number) => number;
  },
  lo: number,
  hi: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  plotW: number,
  plotH: number,
  maxBuckets: number,
  out: number[],
): number {
  if (hi < lo || plotW <= 1 || plotH <= 1) return 0;

  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;
  const n = hi - lo + 1;
  const buckets = Math.max(1, Math.min(maxBuckets, n));

  let k = 0;
  for (let b = 0; b < buckets; b++) {
    const start = lo + Math.floor((b * n) / buckets);
    const end = lo + Math.floor(((b + 1) * n) / buckets) - 1;
    if (end < start) continue;

    let minI = start;
    let maxI = start;
    let minY = buf.getY(start);
    let maxY = minY;
    for (let i = start + 1; i <= end; i++) {
      const vy = buf.getY(i);
      if (vy < minY) {
        minY = vy;
        minI = i;
      }
      if (vy > maxY) {
        maxY = vy;
        maxI = i;
      }
    }

    const firstT = buf.getT(minI);
    const secondT = buf.getT(maxI);
    if (firstT <= secondT) {
      pushPixel(buf.getT(minI), minY, out, k);
      k += 2;
      if (maxI !== minI) {
        pushPixel(buf.getT(maxI), maxY, out, k);
        k += 2;
      }
    } else {
      pushPixel(buf.getT(maxI), maxY, out, k);
      k += 2;
      if (maxI !== minI) {
        pushPixel(buf.getT(minI), minY, out, k);
        k += 2;
      }
    }
  }

  function pushPixel(t: number, y: number, arr: number[], idx: number): void {
    const px = ((t - xMin) / xSpan) * plotW;
    const py = plotH - ((y - yMin) / ySpan) * plotH;
    arr[idx] = px;
    arr[idx + 1] = py;
  }

  return k;
}

/**
 * Y-range of raw samples in [lo, hi] — cheap scan only on the windowed slice,
 * not the full buffer capacity.
 */
export function yRangeInSlice(
  buf: { getY: (i: number) => number },
  lo: number,
  hi: number,
): { yMin: number; yMax: number } {
  let yMin = buf.getY(lo);
  let yMax = yMin;
  for (let i = lo + 1; i <= hi; i++) {
    const y = buf.getY(i);
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  if (yMin === yMax) {
    const pad = Math.abs(yMin) * 0.05 + 0.01;
    return { yMin: yMin - pad, yMax: yMax + pad };
  }
  const pad = (yMax - yMin) * 0.08;
  return { yMin: yMin - pad, yMax: yMax + pad };
}
