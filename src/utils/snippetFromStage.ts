import type { StageConfiguration } from '../store/editorTypes';

/**
 * Deterministic snippet aligned with `SvgModuleProps` + `renderSvgModule(draw, activeModule, moduleProps)`.
 */
export function snippetFromStage(
  stage: StageConfiguration,
  activeModuleId: string,
): string {
  if (activeModuleId === 'showcase-game-demo') {
    return [
      `// Active module: ${activeModuleId} (Game demo)`,
      '// Game loop + svg.js targets live in GameCanvas.tsx',
      '// State: useGameStore — score, highScore, timer, gameActive',
      '',
      "import { SVG } from '@svgdotjs/svg.js'",
      '',
      'const draw = SVG().addTo(mountEl).size("100%", "100%")',
      'draw.viewbox(0, 0, 800, 600)',
      '',
      'const mouse = draw.group().center(400, 300) // ears, body, path tail…',
      'mouse.opacity(0).animate(200).opacity(1)',
      'mouse.animate(2000).ease("-").transform({ scale: 0.1 }, true)',
      'mouse.on("click", () => { /* incrementScore, scale + fade */ })',
    ].join('\n');
  }

  if (activeModuleId === 'showcase-realtime-chart') {
    return [
      `// Active module: ${activeModuleId} (Realtime dashboard)`,
      '// Data: ChartDataModel + MockChartStreamConnection (features/realtime-chart/services)',
      '// Render: RealtimeLineChartEngine — rAF syncFrame, min–max decimation',
      '// UI state: useRealtimeChartStore (series visibility, follow, stream on/off)',
      '',
      "import { RealtimeLineChartEngine } from '../features/realtime-chart'",
      '// new RealtimeLineChartEngine(mountEl).mount(); engine.syncFrame(model, view)',
    ].join('\n');
  }

  if (activeModuleId === 'showcase-graph-engine') {
    return [
      `// Active module: ${activeModuleId} (Workflow graph)`,
      '// Model: GraphDocModel + NormalizedGraph (nodes/edges by id)',
      '// Commands: AddNodeCommand, MoveNodesCommand, RemoveNodesCommand, AddEdgeCommand',
      '// Render: GraphSvgEngine — virtualized node groups, incremental edge paths',
      '',
      "import { GraphDocModel, GraphSvgEngine } from '../features/graph-engine'",
    ].join('\n');
  }

  if (activeModuleId === 'showcase-floor-map') {
    return [
      `// Active module: ${activeModuleId} (Warehouse floor)`,
      '// Data: useFloorMapStore (zones, runtime, assets, layers, selection)',
      '// Hit test: ZoneSpatialGrid (world coords) — no elementFromPoint',
      '// Render: FloorMapSvgEngine — world matrix pan/zoom, per-zone SVG groups',
      '',
      "import { FloorMapSvgEngine, useFloorMapStore } from '../features/floor-map'",
    ].join('\n');
  }

  const moduleProps = {
    duration: stage.durationMs,
    fill: stage.fillColor,
    strokeWidth: stage.strokeWidth,
    easing: stage.easingFunction,
    panEnabled: stage.panEnabled,
    zoomEnabled: stage.zoomEnabled,
    forceUseGroupColors: stage.forceUseGroupColors,
    forceNodeColor: stage.forceNodeColor,
    forceNodeCount: stage.forceNodeCount,
    forceNodeSize: stage.forceNodeSize,
    forceLinkDistance: stage.forceLinkDistance,
    forceRepulsion: stage.forceRepulsion,
  };

  return [
    `// Active module: ${activeModuleId}`,
    '// moduleProps mirrors the object passed from ShowcasePage → SvgCanvas',
    `const moduleProps = ${JSON.stringify(moduleProps, null, 2)}`,
    '',
    "import { SVG } from '@svgdotjs/svg.js'",
    "import { renderSvgModule } from '../components/canvas'",
    '',
    "const draw = SVG().addTo('.canvas').size('100%', '100%')",
    `renderSvgModule(draw, '${activeModuleId}', moduleProps)`,
  ].join('\n');
}
