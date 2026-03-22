import { SVG, type G, type Polyline, type Rect, type Svg } from '@svgdotjs/svg.js';

import type { SeriesId } from '../types';
import { DEFAULT_SERIES_STYLES, SERIES_IDS } from '../types';
import { decimateToPixelPairs, yRangeInSlice } from './decimateMinMax';
import type { ChartDataModel } from './chartDataModel';

/** Mutable view state updated by interaction handlers (no React). */
export type ChartViewTransform = {
  xMin: number;
  xMax: number;
  /** When true, the engine slides `xMin`/`xMax` so the newest `t` stays near the right edge. */
  followLatest: boolean;
};

const MARGIN = { top: 12, right: 12, bottom: 28, left: 44 };

/**
 * Imperative SVG.js renderer: one rAF tick may update only polylines that need it.
 * React never receives per-frame props — avoids reconciliation under 30–60 FPS load.
 */
export class RealtimeLineChartEngine {
  private svg: Svg | null = null;
  private plotGroup: G | null = null;
  private gridGroup: G | null = null;
  /** Top stacking layer: captures wheel / pointer for zoom-pan + hover without hitting polylines. */
  private hitRect: Rect | null = null;
  private seriesLines: Partial<Record<SeriesId, Polyline>> = {};
  private container: HTMLElement;
  private width = 800;
  private height = 400;
  /**
   * One flat buffer per series for polyline.plot — avoids cross-series races if the
   * runtime retains the last array reference until the next attribute write.
   */
  private readonly scratchBySeries: Record<SeriesId, number[]> = {
    alpha: [],
    beta: [],
    gamma: [],
  };
  private readonly visible: Record<SeriesId, boolean> = {
    alpha: true,
    beta: true,
    gamma: true,
  };

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(): void {
    this.svg?.remove();
    this.svg = SVG().addTo(this.container).size('100%', '100%');
    this.svg.attr('role', 'img').attr('aria-label', 'Real-time line chart');

    this.gridGroup = this.svg.group().addClass('rt-chart-grid');
    // Plot coordinates are 0..innerW / 0..innerH; translate into the margins.
    this.plotGroup = this.svg.group().addClass('rt-chart-series');

    for (const s of DEFAULT_SERIES_STYLES) {
      const line = this.plotGroup!
        .polyline([])
        .fill('none')
        .stroke({ width: 2, color: s.color, linejoin: 'round', linecap: 'round' })
        .attr('vector-effect', 'non-scaling-stroke');
      line.css({ transition: 'opacity 220ms ease-out' });
      this.seriesLines[s.id] = line;
    }

    this.hitRect = this.svg
      .rect(1, 1)
      .move(MARGIN.left, MARGIN.top)
      .fill({ color: '#000', opacity: 0 })
      .attr('pointer-events', 'all');
    const hitNode = this.hitRect.node as SVGRectElement;
    hitNode.style.cursor = 'crosshair';
    hitNode.style.touchAction = 'none';

    this.resize();
  }

  setSeriesVisible(id: SeriesId, on: boolean): void {
    this.visible[id] = on;
    const line = this.seriesLines[id];
    if (line) {
      // Smooth show/hide without removing nodes (keeps GPU-friendly paths warm).
      line.opacity(on ? 1 : 0);
    }
  }

  /** Plot inner size (excluding margins). */
  private innerSize(): { w: number; h: number } {
    const w = Math.max(1, this.width - MARGIN.left - MARGIN.right);
    const h = Math.max(1, this.height - MARGIN.top - MARGIN.bottom);
    return { w, h };
  }

  resize(): void {
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(200, rect.width);
    this.height = Math.max(160, rect.height);
    if (this.svg) {
      this.svg.size(this.width, this.height);
    }
    this.plotGroup?.transform({ translateX: MARGIN.left, translateY: MARGIN.top });
    this.gridGroup?.transform({ translateX: MARGIN.left, translateY: MARGIN.top });
    const { w, h } = this.innerSize();
    this.hitRect?.size(w, h).move(MARGIN.left, MARGIN.top);
    this.drawStaticGrid();
  }

  private drawStaticGrid(): void {
    if (!this.gridGroup) return;
    this.gridGroup.clear();
    const { w, h } = this.innerSize();
    const gridStroke = { width: 1, color: 'rgba(148, 163, 184, 0.35)' };
    const nx = 6;
    const ny = 4;
    for (let i = 0; i <= nx; i++) {
      const x = (i / nx) * w;
      this.gridGroup.line(x, 0, x, h).stroke(gridStroke);
    }
    for (let j = 0; j <= ny; j++) {
      const y = (j / ny) * h;
      this.gridGroup.line(0, y, w, y).stroke(gridStroke);
    }
  }

  /**
   * Single frame: window buffers → shared y-scale → partial polyline updates only for visible series.
   */
  syncFrame(model: ChartDataModel, view: ChartViewTransform): void {
    if (!this.plotGroup) return;

    const { w, h } = this.innerSize();
    const maxBuckets = Math.min(4096, Math.max(32, Math.floor(w) * 2));

    const newestT = model.buffers.alpha.newestT();
    if (newestT !== null && view.followLatest) {
      const span = view.xMax - view.xMin;
      view.xMax = newestT;
      view.xMin = newestT - span;
    }

    const xMin = view.xMin;
    const xMax = view.xMax;

    let globalYMin = Number.POSITIVE_INFINITY;
    let globalYMax = Number.NEGATIVE_INFINITY;
    const ranges: Partial<
      Record<SeriesId, { lo: number; hi: number; yMin: number; yMax: number }>
    > = {};

    for (const id of SERIES_IDS) {
      if (!this.visible[id]) continue;
      const buf = model.buffers[id];
      if (buf.length === 0) continue;
      const lo = buf.lowerBoundT(xMin);
      const hi = buf.upperBoundT(xMax);
      if (hi < lo) continue;
      const yr = yRangeInSlice(buf, lo, hi);
      ranges[id] = { lo, hi, yMin: yr.yMin, yMax: yr.yMax };
      if (yr.yMin < globalYMin) globalYMin = yr.yMin;
      if (yr.yMax > globalYMax) globalYMax = yr.yMax;
    }

    if (!Number.isFinite(globalYMin) || !Number.isFinite(globalYMax)) {
      globalYMin = -1;
      globalYMax = 1;
    }

    for (const id of SERIES_IDS) {
      const line = this.seriesLines[id];
      if (!line) continue;
      if (!this.visible[id]) continue;

      const r = ranges[id];
      if (!r) {
        line.plot([]);
        continue;
      }

      const scratch = this.scratchBySeries[id];
      const n = decimateToPixelPairs(
        model.buffers[id],
        r.lo,
        r.hi,
        xMin,
        xMax,
        globalYMin,
        globalYMax,
        w,
        h,
        maxBuckets,
        scratch,
      );
      if (n === 0) {
        line.plot([]);
        continue;
      }
      scratch.length = n;
      line.plot(scratch);
    }
  }

  dispose(): void {
    this.svg?.remove();
    this.svg = null;
    this.plotGroup = null;
    this.gridGroup = null;
    this.hitRect = null;
    this.seriesLines = {};
  }

  getHitTarget(): SVGRectElement | null {
    const n = this.hitRect?.node;
    return n instanceof SVGRectElement ? n : null;
  }

  getPlotMetrics(): {
    margin: typeof MARGIN;
    width: number;
    height: number;
    innerW: number;
    innerH: number;
  } {
    const { w, h } = this.innerSize();
    return {
      margin: MARGIN,
      width: this.width,
      height: this.height,
      innerW: w,
      innerH: h,
    };
  }
}
