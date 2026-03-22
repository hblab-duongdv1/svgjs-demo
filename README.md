# SVG.js Studio

Interactive demo and playground built with [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), and [SVG.js](https://svgjs.dev/) v3.

## Repository

Source code: [github.com/hblab-duongdv1/svgjs-demo](https://github.com/hblab-duongdv1/svgjs-demo)

## Requirements

- Node.js (LTS recommended)

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Start dev server (Vite)  |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build locally |
| `npm test`   | Run tests (Vitest)       |
| `npm run lint` | ESLint                   |
| `npm run format` | Prettier (write)       |

## Development

```bash
npm install
npm run dev
```

## Realtime chart (Showcase)

The **Showcase → Realtime chart** module demonstrates a high-frequency line chart built with SVG.js (no Chart.js / Recharts / D3 rendering). Source lives under `src/features/realtime-chart/`:

- **Data**: `ChartDataModel` + `TimeSeriesRingBuffer` (12k samples per series, bounded memory)
- **Stream**: `MockChartStreamConnection` (WebSocket-shaped API, `requestAnimationFrame` producer)
- **Render**: `RealtimeLineChartEngine` (viewport windowing, min–max decimation, reused point buffer)
- **UI state**: `useRealtimeChartStore` (Zustand — visibility, follow-latest, pause/resume)

Run `npm run dev`, open **Showcase**, then select **Realtime chart** in the sidebar.

## Graph engine (Showcase)

**Showcase → Graph engine** is a mini workflow editor. Code: `src/features/graph-engine/`.

- **Model**: `GraphDocModel` + `NormalizedGraph`, command-pattern history (`AddNodeCommand`, `MoveNodesCommand`, `RemoveNodesCommand`, `AddEdgeCommand`), JSON import/export
- **Render**: `GraphSvgEngine` — world `matrix(scale, pan)` on a group, virtualized visible nodes/edges, incremental updates while dragging
- **Plugins**: `NodeTypeRegistry` for node shapes and ports
- **Interactions**:
  - **Zoom**: wheel (toward cursor)
  - **Pan**: middle mouse; **Alt + drag**; **Space + drag** (Space is tracked via `keydown`/`keyup`, not `PointerEvent.getModifierState('Space')`, which is unreliable)
  - **Connect** tool: drag empty canvas to pan; click ports to start/finish edges
  - **Select** tool: Shift + click, marquee; drag node bodies to move

## Floor map (Showcase)

**Showcase → Floor map** is a warehouse-style floor plan (no Leaflet/Mapbox). Code: `src/features/floor-map/`.

- **Data**: `useFloorMapStore` (Zustand) — zones, per-zone runtime (`status`, `heat`), assets, layer visibility, selection, mock simulation (`buildMockWarehouseFloor`, default **14×8** bays)
- **Hit testing**: `ZoneSpatialGrid` in **world** space (no `elementFromPoint` on SVG)
- **Render**: `FloorMapSvgEngine` — `fm-world` uses `matrix(scale, pan)`; zone groups use **`transform({ translateX, translateY })`** (not `Group.move`, which would accumulate drift). Layers: grid (union of **content bbox** and **visible viewport** via `viewportPxToWorld`), zones, assets
- **UI**: `FloorMapPanel` — layer toggles (zones, labels, assets, heatmap, grid), Fit view, Reset layout, live sim toggle, selection sidebar
- **Controls**: wheel zoom; pan — middle mouse, **Alt + drag**, or **Space + drag**; click / Cmd|Ctrl + click multi-select

**Tests**: `tests/floor-map/spatialGrid.test.ts`, `tests/graph-engine/serialization.test.ts`, `tests/realtime-chart/timeSeriesRingBuffer.test.ts`

## License

ISC (see `package.json`).
