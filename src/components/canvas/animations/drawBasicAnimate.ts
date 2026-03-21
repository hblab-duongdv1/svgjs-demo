import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Basic animation sample using `.animate(duration).move(...)`.
 */
export function drawBasicAnimate(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const duration = Math.max(150, props.duration || 800);

  content
    .plain('Basic .animate() demo')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  const chip = content
    .rect(120, 72)
    .fill(fill)
    .stroke({ width: props.strokeWidth, color: fill })
    .radius(10)
    .move(140, 180);

  chip.animate(duration).move(540, 180).loop(0, true);
}
