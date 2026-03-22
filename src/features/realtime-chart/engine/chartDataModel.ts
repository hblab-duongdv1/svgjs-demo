import type { SeriesId } from '../types';
import { SERIES_IDS } from '../types';
import { TimeSeriesRingBuffer } from './timeSeriesRingBuffer';

/** Central data layer: one ring buffer per series, fixed total memory. */
export class ChartDataModel {
  readonly buffers: Record<SeriesId, TimeSeriesRingBuffer>;

  constructor(pointsPerSeries: number) {
    this.buffers = {
      alpha: new TimeSeriesRingBuffer(pointsPerSeries),
      beta: new TimeSeriesRingBuffer(pointsPerSeries),
      gamma: new TimeSeriesRingBuffer(pointsPerSeries),
    };
  }

  appendSample(t: number, values: Record<SeriesId, number>): void {
    for (const id of SERIES_IDS) {
      this.buffers[id].append(t, values[id]);
    }
  }

  clear(): void {
    for (const id of SERIES_IDS) {
      this.buffers[id].clear();
    }
  }
}
