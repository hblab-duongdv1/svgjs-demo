import {
  GRAPH_JSON_VERSION,
  type GraphEdge,
  type GraphNode,
  type NormalizedGraph,
  type SerializedGraphV1,
} from './graphTypes';
import { createEmptyGraph } from './model/graphFactory';

export function serializeGraph(graph: NormalizedGraph): string {
  const payload: SerializedGraphV1 = {
    version: GRAPH_JSON_VERSION,
    nodes: graph.nodeIds.map((id) => graph.nodes[id]).filter(Boolean),
    edges: graph.edgeIds.map((id) => graph.edges[id]).filter(Boolean),
  };
  return JSON.stringify(payload, null, 2);
}

export function deserializeGraph(json: string): NormalizedGraph {
  const raw = JSON.parse(json) as SerializedGraphV1;
  if (raw.version !== GRAPH_JSON_VERSION) {
    throw new Error(`Unsupported graph JSON version: ${raw.version}`);
  }
  const g = createEmptyGraph();
  for (const n of raw.nodes ?? []) {
    if (!n?.id) continue;
    g.nodes[n.id] = { ...n };
    g.nodeIds.push(n.id);
  }
  for (const e of raw.edges ?? []) {
    if (!e?.id) continue;
    g.edges[e.id] = { ...e };
    g.edgeIds.push(e.id);
  }
  return g;
}

/** Shallow validation for pasted graphs. */
export function graphReferencesValid(g: NormalizedGraph): boolean {
  for (const id of g.edgeIds) {
    const e = g.edges[id];
    if (!e) return false;
    if (!g.nodes[e.sourceNodeId] || !g.nodes[e.targetNodeId]) return false;
  }
  return true;
}

export function snapshotNodesEdges(graph: NormalizedGraph): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  return {
    nodes: graph.nodeIds.map((id) => graph.nodes[id]).filter(Boolean),
    edges: graph.edgeIds.map((id) => graph.edges[id]).filter(Boolean),
  };
}
