import { create } from 'zustand';

import { buildMockWarehouseFloor, jitterRuntime } from '../data/mockWarehouseData';
import type {
  FloorAsset,
  FloorLayersVisibility,
  FloorZone,
  ZoneRuntimeState,
} from '../types';
import { DEFAULT_LAYER_VISIBILITY } from '../types';

export type FloorMapState = {
  zones: FloorZone[];
  zoneOrder: string[];
  assets: FloorAsset[];
  runtimeByZone: Record<string, ZoneRuntimeState>;
  layers: FloorLayersVisibility;
  selectedIds: string[];
  hoveredId: string | null;
  detailZoneId: string | null;
  simulationOn: boolean;
  resetDemo: () => void;
  setLayers: (p: Partial<FloorLayersVisibility>) => void;
  setHovered: (id: string | null) => void;
  setDetail: (id: string | null) => void;
  selectZone: (id: string | null, additive: boolean) => void;
  clearSelection: () => void;
  toggleSimulation: (on: boolean) => void;
  tickSimulation: () => void;
};

const initial = buildMockWarehouseFloor();

export const useFloorMapStore = create<FloorMapState>((set, get) => ({
  zones: initial.zones,
  zoneOrder: initial.zones.map((z) => z.id),
  assets: initial.assets,
  runtimeByZone: initial.runtime,
  layers: { ...DEFAULT_LAYER_VISIBILITY },
  selectedIds: [],
  hoveredId: null,
  detailZoneId: null,
  simulationOn: true,

  resetDemo: () => {
    const d = buildMockWarehouseFloor();
    set({
      zones: d.zones,
      zoneOrder: d.zones.map((z) => z.id),
      assets: d.assets,
      runtimeByZone: d.runtime,
      selectedIds: [],
      hoveredId: null,
      detailZoneId: null,
    });
  },

  setLayers: (p) =>
    set((s) => ({
      layers: { ...s.layers, ...p },
    })),

  setHovered: (id) => set({ hoveredId: id }),

  setDetail: (id) => set({ detailZoneId: id }),

  selectZone: (id, additive) => {
    if (!id) {
      set({ selectedIds: [], detailZoneId: null });
      return;
    }
    if (!additive) {
      set({ selectedIds: [id], detailZoneId: id });
      return;
    }
    set((s) => {
      const has = s.selectedIds.includes(id);
      const selectedIds = has
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id];
      let detailZoneId = s.detailZoneId;
      if (!has) detailZoneId = id;
      else if (s.detailZoneId && !selectedIds.includes(s.detailZoneId)) {
        detailZoneId = selectedIds[0] ?? null;
      }
      return { selectedIds, detailZoneId };
    });
  },

  clearSelection: () => set({ selectedIds: [], detailZoneId: null }),

  toggleSimulation: (on) => set({ simulationOn: on }),

  tickSimulation: () => {
    if (!get().simulationOn) return;
    const { zoneOrder, runtimeByZone } = get();
    set({ runtimeByZone: jitterRuntime(zoneOrder, runtimeByZone) });
  },
}));
