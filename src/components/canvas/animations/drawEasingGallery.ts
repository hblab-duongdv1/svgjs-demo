import type { Svg } from '@svgdotjs/svg.js';

import { prepareStage } from '../../../utils/canvasHelpers';
import {
  EASING_LABELS,
  SVG_FONT_FAMILY,
  SVG_FONT_SIZES,
  SVG_STYLE_TOKENS,
} from '../../../utils/styleTokens';
import { easingToSvgEaseToken } from '../../../utils/svgEasing';
import type { SvgModuleProps } from '../types';

const REFERENCE_EASINGS = ['-', '<>', '<', '>'] as const;

/**
 * Easing visualization: top row follows Properties panel (duration + easing); below, fixed SVG.js
 * tokens for comparison.
 */
export function drawEasingGallery(draw: Svg, props: SvgModuleProps): void {
  const { content } = prepareStage(draw);
  const fill = props.fill || SVG_STYLE_TOKENS.primary;
  const duration = Math.max(250, props.duration || 800);
  const panelEase = easingToSvgEaseToken(props.easing);
  const panelLabel = props.easing ?? 'easeInOutCubic';

  content
    .plain('Easing gallery')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.body,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.75)
    .center(400, 32);

  content
    .plain('Top row = Properties panel; rows below = built-in reference curves')
    .font({
      family: SVG_FONT_FAMILY,
      size: SVG_FONT_SIZES.label,
      anchor: 'middle',
    })
    .fill(SVG_STYLE_TOKENS.onSurface)
    .opacity(0.55)
    .center(400, 54);

  const rows: { ease: (typeof REFERENCE_EASINGS)[number] | ReturnType<typeof easingToSvgEaseToken>; label: string }[] = [
    { ease: panelEase, label: `Panel · ${panelLabel}` },
    ...REFERENCE_EASINGS.map((token, i) => ({
      ease: token,
      label: String(EASING_LABELS[i] ?? token),
    })),
  ];

  rows.forEach((row, index) => {
    const y = 88 + index * 78;
    content
      .line(120, y + 10, 680, y + 10)
      .stroke({ width: 1, color: SVG_STYLE_TOKENS.outlineVariant });
    content
      .plain(row.label)
      .font({
        family: SVG_FONT_FAMILY,
        size: SVG_FONT_SIZES.label,
        anchor: 'start',
      })
      .fill(SVG_STYLE_TOKENS.onSurface)
      .move(88, y);

    const dot = content
      .circle(16)
      .fill(fill)
      .move(120, y + 2);
    dot
      .animate(duration)
      .ease(row.ease)
      .move(664, y + 2)
      .loop(0, true);
  });
}
