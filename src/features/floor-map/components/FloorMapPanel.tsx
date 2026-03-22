import { useRef } from 'react';

import { useFloorMapRuntime } from '../hooks/useFloorMapRuntime';
import { useFloorMapStore } from '../store/floorMapStore';
import type { FloorLayersVisibility } from '../types';

function LayerToggle({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={[
        'rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors',
        on
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container-highest text-on-surface-variant',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

export default function FloorMapPanel() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { fitView } = useFloorMapRuntime(mountRef);

  const zones = useFloorMapStore((s) => s.zones);
  const assets = useFloorMapStore((s) => s.assets);
  const runtimeByZone = useFloorMapStore((s) => s.runtimeByZone);
  const layers = useFloorMapStore((s) => s.layers);
  const setLayers = useFloorMapStore((s) => s.setLayers);
  const selectedIds = useFloorMapStore((s) => s.selectedIds);
  const detailZoneId = useFloorMapStore((s) => s.detailZoneId);
  const simulationOn = useFloorMapStore((s) => s.simulationOn);
  const toggleSimulation = useFloorMapStore((s) => s.toggleSimulation);
  const resetDemo = useFloorMapStore((s) => s.resetDemo);
  const clearSelection = useFloorMapStore((s) => s.clearSelection);

  const toggleLayer = (key: keyof FloorLayersVisibility) => {
    setLayers({ [key]: !layers[key] });
  };

  const primaryZoneId = detailZoneId ?? selectedIds[0] ?? null;
  const primaryZone = primaryZoneId ? zones.find((z) => z.id === primaryZoneId) : null;
  const primaryRt = primaryZoneId ? runtimeByZone[primaryZoneId] : undefined;
  const primaryAssets = primaryZoneId
    ? assets.filter((a) => a.zoneId === primaryZoneId)
    : [];

  return (
    <div className="flex w-full min-h-0 min-w-0 max-w-6xl flex-col gap-4">
      <div className="sticky top-0 z-10 shrink-0 rounded-2xl border border-outline-variant/60 bg-surface-container-low px-4 py-4 shadow-[var(--shadow-ambient)] sm:px-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
          Floor map
        </p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Data (zones, assets, telemetry) is separate from SVG rendering and pointer
          routing. Pan: middle mouse or Alt + drag (Space + drag also). Zoom: wheel.
          Click a bay to inspect; Cmd/Ctrl + click for multi-select. Heatmap and layers
          are toggled below — realtime simulation randomizes occupancy and heat.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-outline-variant pt-4">
          <span className="mr-1 text-xs font-bold text-on-surface">Layers</span>
          <LayerToggle label="Zones" on={layers.zones} onToggle={() => toggleLayer('zones')} />
          <LayerToggle label="Labels" on={layers.labels} onToggle={() => toggleLayer('labels')} />
          <LayerToggle label="Assets" on={layers.assets} onToggle={() => toggleLayer('assets')} />
          <LayerToggle label="Heat" on={layers.heatmap} onToggle={() => toggleLayer('heatmap')} />
          <LayerToggle label="Grid" on={layers.grid} onToggle={() => toggleLayer('grid')} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => fitView()}
          >
            Fit view
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => resetDemo()}
          >
            Reset layout
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface-container-highest px-3 py-1.5 text-xs font-bold text-on-secondary-container"
            onClick={() => clearSelection()}
          >
            Clear selection
          </button>
          <button
            type="button"
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-bold',
              simulationOn
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-highest text-on-surface-variant',
            ].join(' ')}
            onClick={() => toggleSimulation(!simulationOn)}
          >
            Live sim: {simulationOn ? 'on' : 'off'}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-blue-500/80" />
            Occupied
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-500/80" />
            Warning
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-600/70" />
            Heat overlay
          </span>
        </div>
      </div>

      <div className="flex min-h-[min(72vh,640px)] w-full min-w-0 shrink-0 flex-col gap-4 lg:flex-row lg:items-stretch">
        <div
          ref={mountRef}
          className="floor-map-canvas relative flex min-h-[320px] w-full min-w-0 flex-1 basis-0 cursor-crosshair flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-[var(--shadow-ambient)] touch-none lg:min-h-0"
          style={{ touchAction: 'none', overflowAnchor: 'none' }}
        />

        <aside className="w-full shrink-0 rounded-2xl border border-outline-variant bg-surface-container-low p-4 shadow-[var(--shadow-ambient)] lg:w-80">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            Selection
          </p>
          {selectedIds.length === 0 ? (
            <p className="mt-3 text-sm text-on-surface-variant">
              Click a storage bay on the map. Use Cmd/Ctrl + click to add or remove bays
              from the selection.
            </p>
          ) : (
            <div className="mt-3 space-y-3 text-sm">
              <p className="font-semibold text-on-surface">
                {selectedIds.length} zone{selectedIds.length > 1 ? 's' : ''} selected
              </p>
              <ul className="max-h-40 list-inside list-disc overflow-y-auto text-xs text-on-surface-variant">
                {selectedIds.map((id) => {
                  const z = zones.find((x) => x.id === id);
                  return <li key={id}>{z?.code ?? id}</li>;
                })}
              </ul>
            </div>
          )}

          {primaryZone ? (
            <div className="mt-6 border-t border-outline-variant pt-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Focus
              </p>
              <h3 className="mt-2 text-lg font-bold text-on-surface">{primaryZone.code}</h3>
              <p className="text-xs text-on-surface-variant">{primaryZone.name}</p>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-2">
                  <dt className="text-on-surface-variant">Aisle</dt>
                  <dd className="font-medium text-on-surface">{primaryZone.aisle}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-on-surface-variant">Status</dt>
                  <dd className="font-medium capitalize text-on-surface">
                    {primaryRt?.status ?? '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-on-surface-variant">Heat</dt>
                  <dd className="font-mono text-on-surface">
                    {primaryRt ? `${Math.round(primaryRt.heat * 100)}%` : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-on-surface-variant">Bounds</dt>
                  <dd className="font-mono text-[10px] text-on-surface">
                    {primaryZone.bounds.x},{primaryZone.bounds.y} · {primaryZone.bounds.w}×
                    {primaryZone.bounds.h}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                Assets
              </p>
              {primaryAssets.length === 0 ? (
                <p className="mt-1 text-xs text-on-surface-variant">No tagged assets in this bay.</p>
              ) : (
                <ul className="mt-2 space-y-1 text-xs font-mono text-on-surface">
                  {primaryAssets.map((a) => (
                    <li key={a.id}>{a.label}</li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
