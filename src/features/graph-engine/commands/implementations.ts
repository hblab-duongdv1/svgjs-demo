import type { GraphEdge, GraphNode, NormalizedGraph } from '../graphTypes';
import type { GraphCommand } from './GraphCommand';

function removeNodeFromOrder(graph: NormalizedGraph, nodeId: string): void {
  graph.nodeIds = graph.nodeIds.filter((id) => id !== nodeId);
}

function removeEdgeFromOrder(graph: NormalizedGraph, edgeId: string): void {
  graph.edgeIds = graph.edgeIds.filter((id) => id !== edgeId);
}

export class AddNodeCommand implements GraphCommand {
  readonly label = 'Add node';

  constructor(private readonly node: GraphNode) {}

  apply(graph: NormalizedGraph): void {
    graph.nodes[this.node.id] = { ...this.node };
    graph.nodeIds.push(this.node.id);
  }

  revert(graph: NormalizedGraph): void {
    delete graph.nodes[this.node.id];
    removeNodeFromOrder(graph, this.node.id);
  }
}

export class MoveNodesCommand implements GraphCommand {
  readonly label: string;

  constructor(
    private readonly moves: readonly { id: string; from: { x: number; y: number }; to: { x: number; y: number } }[],
  ) {
    this.label = moves.length === 1 ? 'Move node' : `Move ${moves.length} nodes`;
  }

  apply(graph: NormalizedGraph): void {
    for (const m of this.moves) {
      const n = graph.nodes[m.id];
      if (n) {
        n.x = m.to.x;
        n.y = m.to.y;
      }
    }
  }

  revert(graph: NormalizedGraph): void {
    for (const m of this.moves) {
      const n = graph.nodes[m.id];
      if (n) {
        n.x = m.from.x;
        n.y = m.from.y;
      }
    }
  }
}

/**
 * Deletes nodes and all incident edges. Snapshots on first `apply` so redo/undo stay consistent.
 */
export class RemoveNodesCommand implements GraphCommand {
  readonly label: string;
  private readonly idSet: Set<string>;
  private snapshotted = false;
  private readonly removedNodes: GraphNode[] = [];
  private readonly removedEdges: GraphEdge[] = [];

  constructor(private readonly nodeIds: readonly string[]) {
    this.idSet = new Set(nodeIds);
    this.label =
      nodeIds.length === 1 ? 'Remove node' : `Remove ${nodeIds.length} nodes`;
  }

  apply(graph: NormalizedGraph): void {
    if (!this.snapshotted) {
      this.snapshotted = true;
      for (const nid of this.nodeIds) {
        const n = graph.nodes[nid];
        if (n) this.removedNodes.push({ ...n });
      }
      for (const eid of [...graph.edgeIds]) {
        const e = graph.edges[eid];
        if (!e) continue;
        if (this.idSet.has(e.sourceNodeId) || this.idSet.has(e.targetNodeId)) {
          this.removedEdges.push({ ...e });
        }
      }
    }

    for (const e of this.removedEdges) {
      delete graph.edges[e.id];
      removeEdgeFromOrder(graph, e.id);
    }
    for (const n of this.removedNodes) {
      delete graph.nodes[n.id];
      removeNodeFromOrder(graph, n.id);
    }
  }

  revert(graph: NormalizedGraph): void {
    for (const n of this.removedNodes) {
      graph.nodes[n.id] = { ...n };
      if (!graph.nodeIds.includes(n.id)) graph.nodeIds.push(n.id);
    }
    for (const e of this.removedEdges) {
      graph.edges[e.id] = { ...e };
      if (!graph.edgeIds.includes(e.id)) graph.edgeIds.push(e.id);
    }
  }
}

export class AddEdgeCommand implements GraphCommand {
  readonly label = 'Add edge';

  constructor(private readonly edge: GraphEdge) {}

  apply(graph: NormalizedGraph): void {
    graph.edges[this.edge.id] = { ...this.edge };
    graph.edgeIds.push(this.edge.id);
  }

  revert(graph: NormalizedGraph): void {
    delete graph.edges[this.edge.id];
    removeEdgeFromOrder(graph, this.edge.id);
  }
}
