/** Business status driving fill / alerts (data layer). */
export type ZoneStatus = 'available' | 'occupied' | 'warning';

export type ZoneBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};

/** Static layout + identity (rarely changes). */
export type FloorZone = {
  id: string;
  code: string;
  name: string;
  bounds: ZoneBounds;
  /** Aisle / row for grouping in UI. */
  aisle: string;
};

export type FloorAsset = {
  id: string;
  zoneId: string;
  label: string;
};

/** Volatile telemetry (updates often). */
export type ZoneRuntimeState = {
  status: ZoneStatus;
  /** 0..1 for heatmap tint intensity. */
  heat: number;
};

export type FloorLayersVisibility = {
  zones: boolean;
  labels: boolean;
  assets: boolean;
  heatmap: boolean;
  grid: boolean;
};

export const DEFAULT_LAYER_VISIBILITY: FloorLayersVisibility = {
  zones: true,
  labels: true,
  assets: true,
  heatmap: false,
  grid: true,
};
