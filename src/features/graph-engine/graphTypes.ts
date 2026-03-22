/**
 * Normalized graph schema: O(1) node/edge lookup by id.
 * `nodeIds` preserves stable render / z-order (later items paint above earlier).
 */

export type PortId = string;

export type GraphNode = {
  id: string;
  /** Plugin key — drives default geometry + styling. */
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  /** Extension payload for enterprise metadata (status, SLA, etc.). */
  meta?: Record<string, unknown>;
};

export type GraphEdge = {
  id: string;
  sourceNodeId: string;
  sourcePort: PortId;
  targetNodeId: string;
  targetPort: PortId;
};

export type NormalizedGraph = {
  nodes: Record<string, GraphNode>;
  edges: Record<string, GraphEdge>;
  nodeIds: string[];
  edgeIds: string[];
};

export const GRAPH_JSON_VERSION = 1 as const;

export type SerializedGraphV1 = {
  version: typeof GRAPH_JSON_VERSION;
  nodes: GraphNode[];
  edges: GraphEdge[];
};
