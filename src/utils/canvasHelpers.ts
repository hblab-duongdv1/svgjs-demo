import type { G, Svg } from '@svgdotjs/svg.js';

/** Default logical canvas size (matches prior SvgCanvas viewBox usage). */
export const DEFAULT_VIEWBOX = {
  minX: 0,
  minY: 0,
  width: 800,
  height: 600,
} as const;

/** Remove all children from the root SVG document. */
export function clearStage(draw: Svg): void {
  draw.clear();
}

/** Apply a consistent viewBox so module renderers share the same coordinate space. */
export function setStageViewbox(
  draw: Svg,
  vb: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  } = DEFAULT_VIEWBOX,
): void {
  draw.viewbox(vb.minX, vb.minY, vb.width, vb.height);
}

/**
 * Create the default content group used by module renderers (keeps a stable hook for plugins).
 * Call after {@link clearStage} / {@link setStageViewbox}.
 */
export function createDefaultContentGroup(draw: Svg): G {
  return draw.group().id('svg-module-content');
}

/**
 * One-shot setup: clear, viewBox, and return the root content group for drawing.
 */
export function prepareStage(draw: Svg): { draw: Svg; content: G } {
  clearStage(draw);
  setStageViewbox(draw);
  const content = createDefaultContentGroup(draw);
  return { draw, content };
}
