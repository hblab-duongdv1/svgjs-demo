import { describe, expect, it } from 'vitest';

import { ZoneSpatialGrid } from '../../src/features/floor-map/data/spatialGrid';
import type { FloorZone } from '../../src/features/floor-map/types';

function z(id: string, x: number, y: number, w: number, h: number): FloorZone {
  return {
    id,
    code: id,
    name: id,
    aisle: 'A1',
    bounds: { x, y, w, h },
  };
}

describe('ZoneSpatialGrid', () => {
  it('returns top-most id in paint order when zones overlap', () => {
    const zones = [z('a', 10, 10, 100, 100), z('b', 50, 50, 100, 100)];
    const grid = new ZoneSpatialGrid(zones, 40);
    const order = ['a', 'b'];
    expect(grid.pickAt(60, 60, order)).toBe('b');
    expect(grid.pickAt(60, 60, ['b', 'a'])).toBe('a');
  });

  it('returns null outside all zones', () => {
    const zones = [z('a', 0, 0, 10, 10)];
    const grid = new ZoneSpatialGrid(zones, 200);
    expect(grid.pickAt(500, 500, ['a'])).toBeNull();
  });
});
