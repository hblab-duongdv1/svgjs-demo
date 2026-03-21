import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

const HOVER_MS = 200;

/**
 * Hover-driven fill transitions (animated) on shapes.
 */
export function drawHoverTransitions(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const base = props.fill || SVG_STYLE_TOKENS.primary;
  const hover = SVG_STYLE_TOKENS.surfaceContainerHighest;
  const stroke = { width: props.strokeWidth, color: base };

  content
    .plain('Hover cards — fill animates')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  const mkCard = (x: number, y: number) => {
    const r = content
      .rect(160, 100)
      .fill(base)
      .stroke(stroke)
      .radius(10)
      .move(x, y);
    r.on('mouseenter', () => {
      r.stop?.();
      r.animate(HOVER_MS).ease('-').fill(hover);
    });
    r.on('mouseleave', () => {
      r.stop?.();
      r.animate(HOVER_MS).ease('-').fill(base);
    });
  };

  mkCard(112, 120);
  mkCard(320, 120);
  mkCard(528, 120);
}
