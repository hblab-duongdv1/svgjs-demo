/**
 * WebSocket-shaped mock: push-based samples with connect/disconnect lifecycle.
 * Producers run on rAF (~display rate) so dev tools show realistic frame pressure.
 * The chart renderer stays decoupled — it only reads `ChartDataModel` each frame.
 */

import type { ChartDataModel } from '../engine/chartDataModel';
import type { SeriesId, StreamSample } from '../types';

export type StreamListener = (sample: StreamSample) => void;

/** Narrow channel shape similar to browser WebSocket (open/close + messages). */
export class MockChartStreamConnection {
  private listeners = new Set<StreamListener>();
  private rafId: number | null = null;
  private running = false;
  /** Wall-clock anchor for monotonic `t` across pause/resume. */
  private tStartMs = 0;
  private readonly model: ChartDataModel;

  constructor(model: ChartDataModel) {
    this.model = model;
  }

  addListener(fn: StreamListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  connect(): void {
    if (this.running) return;
    this.running = true;
    if (this.tStartMs === 0) {
      this.tStartMs = performance.now();
    }

    const emit = () => {
      if (!this.running) return;
      const now = performance.now();
      const t = (now - this.tStartMs) / 1000;
      const phase = t * Math.PI;

      const noise = () => (Math.random() - 0.5) * 0.08;
      const values: Record<SeriesId, number> = {
        alpha: Math.sin(phase * 1.1) * 0.9 + noise(),
        beta: Math.sin(phase * 0.35 + 0.5) * 1.1 + noise() * 0.5,
        gamma:
          Math.sin(phase * 2.0) * 0.35 +
          Math.sin(phase * 0.5) * 0.55 +
          noise(),
      };

      const sample: StreamSample = { t, values };
      this.model.appendSample(t, values);
      for (const fn of this.listeners) fn(sample);

      this.rafId = requestAnimationFrame(emit);
    };

    this.rafId = requestAnimationFrame(emit);
  }

  disconnect(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Empty buffers and restart the time base. Always disconnects first so rAF
   * handles are released (long-run leak prevention).
   */
  hardReset(): void {
    this.disconnect();
    this.tStartMs = 0;
    this.model.clear();
  }
}
