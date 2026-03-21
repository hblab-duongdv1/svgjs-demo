import '@svgdotjs/svg.draggable.js';

import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Draggable shapes via official `@svgdotjs/svg.draggable.js` (extends `Element.draggable()`).
 */
export function drawDraggable(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const stroke = { width: props.strokeWidth, color: fill };

  content
    .plain('Drag the rectangle and the circle')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 56);

  const box = content
    .rect(140, 96)
    .fill(fill)
    .stroke(stroke)
    .radius(8)
    .center(250, 220);
  box.draggable(true);

  const knob = content.circle(52).fill(fill).stroke(stroke).center(550, 220);
  knob.draggable(true);
}
