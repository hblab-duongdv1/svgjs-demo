import { SVG, type Circle, type G, type Path, type Rect, type Svg, type Text } from '@svgdotjs/svg.js';

import type { FloorAsset, FloorLayersVisibility, FloorZone, ZoneRuntimeState, ZoneStatus } from '../types';

const STATUS_FILL: Record<ZoneStatus, string> = {
  available: 'rgba(16, 185, 129, 0.22)',
  occupied: 'rgba(59, 130, 246, 0.28)',
  warning: 'rgba(245, 158, 11, 0.35)',
};

const STATUS_STROKE: Record<ZoneStatus, string> = {
  available: 'rgba(5, 150, 105, 0.85)',
  occupied: 'rgba(37, 99, 235, 0.9)',
  warning: 'rgba(217, 119, 6, 0.95)',
};

export type ViewportState = {
  panX: number;
  panY: number;
  scale: number;
};

type ZoneGfx = {
  group: G;
  rect: Rect;
  heat: Rect;
  label: Text;
};

type AssetGfx = {
  group: G;
  dot: Circle;
  cap: Text;
};

/** Keep path complexity bounded when the floor rect spans huge world units (zoomed out). */
function gridPathD(w: number, h: number, maxLines = 100, baseStep = 88): string {
  let step = baseStep;
  while (step < 1e6 && w / step + h / step > maxLines) {
    step *= 1.35;
  }
  const p: string[] = [];
  for (let x = 0; x <= w; x += step) p.push(`M${x},0V${h}`);
  for (let y = 0; y <= h; y += step) p.push(`M0,${y}H${w}`);
  return p.join('');
}

/**
 * Imperative SVG.js floor map: world-group matrix for pan/zoom; per-zone groups
 * updated in place when runtime or selection changes.
 */
export class FloorMapSvgEngine {
  private container: HTMLElement;
  private svg: Svg | null = null;
  private world: G | null = null;
  private gridLayer: G | null = null;
  private gridBg: Rect | null = null;
  private gridLines: Path | null = null;
  private zonesLayer: G | null = null;
  private assetLayer: G | null = null;

  private readonly zoneGfx = new Map<string, ZoneGfx>();
  private readonly assetGfx = new Map<string, AssetGfx>();

  private clientW = 800;
  private clientH = 600;

  viewport: ViewportState = { panX: 32, panY: 32, scale: 0.85 };

  /** Warehouse content size (for fit view) — origin at world (0,0). */
  private contentWorldW = 3200;
  private contentWorldH = 2000;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  mount(): void {
    this.dispose();
    this.svg = SVG().addTo(this.container).size('100%', '100%');
    this.svg.attr({
      role: 'img',
      'aria-label': 'Warehouse floor map',
      /* Clip world content; avoid intrinsic overflow affecting flex min-height:auto */
      overflow: 'hidden',
    });
    const root = this.svg.node as SVGSVGElement;
    root.style.display = 'block';
    root.style.maxWidth = '100%';
    root.style.maxHeight = '100%';
    root.style.flex = '1 1 0%';
    root.style.minHeight = '0';
    root.style.minWidth = '0';

    this.world = this.svg.group().addClass('fm-world');
    this.gridLayer = this.world.group().addClass('fm-grid');
    this.gridBg = this.gridLayer
      .rect(1, 1)
      .radius(6)
      .fill('rgba(248, 250, 252, 0.96)')
      .stroke({ width: 1, color: 'rgba(148, 163, 184, 0.45)' });
    this.gridLines = this.gridLayer
      .path('')
      .fill('none')
      .stroke({ width: 0.45, color: 'rgba(100,116,139,0.22)' });
    this.zonesLayer = this.world.group().addClass('fm-zones');
    this.assetLayer = this.world.group().addClass('fm-assets');

    this.applyViewportTransform();
    this.resizeFromContainer();
  }

  dispose(): void {
    this.zoneGfx.clear();
    this.assetGfx.clear();
    this.svg?.remove();
    this.svg = null;
    this.world = null;
    this.gridLayer = null;
    this.gridBg = null;
    this.gridLines = null;
    this.zonesLayer = null;
    this.assetLayer = null;
  }

