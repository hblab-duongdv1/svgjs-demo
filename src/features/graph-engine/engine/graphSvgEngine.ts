import { SVG, type G, type Path as SvgPath, type Svg } from '@svgdotjs/svg.js';

import type { GraphDocModel } from '../model/GraphDocModel';
import type { NodeTypeRegistry } from '../plugins/nodeTypeRegistry';
import { computeEdgePath } from '../routing/edgePath';
import type { GraphNode, NormalizedGraph } from '../graphTypes';

export type ViewportState = {
  panX: number;
  panY: number;
  scale: number;
};

const PORT_R = 5;

/**
 * Imperative SVG.js graph view: mounts only visible nodes/edges, mutates transforms
 * and edge `d` on drag without rebuilding the whole scene graph.
 */
export class GraphSvgEngine {
  private container: HTMLElement;
  private registry: NodeTypeRegistry;
  private getDoc: () => GraphDocModel;

  private svg: Svg | null = null;
  private world: G | null = null;
  private edgesLayer: G | null = null;
  private nodesLayer: G | null = null;
  private marquee: SvgPath | null = null;

  private readonly nodeGfx = new Map<string, G>();
  private readonly edgeGfx = new Map<string, SvgPath>();

  private clientW = 800;
  private clientH = 600;
  /** Pan is in **screen px**; scale multiplies world units → screen (matrix e,f = pan). */
  viewport: ViewportState = { panX: 24, panY: 24, scale: 1 };

  constructor(
    container: HTMLElement,
    getDoc: () => GraphDocModel,
    registry: NodeTypeRegistry,
  ) {
    this.container = container;
    this.getDoc = getDoc;
    this.registry = registry;
  }

  mount(): void {
    this.dispose();
    this.svg = SVG().addTo(this.container).size('100%', '100%');
    this.svg.attr('role', 'presentation');

    this.world = this.svg.group().addClass('ge-world');
    this.edgesLayer = this.world.group().addClass('ge-edges');
    this.nodesLayer = this.world.group().addClass('ge-nodes');
    this.marquee = this.world
      .path('')
      .fill({ color: '#6366f1', opacity: 0.12 })
      .stroke({ width: 1, color: '#6366f1', dasharray: '4 3' })
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('visibility', 'hidden');

    this.applyViewportTransform();
    this.resizeFromContainer();
  }

  dispose(): void {
    this.nodeGfx.clear();
    this.edgeGfx.clear();
    this.svg?.remove();
    this.svg = null;
    this.world = null;
    this.edgesLayer = null;
    this.nodesLayer = null;
    this.marquee = null;
  }

  resizeFromContainer(): void {
    const r = this.container.getBoundingClientRect();
    this.clientW = Math.max(120, r.width);
    this.clientH = Math.max(120, r.height);
    if (this.svg) {
      this.svg.size(this.clientW, this.clientH);
    }
  }

  setViewport(v: Partial<ViewportState>): void {
    this.viewport = { ...this.viewport, ...v };
    this.applyViewportTransform();
  }

  private applyViewportTransform(): void {
    if (!this.world) return;
    const { panX, panY, scale } = this.viewport;
    const s = scale || 1;
    /*
     * Use an explicit SVG matrix so pan/zoom matches screenToWorld:
     * lx = s * wx + panX  →  wx = (lx - panX) / s
     * SVG.js object transform() can compose ops in an order that diverges from this.
     */
    this.world.attr('transform', `matrix(${s},0,0,${s},${panX},${panY})`);
  }

