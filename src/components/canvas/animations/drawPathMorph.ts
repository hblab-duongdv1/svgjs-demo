import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

const PATH_A = 'M120,360 C180,180 340,180 400,360 C460,540 620,540 680,360';
const PATH_B = 'M120,360 C200,500 320,220 400,360 C480,500 600,220 680,360';

/**
 * Path morphing by animating path `d` using `plot(...)`.
 */
export function drawPathMorph(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const duration = Math.max(200, props.duration || 800);

  content
    .plain('Path morph: d -> d')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  const path = content
    .path(PATH_A)
    .fill('none')
    .stroke({
      width: Math.max(2, props.strokeWidth + 1),
      color: fill,
    });

  path.animate(duration).attr({ d: PATH_B }).loop(0, true);
}
