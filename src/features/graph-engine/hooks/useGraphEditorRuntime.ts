import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { AddEdgeCommand, AddNodeCommand, MoveNodesCommand, RemoveNodesCommand } from '../commands/implementations';
import { GraphSvgEngine } from '../engine/graphSvgEngine';
import {
  clientToWorldViewport,
  computeVisibleNodeIds,
} from '../engine/virtualCulling';
import { GraphDocModel } from '../model/GraphDocModel';
import { createEmptyGraph } from '../model/graphFactory';
import { NodeTypeRegistry } from '../plugins/nodeTypeRegistry';
import type { GraphNode } from '../graphTypes';
import { useGraphUiStore } from '../store/graphUiStore';

type DragSession = {
  ids: string[];
  startWorld: { x: number; y: number };
  origins: Map<string, { x: number; y: number }>;
  temp: Map<string, { x: number; y: number }>;
};

type MarqueeSession = {
  x0: number;
  y0: number;
  additive: boolean;
};

type PanSession = {
  startClient: { x: number; y: number };
  startPan: { x: number; y: number };
};

function newId(): string {
  return crypto.randomUUID();
}

function seedDemo(model: GraphDocModel, registry: NodeTypeRegistry): void {
  const g = createEmptyGraph();
  const mk = (
    id: string,
    type: string,
    x: number,
    y: number,
    label: string,
  ): GraphNode => {
    const p = registry.get(type);
    return {
      id,
      type,
      x,
      y,
      w: p.defaultSize.w,
      h: p.defaultSize.h,
      label,
    };
  };
  /*
   * Layout in world units (~0–600 × ~40–240) so the whole demo fits the initial
   * canvas (typical ~800×500 CSS px at scale 1, pan 24).
   * Sizes come from NodeTypeRegistry: event 108×40, task 118×44, decision 92×92.
   */
  g.nodes.n1 = mk('n1', 'event', 32, 110, 'Trigger A');
  g.nodes.n2 = mk('n2', 'task', 176, 108, 'Process');
  g.nodes.n3 = mk('n3', 'decision', 330, 90, 'OK?');
  g.nodes.n4 = mk('n4', 'task', 458, 48, 'On success');
  g.nodes.n5 = mk('n5', 'task', 458, 196, 'On fail');
  g.nodeIds = ['n1', 'n2', 'n3', 'n4', 'n5'];
  g.edges.e1 = {
    id: 'e1',
    sourceNodeId: 'n1',
    sourcePort: 'out',
    targetNodeId: 'n2',
    targetPort: 'in',
  };
  g.edges.e2 = {
    id: 'e2',
    sourceNodeId: 'n2',
    sourcePort: 'out',
    targetNodeId: 'n3',
    targetPort: 'in',
  };
  g.edges.e3 = {
    id: 'e3',
    sourceNodeId: 'n3',
    sourcePort: 'out',
    targetNodeId: 'n4',
    targetPort: 'in',
  };
  g.edges.e4 = {
    id: 'e4',
    sourceNodeId: 'n3',
    sourcePort: 'out',
    targetNodeId: 'n5',
    targetPort: 'in',
  };
  g.edgeIds = ['e1', 'e2', 'e3', 'e4'];
  model.replaceGraph(g);
}