  /** Convert client coordinates to world space (for hit tests / marquee). */
  screenToWorld(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.svg?.node.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: this.clientW,
      height: this.clientH,
    };
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    const { panX, panY, scale } = this.viewport;
    const s = scale || 1;
    return { x: (lx - panX) / s, y: (ly - panY) / s };
  }

  zoomTowardScreenPoint(
    clientX: number,
    clientY: number,
    factor: number,
    minS = 0.25,
    maxS = 3,
  ): void {
    const rect = this.svg?.node.getBoundingClientRect();
    if (!rect?.width) return;
    const lx = clientX - rect.left;
    const ly = clientY - rect.top;
    /* Clamp pointer to SVG box so zoom stays stable near edges. */
    const lxClamped = Math.min(Math.max(lx, 0), rect.width);
    const lyClamped = Math.min(Math.max(ly, 0), rect.height);

    const sOld = this.viewport.scale || 1;
    const beforeX = (lxClamped - this.viewport.panX) / sOld;
    const beforeY = (lyClamped - this.viewport.panY) / sOld;

    let sNew = sOld * factor;
    sNew = Math.min(maxS, Math.max(minS, sNew));

    this.viewport.scale = sNew;
    this.viewport.panX = lxClamped - beforeX * sNew;
    this.viewport.panY = lyClamped - beforeY * sNew;
    this.applyViewportTransform();
  }

  setMarqueeWorld(x0: number, y0: number, x1: number, y1: number, show: boolean): void {
    if (!this.marquee) return;
    if (!show) {
      this.marquee.attr('visibility', 'hidden');
      return;
    }
    const xa = Math.min(x0, x1);
    const ya = Math.min(y0, y1);
    const xb = Math.max(x0, x1);
    const yb = Math.max(y0, y1);
    const d = `M ${xa} ${ya} L ${xb} ${ya} L ${xb} ${yb} L ${xa} ${yb} Z`;
    this.marquee.attr('d', d).attr('visibility', 'visible');
  }

  /**
   * Positions during active drag — merged over `graph` node coords for draw only.
   */
  sync(
    graph: NormalizedGraph,
    visibleNodeIds: ReadonlySet<string>,
    tempPositions: ReadonlyMap<string, { x: number; y: number }> | null,
    selectedIds: ReadonlySet<string>,
  ): void {
    if (!this.nodesLayer || !this.edgesLayer) return;

    const pos = (n: GraphNode) => {
      const t = tempPositions?.get(n.id);
      return t ? { ...n, x: t.x, y: t.y } : n;
    };

    /* --- Nodes: drop invisible (except caller should pin dragging nodes into visible set) --- */
    for (const id of [...this.nodeGfx.keys()]) {
      if (!visibleNodeIds.has(id)) {
        this.nodeGfx.get(id)?.remove();
        this.nodeGfx.delete(id);
      }
    }

    for (const id of graph.nodeIds) {
      if (!visibleNodeIds.has(id)) continue;
      const raw = graph.nodes[id];
      if (!raw) continue;
      const n = pos(raw);
      let g = this.nodeGfx.get(id);
      if (!g) {
        g = this.buildNodeGroup(n, selectedIds.has(id));
        this.nodesLayer.add(g);
        this.nodeGfx.set(id, g);
      } else {
        this.updateNodeGroup(g, n, selectedIds.has(id));
      }
    }

    /* --- Edges: only when both endpoints have gfx (visible) --- */
    for (const eid of [...this.edgeGfx.keys()]) {
      const e = graph.edges[eid];
      if (!e || !this.nodeGfx.has(e.sourceNodeId) || !this.nodeGfx.has(e.targetNodeId)) {
        this.edgeGfx.get(eid)?.remove();
        this.edgeGfx.delete(eid);
      }
    }

    for (const eid of graph.edgeIds) {
      const e = graph.edges[eid];
      if (!e) continue;
      if (!this.nodeGfx.has(e.sourceNodeId) || !this.nodeGfx.has(e.targetNodeId)) {
        continue;
      }
      const from = pos(graph.nodes[e.sourceNodeId]!);
      const to = pos(graph.nodes[e.targetNodeId]!);
      const d = computeEdgePath(graph, from, to);
      let p = this.edgeGfx.get(eid);
      if (!p) {
        p = this.edgesLayer
          .path(d)
          .fill('none')
          .stroke({ width: 1.75, color: '#94a3b8', linecap: 'round' })
          .attr('vector-effect', 'non-scaling-stroke')
          .attr('pointer-events', 'none');
        this.edgeGfx.set(eid, p);
      } else {
        p.attr('d', d);
      }
    }
  }

  private buildNodeGroup(n: GraphNode, selected: boolean): G {
    const g = (this.nodesLayer as G)
      .group()
      .addClass('ge-node')
      .attr('data-node-id', n.id);
    this.renderNode(g, n, selected);
    return g;
  }

  private updateNodeGroup(g: G, n: GraphNode, selected: boolean): void {
    this.renderNode(g, n, selected);
  }

  private renderNode(g: G, n: GraphNode, selected: boolean): void {
    g.clear();
    g.transform({ translateX: n.x, translateY: n.y });

    const plugin = this.registry.get(n.type);
    const { fill, stroke, strokeWidth, radius } = plugin.style;
    const sw = selected ? strokeWidth + 1.6 : strokeWidth;
    const sc = selected ? '#4f46e5' : stroke;

    g.rect(n.w, n.h)
      .radius(radius)
      .fill(fill)
      .stroke({ width: sw, color: sc })
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('data-hit', 'node-body');

    const label = g
      .plain(n.label)
      .font({
        family: 'system-ui, sans-serif',
        size: 12,
        anchor: 'middle',
        leading: '1em',
      })
      .fill('#0f172a')
      .attr('pointer-events', 'none')
      .attr('dominant-baseline', 'central');
    label.center(n.w / 2, n.h / 2);

    const cy = n.h / 2;
    g.circle(PORT_R)
      .center(0, cy)
      .fill('#ffffff')
      .stroke({ width: 1.5, color: '#64748b' })
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('data-hit', 'port-in')
      .attr('data-port', 'in');

    g.circle(PORT_R)
      .center(n.w, cy)
      .fill('#ffffff')
      .stroke({ width: 1.5, color: '#64748b' })
      .attr('vector-effect', 'non-scaling-stroke')
      .attr('data-hit', 'port-out')
      .attr('data-port', 'out');
  }

  /** Find top-most hit node under point (visible gfx only). */
  hitTestNodeBody(clientX: number, clientY: number): string | null {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    let cur: Element | null = el;
    while (cur) {
      if (cur instanceof SVGGElement && cur.classList.contains('ge-node')) {
        const id = cur.getAttribute('data-node-id');
        if (id) {
          const target = el as SVGElement;
          const hit = target.getAttribute('data-hit');
          if (hit === 'node-body') return id;
          return null;
        }
      }
      cur = cur.parentElement;
    }
    return null;
  }

  hitTestPort(
    clientX: number,
    clientY: number,
  ): { nodeId: string; port: 'in' | 'out' } | null {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return null;
    let cur: Element | null = el;
    while (cur) {
      if (cur instanceof SVGGElement && cur.classList.contains('ge-node')) {
        const id = cur.getAttribute('data-node-id');
        const port = (el as SVGElement).getAttribute('data-port');
        if (id && (port === 'in' || port === 'out')) {
          return { nodeId: id, port };
        }
        return null;
      }
      cur = cur.parentElement;
    }
    return null;
  }
}
