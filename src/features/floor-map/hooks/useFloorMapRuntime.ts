import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';

import { ZoneSpatialGrid } from '../data/spatialGrid';
import { FloorMapSvgEngine } from '../engine/FloorMapSvgEngine';
import { useFloorMapStore } from '../store/floorMapStore';

type PanSession = {
  startClient: { x: number; y: number };
  startPan: { x: number; y: number };
};

type ClickSession = {
  clientX: number;
  clientY: number;
  additive: boolean;
};

function fitZonesToViewport(
  engine: FloorMapSvgEngine,
  container: HTMLElement,
  worldW: number,
  worldH: number,
  pad = 40,
): void {
  const r = container.getBoundingClientRect();
  const cw = Math.max(1, r.width);
  const ch = Math.max(1, r.height);
  const sx = (cw - pad * 2) / worldW;
  const sy = (ch - pad * 2) / worldH;
  const s = Math.min(Math.max(Math.min(sx, sy), 0.15), 2.2);
  engine.setViewport({
    scale: s,
    panX: pad,
    panY: pad,
  });
}

export function useFloorMapRuntime(containerRef: React.RefObject<HTMLElement | null>) {
  const engineRef = useRef<FloorMapSvgEngine | null>(null);
  const gridRef = useRef<ZoneSpatialGrid | null>(null);
  const zoneLayoutKeyRef = useRef<string>('');
  const panRef = useRef<PanSession | null>(null);
  const clickRef = useRef<ClickSession | null>(null);
  const rafRef = useRef<number | null>(null);

  const sync = useCallback(() => {
    const el = containerRef.current;
    const engine = engineRef.current;
    if (!el || !engine) return;

    engine.resizeFromContainer();
    const st = useFloorMapStore.getState();
    const { zones, zoneOrder, assets, runtimeByZone, layers, selectedIds, hoveredId } = st;

    const layoutKey = `${zones.length}:${zones[0]?.id ?? ''}:${zones.at(-1)?.id ?? ''}`;
    if (layoutKey !== zoneLayoutKeyRef.current) {
      zoneLayoutKeyRef.current = layoutKey;
      gridRef.current = new ZoneSpatialGrid(zones, 160);
    }

    engine.ensureZones(
      zones,
      assets,
      runtimeByZone,
      layers,
      new Set(selectedIds),
      hoveredId,
    );
  }, [containerRef]);

  const scheduleSync = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      sync();
    });
  }, [sync]);

  const scheduleSyncRef = useRef(scheduleSync);
  scheduleSyncRef.current = scheduleSync;

  const fitView = useCallback(() => {
    const el = containerRef.current;
    const engine = engineRef.current;
    if (!el || !engine) return;
    const { w, h } = engine.getWorldSize();
    fitZonesToViewport(engine, el, w, h);
    scheduleSyncRef.current();
  }, [containerRef]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const engine = new FloorMapSvgEngine(el);
    engineRef.current = engine;
    engine.mount();
    sync();
    {
      const { w, h } = engine.getWorldSize();
      fitZonesToViewport(engine, el, w, h);
    }
    sync();

    const ro = new ResizeObserver(() => scheduleSyncRef.current());
    ro.observe(el);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.001);
      engine.zoomTowardScreenPoint(e.clientX, e.clientY, factor);
      scheduleSyncRef.current();
    };

    const pickHover = (clientX: number, clientY: number) => {
      const w = engine.screenToWorld(clientX, clientY);
      const order = useFloorMapStore.getState().zoneOrder;
      const hit = gridRef.current?.pickAt(w.x, w.y, order) ?? null;
      const cur = useFloorMapStore.getState().hoveredId;
      if (hit !== cur) useFloorMapStore.getState().setHovered(hit);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (panRef.current) {
        const dx = e.clientX - panRef.current.startClient.x;
        const dy = e.clientY - panRef.current.startClient.y;
        engine.setViewport({
          panX: panRef.current.startPan.x + dx,
          panY: panRef.current.startPan.y + dy,
        });
        scheduleSyncRef.current();
        return;
      }
      pickHover(e.clientX, e.clientY);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 1) {
        panRef.current = {
          startClient: { x: e.clientX, y: e.clientY },
          startPan: { x: engine.viewport.panX, y: engine.viewport.panY },
        };
        el.setPointerCapture(e.pointerId);
        return;
      }
      if (e.button === 0 && (e.altKey || e.getModifierState('Space'))) {
        panRef.current = {
          startClient: { x: e.clientX, y: e.clientY },
          startPan: { x: engine.viewport.panX, y: engine.viewport.panY },
        };
        el.setPointerCapture(e.pointerId);
        return;
      }
      if (e.button === 0) {
        clickRef.current = {
          clientX: e.clientX,
          clientY: e.clientY,
          additive: e.metaKey || e.ctrlKey,
        };
        el.setPointerCapture(e.pointerId);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* */
      }

      if (panRef.current) {
        panRef.current = null;
        return;
      }

      const c = clickRef.current;
      clickRef.current = null;
      if (e.button !== 0 || !c) return;

      const moved =
        Math.abs(e.clientX - c.clientX) > 6 || Math.abs(e.clientY - c.clientY) > 6;
      if (moved) return;

      const w = engine.screenToWorld(e.clientX, e.clientY);
      const order = useFloorMapStore.getState().zoneOrder;
      const hit = gridRef.current?.pickAt(w.x, w.y, order) ?? null;
      if (hit) {
        useFloorMapStore.getState().selectZone(hit, c.additive);
      } else if (!c.additive) {
        useFloorMapStore.getState().clearSelection();
      }
      scheduleSyncRef.current();
    };

    const onPointerLeave = () => {
      useFloorMapStore.getState().setHovered(null);
      scheduleSyncRef.current();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('pointerleave', onPointerLeave);

    const unsub = useFloorMapStore.subscribe(() => {
      scheduleSyncRef.current();
    });

    return () => {
      unsub();
      ro.disconnect();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('pointerleave', onPointerLeave);
      engine.dispose();
      engineRef.current = null;
      gridRef.current = null;
      zoneLayoutKeyRef.current = '';
    };
  }, [containerRef, sync]);

  useEffect(() => {
    const id = window.setInterval(() => {
      useFloorMapStore.getState().tickSimulation();
    }, 850);
    return () => window.clearInterval(id);
  }, []);

  return { fitView };
}
