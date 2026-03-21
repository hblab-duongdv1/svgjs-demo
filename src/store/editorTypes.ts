export type StageConfiguration = {
  durationMs: number;
  fillColor: string;
  strokeWidth: number;
  easingFunction: string;
  /** Used by Interactions modules (pan/zoom). */
  panEnabled: boolean;
  /** Used by Interactions modules (pan/zoom). */
  zoomEnabled: boolean;
};

export type EditorUIState = {
  isPlaying: boolean;
};
