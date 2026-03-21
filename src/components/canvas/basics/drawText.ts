import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Basics: typography sample using the Inter stack (loaded in `index.html`).
 */
export function drawText(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;

  content
    .text((tspan) => {
      tspan.tspan('SVG.js ').fill(fill);
      tspan.tspan('Basics').fill(SVG_STYLE_TOKENS.onSurface);
    })
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.title,
      weight: 700,
      anchor: 'middle',
    })
    .center(400, 120);

  content
    .text('Inter — weights 400 / 600')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      weight: 400,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.85)
    .center(400, 168);

  content
    .text('Easing hint: ')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.65)
    .move(320, 220);

  content
    .text(String(props.easing ?? 'easeInOutCubic'))
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      weight: 600,
      anchor: 'middle',
    })
    .fill(fill)
    .move(480, 220);
}
