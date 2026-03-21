import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Advanced demo: nested SVG (`nested()`) inside a parent stage.
 */
export function drawNestedSvg(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;

  content
    .plain('Nested SVG demo')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  content
    .rect(560, 260)
    .radius(14)
    .fill(SVG_STYLE_TOKENS.surfaceContainerHighest)
    .opacity(0.6)
    .move(120, 140);

  const inner = content.nested().size(360, 180).move(220, 180);
  inner.viewbox(0, 0, 360, 180);
  inner.rect(360, 180).fill('#ffffff').opacity(0.85);
  inner.circle(72).fill(fill).move(40, 54);
  inner.rect(140, 30).radius(8).fill(fill).opacity(0.7).move(150, 70);
  inner
    .plain('Inner SVG')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
      weight: '700',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .move(180, 16);
}
