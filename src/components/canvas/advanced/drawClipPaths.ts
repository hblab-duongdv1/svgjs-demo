import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Advanced demo: clip-path geometry (`clipWith`) over a patterned group.
 */
export function drawClipPaths(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;

  content
    .plain('Clip-path demo')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  const scene = content.group().move(120, 140);
  scene
    .rect(520, 240)
    .radius(14)
    .fill(SVG_STYLE_TOKENS.surfaceContainerHighest)
    .opacity(0.7);

  for (let i = 0; i < 9; i += 1) {
    scene
      .rect(80, 260)
      .fill(fill)
      .opacity(0.15 + (i % 3) * 0.15)
      .rotate(12, 40, 130)
      .move(i * 60 - 30, -10);
  }

  const clipShape = draw
    .polygon('180,120 300,20 430,120 400,250 210,250')
    .move(120, 130);
  scene.clipWith(clipShape);
}