export function useGraphEditorRuntime(
  containerRef: React.RefObject<HTMLElement | null>,
) {
  const modelRef = useRef<GraphDocModel | null>(null);
  const registryRef = useRef<NodeTypeRegistry | null>(null);
  const engineRef = useRef<GraphSvgEngine | null>(null);

  const [revision, setRevision] = useState(0);
  const bump = useCallback(() => setRevision((r) => r + 1), []);
  const bumpRef = useRef(bump);
  bumpRef.current = bump;

  const dragRef = useRef<DragSession | null>(null);
  const marqueeRef = useRef<MarqueeSession | null>(null);
  const panRef = useRef<PanSession | null>(null);
  const rafRef = useRef<number | null>(null);
  /** PointerEvent.getModifierState('Space') is unreliable; track Space from keyboard. */
  const spaceForPanRef = useRef(false);

  const selectedIds = useGraphUiStore((s) => s.selectedIds);
  const tool = useGraphUiStore((s) => s.tool);
  const setSelectedIds = useGraphUiStore((s) => s.setSelectedIds);
  const clearSelection = useGraphUiStore((s) => s.clearSelection);

  const sync = useCallback(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    const model = modelRef.current;
    if (!container || !engine || !model) return;

    engine.resizeFromContainer();
    const rect = container.getBoundingClientRect();
    const { panX, panY, scale } = engine.viewport;
    const vp = clientToWorldViewport(rect.width, rect.height, panX, panY, scale, 140);

    const sel = useGraphUiStore.getState().selectedIds;
    const pin = new Set<string>(sel);
    const d = dragRef.current;
    if (d) for (const id of d.ids) pin.add(id);

    const visible = computeVisibleNodeIds(model.graph, vp, pin);
    const temp = d?.temp ?? null;
    engine.sync(model.graph, visible, temp, new Set(sel));
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

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const model = new GraphDocModel();
    modelRef.current = model;
    const registry = new NodeTypeRegistry();
    registryRef.current = registry;
    seedDemo(model, registry);

    const engine = new GraphSvgEngine(el, () => modelRef.current!, registry);
    engineRef.current = engine;
    engine.mount();

    const runSync = () => {
      engine.resizeFromContainer();
      const rect = el.getBoundingClientRect();
      const { panX, panY, scale } = engine.viewport;
      const vp = clientToWorldViewport(rect.width, rect.height, panX, panY, scale, 140);
      const sel = useGraphUiStore.getState().selectedIds;
      const pin = new Set<string>(sel);
      const d = dragRef.current;
      if (d) for (const id of d.ids) pin.add(id);
      const visible = computeVisibleNodeIds(model.graph, vp, pin);
      const temp = d?.temp ?? null;
      engine.sync(model.graph, visible, temp, new Set(sel));
    };

    runSync();

    const ro = new ResizeObserver(() => {
      scheduleSyncRef.current();
    });
    ro.observe(el);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      if (e.repeat) return;
      const tgt = e.target;
      if (
        tgt instanceof Element &&
        tgt.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return;
      }
      spaceForPanRef.current = true;
      if (el.contains(tgt as Node) || document.activeElement === el) {
        e.preventDefault();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' && e.key !== ' ') return;
      spaceForPanRef.current = false;
    };
    const onWindowBlur = () => {
      spaceForPanRef.current = false;
    };
    window.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('blur', onWindowBlur);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0012);
      engine.zoomTowardScreenPoint(e.clientX, e.clientY, factor);
      scheduleSyncRef.current();
    };

    const onPointerDown = (e: PointerEvent) => {
      const portHit = engine.hitTestPort(e.clientX, e.clientY);
      const bodyHit = engine.hitTestNodeBody(e.clientX, e.clientY);

      if (e.button === 1) {
        panRef.current = {
          startClient: { x: e.clientX, y: e.clientY },
          startPan: { x: engine.viewport.panX, y: engine.viewport.panY },
        };
        el.setPointerCapture(e.pointerId);
        return;
      }

      const uiTool = useGraphUiStore.getState().tool;
      const st = useGraphUiStore.getState();
      const pend = st.pendingConnect;

      /*
       * Connect: start from **either** port (left=in, right=out).
       * Complete with the complementary port on another node: out→in or in→out.
       */
      if (uiTool === 'connect' && portHit) {
        if (!pend) {
          st.setPendingConnect({
            nodeId: portHit.nodeId,
            port: portHit.port,
          });
          return;
        }

        if (portHit.nodeId === pend.nodeId) {
          st.setPendingConnect({
            nodeId: portHit.nodeId,
            port: portHit.port,
          });
          return;
        }

        let sourceId: string;
        let targetId: string;
        if (pend.port === 'out' && portHit.port === 'in') {
          sourceId = pend.nodeId;
          targetId = portHit.nodeId;
        } else if (pend.port === 'in' && portHit.port === 'out') {
          sourceId = portHit.nodeId;
          targetId = pend.nodeId;
        } else {
          st.setPendingConnect({
            nodeId: portHit.nodeId,
            port: portHit.port,
          });
          return;
        }

        if (sourceId === targetId) {
          return;
        }

        const dup = Object.values(model.graph.edges).some(
          (x) =>
            x.sourceNodeId === sourceId && x.targetNodeId === targetId,
        );
        if (!dup) {
          model.execute(
            new AddEdgeCommand({
              id: newId(),
              sourceNodeId: sourceId,
              sourcePort: 'out',
              targetNodeId: targetId,
              targetPort: 'in',
            }),
          );
          st.setPendingConnect(null);
          bumpRef.current();
        }
        return;
      }

      if (bodyHit) {
        const ui = useGraphUiStore.getState();
        let moving: string[];
        if (e.shiftKey) {
          ui.selectNode(bodyHit, true);
          moving = ui.selectedIds.filter((id) => model.graph.nodes[id]);
        } else {
          const cur = ui.selectedIds;
          if (cur.includes(bodyHit)) {
            moving = [...cur];
          } else {
            ui.selectNode(bodyHit, false);
            moving = [bodyHit];
          }
        }

        const w = engine.screenToWorld(e.clientX, e.clientY);
        const origins = new Map<string, { x: number; y: number }>();
        for (const id of moving) {
          const n = model.graph.nodes[id];
          if (n) origins.set(id, { x: n.x, y: n.y });
        }
        dragRef.current = {
          ids: [...origins.keys()],
          startWorld: w,
          origins,
          temp: new Map(),
        };
        el.setPointerCapture(e.pointerId);
        return;
      }

      /*
       * Pan with primary button: Alt, or Space (tracked above — not getModifierState),
       * or drag empty canvas in Connect mode (no marquee there).
       */
      if (
        e.button === 0 &&
        !bodyHit &&
        (e.altKey ||
          spaceForPanRef.current ||
          (uiTool === 'connect' && !portHit))
      ) {
        panRef.current = {
          startClient: { x: e.clientX, y: e.clientY },
          startPan: { x: engine.viewport.panX, y: engine.viewport.panY },
        };
        el.setPointerCapture(e.pointerId);
        return;
      }

      if (e.button === 0 && uiTool === 'select') {
        if (!e.shiftKey) useGraphUiStore.getState().clearSelection();
        const w = engine.screenToWorld(e.clientX, e.clientY);
        marqueeRef.current = { x0: w.x, y0: w.y, additive: e.shiftKey };
        el.setPointerCapture(e.pointerId);
      }
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

      const drag = dragRef.current;
      if (drag) {
        const w = engine.screenToWorld(e.clientX, e.clientY);
        const dx = w.x - drag.startWorld.x;
        const dy = w.y - drag.startWorld.y;
        drag.temp.clear();
        for (const id of drag.ids) {
          const o = drag.origins.get(id);
          if (o) drag.temp.set(id, { x: o.x + dx, y: o.y + dy });
        }
        scheduleSyncRef.current();
        return;
      }

      const mq = marqueeRef.current;
      if (mq) {
        const w = engine.screenToWorld(e.clientX, e.clientY);
        engine.setMarqueeWorld(mq.x0, mq.y0, w.x, w.y, true);
        scheduleSyncRef.current();
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

      const drag = dragRef.current;
      if (drag) {
        const moves: {
          id: string;
          from: { x: number; y: number };
          to: { x: number; y: number };
        }[] = [];
        for (const id of drag.ids) {
          const from = drag.origins.get(id);
          const to = drag.temp.get(id);
          if (from && to && (from.x !== to.x || from.y !== to.y)) {
            moves.push({ id, from, to });
          }
        }
        if (moves.length) {
          model.execute(new MoveNodesCommand(moves));
          bumpRef.current();
        }
        dragRef.current = null;
        scheduleSyncRef.current();
        return;
      }

      const mq = marqueeRef.current;
      if (mq) {
        const w = engine.screenToWorld(e.clientX, e.clientY);
        const xa = Math.min(mq.x0, w.x);
        const ya = Math.min(mq.y0, w.y);
        const xb = Math.max(mq.x0, w.x);
        const yb = Math.max(mq.y0, w.y);
        if (Math.abs(xb - xa) > 4 && Math.abs(yb - ya) > 4) {
          const picked: string[] = [];
          for (const id of model.graph.nodeIds) {
            const n = model.graph.nodes[id];
            if (!n) continue;
            const hit = !(
              n.x + n.w < xa ||
              n.x > xb ||
              n.y + n.h < ya ||
              n.y > yb
            );
            if (hit) picked.push(id);
          }
          const { addToSelection: addSel, setSelectedIds: setSel } =
            useGraphUiStore.getState();
          if (mq.additive) addSel(picked);
          else setSel(picked);
        }
        marqueeRef.current = null;
        engine.setMarqueeWorld(0, 0, 0, 0, false);
        scheduleSyncRef.current();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);

    return () => {
      spaceForPanRef.current = false;
      window.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('blur', onWindowBlur);
      ro.disconnect();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      engine.dispose();
      engineRef.current = null;
      modelRef.current = null;
    };
  }, [containerRef]);

  useEffect(() => {
    scheduleSync();
  }, [revision, selectedIds, tool, scheduleSync]);

  const undo = useCallback(() => {
    const m = modelRef.current;
    if (!m?.undo()) return;
    bump();
  }, [bump]);

  const redo = useCallback(() => {
    const m = modelRef.current;
    if (!m?.redo()) return;
    bump();
  }, [bump]);

  const addNode = useCallback(
    (type: string) => {
      const model = modelRef.current;
      const engine = engineRef.current;
      const reg = registryRef.current;
      if (!model || !engine || !reg) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const { panX, panY, scale } = engine.viewport;
      const s = scale || 1;
      const cx = (rect.width / 2 - panX) / s;
      const cy = (rect.height / 2 - panY) / s;
      const p = reg.get(type);
      const id = newId();
      const node: GraphNode = {
        id,
        type,
        x: cx - p.defaultSize.w / 2,
        y: cy - p.defaultSize.h / 2,
        w: p.defaultSize.w,
        h: p.defaultSize.h,
        label: p.defaultLabel,
      };
      model.execute(new AddNodeCommand(node));
      setSelectedIds([id]);
      bump();
    },
    [bump, containerRef, setSelectedIds],
  );

  const deleteSelected = useCallback(() => {
    const model = modelRef.current;
    if (!model) return;
    const ids = useGraphUiStore.getState().selectedIds;
    if (!ids.length) return;
    model.execute(new RemoveNodesCommand(ids));
    clearSelection();
    bump();
  }, [bump, clearSelection]);

  const exportJson = useCallback(() => modelRef.current?.toJSON() ?? '', []);

  const importJson = useCallback(
    (json: string) => {
      const m = modelRef.current;
      if (!m) return;
      try {
        m.loadJSON(json);
        clearSelection();
        bump();
      } catch {
        window.alert('Invalid graph JSON');
      }
    },
    [bump, clearSelection],
  );

  const spawnStressNodes = useCallback(
    (count: number) => {
      const model = modelRef.current;
      const reg = registryRef.current;
      if (!model || !reg) return;
      const g = createEmptyGraph();
      const p = reg.get('task');
      const cols = Math.ceil(Math.sqrt(count));
      for (let i = 0; i < count; i++) {
        const id = `s-${i}`;
        const col = i % cols;
        const row = Math.floor(i / cols);
        g.nodes[id] = {
          id,
          type: 'task',
          x: col * (p.defaultSize.w + 24),
          y: row * (p.defaultSize.h + 20),
          w: p.defaultSize.w,
          h: p.defaultSize.h,
          label: `N${i}`,
        };
        g.nodeIds.push(id);
      }
      model.replaceGraph(g);
      clearSelection();
      bump();
    },
    [bump, clearSelection],
  );

  const resetDemo = useCallback(() => {
    const model = modelRef.current;
    const reg = registryRef.current;
    if (!model || !reg) return;
    seedDemo(model, reg);
    clearSelection();
    bump();
  }, [bump, clearSelection]);

  return {
    revision,
    undo,
    redo,
    addNode,
    deleteSelected,
    exportJson,
    importJson,
    spawnStressNodes,
    resetDemo,
    canUndo: () => modelRef.current?.history.canUndo() ?? false,
    canRedo: () => modelRef.current?.history.canRedo() ?? false,
  };
}
