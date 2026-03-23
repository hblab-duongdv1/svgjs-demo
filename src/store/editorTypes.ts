export type StageConfiguration = {
  durationMs: number;
  fillColor: string;
  strokeWidth: number;
  easingFunction: string;
  /** Used by Interactions modules (pan/zoom). */
  panEnabled: boolean;
  /** Used by Interactions modules (pan/zoom). */
  zoomEnabled: boolean;
  /** Force graph: true = color by node group palette, false = use `forceNodeColor`. */
  forceUseGroupColors: boolean;
  /** Force graph: single color for all nodes when `forceUseGroupColors` is false. */
  forceNodeColor: string;
  /** Force graph: number of nodes to render from dataset. */
  forceNodeCount: number;
  /** Force graph: node radius in px. */
  forceNodeSize: number;
  /** Force graph: ideal edge length. */
  forceLinkDistance: number;
  /** Force graph: charge repulsion strength. */
  forceRepulsion: number;
};

export type EditorUIState = {
  isPlaying: boolean;
};
