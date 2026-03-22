import type { GraphNode, NormalizedGraph } from '../graphTypes';

/** Visible region in world coordinates (same space as `GraphNode.x/y`). */
export type WorldViewport = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export function nodeIntersectsViewport(n: GraphNode, v: WorldViewport): boolean {
  return !(
    n.x + n.w < v.x ||
    n.x > v.x + v.w ||
    n.y + n.h < v.y ||
    n.y > v.y + v.h
  );
}

/**
 * Picks node ids whose bbox hits the viewport. Pins are always included so
 * dragged/off-screen selections still receive imperative updates.
 */
export function computeVisibleNodeIds(
  graph: NormalizedGraph,
  viewport: WorldViewport,
  pin?: ReadonlySet<string>,
): Set<string> {
  const out = new Set<string>();
  if (pin) {
    for (const id of pin) {
      if (graph.nodes[id]) out.add(id);
    }
  }
  for (const id of graph.nodeIds) {
    const n = graph.nodes[id];
    if (n && nodeIntersectsViewport(n, viewport)) {
      out.add(id);
    }
  }
  return out;
}

/** Map client pixels → world rect from pan/zoom applied as translate then uniform scale. */
export function clientToWorldViewport(
  clientW: number,
  clientH: number,
  panX: number,
  panY: number,
  scale: number,
  padWorld: number,
): WorldViewport {
  const s = scale || 1;
  return {
    x: -panX / s - padWorld,
    y: -panY / s - padWorld,
    w: clientW / s + padWorld * 2,
    h: clientH / s + padWorld * 2,
  };
}
