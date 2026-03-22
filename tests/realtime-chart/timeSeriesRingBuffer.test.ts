import { describe, expect, it } from 'vitest';

import { TimeSeriesRingBuffer } from '../../src/features/realtime-chart/engine/timeSeriesRingBuffer';

describe('TimeSeriesRingBuffer', () => {
  it('appends in order and reports length', () => {
    const b = new TimeSeriesRingBuffer(100);
    for (let i = 0; i < 10; i++) b.append(i, i * 2);
    expect(b.length).toBe(10);
    expect(b.getT(0)).toBe(0);
    expect(b.getY(9)).toBe(18);
  });

  it('overwrites oldest when full (ring)', () => {
    const b = new TimeSeriesRingBuffer(4);
    for (let i = 0; i < 6; i++) b.append(i, i);
    expect(b.length).toBe(4);
    expect(b.getT(0)).toBe(2);
    expect(b.getT(3)).toBe(5);
  });

  it('nearestByT picks closest sample', () => {
    const b = new TimeSeriesRingBuffer(50);
    b.append(1, 10);
    b.append(2, 20);
    b.append(5, 50);
    expect(b.nearestByT(1.1)?.logical).toBe(0);
    expect(b.nearestByT(4.2)?.logical).toBe(2);
  });
});
