import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Advanced demo: mask composition (`maskWith`) with gradient-like bands.
 */
export function drawMasks(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;

  content
    .plain('Mask demo')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  const target = content
    .rect(520, 220)
    .radius(16)
    .fill(fill)
    .stroke({ width: Math.max(1, props.strokeWidth), color: fill })
    .move(120, 150);

  const mask = draw.mask();
  mask.add(draw.rect(520, 220).move(120, 150).fill('#111'));
  mask.add(draw.circle(280).center(280, 260).fill('#fff'));
  mask.add(
    draw.circle(220).center(500, 260).fill({ color: '#fff', opacity: 0.45 }),
  );

  target.maskWith(mask);
}
