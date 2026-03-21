import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Placeholder callbacks for future wiring (store, analytics, selection bus).
 * Replace or subscribe from app code when integrating beyond demos.
 */
export const interactionClickPlaceholders = {
  onShapeClick: (_payload: {
    shapeId: string;
    clientX: number;
    clientY: number;
  }) => {
    /* no-op: hook for host app */
  },
};

/**
 * Click targets with a live counter; demonstrates delegated click handling.
 */
export function drawClickEvents(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const stroke = { width: props.strokeWidth, color: fill };

  const label = content
    .plain('Clicks: 0 — tap a chip')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .center(400, 88);

  let clicks = 0;

  /** Row of chips centered in default 800×600 stage (see `DEFAULT_VIEWBOX`). */
  const cy = 300;
  const chips = [
    { id: 'a', cx: 280 },
    { id: 'b', cx: 400 },
    { id: 'c', cx: 520 },
  ] as const;

  chips.forEach(({ id, cx }) => {
    const c = content.circle(40).fill(fill).stroke(stroke).center(cx, cy);
    content
      .plain(id.toUpperCase())
      .font({
        family: SVG_FONT_FAMILY,
        size: SVG_FONT_SIZES.label,
        weight: 700,
        anchor: 'middle',
      })
      .fill('#ffffff')
      .center(cx, cy);
    c.css('cursor', 'pointer');
    c.on('click', (e: Event) => {
      e.preventDefault();
      clicks += 1;
      label.text(`Clicks: ${clicks} — last: ${id}`);
      const ev = e as MouseEvent;
      interactionClickPlaceholders.onShapeClick({
        shapeId: id,
        clientX: ev.clientX,
        clientY: ev.clientY,
      });
    });
  });
}
