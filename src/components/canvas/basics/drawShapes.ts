import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import { SVG_STYLE_TOKENS } from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Basics: rectangle, circle, and polygon samples driven by stage `moduleProps`.
 */
export function drawShapes(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const stroke = { width: props.strokeWidth, color: fill };

  content.rect(120, 90).fill(fill).stroke(stroke).center(220, 150);

  content.circle(56).fill(fill).stroke(stroke).center(400, 150);

  content
    .polygon('520,105 605,85 640,175 570,210 500,165')
    .fill(fill)
    .stroke(stroke);
}
