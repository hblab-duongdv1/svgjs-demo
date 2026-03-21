import type { Svg } from '@svgdotjs/svg.js';

export type SvgModuleProps = {
  duration: number;
  fill: string;
  strokeWidth: number;
  easing?: string;
  /** When false, pan/zoom plugins should not attach (Interactions modules). Default: true. */
  panEnabled?: boolean;
  /** When false, zoom gestures should be disabled. Default: true. */
  zoomEnabled?: boolean;
};

export type SvgModuleRenderer = (draw: Svg, props: SvgModuleProps) => void;
