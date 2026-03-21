import '@svgdotjs/svg.panzoom.js';

import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Pan / zoom the SVG viewport via `@svgdotjs/svg.panzoom.js` (`Svg.panZoom()`).
 * Large background so panning is obvious; wheel = zoom when enabled.
 */
export function drawPanZoom(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);

  const panning = props.panEnabled !== false;
  const zoom = props.zoomEnabled !== false;

  if (!panning && !zoom) {
    draw.panZoom(false);
  } else {
    draw.panZoom({
      panning,
      wheelZoom: zoom,
      pinchZoom: zoom,
    });
  }

  content
    .rect(1200, 900)
    .fill(SVG_STYLE_TOKENS.surfaceContainerHighest)
    .opacity(0.35)
    .move(-120, -60);

  const accent = props.fill || SVG_STYLE_TOKENS.primary;
  for (let i = 0; i < 6; i += 1) {
    content
      .circle(28 + i * 6)
      .fill(accent)
      .opacity(0.2 + i * 0.12)
      .move(180 + i * 140, 140 + i * 40);
  }

  content
    .plain('Pan: drag background · Zoom: wheel / pinch (when enabled)')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.8)
    .center(400, 48);
}
