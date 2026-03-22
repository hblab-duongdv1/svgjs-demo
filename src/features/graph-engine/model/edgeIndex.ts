import type { GraphEdge, NormalizedGraph } from '../graphTypes';

/** Maps each node id → edge ids incident on that node (for incremental edge path updates). */
export function buildEdgeIndex(graph: NormalizedGraph): Map<string, string[]> {
  const m = new Map<string, string[]>();
  const add = (nodeId: string, edgeId: string) => {
    const arr = m.get(nodeId);
    if (arr) arr.push(edgeId);
    else m.set(nodeId, [edgeId]);
  };
  for (const id of graph.edgeIds) {
    const e = graph.edges[id];
    if (!e) continue;
    add(e.sourceNodeId, id);
    add(e.targetNodeId, id);
  }
  return m;
}

export function collectEdgesForNodes(
  graph: NormalizedGraph,
  index: Map<string, string[]>,
  nodeIds: Iterable<string>,
): Set<string> {
  const out = new Set<string>();
  for (const nid of nodeIds) {
    const list = index.get(nid);
    if (!list) continue;
    for (const eid of list) out.add(eid);
  }
  return out;
}

export function getEdgeOrThrow(graph: NormalizedGraph, edgeId: string): GraphEdge {
  const e = graph.edges[edgeId];
  if (!e) throw new Error(`Unknown edge "${edgeId}"`);
  return e;
}
