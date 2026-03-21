import { Timeline, type Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import type { SvgModuleProps } from '../types';

/**
 * Timeline-based orchestration using `new Timeline()`.
 */
export function drawTimelineSequence(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const duration = Math.max(180, props.duration || 800);

  content
    .plain('Timeline sequence')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 52);

  const timeline = new Timeline();

  const a = content.rect(72, 72).radius(8).fill(fill).move(164, 190);
  const b = content
    .rect(72, 72)
    .radius(8)
    .fill(fill)
    .opacity(0.75)
    .move(164, 300);
  const c = content
    .rect(72, 72)
    .radius(8)
    .fill(fill)
    .opacity(0.5)
    .move(164, 410);

  a.timeline(timeline).animate(duration).move(564, 190);
  b.timeline(timeline)
    .animate(duration)
    .move(564, 300)
    .delay(Math.round(duration * 0.4));
  c.timeline(timeline)
    .animate(duration)
    .move(564, 410)
    .delay(Math.round(duration * 0.8));

  timeline.persist(true).play();
}
