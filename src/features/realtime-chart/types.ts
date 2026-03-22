/**
 * Shared types for the realtime SVG.js line chart system.
 * Numeric samples use a monotonic `t` axis (seconds) so we can binary-search
 * the ring buffer for viewport windowing without scanning all 10k+ points.
 */

export type SeriesId = 'alpha' | 'beta' | 'gamma';

export const SERIES_IDS: readonly SeriesId[] = ['alpha', 'beta', 'gamma'] as const;

export type SeriesStyle = {
  id: SeriesId;
  label: string;
  /** Stroke color (CSS / hex) */
  color: string;
};

export const DEFAULT_SERIES_STYLES: readonly SeriesStyle[] = [
  { id: 'alpha', label: 'Alpha (sin)', color: '#6366f1' },
  { id: 'beta', label: 'Beta (slow)', color: '#14b8a6' },
  { id: 'gamma', label: 'Gamma (harmonic)', color: '#f97316' },
] as const;

/** One logical sample on the wire (mirrors a compact WebSocket payload). */
export type StreamSample = {
  t: number;
  /** Parallel values per series — same clock `t` for all channels in this tick. */
  values: Record<SeriesId, number>;
};
