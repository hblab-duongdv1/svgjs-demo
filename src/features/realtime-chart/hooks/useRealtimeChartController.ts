import { useEffect } from 'react';

import { ChartDataModel } from '../engine/chartDataModel';
import {
  RealtimeLineChartEngine,
  type ChartViewTransform,
} from '../engine/realtimeLineChartEngine';
import { MockChartStreamConnection } from '../services/mockStreamService';
import { useRealtimeChartStore } from '../store/useRealtimeChartStore';
import { DEFAULT_SERIES_STYLES, SERIES_IDS, type SeriesId } from '../types';

const SAMPLES_PER_SERIES = 12_000;
const DEFAULT_X_WINDOW = 45;

function formatTooltip(
  tQuery: number,
  model: ChartDataModel,
  visible: Record<SeriesId, boolean>,
): string {
  const lines: string[] = [`t = ${tQuery.toFixed(4)} s`];
  for (const id of SERIES_IDS) {
    if (!visible[id]) continue;
    const hit = model.buffers[id].nearestByT(tQuery);
    if (hit) {
      const label = DEFAULT_SERIES_STYLES.find((s) => s.id === id)?.label ?? id;
      lines.push(`${label}: ${hit.y.toFixed(5)}`);
    }
  }
  return lines.join('\n');
}

/**
 * Wires data model, stream, SVG.js engine, rAF render loop, and pointer/wheel handlers.
 * Tooltip text is written imperatively to keep pointermove off React state.
 */
export function useRealtimeChartController(
  containerRef: React.RefObject<HTMLElement | null>,
  tooltipRef: React.RefObject<HTMLDivElement | null>,
  fpsRef: React.RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const model = new ChartDataModel(SAMPLES_PER_SERIES);
    const engine = new RealtimeLineChartEngine(root);
    engine.mount();

    const view: ChartViewTransform = {
      xMin: 0,
      xMax: DEFAULT_X_WINDOW,
      followLatest: useRealtimeChartStore.getState().followLatest,
    };

    const conn = new MockChartStreamConnection(model);
    let hardResetNonce = useRealtimeChartStore.getState().hardResetNonce;

    let dragActive = false;
    let dragStartClientX = 0;
    let dragStartXMin = 0;
    let dragStartXMax = 0;

    let rafRender: number | null = null;
    let lastFpsTick = performance.now();
    let frameAcc = 0;

    const resizeObserver = new ResizeObserver(() => {
      engine.resize();
    });
    resizeObserver.observe(root);

    const hit = () => engine.getHitTarget();

    const applyWheelZoom = (e: WheelEvent): void => {
      e.preventDefault();
      useRealtimeChartStore.getState().setFollowLatest(false);
      const m = engine.getPlotMetrics();
      const rect = root.getBoundingClientRect();
      const px = e.clientX - rect.left - m.margin.left;
      if (px < 0 || px > m.innerW) return;

      const span = view.xMax - view.xMin;
      const dataX = view.xMin + (px / m.innerW) * span;
      const factor = Math.exp(-e.deltaY * 0.0018);
      const newSpan = Math.min(600, Math.max(0.35, span * factor));
      const rel = px / m.innerW;
      view.xMin = dataX - rel * newSpan;
      view.xMax = dataX + (1 - rel) * newSpan;
    };

    const onPointerDown = (e: PointerEvent): void => {
      const t = hit();
      if (!t) return;
      t.setPointerCapture(e.pointerId);
      dragActive = true;
      dragStartClientX = e.clientX;
      dragStartXMin = view.xMin;
      dragStartXMax = view.xMax;
      useRealtimeChartStore.getState().setFollowLatest(false);
    };

    const onPointerMove = (e: PointerEvent): void => {
      const tip = tooltipRef.current;
      const m = engine.getPlotMetrics();
      const rect = root.getBoundingClientRect();

      if (dragActive) {
        if (tip) tip.style.opacity = '0';
        const span = dragStartXMax - dragStartXMin;
        const dxPx = e.clientX - dragStartClientX;
        const deltaData = -(dxPx / m.innerW) * span;
        view.xMin = dragStartXMin + deltaData;
        view.xMax = dragStartXMax + deltaData;
        return;
      }

      const px = e.clientX - rect.left - m.margin.left;
      if (px < 0 || px > m.innerW || m.innerW <= 0) {
        if (tip) tip.style.opacity = '0';
        return;
      }
      const span = view.xMax - view.xMin;
      const tQuery = view.xMin + (px / m.innerW) * span;
      const vis = useRealtimeChartStore.getState().seriesVisible;
      if (tip) {
        tip.style.opacity = '1';
        tip.style.left = `${e.clientX + 14}px`;
        tip.style.top = `${e.clientY + 14}px`;
        tip.textContent = formatTooltip(tQuery, model, vis);
      }
    };

    const onPointerUp = (e: PointerEvent): void => {
      const t = hit();
      try {
        t?.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
      dragActive = false;
    };

    const attachHitListeners = (): void => {
      const t = hit();
      if (!t) return;
      t.addEventListener('wheel', applyWheelZoom, { passive: false });
      t.addEventListener('pointerdown', onPointerDown);
      t.addEventListener('pointermove', onPointerMove);
      t.addEventListener('pointerup', onPointerUp);
      t.addEventListener('pointercancel', onPointerUp);
    };

    attachHitListeners();

    const renderLoop = (): void => {
      rafRender = requestAnimationFrame(renderLoop);
      frameAcc++;
      view.followLatest = useRealtimeChartStore.getState().followLatest;
      engine.syncFrame(model, view);

      const now = performance.now();
      if (now - lastFpsTick >= 1000) {
        const fps = (frameAcc * 1000) / (now - lastFpsTick);
        frameAcc = 0;
        lastFpsTick = now;
        const el = fpsRef.current;
        if (el) el.textContent = `${Math.round(fps)} FPS`;
      }
    };
    rafRender = requestAnimationFrame(renderLoop);

    const syncStore = (): void => {
      const s = useRealtimeChartStore.getState();
      view.followLatest = s.followLatest;
      for (const id of SERIES_IDS) {
        engine.setSeriesVisible(id, s.seriesVisible[id]);
      }

      if (s.hardResetNonce !== hardResetNonce) {
        hardResetNonce = s.hardResetNonce;
        const resume = s.streamConnected;
        conn.hardReset();
        view.xMin = 0;
        view.xMax = DEFAULT_X_WINDOW;
        if (resume) conn.connect();
      } else if (s.streamConnected) {
        conn.connect();
      } else {
        conn.disconnect();
      }
    };

    const unsub = useRealtimeChartStore.subscribe(syncStore);
    syncStore();

    return () => {
      unsub();
      resizeObserver.disconnect();
      const t = hit();
      if (t) {
        t.removeEventListener('wheel', applyWheelZoom);
        t.removeEventListener('pointerdown', onPointerDown);
        t.removeEventListener('pointermove', onPointerMove);
        t.removeEventListener('pointerup', onPointerUp);
        t.removeEventListener('pointercancel', onPointerUp);
      }
      if (rafRender !== null) cancelAnimationFrame(rafRender);
      conn.disconnect();
      engine.dispose();
    };
  }, [containerRef, fpsRef, tooltipRef]);
}
