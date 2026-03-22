import { create } from 'zustand';

import type { SeriesId } from '../types';

/**
 * UI / interaction state only. High-volume samples never pass through here —
 * that keeps React diffing and Zustand notify churn off the hot path.
 */
export type RealtimeChartStore = {
  seriesVisible: Record<SeriesId, boolean>;
  followLatest: boolean;
  streamConnected: boolean;
  /** Bumped to clear buffers + time base without remounting the chart shell. */
  hardResetNonce: number;
  setSeriesVisible: (id: SeriesId, visible: boolean) => void;
  toggleSeries: (id: SeriesId) => void;
  setFollowLatest: (v: boolean) => void;
  setStreamConnected: (v: boolean) => void;
  bumpHardReset: () => void;
};

export const useRealtimeChartStore = create<RealtimeChartStore>((set) => ({
  seriesVisible: { alpha: true, beta: true, gamma: true },
  followLatest: true,
  streamConnected: true,
  hardResetNonce: 0,
  setSeriesVisible: (id, visible) =>
    set((s) => ({
      seriesVisible: { ...s.seriesVisible, [id]: visible },
    })),
  toggleSeries: (id) =>
    set((s) => ({
      seriesVisible: {
        ...s.seriesVisible,
        [id]: !s.seriesVisible[id],
      },
    })),
  setFollowLatest: (v) => set({ followLatest: v }),
  setStreamConnected: (v) => set({ streamConnected: v }),
  bumpHardReset: () => set((s) => ({ hardResetNonce: s.hardResetNonce + 1 })),
}));
