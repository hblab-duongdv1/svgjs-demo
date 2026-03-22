import type { FloorZone } from '../types';

/**
 * Uniform grid for point queries — avoids DOM `elementFromPoint` and scales
 * better than scanning all rects when zone counts grow.
 */
export class ZoneSpatialGrid {
  private readonly cell: number;
  private readonly buckets = new Map<string, string[]>();
  private readonly zoneById = new Map<string, FloorZone>();

  constructor(zones: FloorZone[], cellSize = 180) {
    this.cell = cellSize;
    for (const z of zones) {
      this.zoneById.set(z.id, z);
      this.insert(z);
    }
  }

  private key(cx: number, cy: number): string {
    return `${cx},${cy}`;
  }

  private insert(z: FloorZone): void {
    const { x, y, w, h } = z.bounds;
    const x0 = Math.floor(x / this.cell);
    const y0 = Math.floor(y / this.cell);
    const x1 = Math.floor((x + w) / this.cell);
    const y1 = Math.floor((y + h) / this.cell);
    for (let xi = x0; xi <= x1; xi += 1) {
      for (let yi = y0; yi <= y1; yi += 1) {
        const k = this.key(xi, yi);
        const arr = this.buckets.get(k);
        if (arr) {
          if (!arr.includes(z.id)) arr.push(z.id);
        } else {
          this.buckets.set(k, [z.id]);
        }
      }
    }
  }

  /**
   * Top-most zone under point (later ids in mock data list win if overlapping).
   * Caller can pass ordered ids to refine paint order.
   */
  pickAt(wx: number, wy: number, paintOrderIds: string[]): string | null {
    const cx = Math.floor(wx / this.cell);
    const cy = Math.floor(wy / this.cell);
    const cand = new Set(this.buckets.get(this.key(cx, cy)) ?? []);
    for (let d = 1; d <= 2 && cand.size === 0; d += 1) {
      for (let xi = cx - d; xi <= cx + d; xi += 1) {
        for (let yi = cy - d; yi <= cy + d; yi += 1) {
          const ids = this.buckets.get(this.key(xi, yi));
          if (ids) for (const id of ids) cand.add(id);
        }
      }
    }

    let hit: string | null = null;
    for (let i = paintOrderIds.length - 1; i >= 0; i -= 1) {
      const id = paintOrderIds[i];
      if (!cand.has(id)) continue;
      const z = this.zoneById.get(id);
      if (!z) continue;
      const b = z.bounds;
      if (wx >= b.x && wy >= b.y && wx <= b.x + b.w && wy <= b.y + b.h) {
        hit = id;
        break;
      }
    }
    return hit;
  }
}
