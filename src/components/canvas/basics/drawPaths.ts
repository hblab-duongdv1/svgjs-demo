import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import { SVG_STYLE_TOKENS } from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

const BEZIER_D =
  'M 72 420 C 72 300 180 260 260 340 S 420 460 520 380 S 640 240 700 320';

/**
 * Basics: complex cubic Bézier path (multi-segment) using `d` attribute.
 */
export function drawPaths(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const stroke = { width: props.strokeWidth, color: fill };

  content.path(BEZIER_D).fill('none').stroke(stroke);

  content
    .circle(6)
    .fill(SVG_STYLE_TOKENS.onSurface)
    .stroke({ width: 0 })
    .center(72, 420);

  content
    .text('Cubic Bézier path')
    .font({
      family: 'Inter, ui-sans-serif, system-ui, sans-serif',
      size: 12,
      anchor: 'start',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .move(72, 400);
}
