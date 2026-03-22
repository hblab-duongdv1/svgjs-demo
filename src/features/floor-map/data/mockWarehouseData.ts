import type { FloorAsset, FloorZone, ZoneRuntimeState, ZoneStatus } from '../types';

const STATUS_POOL: ZoneStatus[] = ['available', 'occupied', 'warning'];

function rnd<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

/**
 * Procedural grid: aisles + bays. Defaults ~112 zones, sized to read well on a
 * typical canvas; tune `cols`/`rows` as needed.
 */
export function buildMockWarehouseFloor(options?: {
  cols?: number;
  rows?: number;
  bayW?: number;
  bayH?: number;
  gutterX?: number;
  gutterY?: number;
  aisleEvery?: number;
}): { zones: FloorZone[]; assets: FloorAsset[]; runtime: Record<string, ZoneRuntimeState> } {
  const cols = options?.cols ?? 14;
  const rows = options?.rows ?? 8;
  const bayW = options?.bayW ?? 68;
  const bayH = options?.bayH ?? 48;
  const gutterX = options?.gutterX ?? 14;
  const gutterY = options?.gutterY ?? 12;
  const aisleEvery = options?.aisleEvery ?? 4;

  const zones: FloorZone[] = [];
  const assets: FloorAsset[] = [];
  const runtime: Record<string, ZoneRuntimeState> = {};

  let originX = 40;
  let originY = 40;
  let assetSeq = 0;

  for (let r = 0; r < rows; r += 1) {
    const rowY = originY + r * (bayH + gutterY);
    let xCursor = originX;
    for (let c = 0; c < cols; c += 1) {
      const isAisleCol = c > 0 && c % aisleEvery === 0;
      if (isAisleCol) {
        xCursor += 28;
      }
      const id = `z-${r}-${c}`;
      const code = `B${String(r + 1).padStart(2, '0')}-${String(c + 1).padStart(2, '0')}`;
      zones.push({
        id,
        code,
        name: `Bay ${code}`,
        aisle: `Aisle ${Math.floor(c / aisleEvery) + 1}`,
        bounds: { x: xCursor, y: rowY, w: bayW, h: bayH },
      });
      const st = rnd(STATUS_POOL);
      runtime[id] = { status: st, heat: Math.random() };
      if (st === 'occupied' && Math.random() > 0.45) {
        assetSeq += 1;
        assets.push({
          id: `a-${assetSeq}`,
          zoneId: id,
          label: `SKU-${(1000 + assetSeq).toString(36).toUpperCase()}`,
        });
      }
      xCursor += bayW + gutterX;
    }
  }

  return { zones, assets, runtime };
}

/** Nudge a subset of zones for realtime demo. */
export function jitterRuntime(
  zoneIds: string[],
  prev: Record<string, ZoneRuntimeState>,
): Record<string, ZoneRuntimeState> {
  const next = { ...prev };
  const pickN = Math.max(3, Math.floor(zoneIds.length * 0.02));
  for (let i = 0; i < pickN; i += 1) {
    const id = zoneIds[Math.floor(Math.random() * zoneIds.length)]!;
    const cur = next[id];
    if (!cur) continue;
    const roll = Math.random();
    if (roll < 0.35) {
      next[id] = { ...cur, status: rnd(STATUS_POOL) };
    } else if (roll < 0.7) {
      const heat = Math.min(1, Math.max(0, cur.heat + (Math.random() - 0.5) * 0.22));
      next[id] = { ...cur, heat };
    } else {
      next[id] = { ...cur, heat: Math.random(), status: rnd(STATUS_POOL) };
    }
  }
  return next;
}
