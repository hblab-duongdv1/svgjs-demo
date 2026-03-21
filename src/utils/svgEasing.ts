/**
 * Map PropertiesPanel `easingFunction` values to svg.js `.ease()` string tokens.
 *
 * SVG.js built-ins (see `docs/AnimatingAnimate.md`): `-` linear, `<>` in-out, `<` in, `>` out.
 *
 * Previously `easeInOutCubic` incorrectly mapped to `-`, same as `linear`, so changing the
 * dropdown had almost no visible effect on the plugin demo.
 */
export type SvgEaseString = '-' | '<>' | '<' | '>';

export function easingToSvgEaseToken(easing?: string): SvgEaseString {
  switch (easing) {
    case 'linear':
      return '-';
    case 'easeInExpo':
      return '<';
    case 'easeOutElastic':
      return '>';
    case 'easeInOutCubic':
    default:
      return '<>';
  }
}
