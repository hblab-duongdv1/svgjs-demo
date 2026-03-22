import type { GraphNode, NormalizedGraph } from '../graphTypes';

export type Rect = { x: number; y: number; w: number; h: number };

function centerRight(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w, y: r.y + r.h / 2 };
}

function centerLeft(r: Rect): { x: number; y: number } {
  return { x: r.x, y: r.y + r.h / 2 };
}

function pointInNode(x: number, y: number, n: GraphNode, pad = 0): boolean {
  return (
    x >= n.x - pad &&
    x <= n.x + n.w + pad &&
    y >= n.y - pad &&
    y <= n.y + n.h + pad
  );
}

/**
 * Right-to-left cubic edge with horizontal control arms.
 * If the geometric midpoint sits inside a third node, nudges control Y to reduce overlap.
 */
export function computeEdgePath(
  graph: NormalizedGraph,
  fromNode: GraphNode,
  toNode: GraphNode,
): string {
  const a: Rect = { x: fromNode.x, y: fromNode.y, w: fromNode.w, h: fromNode.h };
  const b: Rect = { x: toNode.x, y: toNode.y, w: toNode.w, h: toNode.h };
  const p0 = centerRight(a);
  const p3 = centerLeft(b);

  const dx = p3.x - p0.x;
  const arm = Math.min(160, Math.max(48, Math.abs(dx) * 0.45));

  let c1y = p0.y;
  let c2y = p3.y;

  const obstacles = Object.values(graph.nodes).filter(
    (n) => n.id !== fromNode.id && n.id !== toNode.id,
  );

  const midx = (p0.x + p3.x) / 2;
  const midy = (p0.y + p3.y) / 2;
  for (const n of obstacles) {
    if (pointInNode(midx, midy, n, 4)) {
      const bump = 56 * (p3.y >= p0.y ? 1 : -1);
      c1y += bump;
      c2y += bump;
      break;
    }
  }

  /* Sample the cubic at a few t values; if still inside a bbox, bump again. */
  for (let pass = 0; pass < 3; pass++) {
    let clipped = false;
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      const sx =
        (1 - t) ** 3 * p0.x +
        3 * (1 - t) ** 2 * t * (p0.x + arm) +
        3 * (1 - t) * t ** 2 * (p3.x - arm) +
        t ** 3 * p3.x;
      const sy =
        (1 - t) ** 3 * p0.y +
        3 * (1 - t) ** 2 * t * c1y +
        3 * (1 - t) * t ** 2 * c2y +
        t ** 3 * p3.y;
      for (const n of obstacles) {
        if (pointInNode(sx, sy, n, 2)) {
          clipped = true;
          break;
        }
      }
      if (clipped) break;
    }
    if (!clipped) break;
    const dir = pass % 2 === 0 ? 1 : -1;
    c1y += 36 * dir;
    c2y += 36 * dir;
  }

  return `M ${p0.x} ${p0.y} C ${p0.x + arm} ${c1y}, ${p3.x - arm} ${c2y}, ${p3.x} ${p3.y}`;
}