  /**
   * Convert **SVG viewport pixel** (0…width, 0…height) to world — not screen clientX/Y.
   * `screenToWorld` subtracts getBoundingClientRect().left/top; corners must use this.
   */
  viewportPxToWorld(vx: number, vy: number): { x: number; y: number } {
    const { panX, panY, scale } = this.viewport;
    const s = scale || 1;
    return { x: (vx - panX) / s, y: (vy - panY) / s };
  }

  /**
   * Floor + grid: union of zone bounds and visible viewport in **world** coords.
   */
  private updateFloorExtent(contentMaxX: number, contentMaxY: number, pad = 80): void {
    this.contentWorldW = Math.max(pad, contentMaxX + pad);
    this.contentWorldH = Math.max(pad, contentMaxY + pad);

    let gx0 = 0;
    let gy0 = 0;
    let gx1 = this.contentWorldW;
    let gy1 = this.contentWorldH;

    const vpad = 72;
    const corners = [
      this.viewportPxToWorld(0, 0),
      this.viewportPxToWorld(this.clientW, 0),
      this.viewportPxToWorld(this.clientW, this.clientH),
      this.viewportPxToWorld(0, this.clientH),
    ];
    for (const p of corners) {
      gx0 = Math.min(gx0, p.x - vpad);
      gy0 = Math.min(gy0, p.y - vpad);
      gx1 = Math.max(gx1, p.x + vpad);
      gy1 = Math.max(gy1, p.y + vpad);
    }

    const gw = Math.max(1, gx1 - gx0);
    const gh = Math.max(1, gy1 - gy0);

    this.gridLayer?.transform({ translateX: gx0, translateY: gy0 });
    this.gridBg?.size(gw, gh);
    this.gridLines?.attr('d', gridPathD(gw, gh));
  }

  getWorldSize(): { w: number; h: number } {
    return { w: this.contentWorldW, h: this.contentWorldH };
  }

