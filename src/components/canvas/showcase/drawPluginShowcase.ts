import '@svgdotjs/svg.draggable.js';
import '@svgdotjs/svg.panzoom.js';

import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';
import { easingToSvgEaseToken } from '../../../utils/svgEasing';

/**
 * Combined demo: pan/zoom on the root SVG, draggable shapes, and motion driven by
 * `moduleProps.duration` / `moduleProps.fill` (from Zustand → PropertiesPanel).
 */
export function drawPluginShowcase(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const stroke = { width: props.strokeWidth, color: fill };
  const duration = Math.max(150, props.duration || 800);
  const ease = easingToSvgEaseToken(props.easing);

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
    .plain(
      'Plugin demo — drag shapes · pan/zoom background · duration & fill from Properties',
    )
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .center(400, 56);

  content
    .plain(`Fill: ${fill} · Duration: ${duration}ms`)
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 86);

  const group = content.group();

  const rounded = group
    .rect(140, 100)
    .radius(14)
    .fill(fill)
    .stroke(stroke)
    .move(150, 250);
  rounded.draggable(true);
  rounded.animate(duration).ease(ease).move(150, 210).loop(0, true);

  const ball = group.circle(52).fill(fill).stroke(stroke).move(348, 248);
  ball.draggable(true);
  ball.animate(duration).ease(ease).move(348, 200).loop(0, true);

  const hexPath = 'M500 260 L580 260 L620 300 L580 340 L500 340 L460 300 Z';
  const hex = group.path(hexPath).fill(fill).stroke(stroke);
  hex.draggable(true);
  hex.animate(duration).ease(ease).rotate(360, 540, 300).loop(0, true);

  group
    .circle(8)
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.4)
    .center(400, 420);

  content
    .plain('Pan: drag empty area · Zoom: wheel')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.55)
    .center(400, 548);
}
