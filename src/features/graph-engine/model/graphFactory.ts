import type { NormalizedGraph } from '../graphTypes';

export function createEmptyGraph(): NormalizedGraph {
  return {
    nodes: {},
    edges: {},
    nodeIds: [],
    edgeIds: [],
  };
}

export function cloneGraph(source: NormalizedGraph): NormalizedGraph {
  return {
    nodes: { ...source.nodes },
    edges: { ...source.edges },
    nodeIds: [...source.nodeIds],
    edgeIds: [...source.edgeIds],
  };
}