  resizeFromContainer(): void {
    /*
     * Use layout box (client*) — not getBoundingClientRect() — so we follow the
     * flex/grid-assigned size instead of SVG descendants inflating measured height.
     */
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.clientW = Math.max(120, w);
    this.clientH = Math.max(120, h);
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
    this.world.attr('transform', `matrix(${s},0,0,${s},${panX},${panY})`);
  }

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
    minS = 0.2,
    maxS = 4,
  ): void {
    const rect = this.svg?.node.getBoundingClientRect();
    if (!rect?.width) return;
    const lx = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ly = Math.min(Math.max(clientY - rect.top, 0), rect.height);

    const sOld = this.viewport.scale || 1;
    const beforeX = (lx - this.viewport.panX) / sOld;
    const beforeY = (ly - this.viewport.panY) / sOld;

    let sNew = sOld * factor;
    sNew = Math.min(maxS, Math.max(minS, sNew));

    this.viewport.scale = sNew;
    this.viewport.panX = lx - beforeX * sNew;
    this.viewport.panY = ly - beforeY * sNew;
    this.applyViewportTransform();
  }

  ensureZones(
    zones: FloorZone[],
    assets: FloorAsset[],
    runtime: Record<string, ZoneRuntimeState>,
    layers: FloorLayersVisibility,
    selected: Set<string>,
    hoveredId: string | null,
  ): void {
    if (!this.zonesLayer || !this.assetLayer) return;

    const ids = new Set(zones.map((z) => z.id));
    for (const id of [...this.zoneGfx.keys()]) {
      if (!ids.has(id)) {
        this.zoneGfx.get(id)?.group.remove();
        this.zoneGfx.delete(id);
      }
    }

    let maxX = 0;
    let maxY = 0;
    for (const z of zones) {
      const b = z.bounds;
      maxX = Math.max(maxX, b.x + b.w);
      maxY = Math.max(maxY, b.y + b.h);
    }
    this.updateFloorExtent(maxX, maxY, 80);

    for (const z of zones) {
      let gfx = this.zoneGfx.get(z.id);
      if (!gfx) {
        const group = this.zonesLayer!.group().addClass('fm-zone').attr('data-zone-id', z.id);
        const rect = group
          .rect(1, 1)
          .radius(4)
          .stroke({ width: 1.2 })
          .attr('vector-effect', 'non-scaling-stroke')
          .css({
            transition:
              'fill 0.16s ease-out, stroke 0.16s ease-out, stroke-width 0.12s ease-out',
          });
        const heat = group
          .rect(1, 1)
          .radius(4)
          .fill({ color: '#ef4444', opacity: 0 })
          .attr('pointer-events', 'none')
          .css({ transition: 'opacity 0.2s ease-out' });
        const label = group
          .text('')
          .font({ family: 'ui-sans-serif, system-ui', size: 11, weight: '600' })
          .fill('rgba(15,23,42,0.88)')
          .attr('pointer-events', 'none');
        gfx = { group, rect, heat, label };
        this.zoneGfx.set(z.id, gfx);
      }

      const { bounds } = z;
      /*
       * SVG.js `Group.move(x,y)` is **not** absolute — it deltas from the group's
       * current bbox and shifts *children*, so calling it every sync accumulates
       * drift (nodes crawl toward +x/+y). Use explicit translate like GraphSvgEngine.
       */
      gfx.group.transform({ translateX: bounds.x, translateY: bounds.y });
      gfx.rect.size(bounds.w, bounds.h);
      gfx.heat.size(bounds.w, bounds.h);

      const rt = runtime[z.id];
      this.paintZone(gfx, z, rt, selected.has(z.id), hoveredId === z.id, layers);
    }

    const assetIds = new Set(assets.map((a) => a.id));
    for (const id of [...this.assetGfx.keys()]) {
      if (!assetIds.has(id)) {
        this.assetGfx.get(id)?.group.remove();
        this.assetGfx.delete(id);
      }
    }

    for (const a of assets) {
      const z = zones.find((x) => x.id === a.zoneId);
      if (!z) continue;
      let g = this.assetGfx.get(a.id);
      if (!g) {
        const group = this.assetLayer!.group().attr('pointer-events', 'none');
        const dot = group
          .circle(5)
          .fill('#0f172a')
          .stroke({ width: 1.5, color: '#f8fafc' })
          .attr('vector-effect', 'non-scaling-stroke');
        const cap = group
          .text('')
          .font({ family: 'ui-monospace, monospace', size: 7 })
          .fill('rgba(15,23,42,0.9)');
        g = { group, dot, cap };
        this.assetGfx.set(a.id, g);
      }
      const cx = z.bounds.x + z.bounds.w * 0.5;
      const cy = z.bounds.y + z.bounds.h * 0.55;
      g.group.transform({ translateX: cx, translateY: cy });
      g.dot.center(0, 0);
      g.cap.text(a.label.slice(0, 8)).center(0, 12);
      const show = layers.assets;
      g.dot.attr('visibility', show ? 'visible' : 'hidden');
      g.cap.attr('visibility', show ? 'visible' : 'hidden');
    }

    this.gridLayer?.attr('visibility', layers.grid ? 'visible' : 'hidden');
  }

  private paintZone(
    gfx: ZoneGfx,
    z: FloorZone,
    rt: ZoneRuntimeState | undefined,
    selected: boolean,
    hovered: boolean,
    layers: FloorLayersVisibility,
  ): void {
    const status = rt?.status ?? 'available';
    const heat = rt?.heat ?? 0;

    gfx.rect
      .fill(STATUS_FILL[status])
      .stroke({
        width: selected ? 2.4 : hovered ? 2 : 1.2,
        color: selected ? '#6366f1' : hovered ? '#0ea5e9' : STATUS_STROKE[status],
        dasharray: status === 'warning' ? '4 3' : undefined,
      })
      .attr('visibility', layers.zones ? 'visible' : 'hidden');

    const heatOpacity = layers.heatmap ? Math.min(0.72, 0.12 + heat * 0.78) : 0;
    gfx.heat.fill({ color: '#dc2626', opacity: heatOpacity });

    gfx.label
      .text(layers.labels ? z.code : '')
      .center(z.bounds.w / 2, z.bounds.h / 2);
  }
}
