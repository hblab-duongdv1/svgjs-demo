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
  /** Force graph: true = color by node group palette. */
  forceUseGroupColors?: boolean;
  /** Force graph: fallback single color for all nodes. */
  forceNodeColor?: string;
  /** Force graph: number of nodes to render. */
  forceNodeCount?: number;
  /** Force graph: node radius in px. */
  forceNodeSize?: number;
  /** Force graph: ideal edge length. */
  forceLinkDistance?: number;
  /** Force graph: charge repulsion strength. */
  forceRepulsion?: number;
};

export type SvgModuleRenderer = (draw: Svg, props: SvgModuleProps) => void;
