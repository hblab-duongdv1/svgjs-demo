import type { Svg } from '@svgdotjs/svg.js';

import { drawGradients, drawPaths, drawShapes, drawText } from './basics';
import { drawClipPaths, drawMasks, drawNestedSvg } from './advanced';
import {
  drawBasicAnimate,
  drawEasingGallery,
  drawPathMorph,
  drawTimelineSequence,
} from './animations';
import {
  drawClickEvents,
  drawDraggable,
  drawHoverTransitions,
  drawPanZoom,
} from './interactions';
import { drawPluginShowcase } from './showcase';
import { prepareStage } from '../../utils/canvasHelpers';
import { SVG_STYLE_TOKENS } from '../../utils/styleTokens';
import type { SvgModuleProps, SvgModuleRenderer } from './types';

/** Used when `activeModule` is not registered (fail-safe). */
export const FALLBACK_MODULE_KEY = '__fallback__';

const drawFallbackModule: SvgModuleRenderer = (draw, props) => {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  content
    .rect(120, 120)
    .fill(fill)
    .stroke({ width: props.strokeWidth, color: fill })
    .move(80, 80);
};

/** Placeholder when module is driven by React (`GameCanvas`) instead of `SvgCanvas`. */
const drawTargetPracticePlaceholder: SvgModuleRenderer = (draw) => {
  prepareStage(draw);
};

/** Realtime dashboard — rendering lives in `RealtimeChartPanel` + `RealtimeLineChartEngine`. */
const drawRealtimeChartPlaceholder: SvgModuleRenderer = (draw) => {
  prepareStage(draw);
};

const drawGraphEnginePlaceholder: SvgModuleRenderer = (draw) => {
  prepareStage(draw);
};

const drawFloorMapPlaceholder: SvgModuleRenderer = (draw) => {
  prepareStage(draw);
};

export const MODULE_RENDERERS: Record<string, SvgModuleRenderer> = {
  /** Showcase: draggable + panZoom + props-driven motion (Zustand → PropertiesPanel). */
  'showcase-plugins': drawPluginShowcase,

  /** Game demo mini-game — real rendering lives in `GameCanvas.tsx`. */
  'showcase-game-demo': drawTargetPracticePlaceholder,

  /** High-frequency line chart — imperative SVG.js in `features/realtime-chart/`. */
  'showcase-realtime-chart': drawRealtimeChartPlaceholder,

  /** Workflow graph — `GraphEditorPanel` + `GraphSvgEngine` in `features/graph-engine/`. */
  'showcase-graph-engine': drawGraphEnginePlaceholder,

  /** Warehouse floor — `FloorMapPanel` + `FloorMapSvgEngine` in `features/floor-map/`. */
  'showcase-floor-map': drawFloorMapPlaceholder,

  /** Default “Basics” tab in sidebar (`SidebarMenu`). */
  basics: drawShapes,
  'basics-shapes': drawShapes,
  'basics-paths': drawPaths,
  'basics-text': drawText,
  'basics-gradients': drawGradients,

  /** Default “Interactions” tab in sidebar. */
  interactions: drawDraggable,
  'interactions-draggable': drawDraggable,
  'interactions-panzoom': drawPanZoom,
  'interactions-hover': drawHoverTransitions,
  'interactions-click': drawClickEvents,

  /** Default “Animations” tab in sidebar. */
  animations: drawBasicAnimate,
  'animations-basic': drawBasicAnimate,
  'animations-morph': drawPathMorph,
  'animations-easing': drawEasingGallery,
  'animations-timeline': drawTimelineSequence,

  /** Default “Advanced” tab in sidebar. */
  advanced: drawMasks,
  'advanced-masks': drawMasks,
  'advanced-clippaths': drawClipPaths,
  'advanced-nested': drawNestedSvg,
};

/**
 * Resolve the renderer for a module id. Unknown keys use {@link drawFallbackModule}.
 * In development, logs a one-line warning for unknown module ids.
 */
export function resolveRenderer(activeModule: string): SvgModuleRenderer {
  const renderer = MODULE_RENDERERS[activeModule];
  if (!renderer && import.meta.env.DEV) {
    console.warn(
      `[canvas] Unknown module "${activeModule}" — using fallback renderer. Register it in MODULE_RENDERERS.`,
    );
  }
  return renderer ?? drawFallbackModule;
}

export function renderSvgModule(
  draw: Svg,
  activeModule: string,
  moduleProps: SvgModuleProps,
) {
  resolveRenderer(activeModule)(draw, moduleProps);
}
