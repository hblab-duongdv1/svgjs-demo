import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import { SVG_STYLE_TOKENS } from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/** Runtime API uses `stop()`; typings may expose `at()` only — align with svg.js source. */
type GradientStops = {
  stop: (offset: number, color: string, opacity?: number) => unknown;
};

/**
 * Basics: linear and radial gradients applied to rects (stage fill drives one stop).
 */
export function drawGradients(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const accent = props.fill || SVG_STYLE_TOKENS.primary;
  const stroke = {
    width: Math.max(1, props.strokeWidth),
    color: SVG_STYLE_TOKENS.outlineVariant,
  };

  // Define gradients on root SVG defs for maximum compatibility with mask/clip/nested demos.
  const linear = draw.gradient('linear', (g) => {
    const gg = g as unknown as GradientStops;
    gg.stop(0, accent);
    gg.stop(0.55, SVG_STYLE_TOKENS.surfaceContainerHighest);
    gg.stop(1, SVG_STYLE_TOKENS.onSurface);
  });
  linear.from(0, 0).to(1, 0);

  content
    .rect(280, 120)
    .attr({ fill: linear })
    .stroke(stroke)
    .radius(12)
    .move(72, 80);

  const radial = draw.gradient('radial', (g) => {
    const gg = g as unknown as GradientStops;
    gg.stop(0, '#ffffff');
    gg.stop(0.65, accent);
    gg.stop(1, SVG_STYLE_TOKENS.onSurface);
  });
  radial.from(0.5, 0.45).to(0.5, 0.45).radius(0.55);

  content
    .rect(280, 120)
    .attr({ fill: radial })
    .stroke(stroke)
    .radius(12)
    .move(420, 80);

  content
    .plain('Linear (left) · Radial (right)')
    .font({
      family: 'Inter, ui-sans-serif, system-ui, sans-serif',
      size: 12,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.7)
    .center(400, 240);
}
