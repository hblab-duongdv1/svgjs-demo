import type { GraphNode } from '../graphTypes';

export type NodeTypeStyle = {
  fill: string;
  stroke: string;
  strokeWidth: number;
  radius: number;
};

/**
 * Plugin surface for custom workflow nodes: default geometry + palette hooks.
 * Rendering stays in `GraphSvgEngine`; plugins stay data-only for testability.
 */
export type NodeTypePlugin = {
  type: string;
  defaultSize: { w: number; h: number };
  style: NodeTypeStyle;
  /** Default label when spawning. */
  defaultLabel: string;
};

const task: NodeTypePlugin = {
  type: 'task',
  defaultSize: { w: 118, h: 44 },
  style: {
    fill: '#e0e7ff',
    stroke: '#4338ca',
    strokeWidth: 1.5,
    radius: 8,
  },
  defaultLabel: 'Task',
};

const decision: NodeTypePlugin = {
  type: 'decision',
  defaultSize: { w: 92, h: 92 },
  style: {
    fill: '#fef3c7',
    stroke: '#b45309',
    strokeWidth: 1.5,
    radius: 8,
  },
  defaultLabel: 'Decision',
};

const event: NodeTypePlugin = {
  type: 'event',
  defaultSize: { w: 108, h: 40 },
  style: {
    fill: '#dcfce7',
    stroke: '#15803d',
    strokeWidth: 1.5,
    radius: 20,
  },
  defaultLabel: 'Event',
};

const BUILTIN: Record<string, NodeTypePlugin> = {
  task,
  decision,
  event,
};

export class NodeTypeRegistry {
  private readonly plugins = new Map<string, NodeTypePlugin>();

  constructor() {
    for (const p of Object.values(BUILTIN)) {
      this.plugins.set(p.type, p);
    }
  }

  register(plugin: NodeTypePlugin): void {
    this.plugins.set(plugin.type, plugin);
  }

  get(type: string): NodeTypePlugin {
    return (
      this.plugins.get(type) ?? {
        type: 'default',
        defaultSize: { w: 118, h: 44 },
        style: {
          fill: '#f1f5f9',
          stroke: '#64748b',
          strokeWidth: 1.5,
          radius: 8,
        },
        defaultLabel: 'Node',
      }
    );
  }

  ensureNodeGeometry(node: GraphNode): void {
    const p = this.get(node.type);
    if (!node.w || !node.h) {
      node.w = p.defaultSize.w;
      node.h = p.defaultSize.h;
    }
  }
}
