import { useRef } from 'react';

import { useRealtimeChartController } from '../hooks/useRealtimeChartController';
import { useRealtimeChartStore } from '../store/useRealtimeChartStore';
import { DEFAULT_SERIES_STYLES, type SeriesId } from '../types';

/**
 * Thin React shell: controls and layout subscribe to Zustand; the SVG chart and
 * stream run outside React’s render path (see `useRealtimeChartController`).
 */
export default function RealtimeChartPanel() {
  const chartRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLSpanElement>(null);

  useRealtimeChartController(chartRef, tooltipRef, fpsRef);

  const seriesVisible = useRealtimeChartStore((s) => s.seriesVisible);
  const toggleSeries = useRealtimeChartStore((s) => s.toggleSeries);
  const followLatest = useRealtimeChartStore((s) => s.followLatest);
  const setFollowLatest = useRealtimeChartStore((s) => s.setFollowLatest);
  const streamConnected = useRealtimeChartStore((s) => s.streamConnected);
  const setStreamConnected = useRealtimeChartStore((s) => s.setStreamConnected);
  const bumpHardReset = useRealtimeChartStore((s) => s.bumpHardReset);

  return (
    <div className="flex w-full max-w-5xl flex-col gap-4">
      <div className="rounded-2xl bg-surface-container-low px-6 py-4 shadow-[var(--shadow-ambient)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Real-time chart
            </p>
            <p className="mt-1 max-w-xl text-sm text-on-surface-variant">
              Mock WebSocket stream (~display refresh), 12k points per series,
              min–max decimation, rAF render. Drag to pan, wheel to zoom. Hover
              for nearest-sample tooltip.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              ref={fpsRef}
              className="rounded-lg bg-surface-container-highest px-3 py-1.5 font-mono text-xs tabular-nums text-on-secondary-container"
            >
              —
            </span>
            <button
              type="button"
              className="rounded-xl bg-surface-container-highest px-4 py-2 text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-90"
              onClick={() => setStreamConnected(!streamConnected)}
            >
              {streamConnected ? 'Pause stream' : 'Resume stream'}
            </button>
            <button
              type="button"
              className="rounded-xl bg-surface-container-highest px-4 py-2 text-sm font-bold text-on-secondary-container transition-opacity hover:opacity-90"
              onClick={() => bumpHardReset()}
            >
              Reset data
            </button>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-on-surface-variant"
                checked={followLatest}
                onChange={(e) => setFollowLatest(e.target.checked)}
              />
              Follow latest
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 border-t border-outline-variant pt-4">
          {DEFAULT_SERIES_STYLES.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-2 text-sm font-medium text-on-surface"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-on-surface-variant"
                checked={seriesVisible[s.id as SeriesId]}
                onChange={() => toggleSeries(s.id as SeriesId)}
              />
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
                aria-hidden
              />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      <div
        ref={chartRef}
        className="relative h-[min(420px,55vh)] min-h-[280px] w-full overflow-hidden rounded-2xl bg-surface-container-highest shadow-[var(--shadow-ambient)]"
        aria-label="Chart mount node"
      />

      <div
        ref={tooltipRef}
        className="pointer-events-none fixed z-[70] max-w-xs whitespace-pre-wrap rounded-lg border border-outline-variant bg-surface-container-highest px-3 py-2 font-mono text-[11px] text-on-surface opacity-0 shadow-lg"
        role="tooltip"
      />
    </div>
  );
}
